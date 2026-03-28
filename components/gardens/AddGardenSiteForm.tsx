"use client";

import { useActionState } from "react";

import {
  addSiteToGarden,
  type GardenFormState,
} from "@/app/gardens/actions";

const INITIAL_STATE: GardenFormState = undefined;

type AddGardenSiteFormProps = {
  gardenId: string;
  onSuccess?: () => void;
};

export default function AddGardenSiteForm({
  gardenId,
  onSuccess,
}: AddGardenSiteFormProps) {
  const addSiteAction = addSiteToGarden.bind(null, gardenId);
  const [state, action, pending] = useActionState(
    addSiteAction,
    INITIAL_STATE,
  );

  // Trigger onSuccess when state changes to success
  if (state?.success && onSuccess) {
    onSuccess();
  }

  return (
    <form
      action={action}
      className="space-y-8"
    >
      <div className="space-y-3">
        <label
          htmlFor="site-url"
          className="text-[10px] font-medium uppercase tracking-[0.3em] text-ink-variant/60"
        >
          Site URL
        </label>
        <input
          id="site-url"
          name="siteUrl"
          type="url"
          required
          className="field-underlined w-full bg-transparent px-0 py-4 text-lg text-ink outline-none placeholder:text-ink-variant/20"
          placeholder="https://example.com"
        />
      </div>

      {state?.error ? (
        <div className="rounded-2xl bg-surface-high/50 px-5 py-4 text-sm leading-relaxed text-ink-variant italic">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="rounded-2xl bg-surface-highest/60 px-5 py-4 text-sm leading-relaxed text-ink-variant italic">
          {state.success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient w-full rounded-2xl px-6 py-4 text-sm font-medium tracking-widest text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 uppercase"
      >
        {pending ? "planting..." : "seed this site"}
      </button>
    </form>
  );
}
