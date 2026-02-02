import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const featured = await prisma.tutorListing.findMany({
    where: { isActive: true, teacher: { status: "APPROVED" } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      subject: true,
      levels: true,
      city: true,
      modality: true,
      rateMin: true,
      rateMax: true,
      teacher: { select: { fullName: true } },
    },
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight">
            Soutien+
          </Link>

          <nav className="hidden gap-6 text-sm md:flex">
            <Link href="/tutors" className="hover:underline">Cours particuliers</Link>
            <Link href="/stages" className="hover:underline">Stages</Link>
            <Link href="/devenir-prof" className="hover:underline">Devenir prof</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/tutors" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
              Voir les offres
            </Link>
            <Link href="/devenir-prof" className="rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90">
              Donner des cours
            </Link>
          </div>
        </div>
      </header>

      {/* Hero + “widget” de recherche */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Trouvez un professeur adapté à votre enfant.
            </h1>
            <p className="mt-4 text-gray-600">
              Consultez des offres publiques, filtrez, puis faites une demande en quelques clics.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tutors" className="rounded-2xl bg-black px-5 py-3 text-white hover:opacity-90">
                Trouver un prof
              </Link>
              <Link href="/devenir-prof" className="rounded-2xl border px-5 py-3 hover:bg-gray-50">
                Devenir professeur
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium">Recherche rapide</p>
              <form action="/tutors" className="mt-3 grid gap-3 md:grid-cols-3">
                <select name="level" className="w-full rounded-xl border px-3 py-2 text-sm">
                  <option value="">Classe / niveau</option>
                  <option>6ème</option><option>5ème</option><option>4ème</option><option>3ème</option>
                  <option>2nde</option><option>1ère</option><option>Terminale</option>
                </select>

                <input name="city" placeholder="Ville" className="w-full rounded-xl border px-3 py-2 text-sm" />

                <select name="modality" className="w-full rounded-xl border px-3 py-2 text-sm">
                  <option value="">Domicile / Visio</option>
                  <option value="DOMICILE">À domicile</option>
                  <option value="VISIO">Visio</option>
                  <option value="MIXTE">Mixte</option>
                </select>

                <div className="md:col-span-3">
                  <button className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90">
                    Voir les offres
                  </button>
                </div>
              </form>

              <p className="mt-2 text-xs text-gray-500">
                Les contacts se débloquent au moment de la demande (compte parent).
              </p>
            </div>
          </div>

          {/* Réassurance */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium">Pourquoi ça marche</p>
            <div className="mt-4 grid gap-3 text-sm text-gray-700">
              <div className="rounded-2xl bg-gray-50 p-4">Professeurs validés (qualité & sérieux)</div>
              <div className="rounded-2xl bg-gray-50 p-4">Matching selon matière, niveau et localisation</div>
              <div className="rounded-2xl bg-gray-50 p-4">Suivi simple des demandes et rendez-vous</div>
            </div>
          </div>
        </div>
      </section>

      {/* Matières */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-semibold">Les matières les plus demandées</h2>
        <p className="mt-1 text-sm text-gray-600">Maths, Français, Anglais… et plus.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {["Maths", "Français", "Anglais", "Physique"].map((s) => (
            <Link
              key={s}
              href={`/tutors?subject=${encodeURIComponent(s)}`}
              className="rounded-2xl border bg-white p-4 text-sm shadow-sm hover:shadow"
            >
              <div className="font-medium">{s}</div>
              <div className="mt-1 text-gray-600">Voir les offres</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Offres en vedette */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Offres en vedette</h2>
            <p className="mt-1 text-sm text-gray-600">Offres publiques de professeurs validés.</p>
          </div>
          <Link href="/tutors" className="text-sm hover:underline">Voir tout</Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featured.map((o) => (
            <Link key={o.id} href={`/tutors/${o.id}`} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow">
              <div className="text-sm text-gray-500">{o.city} • {o.modality}</div>
              <div className="mt-2 font-semibold">{o.title}</div>
              <div className="mt-1 text-sm text-gray-600">
                {o.subject} • {o.levels.slice(0, 3).join(", ")}{o.levels.length > 3 ? "…" : ""}
              </div>
              <div className="mt-3 text-sm">
                {o.teacher.fullName ?? "Professeur"} •{" "}
                {o.rateMin && o.rateMax ? `${o.rateMin}–${o.rateMax}€/h` : "Tarif sur demande"}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold">Comment ça marche</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { t: "1) Explorez", d: "Parcourez les offres et filtrez (niveau, ville, modalité)." },
            { t: "2) Demandez", d: "Créez une demande parent (simple & rapide)." },
            { t: "3) Planifiez", d: "Proposez un créneau et confirmez avec le bon prof." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="font-medium">{x.t}</div>
              <div className="mt-2 text-sm text-gray-600">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA prof */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-3xl border bg-black p-8 text-white">
          <h3 className="text-xl font-semibold">Vous êtes professeur ?</h3>
          <p className="mt-2 text-sm text-white/80">
            Postulez en quelques étapes, puis publiez vos offres après validation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/devenir-prof" className="rounded-2xl bg-white px-5 py-3 text-sm text-black hover:opacity-90">
              Commencer ma candidature
            </Link>
            <Link href="/tutors" className="rounded-2xl border border-white/30 px-5 py-3 text-sm hover:bg-white/10">
              Voir les offres
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-600">
          © {new Date().getFullYear()} Soutien+ — Mentions légales • Contact
        </div>
      </footer>
    </div>
  );
}
