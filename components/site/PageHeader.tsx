export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-charcoal px-6 pb-20 pt-24 text-white sm:pb-28 sm:pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold uppercase tracking-tight sm:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-xl text-lg text-white/70">{subtitle}</p>
        )}
      </div>
    </section>
  );
}