import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRequestAction } from "@/app/actions/requests";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent("/parent/requests/new")}`);
  if (user.role !== "PARENT") redirect("/");

  const sp = await searchParams;
  const listingId = sp.listingId;

  if (!listingId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Nouvelle demande</h1>
        <p className="mt-2 text-sm text-gray-600">
          Aucune offre sélectionnée. Choisis une offre d’abord.
        </p>
        <Link href="/tutors" className="mt-6 inline-block rounded-2xl border px-5 py-3 text-sm hover:bg-gray-50">
          Voir les offres
        </Link>
      </div>
    );
  }

  const offer = await prisma.tutorListing.findFirst({
    where: { id: listingId, isActive: true, teacher: { status: "APPROVED" } },
    select: {
      id: true,
      title: true,
      subject: true,
      levels: true,
      city: true,
      modality: true,
      teacher: { select: { fullName: true } },
    },
  });

  if (!offer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Nouvelle demande</h1>
        <p className="mt-2 text-sm text-gray-600">Offre introuvable ou inactive.</p>
        <Link href="/tutors" className="mt-6 inline-block rounded-2xl border px-5 py-3 text-sm hover:bg-gray-50">
          Retour aux offres
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href={`/tutors/${offer.id}`} className="text-sm hover:underline">
        ← Retour à l’offre
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Faire une demande</h1>
      <p className="mt-2 text-sm text-gray-600">
        Offre : <span className="font-medium">{offer.title}</span> — {offer.teacher.fullName ?? "Professeur"}
      </p>

      <form action={createRequestAction} className="mt-8 space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input type="hidden" name="listingId" value={offer.id} />

        <div className="grid gap-2">
          <label className="text-sm font-medium">Matière</label>
          <input
            name="subject"
            defaultValue={offer.subject}
            className="rounded-xl border px-3 py-2"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Niveau</label>
          <select name="level" defaultValue={offer.levels[0] ?? ""} className="rounded-xl border px-3 py-2" required>
            {offer.levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Ville</label>
          <input
            name="city"
            defaultValue={offer.city}
            className="rounded-xl border px-3 py-2"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Modalité</label>
          <select name="modality" defaultValue={offer.modality} className="rounded-xl border px-3 py-2" required>
            <option value="DOMICILE">À domicile</option>
            <option value="VISIO">Visio</option>
            <option value="MIXTE">Mixte</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Objectifs</label>
          <textarea
            name="goals"
            className="min-h-[90px] rounded-xl border px-3 py-2"
            placeholder="Ex: remise à niveau, préparation brevet, méthode, confiance..."
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Disponibilités</label>
          <textarea
            name="availability"
            className="min-h-[70px] rounded-xl border px-3 py-2"
            placeholder="Ex: mercredis 15h-18h, samedis matin..."
          />
        </div>

        <button className="w-full rounded-2xl bg-black px-5 py-3 text-sm text-white hover:opacity-90">
          Envoyer la demande
        </button>

        <p className="text-xs text-gray-500">
          (V1) La demande est enregistrée. Ensuite on fera le matching prof ↔ demande.
        </p>
      </form>
    </div>
  );
}
