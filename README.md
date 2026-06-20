# Soutien+

Application Next.js de mise en relation entre familles, professeurs et admin, avec candidature professeur, CV téléchargeable dans l’espace admin et base PostgreSQL.

## Fonctionnalités

- Catalogue public d’offres avec filtres par matière, ville, niveau et modalité.
- Comptes parent/professeur/admin avec sessions sécurisées par cookie JWT.
- Demandes parent complètes : élève, téléphone, disponibilité, objectifs et offre source.
- Candidature professeur : profil, expérience, diplôme, première offre et upload CV.
- Stockage du CV en base et téléchargement sécurisé depuis l’espace admin.
- Console admin pour valider/refuser les professeurs, télécharger les CV et assigner une offre à une demande.

## Installation locale

    npm install
    cp .env.example .env

Le projet fournit un Postgres Docker sur le port 5433, pour éviter les conflits avec un Postgres déjà présent sur 5432.

## Variables d’environnement

    DATABASE_URL="postgresql://soutien:soutien_dev_password@localhost:5433/soutien"
    AUTH_SECRET="une_phrase_longue_et_secrete"

Pour la production, remplace DATABASE_URL par l’URL Neon pooled avec sslmode=require.

## Base de données locale

    npm run db:up
    npm run db:check
    npm run db:generate
    npm run db:migrate
    npm run db:seed

Comptes de démonstration après le seed:

- parent@example.com / demo12345
- admin@example.com / demo12345
- prof.maths@example.com / demo12345

## Développement

    npm run dev

Ouvre ensuite http://localhost:3000.

## Déploiement Neon + Vercel

1. Crée un projet Neon et copie l’URL PostgreSQL pooled.
2. Dans Vercel, ajoute les variables DATABASE_URL et AUTH_SECRET.
3. Applique les migrations sur Neon depuis ta machine:

    npm run db:deploy

4. Déploie sur Vercel. Le script de build exécute prisma generate puis next build.

## Docker / droits

Si npm run db:up répond que Docker est introuvable ou que l’accès à /var/run/docker.sock est refusé, démarre Docker Desktop ou lance Docker avec un utilisateur qui a les droits. Sous WSL avec Docker installé via Snap:

    sudo /snap/bin/docker compose up -d db
