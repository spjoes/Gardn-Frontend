"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { signOut } from "@/app/auth/actions";

type NavbarProps = {
  userEmail?: string;
};

export default function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-6 rounded-full border border-outline-ghost/10 px-6 py-3 shadow-sm glass-nav md:gap-16 md:px-8"
    >
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/Gardn.png"
          alt="Gardn logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <div className="text-xl font-bold tracking-tighter">gardn</div>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <NavLink href="/" active={pathname === "/"}>
          home
        </NavLink>
        {userEmail ? (
          <NavLink
            href="/gardens"
            active={pathname === "/gardens" || pathname.startsWith("/gardens/")}
          >
            gardens
          </NavLink>
        ) : null}
        <NavLink href="/#agents">agents</NavLink>
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
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`text-sm lowercase tracking-wide transition-colors hover:text-ink ${active ? "text-ink border-b border-primary-brand pb-0.5" : "text-ink-variant"}`}
    >
      {children}
    </Link>
  );
}
