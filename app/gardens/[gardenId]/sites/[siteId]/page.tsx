import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  getGardenSiteDesignDocumentForUser,
  requireAuthenticatedUser,
} from "@/lib/gardens";

type GardenSiteDesignDnaPageProps = {
  params: Promise<{
    gardenId: string;
    siteId: string;
  }>;
};

function formatSiteLabel(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "");
  }
}

function formatTimestamp(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusLabel(status: string, hasDesignDocument: boolean) {
  if (status === "failed") {
    return "needs retry";
  }

  if (status === "processing") {
    return "analyzing";
  }

  if (status === "queued") {
    return "queued";
  }

  return hasDesignDocument ? "dna ready" : "saved";
}

export default async function GardenSiteDesignDnaPage({
  params,
}: GardenSiteDesignDnaPageProps) {
  const { gardenId, siteId } = await params;
  const user = await requireAuthenticatedUser();

  const detail = await getGardenSiteDesignDocumentForUser(user.id, gardenId, siteId);

  if (!detail.garden || !detail.site) {
    notFound();
  }

  const siteLabel = formatSiteLabel(detail.site.normalized_url);
  const statusLabel = getStatusLabel(
    detail.site.processing_status,
    Boolean(detail.designDocument),
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-surface-highest selection:text-ink">
      <Navbar userEmail={user.email} />

      <main className="flex-1 px-6 pb-24 pt-40">
        <section className="mx-auto max-w-5xl space-y-10">
          <div className="space-y-6">
            <Link
              href={`/gardens/${gardenId}`}
              className="group inline-flex items-center gap-2 text-sm text-ink-variant transition-colors hover:text-ink"
            >
              <span className="text-lg transition-transform group-hover:-translate-x-1">
                ←
              </span>
              <span>back to {detail.garden.name}</span>
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-surface-container px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-variant">
                  {statusLabel}
                </span>
                <span className="rounded-full bg-surface-highest px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-variant/70">
                  site ref. {detail.site.id.slice(0, 8)}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink-variant/60">
                  design dna
                </p>
                <h1 className="text-4xl font-medium leading-[0.92] tracking-tight lowercase md:text-6xl">
                  {siteLabel}
                </h1>
              </div>

              <p className="max-w-3xl text-lg leading-relaxed text-ink-variant">
                {detail.site.processor_status_message ??
                  "Gardn keeps a DESIGN.md dossier here so future agents can design from taste, not generic patterns."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={detail.site.normalized_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-surface-container px-5 py-3 text-xs uppercase tracking-[0.28em] text-ink-variant transition-colors hover:bg-surface-high"
            >
              visit source
            </a>

            {detail.designDocument ? (
              <Link
                href={`/gardens/${gardenId}/sites/${siteId}/design-md`}
                className="rounded-full bg-surface-highest px-5 py-3 text-xs uppercase tracking-[0.28em] text-ink-variant transition-colors hover:bg-surface-high"
              >
                raw DESIGN.md
              </Link>
            ) : null}
          </div>

          {detail.designDocument ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-ink-variant/55">
                <span>written {formatTimestamp(detail.designDocument.updated_at)}</span>
                <span>model {detail.designDocument.model_name}</span>
                <span>prompt {detail.designDocument.prompt_version}</span>
              </div>

              {detail.designDocument.search_tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {detail.designDocument.search_tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-container px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-ink-variant/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <article className="ambient-panel rounded-[2.5rem] bg-surface-container-low px-6 py-8 sm:px-10 sm:py-12">
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-7 text-ink">
                  {detail.designDocument.document_markdown}
                </pre>
              </article>
            </div>
          ) : (
            <div className="ambient-panel rounded-[2.5rem] bg-surface-container-low px-6 py-10 sm:px-10">
              <p className="max-w-2xl text-base leading-relaxed text-ink-variant">
                {detail.site.processing_status === "failed"
                  ? "The last Design DNA attempt did not finish successfully. Return to the garden and retry the analysis once your Browserbase and Gemini configuration is ready."
                  : detail.site.processing_status === "queued" ||
                      detail.site.processing_status === "processing"
                    ? "Gardn is still drafting this DESIGN.md. Refresh this page in a moment to see the finished dossier."
                    : "This site has not been analyzed yet. Return to the garden and queue Design DNA generation."}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
