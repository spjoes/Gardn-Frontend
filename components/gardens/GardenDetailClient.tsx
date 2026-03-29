"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import AddGardenSiteForm from "@/components/gardens/AddGardenSiteForm";
import DeleteGardenSiteButton from "@/components/gardens/DeleteGardenSiteButton";
import Modal from "@/components/ui/Modal";
import AddButton from "@/components/ui/AddButton";

interface Site {
  id: string;
  normalized_url: string;
  processor_status_message: string | null;
  created_at: string;
}

interface Garden {
  id: string;
  name: string;
  description: string | null;
}

interface GardenDetailClientProps {
  garden: Garden | null;
  sites: Site[];
  schemaError: string | null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTimestamp(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatSiteLabel(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "");
  }
}

export default function GardenDetailClient({
  garden,
  sites,
  schemaError,
}: GardenDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-40 pb-20">
      <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-3xl space-y-6">
          <Link
            href="/gardens"
            className="group inline-flex items-center gap-2 text-sm text-ink-variant transition-colors hover:text-ink"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span>back to your gardens</span>
          </Link>

          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-ink-variant/60">
              Garden ID. {garden?.id.split("-")[0] || "000"}
            </p>
            <h1 className="text-5xl font-medium leading-[0.9] tracking-tighter lowercase md:text-7xl">
              {garden?.name ?? "untitled garden"}
            </h1>
          </div>

          <p className="text-xl font-light leading-relaxed text-ink-variant md:text-2xl">
            {garden?.description ||
              "A curated collection of digital artifacts and web design inspiration."}
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 self-end md:items-end">
          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="rounded-full bg-surface-container px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-ink-variant">
              {sites.length} {sites.length === 1 ? "seed" : "seeds"}
            </div>
            <p className="text-xs italic text-ink-variant/50 md:pr-4 md:text-right">
              last updated {sites.length > 0 ? formatDate(sites[0].created_at) : "recently"}
            </p>
          </div>

          <AddButton
            onClick={() => setIsModalOpen(true)}
            label="Seed a site"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16 items-start">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-variant/60">
              saved references
            </p>
            <h2 className="text-2xl tracking-tight lowercase text-ink">
              {sites.length > 0
                ? `${sites.length} site${sites.length === 1 ? "" : "s"} collected here`
                : "no saved references yet"}
            </h2>
          </div>

          {schemaError ? (
            <div className="rounded-[2rem] bg-surface-container-low px-6 py-8 text-sm italic text-ink-variant">
              {schemaError}
            </div>
          ) : sites.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {sites.map((site) => (
                <motion.article
                  key={site.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  whileHover={{ backgroundColor: "var(--color-surface-container)" }}
                  className="ambient-panel rounded-[2rem] bg-surface-container-low px-6 py-5 transition-colors duration-150"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-surface-highest px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-variant">
                          saved
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.28em] text-ink-variant/45">
                          added {formatTimestamp(site.created_at)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xl font-medium tracking-tight text-ink">
                          {formatSiteLabel(site.normalized_url)}
                        </p>
                        <p className="text-sm leading-relaxed text-ink-variant/80">
                          {site.processor_status_message ?? "Saved for future reference."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-ink-variant/35">
                        <span>ref.</span>
                        <span>{site.id.slice(0, 8)}</span>
                      </div>
                      {garden?.id ? (
                        <DeleteGardenSiteButton
                          gardenId={garden.id}
                          siteId={site.id}
                          siteLabel={formatSiteLabel(site.normalized_url)}
                        />
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer rounded-[3rem] bg-surface-container-low px-8 py-20 text-center space-y-4 transition-colors hover:bg-surface-container"
            >
              <p className="text-lg italic text-ink-variant">
                This garden is currently empty.
              </p>
              <p className="mx-auto max-w-xs text-sm text-ink-variant/60">
                Click the plus button or here to seed your first site.
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="seed a site"
      >
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-ink-variant/80">
            Save a URL into this garden so you can revisit it later.
          </p>
          {garden ? (
            <AddGardenSiteForm
              gardenId={garden.id}
              onSuccess={() => {
                setIsModalOpen(false);
              }}
            />
          ) : null}
          <p className="pt-4 text-[10px] font-medium leading-relaxed uppercase tracking-widest text-ink-variant/40">
            Saved seeds stay in your archive until you are ready to use them.
          </p>
        </div>
      </Modal>
    </section>
  );
}
