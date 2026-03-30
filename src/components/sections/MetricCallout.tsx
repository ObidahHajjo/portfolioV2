interface MetricCalloutProps {
  id: string;
  label: string;
  value: string;
  unit: string | null;
}

export function MetricCallout({ label, value, unit }: MetricCalloutProps) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <div className="text-3xl font-bold text-primary">
        {value}
        {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
