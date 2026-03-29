"use client";

import { useActionState, useEffect } from "react";

import {
  addSiteToGarden,
  type GardenFormState,
} from "@/app/gardens/actions";

import { ModalButton } from "@/components/ui/Modal";

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

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [onSuccess, state?.success]);

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

      <ModalButton
        type="submit"
        disabled={pending}
      >
        {pending ? "planting..." : "seed this site"}
      </ModalButton>

      <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest text-ink-variant/45">
        Gardn will draft a DESIGN.md for this site in the background.
      </p>
    </form>
  );
}
