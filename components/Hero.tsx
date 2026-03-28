"use client";

import { motion } from "motion/react";
import Image from "next/image";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1709755813430-5dbd547214df?q=80&w=1470&auto=format&fit=crop";

export default function Hero() {
  return (
    <section className="px-6 max-w-7xl mx-auto pt-32 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden mb-12"
      >
        <Image
          src={HERO_IMAGE}
          alt="Atmospheric garden"
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-10 left-10 right-10 pointer-events-none">
          <h1 className="text-4xl md:text-7xl font-medium text-white max-w-2xl leading-[0.9] lowercase tracking-tighter">
            save the best of the web.
          </h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <p className="text-xl md:text-2xl text-ink-variant leading-relaxed">
            Gardn helps you build a personal library of web design worth revisiting. Save the sites,
            components, and patterns that catch your eye, then keep them organized as references for
            the work you do next.
          </p>
        </div>
      </div>
    </section>
  );
}
