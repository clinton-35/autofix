import type { Metadata } from "next";

export const SITE = {
  name: "Autofix Garage",
  legalName: "Autotechnik Autofix Garage",
  tagline: "Innovation in Motion",
  city: "Nairobi",
  country: "KE",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_KE",
  ogImage: "/og.png",
  brands: ["Mercedes-Benz", "BMW", "Audi", "Volkswagen"],
  description:
    "Nairobi garage for Mercedes-Benz, BMW, Audi and Volkswagen: diagnostics, servicing, coding and repair. House calls and parts available. Book online.",
};

export const OG_IMAGES = [
  { url: SITE.ogImage, width: 1200, height: 630, alt: `${SITE.name}, ${SITE.tagline}` },
];

export function pageMeta(title: string, description: string, path: string): Metadata {
  const full = `${title} | ${SITE.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      url: path,
      title: full,
      description,
      images: OG_IMAGES,
    },
    twitter: { card: "summary_large_image", title: full, description, images: [SITE.ogImage] },
  };
}