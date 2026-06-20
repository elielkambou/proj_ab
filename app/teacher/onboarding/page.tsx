import { submitTeacherApplicationAction } from "@/app/actions/teacher";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusLabels = {
  DRAFT: "Brouillon",
  SUBMITTED: "Envoyée",
  INTERVIEW: "Entretien",
  APPROVED: "Approuvée",
  REJECTED: "Refusée",
};

const errorLabels = {
  invalid: "Vérifiez les champs obligatoires, les tarifs et les informations de profil.",
  "cv-required": "Ajoutez votre CV en PDF, DOC ou DOCX pour soumettre la candidature.",
  "cv-size": "Le CV doit faire 5 Mo maximum.",
  "cv-type": "Format CV accepté : PDF, DOC ou DOCX.",
};


export default async function TeacherOnboarding({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; storage?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=" + encodeURIComponent("/teacher/onboarding"));
  if (user.role !== "TEACHER") redirect("/");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      fullName: true,
      phone: true,
      city: true,
      bio: true,
      experienceYears: true,
      diploma: true,
      status: true,
      subjects: true,
      levels: true,
      cities: true,
      cvFileName: true,
      cvReceivedAt: true,
      listings: {
        orderBy: { createdAt: "desc" },
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
          isActive: true,
        },
      },
    },
  });
  const firstListing = profile?.listings[0];
  const errorMessage =
    sp.error && sp.error in errorLabels
      ? errorLabels[sp.error as keyof typeof errorLabels]
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            Espace professeur
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Candidature professeur
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Statut actuel :{" "}
            <span className="font-medium text-emerald-800">
              {statusLabels[profile?.status ?? "DRAFT"]}
            </span>
          </p>
        </div>
        <Link
          href="/tutors"
          className="rounded-2xl border border-emerald-200 px-5 py-3 text-sm text-emerald-900 hover:bg-emerald-50"
        >
          Voir les offres publiques
        </Link>
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {sp.success === "submitted" && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Candidature enregistrée. Le CV est disponible dans l’espace admin.
        </div>
      )}

      <form
        action={submitTeacherApplicationAction}
        encType="multipart/form-data"
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]"
      >
        <input type="hidden" name="listingId" value={firstListing?.id ?? ""} />

        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Profil et justificatifs</h2>
          <p className="mt-1 text-sm text-gray-600">
            Ces informations servent à valider votre profil avant publication.
          </p>
          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nom complet</label>
                <input
                  name="fullName"
                  defaultValue={profile?.fullName ?? ""}
                  className="rounded-xl border px-3 py-2"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Téléphone</label>
                <input
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  className="rounded-xl border px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ville principale</label>
                <input
                  name="profileCity"
                  defaultValue={profile?.city ?? ""}
                  className="rounded-xl border px-3 py-2"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Années d’expérience</label>
                <input
                  name="experienceYears"
                  type="number"
                  min="0"
                  defaultValue={profile?.experienceYears ?? ""}
                  className="rounded-xl border px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Diplôme ou parcours</label>
              <input
                name="diploma"
                defaultValue={profile?.diploma ?? ""}
                placeholder="Licence Maths, Master, école d’ingénieur..."
                className="rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Présentation</label>
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ""}
                className="min-h-[130px] rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Matières</label>
              <input
                name="subjects"
                defaultValue={profile?.subjects.join(", ") ?? ""}
                placeholder="Maths, Physique, Anglais"
                className="rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Niveaux</label>
              <input
                name="levels"
                defaultValue={profile?.levels.join(", ") ?? ""}
                placeholder="6ème, 3ème, Terminale"
                className="rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Zones couvertes</label>
              <input
                name="cities"
                defaultValue={profile?.cities.join(", ") ?? ""}
                placeholder="Abidjan, Cocody, Yopougon"
                className="rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4">
              <label className="text-sm font-medium">CV</label>
              <input
                name="cv"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="rounded-xl border bg-white px-3 py-2 text-sm"
                required={!profile?.cvFileName}
              />
              <p className="text-xs text-gray-600">
                PDF, DOC ou DOCX, 5 Mo maximum. Le fichier sera disponible dans l’espace admin.
              </p>
              {profile?.cvFileName && (
                <p className="text-xs font-medium text-emerald-800">
                  CV reçu : {profile.cvFileName}
                  {profile.cvReceivedAt
                    ? " le " + profile.cvReceivedAt.toLocaleDateString("fr-FR")
                    : ""}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Première offre publique</h2>
          <p className="mt-1 text-sm text-gray-600">
            Elle sera visible après validation admin.
          </p>
          <div className="mt-5 space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titre</label>
              <input
                name="title"
                defaultValue={firstListing?.title ?? ""}
                placeholder="Cours de Maths - Collège et Lycée"
                className="rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Matière principale</label>
              <input
                name="subject"
                defaultValue={firstListing?.subject ?? profile?.subjects[0] ?? ""}
                className="rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Niveaux de l’offre</label>
              <input
                name="listingLevels"
                defaultValue={firstListing?.levels.join(", ") ?? ""}
                placeholder="3ème, 2nde, 1ère"
                className="rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ville</label>
                <input
                  name="city"
                  defaultValue={firstListing?.city ?? profile?.cities[0] ?? ""}
                  className="rounded-xl border px-3 py-2"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Modalité</label>
                <select
                  name="modality"
                  defaultValue={firstListing?.modality ?? "DOMICILE"}
                  className="rounded-xl border px-3 py-2"
                >
                  <option value="DOMICILE">À domicile</option>
                  <option value="VISIO">Visio</option>
                  <option value="MIXTE">Mixte</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Description de l’offre</label>
              <textarea
                name="description"
                defaultValue={firstListing?.description ?? ""}
                className="min-h-[110px] rounded-xl border px-3 py-2"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tarif min</label>
                <input
                  name="rateMin"
                  type="number"
                  min="1"
                  defaultValue={firstListing?.rateMin ?? ""}
                  className="rounded-xl border px-3 py-2"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tarif max</label>
                <input
                  name="rateMax"
                  type="number"
                  min="1"
                  defaultValue={firstListing?.rateMax ?? ""}
                  className="rounded-xl border px-3 py-2"
                />
              </div>
            </div>

            <button className="w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800">
              {profile ? "Mettre à jour la candidature" : "Soumettre la candidature"}
            </button>
          </div>
        </section>
      </form>

      {profile?.listings.length ? (
        <section className="mt-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Mes offres</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {profile.listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-xl border bg-emerald-50/50 p-4 text-sm"
              >
                <div className="font-medium">{listing.title}</div>
                <div className="mt-1 text-gray-600">
                  {listing.subject} • {listing.city} • {listing.modality}
                </div>
                <div className="mt-1 text-gray-600">
                  Visibilité publique :{" "}
                  {profile.status === "APPROVED" && listing.isActive
                    ? "active"
                    : "en attente de validation"}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
