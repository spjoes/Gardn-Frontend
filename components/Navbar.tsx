"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { signOut } from "@/app/auth/actions";
import { wrapHtml2CanvasForLiquidGlass } from "@/lib/html2canvas-oklch-shim";
import {
  averageBackdropLuminanceBehindNav,
  NAV_CONTRAST_UPDATE,
  notifyNavContrastUpdate,
  shouldUseLightNavText,
} from "@/lib/nav-backdrop-luminance";

const LIQUID_GLASS_NAV_ID = "gardn-liquid-glass-nav";

type LiquidGLApi = (options: {
  target: string;
  snapshot?: string;
  resolution?: number;
  refraction?: number;
  bevelDepth?: number;
  bevelWidth?: number;
  frost?: number;
  shadow?: boolean;
  specular?: boolean;
  reveal?: string;
  tilt?: boolean;
  magnify?: number;
  on?: { init?: (instance: unknown) => void };
}) => unknown;

declare global {
  interface Window {
    liquidGL?: LiquidGLApi & {
      registerDynamic?: (els: string | Element | Element[]) => void;
    };
    html2canvas?: typeof import("html2canvas").default;
    __liquidGLRenderer__?: {
      lenses: Array<{ el: Element }>;
      canvas?: HTMLCanvasElement;
    };
  }
}

function pruneDetachedLiquidLenses() {
  const renderer = window.__liquidGLRenderer__;
  if (!renderer?.lenses?.length) return;
  renderer.lenses = renderer.lenses.filter((l) => document.body.contains(l.el));
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

type NavbarProps = {
  userEmail?: string;
};

export default function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname();
  const navRootRef = useRef<HTMLDivElement | null>(null);
  const [lightNavText, setLightNavText] = useState(false);

  const updateContrast = useCallback(() => {
    const root = navRootRef.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const y = r.top + r.height / 2;
    const pad = Math.max(4, Math.min(14, r.width * 0.06));
    const xs = [r.left + pad, r.left + r.width * 0.5, r.right - pad];
    const avg = averageBackdropLuminanceBehindNav(root, xs, y);
    setLightNavText(shouldUseLightNavText(avg));
  }, []);

  useEffect(() => {
    updateContrast();
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateContrast);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    window.addEventListener(NAV_CONTRAST_UPDATE, schedule);

    let n = 0;
    const poll = window.setInterval(() => {
      schedule();
      n += 1;
      if (n >= 24) window.clearInterval(poll);
    }, 350);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      window.removeEventListener(NAV_CONTRAST_UPDATE, schedule);
      window.clearInterval(poll);
      cancelAnimationFrame(raf);
    };
  }, [updateContrast, pathname]);

  /*
   * liquidGL sets the lens shell opacity to 0 until a snapshot uploads. If html2canvas fails on
   * some routes (tall DOM, GPU limits), _reveal() never runs and the whole bar + links stay invisible.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const shell = document.getElementById(
        LIQUID_GLASS_NAV_ID,
      ) as HTMLElement | null;
      if (
        !shell ||
        !navRootRef.current ||
        !navRootRef.current.contains(shell)
      ) {
        return;
      }
      const opacity = parseFloat(getComputedStyle(shell).opacity);
      if (opacity >= 0.05) return;

      shell.style.opacity = "1";
      const renderer = window.__liquidGLRenderer__;
      if (renderer?.canvas) {
        renderer.canvas.style.opacity = "1";
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [pathname]);

  useLayoutEffect(() => {
    let cancelled = false;

    const run = async () => {
      const html2canvas = (await import("html2canvas")).default;
      if (cancelled) return;
      window.html2canvas = wrapHtml2CanvasForLiquidGlass(html2canvas);

      if (!window.liquidGL) {
        await loadScript("/scripts/liquidGL.js");
      }
      if (cancelled || !window.liquidGL) return;

      pruneDetachedLiquidLenses();
      if (cancelled) return;

      if (!document.getElementById(LIQUID_GLASS_NAV_ID)) return;
      if (cancelled) return;

      window.liquidGL({
        target: `#${LIQUID_GLASS_NAV_ID}`,
        snapshot: "body",
        resolution: 1.5,
        // "Default" preset from liquidGL — warm editorial glass (MIT, https://github.com/naughtyduk/liquidGL )
        refraction: 0,
        bevelDepth: 0.052,
        bevelWidth: 0.211,
        frost: 2,
        shadow: true,
        specular: true,
        reveal: "none",
        tilt: false,
        magnify: 1,
        on: {
          init() {
            // Unlike <video>, <img> is not auto-tracked; late-loading bitmaps need a re-snapshot.
            window.liquidGL?.registerDynamic?.("[data-liquid-dynamic]");
            notifyNavContrastUpdate();
          },
        },
      });
    };

    void run().catch((e) => {
      console.error("[Navbar] liquidGL init failed", e);
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <motion.div
      ref={navRootRef}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 z-50 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2"
    >
      <div
        id={LIQUID_GLASS_NAV_ID}
        className="gardn-liquid-glass-nav glass-nav inline-flex items-stretch rounded-full border border-outline-ghost/10 px-6 py-3 md:px-8"
      >
        {/*
          liquidGL sets pointer-events:none on the lens shell; descendants must opt back in
          (see MDN: only non-none descendants remain hit targets).
        */}
        <div className="content pointer-events-auto relative z-[3] flex min-w-0 items-center gap-6 md:gap-16">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-sm outline-none transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${lightNavText ? "focus-visible:outline-white/60" : "focus-visible:outline-primary-brand/55"}`}
          >
            <Image
              src="/Gardn.png"
              alt="Gardn logo"
              width={32}
              height={32}
              className="shrink-0 object-contain"
            />
            <span
              className={`text-xl font-bold tracking-tighter transition-colors ${lightNavText ? "text-[#f2f1ea]" : "text-ink"}`}
            >
              gardn
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/" active={pathname === "/"} lightNav={lightNavText}>
              home
            </NavLink>
            {userEmail ? (
              <NavLink
                href="/gardens"
                lightNav={lightNavText}
                active={
                  pathname === "/gardens" || pathname.startsWith("/gardens/")
                }
              >
                gardens
              </NavLink>
            ) : null}
            <NavLink href="/#agents" lightNav={lightNavText}>
              agents
            </NavLink>
          </div>

          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-40 truncate rounded-full bg-surface-highest px-3 py-2 text-xs tracking-wide text-ink-variant lg:inline-block">
                {userEmail}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="brand-gradient cursor-pointer whitespace-nowrap rounded-full px-5 py-2 text-sm text-white transition-all hover:opacity-90 active:scale-95"
                >
                  sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="brand-gradient whitespace-nowrap rounded-full px-6 py-2 text-sm text-white transition-all hover:opacity-90 active:scale-95"
            >
              sign in
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NavLink({
  href,
  children,
  active = false,
  lightNav,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
  lightNav: boolean;
}) {
  const tone = lightNav
    ? active
      ? "text-white underline decoration-1 underline-offset-[7px]"
      : "text-[#d9d7cd] hover:text-[#f6f5ef]"
    : active
      ? "text-ink underline decoration-1 underline-offset-[7px]"
      : "text-ink-variant hover:text-ink";

  const ring = lightNav
    ? "focus-visible:outline-white/55"
    : "focus-visible:outline-primary-brand/55";

  return (
    <Link
      href={href}
      className={`text-sm lowercase tracking-wide transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${ring} ${tone}`}
    >
      {children}
    </Link>
  );
}
