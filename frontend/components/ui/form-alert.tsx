import { AlertIcon } from "./icons";

export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex animate-rise items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger"
    >
      <AlertIcon className="mt-0.5 size-4" />
      {message}
    </div>
  );
}
