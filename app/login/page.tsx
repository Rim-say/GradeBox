import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-base font-bold text-white">
          G
        </span>
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          GradeBox
        </span>
      </div>
      <AuthPanel />
    </div>
  );
}