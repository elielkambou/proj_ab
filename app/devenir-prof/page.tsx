import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function DevenirProfPage() {
  const user = await getCurrentUser();
  const ctaHref =
    user?.role === "TEACHER"
      ? "/teacher/onboarding"
      : "/register?role=TEACHER&returnTo=/teacher/onboarding";
  const ctaLabel =
    user?.role === "TEACHER" ? "Continuer ma candidature" : "Postuler";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/" className="text-sm hover:underline">
        ← Retour accueil
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div>
          <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            Candidature professeur
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Rejoindre l’équipe de professeurs validés
          </h1>
          <p className="mt-3 text-slate-600">
            Créez votre profil, transmettez votre CV, proposez une première
            offre, puis laissez l’équipe valider votre candidature avant
            publication.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Profil",
                text: "Présentez votre expérience, vos diplômes et vos matières fortes.",
              },
              {
                title: "Offre",
                text: "Définissez niveau, ville, modalité et tarif indicatif.",
              },
              {
                title: "Validation",
                text: "Un administrateur vérifie la candidature avant mise en ligne.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
              >
                <h2 className="font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-950">
            Le CV ajouté dans le formulaire est conservé dans l’espace
            administrateur, avec le statut de votre dossier et les informations
            de matching.
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <Image
            src="/teacher-application-v2.png"
            alt="Dossier de candidature professeur avec CV et ordinateur"
            width={900}
            height={700}
            className="aspect-[4/3] w-full object-cover"
            priority
          />
          <div className="p-6">
            <h2 className="text-lg font-semibold">Démarrer</h2>
            <p className="mt-2 text-sm text-slate-600">
              Le formulaire professeur est relié à votre compte et peut être mis
              à jour après soumission.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href={ctaHref}
                className="rounded-2xl bg-emerald-700 px-5 py-3 text-center text-sm text-white hover:bg-emerald-800"
              >
                {ctaLabel}
              </Link>
              <Link
                href="/tutors"
                className="rounded-2xl border px-5 py-3 text-center text-sm hover:bg-emerald-50"
              >
                Voir les offres publiques
              </Link>
            </div>
            {user?.role === "PARENT" && (
              <p className="mt-4 text-xs text-amber-700">
                Vous êtes connecté avec un compte parent. Déconnectez-vous pour
                créer un compte professeur séparé.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
