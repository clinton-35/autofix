"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Our Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          {logoUrl && (
            <Image
              src={logoUrl}
              alt=""
              width={36}
              height={36}
              className="h-9 w-auto"
            />
          )}
          <span className="text-sm font-bold uppercase tracking-[0.25em]">
            {name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-xs font-medium uppercase tracking-[0.18em] underline-offset-8 transition-colors hover:text-brand ${
                isActive(l.href) ? "underline decoration-silver" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="bg-charcoal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
          >
            Book Appointment
          </Link>
        </nav>

        <button
          type="button"
          className="p-2 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          className="border-t border-black/5 bg-white px-6 pb-6 pt-2 lg:hidden"
          aria-label="Mobile"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block border-b border-black/5 py-4 text-sm font-medium uppercase tracking-[0.18em] ${
                isActive(l.href) ? "text-brand" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-5 block bg-charcoal px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Book Appointment
          </Link>
        </nav>
      )}
    </header>
  );
}
