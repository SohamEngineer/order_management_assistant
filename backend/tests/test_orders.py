from typing import Any

from fastapi.testclient import TestClient

ORDERS = "/api/v1/orders"


def create_order(client: TestClient, **overrides: Any) -> dict[str, Any]:
    payload = {"customer_name": "Acme Ltd", "total_amount": "19.9", "currency": "USD"} | overrides
    response = client.post(ORDERS, json=payload)
    assert response.status_code == 201, response.text
    body: dict[str, Any] = response.json()
    return body


def test_create_and_fetch_order(client: TestClient) -> None:
    created = create_order(client, customer_name="  Acme Ltd  ", notes="Leave at reception")

    assert created["reference"].startswith("ORD-")
    assert created["customer_name"] == "Acme Ltd"
    assert created["status"] == "pending"
    assert created["total_amount"] == "19.90"
    assert created["allowed_transitions"] == ["confirmed", "cancelled"]
    assert created["created_at"].endswith("Z")
    assert client.get(f"{ORDERS}/{created['id']}").json() == created


def test_validation_errors_name_the_fields(client: TestClient) -> None:
    response = client.post(
        ORDERS,
        json={"customer_name": "   ", "total_amount": "-1", "currency": "usd", "status": "shipped"},
    )

    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert {detail["field"] for detail in error["details"]} == {
        "customer_name",
        "total_amount",
        "currency",
        "status",
    }


def test_missing_order_returns_404(client: TestClient) -> None:
    response = client.get(f"{ORDERS}/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_list_filters_and_paginates_newest_first(client: TestClient) -> None:
    first, second, third = (create_order(client, customer_name=name) for name in "ABC")
    client.patch(f"{ORDERS}/{second['id']}/status", json={"status": "confirmed"})

    page = client.get(ORDERS, params={"limit": 2}).json()
    assert page["total"] == 3
    assert [item["id"] for item in page["items"]] == [third["id"], second["id"]]

    rest = client.get(ORDERS, params={"limit": 2, "offset": 2}).json()
    assert [item["id"] for item in rest["items"]] == [first["id"]]

    confirmed = client.get(ORDERS, params={"status": "confirmed"}).json()
    assert [item["id"] for item in confirmed["items"]] == [second["id"]]


def test_list_rejects_out_of_range_limit(client: TestClient) -> None:
    assert client.get(ORDERS, params={"limit": 101}).status_code == 422


def test_summary_counts_every_status(client: TestClient) -> None:
    create_order(client)
    create_order(client)

    assert client.get(f"{ORDERS}/summary").json() == {
        "total": 2,
        "by_status": {
            "pending": 2,
            "confirmed": 0,
            "shipped": 0,
            "delivered": 0,
            "cancelled": 0,
        },
    }


def test_status_follows_the_workflow(client: TestClient) -> None:
    order = create_order(client)
    url = f"{ORDERS}/{order['id']}/status"

    for status in ("confirmed", "shipped", "delivered"):
        response = client.patch(url, json={"status": status})
        assert response.status_code == 200, response.text
        assert response.json()["status"] == status

    assert response.json()["allowed_transitions"] == []
    assert response.json()["updated_at"] > order["updated_at"]


def test_invalid_status_change_is_a_conflict(client: TestClient) -> None:
    order = create_order(client)

    response = client.patch(f"{ORDERS}/{order['id']}/status", json={"status": "delivered"})

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "conflict"
    assert client.get(f"{ORDERS}/{order['id']}").json()["status"] == "pending"
