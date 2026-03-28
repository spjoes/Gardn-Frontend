"use client";

import { useActionState } from "react";

import { signIn } from "@/app/auth/actions";

import type { SignInState } from "@/app/auth/actions";

const INITIAL_STATE: SignInState = undefined;

export default function SignInForm() {
  const [state, action, pending] = useActionState(signIn, INITIAL_STATE);

  return (
    <form action={action} className="space-y-10">
      <div className="space-y-3">
        <label
          htmlFor="email"
          className="text-xs font-medium uppercase tracking-[0.28em] text-ink-variant/70"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field-underlined w-full bg-transparent px-0 py-4 text-lg text-ink outline-none transition-all focus:border-outline-ghost/40 placeholder:text-ink-variant/40"
          placeholder="you@studio.com"
        />
      </div>

      <div className="space-y-3">
        <label
          htmlFor="password"
          className="text-xs font-medium uppercase tracking-[0.28em] text-ink-variant/70"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field-underlined w-full bg-transparent px-0 py-4 text-lg text-ink outline-none transition-all focus:border-outline-ghost/40 placeholder:text-ink-variant/40"
          placeholder="Your password"
        />
      </div>

      {state?.error ? (
        <div className="rounded-2xl bg-surface-high/50 px-5 py-4 text-sm leading-relaxed text-ink-variant">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl px-8 py-5 text-sm font-medium tracking-wide text-white transition-all hover:shadow-lg hover:shadow-primary-brand/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
          {pending ? "opening your garden..." : "sign in"}
        </span>
      </button>
    </form>
  );
}
