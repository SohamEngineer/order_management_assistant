"""create orders

Revision ID: 0001
Revises:
Create Date: 2026-11-25
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "orders",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("reference", sa.String(length=32), nullable=False),
        sa.Column("customer_name", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("total_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("notes", sa.String(length=2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("total_amount >= 0", name=op.f("ck_orders_total_amount_non_negative")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_orders")),
        sa.UniqueConstraint("reference", name=op.f("uq_orders_reference")),
    )
    op.create_index("ix_orders_created_at", "orders", ["created_at"])
    op.create_index(op.f("ix_orders_status"), "orders", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_orders_status"), table_name="orders")
    op.drop_index("ix_orders_created_at", table_name="orders")
    op.drop_table("orders")
