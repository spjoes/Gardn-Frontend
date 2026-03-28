import type { ReactNode } from "react";

export default function Footer() {
  return (
    <footer className="border-t border-outline-ghost/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <div className="text-[10px] uppercase tracking-[0.2em]">
          © 2026 Gardn
        </div>

        <div className="flex gap-8">
          <FooterLink href="#">terms</FooterLink>
          <FooterLink href="#">privacy</FooterLink>
          <FooterLink href="#">metadata</FooterLink>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-[10px] uppercase tracking-[0.2em] hover:text-ink transition-colors"
    >
      {children}
    </a>
  );
}
