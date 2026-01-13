import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 rounded shimmer" />
          <div className="h-8 w-32 rounded shimmer" />
          <div className="h-3 w-20 rounded shimmer" />
        </div>
        <div className="h-12 w-12 rounded-lg shimmer" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 flex-1 rounded shimmer" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b p-4 last:border-0">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="h-4 flex-1 rounded shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-card",
        className
      )}
    >
      <div className="h-6 w-32 rounded shimmer mb-4" />
      <div className="h-64 rounded shimmer" />
    </div>
  );
}
