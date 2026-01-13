import { cn } from "@/lib/utils";

type Status = "sent" | "failed" | "replied" | "pending" | "processing" | "ready" | "completed";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  sent: {
    label: "Sent",
    className: "bg-success/10 text-success border-success/20",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  replied: {
    label: "Replied",
    className: "bg-info/10 text-info border-info/20",
  },
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  processing: {
    label: "Processing",
    className: "bg-info/10 text-info border-info/20 animate-pulse-subtle",
  },
  ready: {
    label: "Ready",
    className: "bg-success/10 text-success border-success/20",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success border-success/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
