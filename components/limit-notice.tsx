import Link from "next/link";

export function LimitNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-900"
    >
      <p>{message}</p>
      <Link
        href="/settings"
        className="mt-2 inline-block font-semibold text-teal-700 hover:underline"
      >
        See plans and upgrade
      </Link>
    </div>
  );
}