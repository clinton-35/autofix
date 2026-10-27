export default function Stars({ n }: { n: number }) {
  return (
    <div className="text-lg tracking-widest" aria-label={`${n} out of 5 stars`}>
      <span className="text-charcoal">{"★".repeat(n)}</span>
      <span className="text-silver/50">{"★".repeat(5 - n)}</span>
    </div>
  );
}