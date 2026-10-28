import { login } from "../actions";
import Image from "next/image";

export const metadata = {
  title: "Owner Login",
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  invalid: "Incorrect email or password.",
  denied: "This account does not have access to the dashboard.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-6">
      <div className="w-full max-w-sm bg-white p-8 sm:p-10">
                <Image
          src="/logo-full.png"
          alt="Autofix"
          width={802}
          height={637}
          className="mx-auto mb-6 h-auto w-32"
        />
        <h1 className="text-center text-xl font-bold uppercase tracking-[0.2em]">
          Owner Login
        </h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Sign in to manage appointments and your website.
        </p>

        <form action={login} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-black/15 px-4 py-3 outline-none focus:border-charcoal"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-black/15 px-4 py-3 outline-none focus:border-charcoal"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-brand">
              {messages[error] ?? "Could not sign in."}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-charcoal px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}