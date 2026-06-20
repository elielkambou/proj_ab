import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const statusLabels = {
  NEW: "Nouvelle demande",
  MATCHED: "Professeur assigné",
  CLOSED: "Demande clôturée",
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent("/parent/dashboard")}`);
  if (user.role !== "PARENT") redirect("/");

  const { id } = await params;

  const req = await prisma.tutoringRequest.findFirst({
    where: { id, parentId: user.id },
    select: {
      id: true,
      subject: true,
      level: true,
      city: true,
      modality: true,
      studentName: true,
      contactPhone: true,
      preferredContact: true,
      goals: true,
      availability: true,
      status: true,
      createdAt: true,
      sourceListing: {
        select: {
          title: true,
          teacher: { select: { fullName: true } },
        },
      },
      assignedListing: {
        select: {
          title: true,
          teacher: { select: { fullName: true } },
        },
      },
    },
  });

  if (!req) return notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Demande de cours</h1>
      <p className="mt-2 text-sm text-gray-600">
        Référence : {req.id} • {statusLabels[req.status]}
      </p>

      <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-gray-700">
          <div><span className="font-medium">Matière :</span> {req.subject}</div>
          <div className="mt-1"><span className="font-medium">Niveau :</span> {req.level}</div>
          <div className="mt-1"><span className="font-medium">Ville :</span> {req.city}</div>
          <div className="mt-1"><span className="font-medium">Modalité :</span> {req.modality}</div>
          <div className="mt-1"><span className="font-medium">Élève :</span> {req.studentName ?? "Non renseigné"}</div>
          <div className="mt-1"><span className="font-medium">Téléphone :</span> {req.contactPhone ?? "Non renseigné"}</div>
          <div className="mt-1"><span className="font-medium">Contact préféré :</span> {req.preferredContact ?? "Non renseigné"}</div>
        </div>

        {req.goals && <p className="mt-4 text-sm text-gray-700"><span className="font-medium">Objectifs :</span> {req.goals}</p>}
        {req.availability && <p className="mt-2 text-sm text-gray-700"><span className="font-medium">Dispos :</span> {req.availability}</p>}

        <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          <div className="font-medium">Suivi</div>
          <p className="mt-1">
            Offre demandée : {req.sourceListing?.title ?? "Non renseignée"}
            {req.sourceListing?.teacher.fullName
              ? ` avec ${req.sourceListing.teacher.fullName}`
              : ""}
          </p>
          <p className="mt-1">
            Professeur assigné :{" "}
            {req.assignedListing?.teacher.fullName ?? "En attente de matching"}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/tutors" className="rounded-2xl border px-5 py-3 text-sm hover:bg-gray-50">
            Voir d’autres offres
          </Link>
          <Link href="/parent/dashboard" className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm text-white hover:bg-emerald-800">
            Mon espace parent
          </Link>
        </div>
      </div>
    </div>
  );
}
