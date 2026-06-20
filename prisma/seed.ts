import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const demoPassword = await bcrypt.hash("demo12345", 10);

  await prisma.tutoringRequest.deleteMany();
  await prisma.tutorListing.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  const teachers = [
    {
      email: "prof.maths@example.com",
      fullName: "Sophie M.",
      bio: "Maths collège/lycée, méthode et confiance.",
      phone: "+225 07 01 02 03 04",
      city: "Abidjan",
      experienceYears: 6,
      diploma: "Master Mathématiques appliquées",
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
      phone: "+225 05 11 22 33 44",
      city: "Anyama",
      experienceYears: 8,
      diploma: "Licence Lettres modernes",
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
      phone: "+225 01 98 76 54 32",
      city: "Yamoussoukro",
      experienceYears: 5,
      diploma: "Bachelor English Studies",
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
        password: demoPassword,
        role: "TEACHER",
        teacherProfile: {
          create: {
            fullName: t.fullName,
            phone: t.phone,
            city: t.city,
            bio: t.bio,
            experienceYears: t.experienceYears,
            diploma: t.diploma,
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

  await prisma.user.create({
    data: {
      email: "parent@example.com",
      password: demoPassword,
      role: "PARENT",
      parentProfile: {
        create: {
          fullName: "Parent Démo",
          phone: "+225 07 00 00 00 00",
          city: "Abidjan",
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: demoPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed terminé : 3 offres, 1 parent et 1 admin créés");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
