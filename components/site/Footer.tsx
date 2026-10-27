import Link from "next/link";
import type { Settings } from "@/lib/data";

const quick = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Our Services" },
  { href: "/book", label: "Book Appointment" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact Us" },
];

const heading =
  "mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-silver";

export default function Footer({ s }: { s: Settings }) {
  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold uppercase tracking-[0.25em]">
            {s.garage_name}
          </p>
          {s.address && (
            <p className="mt-5 whitespace-pre-line text-sm text-white/70">
              {s.address}
            </p>
          )}
        </div>

        <div>
          <h3 className={heading}>Contact</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {s.phone && (
              <li>
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {s.phone}
                </a>
              </li>
            )}
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="hover:text-white">
                  {s.email}
                </a>
              </li>
            )}
          </ul>
          {(s.instagram_url || s.facebook_url) && (
            <div className="mt-5 flex gap-5 text-sm">
              {s.instagram_url && (
                <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="underline decoration-silver underline-offset-4 hover:decoration-white">
                  Instagram
                </a>
              )}
              {s.facebook_url && (
                <a href={s.facebook_url} target="_blank" rel="noopener noreferrer" className="underline decoration-silver underline-offset-4 hover:decoration-white">
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className={heading}>Opening Hours</h3>
          <p className="whitespace-pre-line text-sm text-white/70">
            {s.working_hours_text || "Please contact us for opening hours."}
          </p>
        </div>

        <div>
          <h3 className={heading}>Navigate</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {quick.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/50">
        &copy; {new Date().getFullYear()} {s.garage_name}. All rights reserved.
      </div>
    </footer>
  );
}
