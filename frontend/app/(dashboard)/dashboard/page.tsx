import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Tableau de bord</h1>
      <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
        Sprint 1 terminé : compte Supabase, onboarding et catalogue pré-rempli côté base. Les flux{" "}
        <strong>liens clients</strong>, <strong>Stripe</strong> et <strong>PDF</strong> arrivent aux sprints suivants.
      </p>
      <ul className="mt-8 space-y-3 text-sm font-semibold text-indigo-800">
        <li>
          →{" "}
          <Link href="/clients" className="underline-offset-2 hover:underline">
            Clients & liens (Sprint 2)
          </Link>
        </li>
        <li>
          →{" "}
          <Link href="/catalog" className="underline-offset-2 hover:underline">
            Éditer le catalogue (Sprint 2)
          </Link>
        </li>
        <li>
          →{" "}
          <Link href="/artivision" className="underline-offset-2 hover:underline">
            Outil ArtiVision
          </Link>
        </li>
      </ul>
    </div>
  );
}
