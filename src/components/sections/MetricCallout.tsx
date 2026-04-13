interface MetricCalloutProps {
  id: string;
  label: string;
  value: string;
  unit: string | null;
}

export function MetricCallout({ label, value, unit }: MetricCalloutProps) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4 text-center terminal-box-glow">
      <div className="text-2xl font-bold text-primary md:text-3xl">
        {value}
        {unit && <span className="ml-1 text-base text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}
