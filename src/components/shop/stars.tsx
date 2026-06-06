import { Star } from "lucide-react";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const pct = Math.round((value / 5) * 100);
  return (
    <div className="relative inline-flex" aria-label={`${value} out of 5 stars`}>
      <div className="flex gap-0.5 text-muted-foreground/40">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <div className="flex gap-0.5 text-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}
