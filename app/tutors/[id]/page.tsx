import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TutorOfferDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const offer = await prisma.tutorListing.findFirst({
    where: { id, isActive: true, teacher: { status: "APPROVED" } },
    select: {
      id: true,
      title: true,
      subject: true,
      levels: true,
      city: true,
      modality: true,
      description: true,
      rateMin: true,
      rateMax: true,
      teacher: { select: { fullName: true, bio: true } },
    },
  });

  if (!offer) return notFound();

  const user = await getCurrentUser();
  const requestHref = `/parent/requests/new?listingId=${offer.id}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/tutors" className="text-sm hover:underline">
        ← Retour aux offres
      </Link>

      <div className="mt-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-500">
          {offer.city} • {offer.modality}
        </div>
        <h1 className="mt-2 text-2xl font-semibold">{offer.title}</h1>

        <div className="mt-3 text-sm text-slate-700">
          <div>
            <span className="font-medium">Matière :</span> {offer.subject}
          </div>
          <div className="mt-1">
            <span className="font-medium">Niveaux :</span>{" "}
            {offer.levels.join(", ")}
          </div>
          <div className="mt-1">
            <span className="font-medium">Tarif :</span>{" "}
            {offer.rateMin && offer.rateMax
              ? `${offer.rateMin}–${offer.rateMax}€/h`
              : "Sur demande"}
          </div>
        </div>

        {offer.description && (
          <p className="mt-4 text-sm text-slate-700">{offer.description}</p>
        )}

        <div className="mt-6 rounded-2xl bg-emerald-50/60 p-4 text-sm">
          <div className="font-medium">
            {offer.teacher.fullName ?? "Professeur"}
          </div>
          <div className="mt-1 text-slate-600">
            {offer.teacher.bio ?? "Profil en cours de complétion."}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {user?.role === "PARENT" ? (
            <Link
              href={requestHref}
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-center text-sm text-white hover:bg-emerald-800"
            >
              Demander un cours
            </Link>
          ) : user ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
              Connectez-vous avec un compte parent pour faire une demande.
            </div>
          ) : (
            <Link
              href={`/register?role=PARENT&returnTo=${encodeURIComponent(requestHref)}`}
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-center text-sm text-white hover:bg-emerald-800"
            >
              Demander un cours
            </Link>
          )}

          <Link
            href="/devenir-prof"
            className="rounded-2xl border px-5 py-3 text-center text-sm hover:bg-emerald-50"
          >
            Je veux donner des cours
          </Link>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Les infos sensibles seront accessibles après demande et validation.
        </p>
      </div>
    </div>
  );
}
