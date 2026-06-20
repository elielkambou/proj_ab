import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const subjects = ["Maths", "Français", "Anglais", "Physique"];

export default async function HomePage() {
  const [featured, user] = await Promise.all([
    prisma.tutorListing.findMany({
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
        teacher: { select: { fullName: true, experienceYears: true } },
      },
    }),
    getCurrentUser(),
  ]);

  const dashboardHref =
    user?.role === "TEACHER"
      ? "/teacher/onboarding"
      : user?.role === "ADMIN"
        ? "/admin"
        : "/parent/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white">S+</span>
            Soutien+
          </Link>

          <nav className="hidden gap-6 text-sm text-slate-700 md:flex">
            <Link href="/tutors" className="hover:text-emerald-800">Cours particuliers</Link>
            <Link href="/stages" className="hover:text-emerald-800">Stages</Link>
            <Link href="/devenir-prof" className="hover:text-emerald-800">Devenir prof</Link>
          </nav>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={dashboardHref}
                className="rounded-xl border border-emerald-200 px-3 py-2 text-sm text-emerald-900 hover:bg-emerald-50"
              >
                Mon espace
              </Link>
              <form action={logoutAction}>
                <button className="rounded-xl bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-800">
                  Déconnexion
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl border border-emerald-200 px-3 py-2 text-sm text-emerald-900 hover:bg-emerald-50"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-800"
              >
                S’inscrire
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                Soutien scolaire suivi, professeurs validés
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
                Trouver le bon professeur devient simple.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Recherchez une offre, envoyez une demande complète, puis laissez l’équipe valider le meilleur accompagnement pour votre enfant.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/tutors" className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800">
                  Trouver un professeur
                </Link>
                <Link href="/devenir-prof" className="rounded-2xl border border-emerald-200 px-5 py-3 text-sm font-medium text-emerald-900 hover:bg-emerald-50">
                  Postuler comme professeur
                </Link>
              </div>

              <form action="/tutors" className="mt-8 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm md:grid-cols-4">
                <input name="subject" placeholder="Matière" className="rounded-xl border bg-white px-3 py-2 text-sm" />
                <input name="city" placeholder="Ville" className="rounded-xl border bg-white px-3 py-2 text-sm" />
                <select name="level" className="rounded-xl border bg-white px-3 py-2 text-sm">
                  <option value="">Niveau</option>
                  <option>6ème</option><option>5ème</option><option>4ème</option><option>3ème</option>
                  <option>2nde</option><option>1ère</option><option>Terminale</option>
                </select>
                <button className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
                  Rechercher
                </button>
              </form>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-950 shadow-2xl">
              <Image
                src="/hero-tutoring-v2.png"
                alt="Professeur accompagnant un élève pendant une séance de soutien"
                width={1200}
                height={900}
                priority
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Validation", "Profils relus avant publication"],
              ["Matching", "Matière, niveau, ville et modalité"],
              ["Suivi", "Demandes visibles dans l’espace parent"],
              ["Candidature", "CV disponible dans l’espace admin"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="font-semibold text-emerald-900">{title}</div>
                <div className="mt-2 text-sm text-slate-600">{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/stages"
              className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm hover:border-emerald-300 hover:shadow-md"
            >
              <Image
                src="/stage-workshop-v2.png"
                alt="Stage intensif en petit groupe"
                width={900}
                height={620}
                className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="p-5">
                <div className="text-sm font-medium text-emerald-800">Stages intensifs</div>
                <h2 className="mt-2 text-xl font-semibold">Des sessions courtes et ciblées</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Remise à niveau, brevet, bac : les familles peuvent formuler une demande précise et être orientées vers une offre validée.
                </p>
              </div>
            </Link>

            <Link
              href="/devenir-prof"
              className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm hover:border-emerald-300 hover:shadow-md"
            >
              <Image
                src="/teacher-application-v2.png"
                alt="Candidature professeur avec CV"
                width={900}
                height={620}
                className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="p-5">
                <div className="text-sm font-medium text-emerald-800">Recrutement professeur</div>
                <h2 className="mt-2 text-xl font-semibold">Un dossier complet avec CV</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Les enseignants postulent avec leurs informations, une première offre et un CV téléchargeable depuis l’espace administrateur.
                </p>
              </div>
            </Link>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Matières recherchées</h2>
              <p className="mt-1 text-sm text-slate-600">Accédez rapidement aux cours les plus demandés.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {subjects.map((subject) => (
              <Link
                key={subject}
                href={"/tutors?subject=" + encodeURIComponent(subject)}
                className="rounded-2xl border border-emerald-100 bg-white p-5 text-sm shadow-sm hover:border-emerald-300 hover:shadow-md"
              >
                <div className="font-semibold text-slate-950">{subject}</div>
                <div className="mt-2 text-slate-600">Voir les professeurs</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Offres en vedette</h2>
              <p className="mt-1 text-sm text-slate-600">Professeurs approuvés et offres actives.</p>
            </div>
            <Link href="/tutors" className="text-sm font-medium text-emerald-800 hover:text-emerald-950">Voir tout</Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featured.map((offer) => (
              <Link
                key={offer.id}
                href={"/tutors/" + offer.id}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md"
              >
                <div className="text-sm text-emerald-800">{offer.city} • {offer.modality}</div>
                <div className="mt-2 font-semibold">{offer.title}</div>
                <div className="mt-2 text-sm text-slate-600">
                  {offer.subject} • {offer.levels.slice(0, 3).join(", ")}
                  {offer.levels.length > 3 ? "…" : ""}
                </div>
                <div className="mt-4 text-sm text-slate-700">
                  {offer.teacher.fullName ?? "Professeur"} •{" "}
                  {offer.rateMin && offer.rateMax
                    ? offer.rateMin + "-" + offer.rateMax + "€/h"
                    : "Tarif sur demande"}
                </div>
              </Link>
            ))}

            {featured.length === 0 && (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-6 text-sm text-slate-600 md:col-span-3">
                Aucune offre publiée pour le moment. Lancez le seed Prisma ou validez une candidature professeur.
              </div>
            )}
          </div>
        </section>

        <section className="bg-emerald-950 py-12 text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Vous êtes professeur ?</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-50/80">
                Soumettez votre profil, ajoutez votre CV, puis proposez une première offre. L’équipe analyse votre dossier depuis l’espace admin avant publication.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/devenir-prof" className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-emerald-950 hover:bg-emerald-50">
                Commencer ma candidature
              </Link>
              <Link href="/register?role=TEACHER&returnTo=/teacher/onboarding" className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-medium text-white hover:bg-white/10">
                Créer un compte professeur
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-emerald-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">
          © {new Date().getFullYear()} Soutien+ — Plateforme de soutien scolaire
        </div>
      </footer>
    </div>
  );
}
