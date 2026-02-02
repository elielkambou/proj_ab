import Link from "next/link";

export default function DevenirProfPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Devenir professeur</h1>
      <p className="mt-3 text-gray-600">
        Ici on mettra ton parcours de candidature en étapes (profil → matières → zones → dispo → entretien).
      </p>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Démarrer</h2>
        <p className="mt-2 text-sm text-gray-600">
          Pour l’instant, on redirige vers une page d’inscription placeholder.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/register?role=TEACHER&returnTo=/devenir-prof"
            className="rounded-2xl bg-black px-5 py-3 text-sm text-white hover:opacity-90"
          >
            Postuler
          </Link>
          <Link href="/" className="rounded-2xl border px-5 py-3 text-sm hover:bg-gray-50">
            Retour accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
