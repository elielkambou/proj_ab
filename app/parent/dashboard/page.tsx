import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default async function ParentDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent("/parent/dashboard")}`);
  if (user.role !== "PARENT") redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Espace parent</h1>
      <p className="mt-2 text-sm text-gray-600">{user.email}</p>

      <div className="mt-6 flex gap-3">
        <Link href="/tutors" className="rounded-2xl border px-5 py-3 text-sm hover:bg-gray-50">
          Voir les offres
        </Link>

        <form action={logoutAction}>
          <button className="rounded-2xl bg-black px-5 py-3 text-sm text-white hover:opacity-90">
            Déconnexion
          </button>
        </form>
      </div>

      <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Prochaine étape : page “Créer une demande” (à partir d’une offre).
        </p>
      </div>
    </div>
  );
}
