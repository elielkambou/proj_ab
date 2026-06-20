import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Modality, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = {
  subject?: string;
  level?: string;
  city?: string;
  modality?: string;
};

const MODALITIES: Modality[] = ["DOMICILE", "VISIO", "MIXTE"];

function isModality(value: string | undefined): value is Modality {
  return !!value && MODALITIES.includes(value as Modality);
}

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const where: Prisma.TutorListingWhereInput = {
    isActive: true,
    teacher: { status: "APPROVED" },
  };

  const subject = sp.subject?.trim();
  const city = sp.city?.trim();
  const level = sp.level?.trim();

  if (subject) where.subject = { contains: subject, mode: "insensitive" };
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (isModality(sp.modality)) where.modality = sp.modality;
  if (level) where.levels = { has: level };

  const offers = await prisma.tutorListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      subject: true,
      levels: true,
      city: true,
      modality: true,
      rateMin: true,
      rateMax: true,
      teacher: { select: { fullName: true, bio: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Offres de cours</h1>
          <p className="mt-1 text-sm text-slate-600">
            Consultez les offres publiquement (contact au moment de la demande).
          </p>
        </div>
        <Link href="/" className="text-sm hover:underline">Retour</Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 md:grid-cols-4" action="/tutors">
        <input
          name="subject"
          placeholder="Matière (ex: Maths)"
          className="rounded-xl border px-3 py-2 text-sm"
          defaultValue={sp.subject ?? ""}
        />
        <input
          name="city"
          placeholder="Ville"
          className="rounded-xl border px-3 py-2 text-sm"
          defaultValue={sp.city ?? ""}
        />
        <select
          name="level"
          className="rounded-xl border px-3 py-2 text-sm"
          defaultValue={sp.level ?? ""}
        >
          <option value="">Niveau</option>
          <option>6ème</option><option>5ème</option><option>4ème</option><option>3ème</option>
          <option>2nde</option><option>1ère</option><option>Terminale</option>
        </select>
        <select
          name="modality"
          className="rounded-xl border px-3 py-2 text-sm"
          defaultValue={(sp.modality as string) ?? ""}
        >
          <option value="">Modalité</option>
          <option value="DOMICILE">À domicile</option>
          <option value="VISIO">Visio</option>
          <option value="MIXTE">Mixte</option>
        </select>

        <div className="md:col-span-4">
          <button className="w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800">
            Filtrer
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {offers.map((o) => (
          <Link
            key={o.id}
            href={`/tutors/${o.id}`}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:shadow"
          >
            <div className="text-sm text-slate-500">{o.city} • {o.modality}</div>
            <div className="mt-2 font-semibold">{o.title}</div>
            <div className="mt-1 text-sm text-slate-600">
              {o.subject} • {o.levels.slice(0, 3).join(", ")}{o.levels.length > 3 ? "…" : ""}
            </div>
            <div className="mt-3 text-sm">
              {o.teacher.fullName ?? "Professeur"} •{" "}
              {o.rateMin && o.rateMax ? `${o.rateMin}–${o.rateMax}€/h` : "Tarif sur demande"}
            </div>
          </Link>
        ))}
      </div>

      {offers.length === 0 && (
        <p className="mt-8 text-sm text-slate-600">
          Aucune offre ne correspond à ces filtres.
        </p>
      )}
    </div>
  );
}
