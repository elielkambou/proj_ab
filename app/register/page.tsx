import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; returnTo?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const role = sp.role === "TEACHER" ? "TEACHER" : "PARENT";
  const returnTo = sp.returnTo ?? "/";
  const error = sp.error;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Créer un compte</h1>
      <p className="mt-2 text-sm text-gray-600">
        {role === "TEACHER" ? "Inscription professeur" : "Inscription parent"}
      </p>

      {error && (
        <div className="mt-4 rounded-xl border bg-red-50 p-3 text-sm text-red-700">
          {error === "invalid" ? "Email invalide ou mot de passe (8+ caractères)." : "Erreur."}
        </div>
      )}

      <form action={registerAction} className="mt-6 space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <input type="hidden" name="returnTo" value={returnTo} />

        <div className="grid gap-2">
          <label className="text-sm font-medium">Je suis</label>
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="PARENT" defaultChecked={role === "PARENT"} />
              Parent
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="TEACHER" defaultChecked={role === "TEACHER"} />
              Professeur
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>

        <div>
          <label className="text-sm font-medium">Mot de passe</label>
          <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-xl border px-3 py-2" />
          <p className="mt-1 text-xs text-gray-500">8 caractères minimum.</p>
        </div>

        <button className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90">
          Créer mon compte
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Déjà un compte ?{" "}
        <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
