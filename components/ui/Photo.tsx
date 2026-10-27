import Image from "next/image";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  label?: boolean;
};

// Shows the photo if one has been uploaded, otherwise a neutral placeholder.
export default function Photo({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
  label = true,
}: Props) {
  return (
    <div className={`relative overflow-hidden bg-[#23262b] ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : label ? (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-silver/60">
          Photo
        </div>
      ) : null}
    </div>
  );
}
