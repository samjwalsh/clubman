export default function Heading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}
