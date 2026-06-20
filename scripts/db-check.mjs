import "dotenv/config";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL est manquant dans .env.");
  process.exit(1);
}

let url;
try {
  url = new URL(databaseUrl);
} catch {
  console.error("DATABASE_URL n'est pas une URL PostgreSQL valide.");
  process.exit(1);
}

const masked =
  url.protocol +
  "//" +
  (url.username || "(user)") +
  ":***@" +
  url.hostname +
  (url.port ? ":" + url.port : "") +
  url.pathname;

const pool = new pg.Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 3000,
});

try {
  const result = await pool.query(
    "select current_database() as database, current_user as user"
  );
  console.log("Connexion DB OK: " + masked);
  console.log(
    "Base: " + result.rows[0].database + "; utilisateur: " + result.rows[0].user
  );
} catch (error) {
  console.error("Connexion DB impossible: " + masked);
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await pool.end().catch(() => {});
}
