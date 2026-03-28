"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export default function FeatureSection() {
  return (
    <section className="bg-surface-low py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] flex items-center justify-center"
          >
            <svg viewBox="0 0 440 300" className="w-full h-full max-w-md relative z-10">
              <motion.circle
                cx="20"
                cy="150"
                r="3"
                fill="currentColor"
                className="text-primary-brand"
                animate={{
                  cx: [20, 140, 150, 150],
                  opacity: [0, 1, 0, 0],
                  scale: [0.5, 1, 0.5, 0.5],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  times: [0, 0.08, 0.09, 1],
                  ease: "easeInOut",
                }}
              />

              <path
                d="M 20 150 H 140"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-primary-brand/10"
              />

              <motion.rect
                x="140"
                y="120"
                width="60"
                height="65"
                rx="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-primary-brand/40"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />

              <g transform="translate(170, 145)">
                <motion.circle
                  cx="0"
                  cy="0"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="12 38"
                  strokeLinecap="round"
                  className="text-primary-brand"
                  animate={{
                    rotate: [0, 360, 1080, 1080],
                    opacity: [0, 0, 1, 1, 0, 0],
                    scale: [0.5, 0.5, 1, 1, 0.5, 0.5],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    times: [0, 0.08, 0.1, 0.34, 0.35, 1],
                    ease: "linear",
                  }}
                />

                <motion.path
                  d="M -4, 0 L -1, 3 L 5, -4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-brand"
                  animate={{
                    pathLength: [0, 0, 0, 1, 1, 0, 0],
                    opacity: [0, 0, 0, 1, 1, 0, 0],
                    scale: [0.5, 0.5, 0.5, 1, 1, 0.5, 0.5],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    times: [0, 0.34, 0.35, 0.38, 0.76, 0.8, 1],
                    ease: "easeOut",
                  }}
                />

                <motion.text
                  x="0"
                  y="27"
                  textAnchor="middle"
                  className="text-[7px] uppercase tracking-widest font-medium fill-primary-brand/60"
                  animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    times: [0, 0.08, 0.1, 0.34, 0.35, 1],
                  }}
                >
                  Processing
                </motion.text>

                <motion.text
                  x="0"
                  y="27"
                  textAnchor="middle"
                  className="text-[7px] uppercase tracking-widest font-medium fill-primary-brand"
                  animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    times: [0, 0.34, 0.35, 0.76, 0.8, 1],
                  }}
                >
                  Complete
                </motion.text>
              </g>

              {[
                { y: 60, label: "Style" },
                { y: 120, label: "Components" },
                { y: 180, label: "Patterns" },
                { y: 240, label: "Metadata" },
              ].map((branch, i) => (
                <g key={i}>
                  <motion.path
                    d={`M 200 150 C 240 150, 260 ${branch.y}, 320 ${branch.y}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-primary-brand/30"
                    animate={{ pathLength: [0, 0, 1, 1, 0, 0] }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      times: [0, 0.38 + i * 0.02, 0.48 + i * 0.02, 0.76, 0.86, 1],
                      ease: "easeInOut",
                    }}
                  />
                  <motion.text
                    x="330"
                    y={branch.y + 4}
                    className="text-[10px] uppercase tracking-widest font-medium fill-ink-variant"
                    animate={{
                      opacity: [0, 0, 1, 1, 0, 0],
                      x: [-5, -5, 0, 0, -5, -5],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      times: [0, 0.48 + i * 0.02, 0.52 + i * 0.02, 0.76, 0.82, 1],
                    }}
                  >
                    {branch.label}
                  </motion.text>
                  <motion.circle
                    cx="320"
                    cy={branch.y}
                    r="2"
                    fill="currentColor"
                    className="text-primary-brand/40"
                    animate={{ scale: [0, 0, 1, 1, 0, 0] }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      times: [0, 0.48 + i * 0.02, 0.5 + i * 0.02, 0.76, 0.82, 1],
                    }}
                  />
                </g>
              ))}

              <text
                x="20"
                y="140"
                className="text-[10px] uppercase tracking-widest font-medium fill-ink-variant"
              >
                Site
              </text>
            </svg>

            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-brand/5 rounded-full blur-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-sm uppercase tracking-[0.4em] text-primary-brand font-medium">
              01 / Curating Context
            </span>
            <h2 className="text-4xl md:text-5xl leading-[1.1] lowercase tracking-tighter">
              beyond the screenshot,
              <br />
              into the soul.
            </h2>
            <p className="text-lg text-ink-variant leading-relaxed">
              Traditional bookmarks die in folders. Gardn extracts the semantic DNA of your
              inspiration, mapping connections between visual style, technical implementation, and
              cultural context.
            </p>

            <ul className="space-y-4 pt-4">
              <FeatureItem>Semantic Metadata Extraction</FeatureItem>
              <FeatureItem>Visual Origin Tracking</FeatureItem>
              <FeatureItem>Cross-Medium Relational Mapping</FeatureItem>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-4 text-sm font-medium">
      <CheckCircle2 size={18} className="text-primary-brand" />
      {children}
    </li>
  );
}
