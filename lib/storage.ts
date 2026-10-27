export function publicBase(bucket: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`;
}

// Only accept image links that point at our own storage bucket.
export function cleanImageUrl(value: string, bucket: string): string | null {
  const v = value.trim();
  if (!v || v.length > 500) return null;
  return v.startsWith(publicBase(bucket)) ? v : null;
}

export function storagePath(url: string | null, bucket: string): string | null {
  if (!url || !url.startsWith(publicBase(bucket))) return null;
  return decodeURIComponent(url.slice(publicBase(bucket).length));
}