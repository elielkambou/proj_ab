import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

const statusLabels = {
  NEW: "Nouvelle",
  MATCHED: "Prof assigné",
  CLOSED: "Clôturée",
};

export default async function ParentDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent("/parent/dashboard")}`);
  if (user.role !== "PARENT") redirect("/");

  const requests = await prisma.tutoringRequest.findMany({
    where: { parentId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      subject: true,
      level: true,
      city: true,
      modality: true,
      studentName: true,
      contactPhone: true,
      preferredContact: true,
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Espace parent</h1>
          <p className="mt-2 text-sm text-gray-600">{user.email}</p>
        </div>

        <div className="flex gap-3">
          <Link href="/tutors" className="rounded-2xl border px-5 py-3 text-sm hover:bg-gray-50">
            Voir les offres
          </Link>

          <form action={logoutAction}>
            <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm text-white hover:bg-emerald-800">
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Mes demandes</h2>
            <p className="mt-1 text-sm text-gray-600">
              Suivez les cours demandés et le matching proposé.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {requests.map((req) => (
            <Link
              key={req.id}
              href={`/parent/requests/${req.id}`}
              className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:shadow"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    {req.city} • {req.modality} •{" "}
                    {req.createdAt.toLocaleDateString("fr-FR")}
                  </div>
                  <h3 className="mt-1 font-semibold">
                    {req.subject} • {req.level}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Élève : {req.studentName ?? "Non renseigné"} • Contact :{" "}
                    {req.contactPhone ?? "Non renseigné"}
                    {req.preferredContact ? " via " + req.preferredContact : ""}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Offre demandée : {req.sourceListing?.title ?? "Non renseignée"}
                    {req.sourceListing?.teacher.fullName
                      ? ` avec ${req.sourceListing.teacher.fullName}`
                      : ""}
                  </p>
                  {req.assignedListing && (
                    <p className="mt-1 text-sm text-gray-600">
                      Prof assigné : {req.assignedListing.teacher.fullName ?? "Professeur"}
                    </p>
                  )}
                </div>
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {statusLabels[req.status]}
                </span>
              </div>
            </Link>
          ))}

          {requests.length === 0 && (
            <div className="rounded-2xl border border-dashed bg-white p-6 text-sm text-gray-600">
              Aucune demande pour le moment. Parcourez les offres puis cliquez
              sur “Demander un cours”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
