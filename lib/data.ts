import { createPublicClient } from "@/lib/supabase/public";

export type Settings = {
  garage_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  map_embed_url: string | null;
  working_hours_text: string | null;
  logo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
};

export type ContentItem = {
  heading: string;
  description: string;
  image_url: string | null;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price_text: string | null;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  title: string | null;
};

export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  message: string;
  created_at: string;
};

const defaultSettings: Settings = {
  garage_name: "Autofix",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  map_embed_url: "",
  working_hours_text: "",
  logo_url: null,
  instagram_url: "",
  facebook_url: "",
};

export async function getSettings(): Promise<Settings> {
  const { data } = await createPublicClient()
    .from("garage_settings")
    .select(
      "garage_name, phone, whatsapp, email, address, map_embed_url, working_hours_text, logo_url, instagram_url, facebook_url"
    )
    .eq("id", 1)
    .maybeSingle();
  return (data as Settings | null) ?? defaultSettings;
}

export async function getContent() {
  const { data } = await createPublicClient()
    .from("site_content")
    .select("section, heading, description, image_url");
  const map: Record<string, ContentItem> = {};
  for (const r of data ?? []) {
    map[r.section] = {
      heading: r.heading ?? "",
      description: r.description ?? "",
      image_url: r.image_url ?? null,
    };
  }
  return map;
}

export async function getServices(limit?: number) {
  let q = createPublicClient()
    .from("services")
    .select("id, name, description, image_url, price_text")
    .eq("active", true)
    .order("sort_order")
    .order("created_at");
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as Service[];
}

export async function getGallery(limit?: number) {
  let q = createPublicClient()
    .from("gallery_images")
    .select("id, image_url, title")
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as GalleryImage[];
}

export async function getReviews(limit?: number) {
  let q = createPublicClient()
    .from("reviews")
    .select("id, customer_name, rating, message, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as Review[];
}
