import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TeacherOnboarding() {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent("/teacher/onboarding")}`);
  if (user.role !== "TEACHER") redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Candidature professeur</h1>
      <p className="mt-2 text-sm text-gray-600">
        Statut actuel : <span className="font-medium">{user.teacherProfile?.status ?? "DRAFT"}</span>
      </p>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Prochaine étape : formulaire en plusieurs étapes (profil → matières → zones → dispo → soumission).
        </p>

        <div className="mt-4">
          <Link href="/tutors" className="text-sm underline">
            Voir les offres publiques
          </Link>
        </div>
      </div>
    </div>
  );
}
