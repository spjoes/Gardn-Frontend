import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import SignInForm from "@/components/auth/SignInForm";
import { createClient } from "@/lib/supabase/server";

import Footer from "@/components/Footer";

type SignInPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { message } = await searchParams;

  return (
    <div className="min-h-screen selection:bg-surface-highest selection:text-ink flex flex-col flex-1">
      <Navbar />

      <main className="flex-1 px-6 pb-24 pt-36">
        <section className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-16">
          <div className="ambient-panel w-full max-w-md rounded-[2.5rem] bg-surface-container-low p-10 md:p-12">
            <div className="mb-10">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary-brand/70">
                Existing members
              </p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight lowercase">
                reopen your garden.
              </h2>
            </div>

            {message ? (
              <div className="mb-8 rounded-2xl bg-surface-high/50 px-5 py-4 text-sm leading-relaxed text-ink-variant">
                {message}
              </div>
            ) : null}

            <SignInForm />

            <div className="mt-12 space-y-6 pt-6 border-t border-outline-ghost/10">
              <Link 
                href="/" 
                className="inline-block text-sm font-medium text-primary-brand hover:text-primary-dim transition-colors underline decoration-outline-ghost/30 underline-offset-8 hover:decoration-primary-brand/50"
              >
                Return to the landing page
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
