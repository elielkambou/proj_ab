import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL manquant. Crée un fichier .env avec DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/soutien".'
    );
  }

  try {
    const url = new URL(databaseUrl);
    if (!url.username || !url.password) {
      throw new Error("missing-credentials");
    }
  } catch {
    throw new Error(
      'DATABASE_URL invalide. Utilise le format DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE". Si ton mot de passe contient @, #, / ou :, encode-le dans l’URL.'
    );
  }

  return databaseUrl;
}

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: getDatabaseUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
