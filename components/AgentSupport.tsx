"use client";

import { motion } from "motion/react";
import { Bot, Sparkles, Waypoints } from "lucide-react";

export default function AgentSupport() {
  return (
    <section id="agents" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="md:w-1/3 md:sticky md:top-32">
            <span className="text-sm uppercase tracking-[0.4em] text-primary-brand font-medium">
              02 / Agent Support
            </span>
            <h2 className="text-4xl leading-[1.1] lowercase tracking-tighter mt-6 mb-8">
              design with your agents.
            </h2>
            <p className="text-ink-variant leading-relaxed">
              Your agents can access your curated collections as a direct reference, ensuring every
              generation is grounded in your specific aesthetic and design intent.
            </p>
          </div>

          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-surface-high p-10 rounded-2xl aspect-square flex flex-col justify-between"
            >
              <Waypoints size={32} className="text-primary-brand" />
              <div>
                <h3 className="text-xl lowercase mb-3 font-medium">neural taxonomy</h3>
                <p className="text-sm text-ink-variant leading-relaxed">
                  Automated tagging based on visual hierarchy and conceptual depth.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-primary-brand text-white p-10 rounded-2xl aspect-square flex flex-col justify-between"
            >
              <Sparkles size={32} />
              <div>
                <h3 className="text-xl lowercase mb-3 font-medium">taste evolution</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  Agents track how your design preferences change over seasons of work.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-surface-low p-10 rounded-2xl flex items-center gap-10 border border-outline-ghost/10"
            >
              <div className="hidden sm:flex w-20 h-20 bg-surface-highest rounded-full items-center justify-center shrink-0">
                <Bot size={32} className="text-ink-variant" />
              </div>
              <div>
                <h3 className="text-xl lowercase mb-3 font-medium">contextual synthesis</h3>
                <p className="text-sm text-ink-variant leading-relaxed">
                  Generate moodboards and style guides automatically from collected specimens.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
