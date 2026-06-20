import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import {
  approveTeacherAction,
  assignRequestAction,
  closeRequestAction,
  rejectTeacherAction,
} from "@/app/actions/admin";
import { RequestStatus, TeacherApplicationStatus } from "@prisma/client";

const requestStatusLabels: Record<RequestStatus, string> = {
  NEW: "Nouvelle",
  MATCHED: "Matchée",
  CLOSED: "Clôturée",
};

const applicationStatusLabels: Record<TeacherApplicationStatus, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Envoyée",
  INTERVIEW: "Entretien",
  APPROVED: "Approuvée",
  REJECTED: "Refusée",
};

const successMessages: Record<string, string> = {
  "teacher-approved": "Candidature approuvée.",
  "teacher-rejected": "Candidature refusée.",
  "request-assigned": "Demande assignée.",
  "request-closed": "Demande clôturée.",
};

function formatDate(value: Date) {
  return value.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(size?: number | null) {
  if (!size) return "taille inconnue";
  return `${(size / 1024 / 1024).toFixed(1)} Mo`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent("/admin")}`);
  if (user.role !== "ADMIN") redirect("/");

  const [
    totalUsers,
    totalParents,
    totalTeachers,
    pendingApplications,
    approvedTeachers,
    activeListings,
    newRequests,
    matchedRequests,
    closedRequests,
    applications,
    parents,
    requests,
    listings,
    activeOffers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PARENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.teacherProfile.count({
      where: { status: { in: ["SUBMITTED", "INTERVIEW"] } },
    }),
    prisma.teacherProfile.count({ where: { status: "APPROVED" } }),
    prisma.tutorListing.count({ where: { isActive: true } }),
    prisma.tutoringRequest.count({ where: { status: "NEW" } }),
    prisma.tutoringRequest.count({ where: { status: "MATCHED" } }),
    prisma.tutoringRequest.count({ where: { status: "CLOSED" } }),
    prisma.teacherProfile.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 20,
      select: {
        id: true,
        fullName: true,
        phone: true,
        city: true,
        bio: true,
        experienceYears: true,
        diploma: true,
        cvFileName: true,
        cvMimeType: true,
        cvSize: true,
        cvReceivedAt: true,
        subjects: true,
        levels: true,
        cities: true,
        status: true,
        updatedAt: true,
        user: { select: { email: true } },
        listings: {
          select: {
            title: true,
            subject: true,
            city: true,
            modality: true,
            rateMin: true,
            rateMax: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "PARENT" },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        email: true,
        createdAt: true,
        parentProfile: {
          select: { fullName: true, phone: true, city: true },
        },
        requests: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            subject: true,
            level: true,
            city: true,
            status: true,
            createdAt: true,
          },
        },
        _count: { select: { requests: true } },
      },
    }),
    prisma.tutoringRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
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
        parent: {
          select: {
            email: true,
            parentProfile: {
              select: { fullName: true, phone: true, city: true },
            },
          },
        },
        sourceListing: {
          select: {
            title: true,
            teacher: { select: { fullName: true } },
          },
        },
        assignedListingId: true,
      },
    }),
    prisma.tutorListing.findMany({
      where: { isActive: true, teacher: { status: "APPROVED" } },
      orderBy: [{ subject: "asc" }, { city: "asc" }],
      select: {
        id: true,
        title: true,
        subject: true,
        city: true,
        teacher: { select: { fullName: true } },
      },
    }),
    prisma.tutorListing.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        subject: true,
        levels: true,
        city: true,
        modality: true,
        rateMin: true,
        rateMax: true,
        teacher: {
          select: {
            fullName: true,
            status: true,
            user: { select: { email: true } },
          },
        },
      },
    }),
  ]);

  const systemChecks = [
    {
      label: "Base de données",
      value: "Connectée",
      ok: Boolean(process.env.DATABASE_URL),
    },
    {
      label: "Stockage CV",
      value: "Base Neon",
      ok: true,
    },
    {
      label: "Offres assignables",
      value: `${listings.length} disponible(s)`,
      ok: listings.length > 0,
    },
  ];

  const kpis = [
    { label: "Utilisateurs", value: totalUsers },
    { label: "Parents inscrits", value: totalParents },
    { label: "Professeurs", value: totalTeachers },
    { label: "Candidatures à traiter", value: pendingApplications },
    { label: "Professeurs approuvés", value: approvedTeachers },
    { label: "Offres actives", value: activeListings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-emerald-800 hover:text-emerald-950">
              Soutien+
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Administration
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Connecté avec {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm text-emerald-900 hover:bg-emerald-50"
            >
              Accueil
            </Link>
            <Link
              href="/tutors"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm text-emerald-900 hover:bg-emerald-50"
            >
              Offres publiques
            </Link>
            <form action={logoutAction}>
              <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {sp.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Action impossible. Vérifiez la sélection et réessayez.
          </div>
        )}

        {sp.success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {successMessages[sp.success] ?? "Action enregistrée."}
          </div>
        )}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="text-2xl font-semibold text-emerald-800">
                {kpi.value}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {kpi.label}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Demandes parents</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {newRequests} nouvelle(s), {matchedRequests} matchée(s), {closedRequests} clôturée(s).
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{formatDate(request.createdAt)}</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-800">
                          {requestStatusLabels[request.status]}
                        </span>
                        <span>{request.parent.email}</span>
                      </div>
                      <h3 className="mt-2 font-semibold">
                        {request.subject} - {request.level}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {request.city} - {request.modality}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        Parent : {request.parent.parentProfile?.fullName ?? "Nom non renseigné"}
                        {" · "}Élève : {request.studentName ?? "Non renseigné"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Contact : {request.contactPhone ?? request.parent.parentProfile?.phone ?? "Non renseigné"}
                        {request.preferredContact ? ` via ${request.preferredContact}` : ""}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Offre source : {request.sourceListing?.title ?? "Non renseignée"}
                        {request.sourceListing?.teacher.fullName
                          ? ` avec ${request.sourceListing.teacher.fullName}`
                          : ""}
                      </p>
                      {request.goals && (
                        <p className="mt-2 text-sm text-slate-600">
                          Objectifs : {request.goals}
                        </p>
                      )}
                      {request.availability && (
                        <p className="mt-1 text-sm text-slate-600">
                          Disponibilités : {request.availability}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <form action={assignRequestAction} className="space-y-2">
                        <input type="hidden" name="requestId" value={request.id} />
                        <select
                          name="listingId"
                          defaultValue={request.assignedListingId ?? ""}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Choisir une offre</option>
                          {listings.map((listing) => (
                            <option key={listing.id} value={listing.id}>
                              {listing.subject} - {listing.city} - {listing.teacher.fullName ?? "Professeur"}
                            </option>
                          ))}
                        </select>
                        <button
                          className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                          disabled={listings.length === 0}
                        >
                          Assigner
                        </button>
                      </form>
                      <form action={closeRequestAction}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
                          Clôturer
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                  Aucune demande parent pour le moment.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">État technique</h2>
              <div className="mt-4 space-y-3">
                {systemChecks.map((check) => (
                  <div key={check.label} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-medium">{check.label}</div>
                      <div className="mt-1 text-xs text-slate-500">{check.value}</div>
                    </div>
                    <span
                      className={
                        check.ok
                          ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800"
                          : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
                      }
                    >
                      {check.ok ? "OK" : "À configurer"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Offres actives</h2>
              <div className="mt-4 space-y-3">
                {activeOffers.map((offer) => (
                  <Link
                    key={offer.id}
                    href={`/tutors/${offer.id}`}
                    className="block rounded-lg border border-slate-200 p-3 hover:border-emerald-300 hover:bg-emerald-50/40"
                  >
                    <div className="text-sm font-medium">{offer.title}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {offer.subject} - {offer.city} - {offer.modality}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {offer.teacher.fullName ?? offer.teacher.user.email} - {applicationStatusLabels[offer.teacher.status]}
                    </div>
                  </Link>
                ))}

                {activeOffers.length === 0 && (
                  <p className="text-sm text-slate-600">Aucune offre active.</p>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Candidatures professeurs</h2>
              <p className="mt-1 text-sm text-slate-600">
                Les CV sont conservés dans l’espace admin et téléchargeables pour analyse.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{application.user.email}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-800">
                        {applicationStatusLabels[application.status]}
                      </span>
                      <span>Mis à jour le {formatDate(application.updatedAt)}</span>
                    </div>
                    <h3 className="mt-2 font-semibold">
                      {application.fullName ?? "Nom non renseigné"}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                      {application.bio ?? "Présentation non renseignée."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={approveTeacherAction}>
                      <input type="hidden" name="profileId" value={application.id} />
                      <button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-800">
                        Approuver
                      </button>
                    </form>
                    <form action={rejectTeacherAction}>
                      <input type="hidden" name="profileId" value={application.id} />
                      <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                        Refuser
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div>Téléphone : {application.phone ?? "Non renseigné"}</div>
                  <div>Ville : {application.city ?? "Non renseignée"}</div>
                  <div>Expérience : {application.experienceYears ?? 0} an(s)</div>
                  <div>Diplôme : {application.diploma ?? "Non renseigné"}</div>
                </div>

                <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950">
                  CV : {application.cvFileName ?? "Non transmis"}
                  {application.cvMimeType ? ` - ${application.cvMimeType}` : ""}
                  {application.cvSize ? ` - ${formatFileSize(application.cvSize)}` : ""}
                  {application.cvReceivedAt ? ` - reçu le ${formatDate(application.cvReceivedAt)}` : ""}
                  {application.cvFileName ? (
                    <Link
                      href={"/admin/cv/" + application.id}
                      className="ml-2 inline-flex rounded-md bg-white px-2 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                    >
                      Télécharger
                    </Link>
                  ) : null}
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  {application.subjects.join(", ") || "Matières non renseignées"}
                  {" · "}
                  {application.levels.join(", ") || "Niveaux non renseignés"}
                  {" · "}
                  {application.cities.join(", ") || "Villes non renseignées"}
                </p>

                <div className="mt-4 space-y-2">
                  {application.listings.map((listing) => (
                    <div key={`${application.id}-${listing.title}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                      <div className="font-medium">{listing.title}</div>
                      <div className="mt-1 text-slate-600">
                        {listing.subject} - {listing.city} - {listing.modality}
                        {listing.rateMin && listing.rateMax
                          ? ` - ${listing.rateMin}-${listing.rateMax}€/h`
                          : ""}
                        {!listing.isActive ? " - inactive" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {applications.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 lg:col-span-2">
                Aucune candidature professeur.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Parents inscrits</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-4 font-medium">Parent</th>
                  <th className="py-3 pr-4 font-medium">Contact</th>
                  <th className="py-3 pr-4 font-medium">Ville</th>
                  <th className="py-3 pr-4 font-medium">Demandes</th>
                  <th className="py-3 pr-4 font-medium">Dernière demande</th>
                  <th className="py-3 font-medium">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((parent) => {
                  const lastRequest = parent.requests[0];

                  return (
                    <tr key={parent.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4">
                        <div className="font-medium">
                          {parent.parentProfile?.fullName ?? "Nom non renseigné"}
                        </div>
                        <div className="text-xs text-slate-500">{parent.email}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {parent.parentProfile?.phone ?? "Non renseigné"}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {parent.parentProfile?.city ?? "Non renseignée"}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {parent._count.requests}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {lastRequest
                          ? `${lastRequest.subject} - ${requestStatusLabels[lastRequest.status]}`
                          : "Aucune"}
                      </td>
                      <td className="py-3 text-slate-600">
                        {formatDate(parent.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {parents.length === 0 && (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
              Aucun parent inscrit.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
