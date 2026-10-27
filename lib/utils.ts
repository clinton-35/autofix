// Builds a WhatsApp link from a Kenyan number like 0712 345 678 or +254712345678.
export function waLink(
  number: string | null | undefined,
  text = "Hello, I would like to enquire about a service."
) {
  let n = (number ?? "").replace(/\D/g, "");
  if (!n) return null;
  if (n.startsWith("0")) n = "254" + n.slice(1);
  else if (n.length === 9) n = "254" + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
