import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

interface ProviderBadgeProps {
  provider: "gmail" | "outlook";
  showLabel?: boolean;
  className?: string;
}

export function ProviderBadge({ provider, showLabel = false, className }: ProviderBadgeProps) {
  const isGmail = provider === "gmail";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        className
      )}
    >
      {isGmail ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 6.28V17.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5V6.28l9.72 7.04a.75.75 0 0 0 .87 0L22 6.28Z"
            fill="#EA4335"
          />
          <path
            d="M22 6.28 12.28 13.32a.75.75 0 0 1-.87 0L2 6.28V6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v-.22Z"
            fill="#FBBC04"
          />
          <path
            d="M2 6.28V6.5A2.5 2.5 0 0 1 4.5 4H7v8.5L2 6.28Z"
            fill="#34A853"
          />
          <path
            d="M22 6.28V6.5A2.5 2.5 0 0 0 19.5 4H17v8.5l5-6.22Z"
            fill="#4285F4"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path
            d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z"
            fill="#0078D4"
          />
          <path
            d="M2 6l10 7 10-7"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {isGmail ? "Gmail" : "Outlook"}
        </span>
      )}
    </div>
  );
}
