"use client";

import Link from "next/link";
import { useState } from "react";
import CreateGardenForm from "@/components/gardens/CreateGardenForm";
import Modal from "@/components/ui/Modal";
import AddButton from "@/components/ui/AddButton";

interface Garden {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface GardensClientProps {
  initialGardens: Garden[];
  schemaError: string | null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function GardensClient({ initialGardens, schemaError }: GardensClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-16">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-medium tracking-tight lowercase md:text-6xl">
            Your gardens
          </h1>
          <p className="text-lg leading-relaxed text-ink-variant">
            Gardens are living collections of references. Create a new garden to begin
            cataloging sites worth revisiting.
          </p>
        </div>

        <AddButton
          onClick={() => setIsModalOpen(true)}
          label="New Garden"
        />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {schemaError ? (
          <div className="col-span-full rounded-[2rem] bg-surface-container-low p-8 text-center text-ink-variant">
            <p className="text-sm leading-relaxed">{schemaError}</p>
          </div>
        ) : initialGardens.length > 0 ? (
          initialGardens.map((garden) => (
            <Link
              key={garden.id}
              href={`/gardens/${garden.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-surface-container p-8 transition-all hover:-translate-y-1 hover:bg-surface-high"
            >
              {/* Subtle hand-drawn motif placeholder (using CSS) */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rotate-12 opacity-5 transition-transform group-hover:rotate-45">
                <svg viewBox="0 0 100 100" className="h-full w-full fill-current text-ink">
                  <path d="M50 10 C60 40 90 50 50 90 C10 50 40 40 50 10" />
                </svg>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-ink-variant/50">
                  Garden ID. {garden.id.slice(0, 8)}
                </p>
                <h2 className="text-2xl font-medium tracking-tight lowercase">
                  {garden.name}
                </h2>
                <p className="line-clamp-3 text-sm leading-relaxed text-ink-variant">
                  {garden.description || "An uncatalogued collection of digital fragments."}
                </p>
              </div>

              <div className="mt-12 flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-variant/60">
                  {formatDate(garden.created_at)}
                </span>
                <span className="text-xs font-medium lowercase tracking-wide text-primary-brand opacity-0 transition-opacity group-hover:opacity-100">
                  view archive →
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div 
            onClick={() => setIsModalOpen(true)}
            className="col-span-full cursor-pointer rounded-[2.5rem] border-2 border-dashed border-outline-ghost/20 bg-surface-container-low p-16 text-center transition-colors hover:bg-surface-container"
          >
            <p className="text-lg text-ink-variant">
              Your landscape is currently empty.
            </p>
            <p className="mt-2 text-sm text-ink-variant/60">
              Click the plus button or here to plant your first garden.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="new garden"
      >
        <CreateGardenForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
