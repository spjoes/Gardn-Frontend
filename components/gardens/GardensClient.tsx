"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
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

interface GardenCardFaceProps {
  garden: Garden;
  shortId: string;
  description: string;
}

const deckTransition = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
  mass: 0.8,
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCompactDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
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

      <div className="grid items-start gap-x-10 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
        {schemaError ? (
          <div className="col-span-full rounded-[2rem] bg-surface-container-low p-8 text-center text-ink-variant">
            <p className="text-sm leading-relaxed">{schemaError}</p>
          </div>
        ) : initialGardens.length > 0 ? (
          initialGardens.map((garden, index) => (
            <GardenFanCard
              key={garden.id}
              garden={garden}
              index={index}
            />
          ))
        ) : (
          <div 
            onClick={() => setIsModalOpen(true)}
            className="col-span-full cursor-pointer rounded-[2.5rem] bg-surface-container-low p-16 text-center transition-colors hover:bg-surface-container"
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

function GardenFanCard({ garden, index }: { garden: Garden; index: number }) {
  const [isActive, setIsActive] = useState(false);
  const description =
    garden.description || "An uncatalogued collection of digital fragments.";
  const shortId = garden.id.split("-")[0];

  return (
    <div className="self-start">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
      >
        <Link
          href={`/gardens/${garden.id}`}
          aria-label={`Open garden ${garden.name}`}
          onMouseEnter={() => setIsActive(true)}
          onMouseLeave={() => setIsActive(false)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          className="group block focus-visible:outline-none"
        >
          <div className="relative mx-auto flex h-[24rem] w-full max-w-[18.5rem] items-center justify-center overflow-visible">
            <motion.div
              animate={isActive ? { y: -5, scale: 1.01 } : { y: 0, scale: 1 }}
              transition={deckTransition}
              className="relative h-[18.75rem] w-[13.5rem] sm:h-[19.5rem] sm:w-[14rem]"
            >
              <motion.div
                aria-hidden="true"
                animate={
                  isActive
                    ? { x: -34, y: 2, rotate: -10, opacity: 1 }
                    : { x: -3, y: 5, rotate: -1.5, opacity: 0.84 }
                }
                transition={deckTransition}
                className="absolute inset-0 overflow-hidden rounded-[1.85rem] p-4 shadow-[0_10px_24px_rgba(56,57,39,0.04)]"
                style={{
                  backgroundColor: "#fdfaeb", // surface-container-low
                }}
              >
                <GardenFieldNoteFace
                  garden={garden}
                  shortId={shortId}
                  description={description}
                />
              </motion.div>

              <motion.div
                aria-hidden="true"
                animate={
                  isActive
                    ? { x: 32, y: 4, rotate: 9, opacity: 1 }
                    : { x: 3, y: 6, rotate: 1.5, opacity: 0.82 }
                }
                transition={deckTransition}
                className="absolute inset-0 overflow-hidden rounded-[1.85rem] p-4 shadow-[0_10px_24px_rgba(56,57,39,0.04)]"
                style={{
                  backgroundColor: "#f7f4e2", // surface-container
                }}
              >
                <GardenArchiveFace
                  garden={garden}
                  shortId={shortId}
                  description={description}
                />
              </motion.div>

              <motion.div
                animate={isActive ? { y: -1, rotate: -0.65 } : { y: 0, rotate: 0 }}
                transition={deckTransition}
                className="absolute inset-0 overflow-hidden rounded-[1.95rem] bg-surface p-4 shadow-[0_12px_28px_rgba(56,57,39,0.05)] transition-[box-shadow] duration-500 group-hover:shadow-[0_16px_36px_rgba(56,57,39,0.08)] group-focus-visible:ring-2 group-focus-visible:ring-primary-brand/20 group-focus-visible:shadow-[0_16px_36px_rgba(56,57,39,0.08)]"
                style={{
                  backgroundColor: "#fffbff", // surface
                }}
              >
                <GardenPrimaryFace
                  garden={garden}
                  shortId={shortId}
                  description={description}
                />
              </motion.div>
            </motion.div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

function GardenFieldNoteFace({
  shortId,
  description,
}: GardenCardFaceProps) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-end">
        <span className="text-[9px] font-medium uppercase tracking-[0.28em] text-ink-variant/55">
          note
        </span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-[9px] uppercase tracking-[0.28em] text-ink-variant/45">
            catalog no.
          </p>
          <p className="text-2xl font-medium tracking-tight lowercase text-ink">
            {shortId}
          </p>
        </div>

        <p className="line-clamp-2 max-w-[8rem] text-xs leading-relaxed text-ink-variant/72">
          {description}
        </p>
      </div>
    </div>
  );
}

function GardenArchiveFace({
  garden,
  description,
}: GardenCardFaceProps) {
  return (
    <div className="flex h-full flex-col justify-between text-right">
      <span className="ml-auto text-[9px] font-medium uppercase tracking-[0.28em] text-ink-variant/55">
        archive
      </span>

      <div className="ml-auto max-w-[8rem] space-y-3">
        <p className="text-[9px] uppercase tracking-[0.28em] text-ink-variant/45">
          started
        </p>
        <p className="text-2xl font-medium tracking-tight lowercase leading-[1.02] text-ink">
          {formatCompactDate(garden.created_at)}
        </p>
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-variant/72">
          {description}
        </p>
      </div>
    </div>
  );
}

function GardenPrimaryFace({
  garden,
  shortId,
  description,
}: GardenCardFaceProps) {
  return (
    <div className="relative flex h-full flex-col justify-between">
      <div className="flex items-start justify-end">
        <span className="text-[9px] font-medium uppercase tracking-[0.28em] text-ink-variant/55">
          garden id: {shortId}
        </span>
      </div>

      <div className="space-y-4">
        <h2 className="max-w-[9rem] text-[1.7rem] font-medium tracking-tight lowercase leading-[0.92]">
          {garden.name}
        </h2>

        <p className="line-clamp-3 max-w-[9.5rem] text-xs leading-relaxed text-ink-variant/80">
          {description}
        </p>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[9px] uppercase tracking-[0.28em] text-ink-variant/45">
            started {formatDate(garden.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
