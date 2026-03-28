"use client";

import { useState } from "react";
import Link from "next/link";
import AddGardenSiteForm from "@/components/gardens/AddGardenSiteForm";
import Modal from "@/components/ui/Modal";
import AddButton from "@/components/ui/AddButton";

interface Site {
  id: string;
  normalized_url: string;
  processing_status: string;
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

export default function GardenDetailClient({
  garden,
  sites,
  schemaError,
}: GardenDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal when a site is successfully added (you'll need to handle this in the form or via state)
  // For now, we'll just let the user close it manually or after a successful action if we add a callback.

  return (
    <section className="px-6 pt-40 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-6 max-w-3xl">
          <Link
            href="/gardens"
            className="group inline-flex items-center gap-2 text-sm text-ink-variant hover:text-ink transition-colors"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
            <span>back to your gardens</span>
          </Link>
          
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-variant/60 font-medium">
              Garden ID. {garden?.id.split('-')[0] || '000'}
            </p>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tighter lowercase leading-[0.9]">
              {garden?.name ?? "untitled garden"}
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-ink-variant leading-relaxed font-light">
            {garden?.description ||
              "A curated collection of digital artifacts and web design inspiration."}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-6 self-end">
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="px-4 py-2 rounded-full bg-surface-container-high text-[11px] uppercase tracking-widest text-ink-variant font-medium">
              {sites.length} {sites.length === 1 ? 'seed' : 'seeds'}
            </div>
            <p className="text-xs text-ink-variant/50 italic md:pr-4 md:text-right">
              last updated {sites.length > 0 ? formatDate(sites[0].created_at) : 'recently'}
            </p>
          </div>

          <AddButton
            onClick={() => setIsModalOpen(true)}
            label="Seed a site"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16 items-start">
        {/* Sites List */}
        <div className="space-y-12">
          {schemaError ? (
            <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-ghost/10 text-ink-variant italic">
              {schemaError}
            </div>
          ) : sites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="group relative p-8 rounded-[2.5rem] bg-surface-container-low hover:bg-surface-container transition-colors duration-500 ambient-panel"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-surface-highest text-[10px] uppercase tracking-widest text-primary-brand font-semibold">
                          {site.processing_status}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-ink-variant/40 font-medium">
                          {formatDate(site.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <a
                        href={site.normalized_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-2xl font-medium tracking-tight text-ink hover:text-primary-brand transition-colors break-all leading-tight"
                      >
                        {site.normalized_url.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                      
                      <p className="text-ink-variant leading-relaxed max-w-2xl text-sm">
                        {site.processor_status_message ||
                          "Digital artifact queued for archival processing."}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-ink-variant/30 font-bold">
                      <span>File Reference</span>
                      <span className="h-px flex-1 bg-outline-ghost/10"></span>
                      <span>{site.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              onClick={() => setIsModalOpen(true)}
              className="py-20 px-8 rounded-[3rem] bg-surface-container-low border border-dashed border-outline-ghost/20 text-center space-y-4 cursor-pointer hover:bg-surface-container transition-colors"
            >
              <p className="text-lg text-ink-variant italic">
                This garden is currently empty.
              </p>
              <p className="text-sm text-ink-variant/60 max-w-xs mx-auto">
                Click the plus button or here to archive your first digital artifact.
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
            Submit a URL to be processed and indexed into this garden&apos;s digital archive.
          </p>
          {garden ? (
            <AddGardenSiteForm 
              gardenId={garden.id} 
              onSuccess={() => {
                // The form will handle success message, but we could close modal here
                // For a better UX, maybe we wait a second or let the user close it
              }} 
            />
          ) : null}
          <p className="text-[10px] leading-relaxed text-ink-variant/40 uppercase tracking-widest font-medium pt-4 border-t border-outline-ghost/10">
            Note: Artifacts are stored in Supabase and queued for automated archival analysis.
          </p>
        </div>
      </Modal>
    </section>
  );
}
