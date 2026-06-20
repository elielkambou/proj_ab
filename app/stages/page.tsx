import Image from "next/image";
import Link from "next/link";

const programs = [
  {
    title: "Stage remise à niveau",
    text: "Reprendre les bases, combler les lacunes et repartir avec une méthode claire.",
  },
  {
    title: "Stage brevet",
    text: "Révisions ciblées, exercices chronométrés et entraînement sur sujets types.",
  },
  {
    title: "Stage bac",
    text: "Consolidation des notions clés, organisation des révisions et préparation orale.",
  },
];

export default function StagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/" className="text-sm hover:underline">
        ← Retour accueil
      </Link>

      <section className="mt-6 grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            Programmes courts
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Stages intensifs pour reprendre le rythme
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Orientez les familles vers des professeurs capables d’accompagner
            des périodes courtes et ciblées : remise à niveau, préparation
            brevet, préparation bac ou objectifs précis.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tutors"
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm text-white hover:bg-emerald-800"
            >
              Voir les professeurs
            </Link>
            <Link
              href="/register?role=PARENT"
              className="rounded-2xl border border-emerald-200 px-5 py-3 text-sm text-emerald-900 hover:bg-emerald-50"
            >
              Créer un compte parent
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <Image
            src="/stage-workshop-v2.png"
            alt="Groupe d’élèves en stage intensif avec un professeur"
            width={900}
            height={700}
            className="aspect-[4/3] w-full object-cover"
            priority
          />
        </div>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {programs.map((program) => (
          <div
            key={program.title}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold">{program.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{program.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Trouver le bon intervenant</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Filtrez les offres par matière, ville et modalité, puis envoyez une
          demande en précisant vos dates, vos disponibilités et vos objectifs.
          L’espace administrateur peut ensuite assigner une offre validée.
        </p>
        <Link
          href="/tutors"
          className="mt-5 inline-block rounded-2xl bg-emerald-700 px-5 py-3 text-sm text-white hover:bg-emerald-800"
        >
          Rechercher une offre
        </Link>
      </section>
    </div>
  );
}
