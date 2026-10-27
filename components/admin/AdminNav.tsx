"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/appointments", label: "Appointments", badge: "pending" },
  { href: "/admin/enquiries", label: "Enquiries", badge: "unread" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/content", label: "Website Content" },
  { href: "/admin/settings", label: "Availability & Settings" },
];

export default function AdminNav({
  pending,
  unread,
}: {
  pending: number;
  unread: number;
}) {
  const pathname = usePathname();
  const counts: Record<string, number> = { pending, unread };

  return (
    <nav
      aria-label="Dashboard"
      className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {items.map((i) => {
        const active = i.exact
          ? pathname === i.href
          : pathname.startsWith(i.href);
        const n = i.badge ? counts[i.badge] : 0;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`flex shrink-0 items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
              active
                ? "bg-white/10 font-semibold text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>{i.label}</span>
            {n > 0 && (
              <span className="bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                {n}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}