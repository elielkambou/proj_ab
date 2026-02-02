import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const returnTo = sp.returnTo ?? "/";
  const error = sp.error;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Connexion</h1>

      {error && (
        <div className="mt-4 rounded-xl border bg-red-50 p-3 text-sm text-red-700">
          {error === "invalid" ? "Email ou mot de passe incorrect." : "Erreur."}
        </div>
      )}

      <form action={loginAction} className="mt-6 space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <input type="hidden" name="returnTo" value={returnTo} />

        <div>
          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>

        <div>
          <label className="text-sm font-medium">Mot de passe</label>
          <input name="password" type="password" required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>

        <button className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90">
          Se connecter
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Pas de compte ?{" "}
        <Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
