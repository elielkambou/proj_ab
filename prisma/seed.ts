import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  // Nettoyage (si les tables existent)
  await prisma.tutorListing.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  const teachers = [
    {
      email: "prof.maths@example.com",
      fullName: "Sophie M.",
      bio: "Maths collège/lycée, méthode et confiance.",
      subjects: ["Maths"],
      levels: ["4ème", "3ème", "2nde", "1ère", "Terminale"],
      cities: ["Abidjan", "Songon"],
      listing: {
        title: "Cours de Maths – Collège & Lycée",
        subject: "Maths",
        levels: ["3ème", "2nde", "1ère"],
        city: "Abidjan",
        modality: "DOMICILE" as const,
        description: "Remise à niveau + préparation brevet/bac.",
        rateMin: 25,
        rateMax: 35,
      },
    },
    {
      email: "prof.francais@example.com",
      fullName: "Michel G.",
      bio: "Français : rédaction, grammaire, oral.",
      subjects: ["Français"],
      levels: ["6ème", "5ème", "4ème", "3ème"],
      cities: ["Anyama"],
      listing: {
        title: "Français – Progresser en rédaction",
        subject: "Français",
        levels: ["5ème", "4ème", "3ème"],
        city: "Anyama",
        modality: "MIXTE" as const,
        description: "Méthode + exercices ciblés, suivi régulier.",
        rateMin: 22,
        rateMax: 30,
      },
    },
    {
      email: "prof.anglais@example.com",
      fullName: "Emma R.",
      bio: "Anglais visio, conversation + examens.",
      subjects: ["Anglais"],
      levels: ["2nde", "1ère", "Terminale", "Supérieur"],
      cities: ["Yamoussoukro", "Korogho"],
      listing: {
        title: "Anglais en visio – Oral & examens",
        subject: "Anglais",
        levels: ["1ère", "Terminale"],
        city: "Yamoussoukro",
        modality: "VISIO" as const,
        description: "Conversation + entraînement bac et tests.",
        rateMin: 20,
        rateMax: 28,
      },
    },
  ];

  for (const t of teachers) {
    await prisma.user.create({
      data: {
        email: t.email,
        password: "demo",
        role: "TEACHER",
        teacherProfile: {
          create: {
            fullName: t.fullName,
            bio: t.bio,
            status: "APPROVED",
            subjects: t.subjects,
            levels: t.levels,
            cities: t.cities,
            listings: { create: { ...t.listing, isActive: true } },
          },
        },
      },
    });
  }

  console.log("✅ Seed terminé : 3 offres créées");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
