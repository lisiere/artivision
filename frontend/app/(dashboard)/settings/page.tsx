import Link from "next/link";

export default function SettingsPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-indigo-200 bg-white/80 p-10 text-center">
      <h1 className="text-2xl font-black text-slate-900">Paramètres</h1>
      <p className="mt-3 text-sm font-medium text-slate-600">
        Sprint 5 — branding avancé et{" "}
        <Link href="/settings/billing" className="font-bold text-indigo-700 underline-offset-2 hover:underline">
          facturation Stripe
        </Link>
        .
      </p>
    </div>
  );
}
