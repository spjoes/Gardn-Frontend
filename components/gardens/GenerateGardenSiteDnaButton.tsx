"use client";

import { startTransition, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { requestGardenSiteDesignDna } from "@/app/gardens/actions";

type GenerateGardenSiteDnaButtonProps = {
  gardenId: string;
  siteId: string;
  hasDesignDocument: boolean;
};

export default function GenerateGardenSiteDnaButton({
  gardenId,
  siteId,
  hasDesignDocument,
}: GenerateGardenSiteDnaButtonProps) {
  const [pending, startRequestTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMessage(null);

          startRequestTransition(() => {
            startTransition(async () => {
              const result = await requestGardenSiteDesignDna(gardenId, siteId);

              if (result?.error) {
                setMessage(result.error);
                return;
              }

              setMessage(
                result?.success ??
                  "Design DNA queued. Refresh in a moment to see the updated dossier.",
              );
              router.refresh();
            });
          });
        }}
        className="rounded-full bg-surface-highest px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink-variant transition-colors hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? hasDesignDocument
            ? "refreshing..."
            : "queuing..."
          : hasDesignDocument
            ? "refresh dna"
            : "generate dna"}
      </button>

      {message ? (
        <p className="max-w-56 text-right text-[11px] leading-relaxed text-ink-variant/70">
          {message}
        </p>
      ) : null}
    </div>
  );
}
