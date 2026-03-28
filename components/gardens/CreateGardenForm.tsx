"use client";

import { useActionState, useEffect } from "react";

import {
  createGarden,
  type GardenFormState,
} from "@/app/gardens/actions";

const INITIAL_STATE: GardenFormState = undefined;

export default function CreateGardenForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, pending] = useActionState(createGarden, INITIAL_STATE);

  useEffect(() => {
    if (state?.success || (state && !state.error)) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form
      action={action}
      className="space-y-8"
    >
      <div className="space-y-3">
        <label
          htmlFor="garden-name"
          className="text-xs font-medium uppercase tracking-[0.28em] text-ink-variant/70"
        >
          Garden name
        </label>
        <input
          id="garden-name"
          name="name"
          type="text"
          required
          maxLength={80}
          className="field-underlined w-full bg-transparent px-0 py-4 text-lg text-ink outline-none placeholder:text-ink-variant/40"
          placeholder="editorial inspiration"
        />
      </div>

      <div className="space-y-3">
        <label
          htmlFor="garden-description"
          className="text-xs font-medium uppercase tracking-[0.28em] text-ink-variant/70"
        >
          Short note
        </label>
        <textarea
          id="garden-description"
          name="description"
          rows={3}
          maxLength={280}
          className="field-underlined min-h-28 w-full resize-none bg-transparent px-0 py-4 text-base leading-7 text-ink outline-none placeholder:text-ink-variant/40"
          placeholder="A place for bold landing pages, tactile details, and interfaces worth revisiting."
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
        className="brand-gradient inline-flex rounded-2xl px-6 py-4 text-sm font-medium tracking-wide text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "creating garden..." : "create garden"}
      </button>
    </form>
  );
}
