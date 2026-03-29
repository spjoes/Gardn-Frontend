"use client";

import { startTransition, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteGardenSite } from "@/app/gardens/actions";

type DeleteGardenSiteButtonProps = {
  gardenId: string;
  siteId: string;
  siteLabel: string;
};

export default function DeleteGardenSiteButton({
  gardenId,
  siteId,
  siteLabel,
}: DeleteGardenSiteButtonProps) {
  const [pending, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const confirmed = window.confirm(
            `Remove ${siteLabel} from this garden?`,
          );

          if (!confirmed) {
            return;
          }

          setError(null);
          startDeleteTransition(() => {
            startTransition(async () => {
              const result = await deleteGardenSite(gardenId, siteId);

              if (result.error) {
                setError(result.error);
                return;
              }

              router.refresh();
            });
          });
        }}
        className="rounded-full bg-surface-highest px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink-variant transition-colors hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "removing..." : "remove"}
      </button>

      {error ? (
        <p className="max-w-56 text-right text-[11px] leading-relaxed text-ink-variant/70">
          {error}
        </p>
      ) : null}
    </div>
  );
}
