import { cn } from "@/shared/lib/utils";

interface StatusBadgeProps {
  status: "approved" | "rejected" | "pending";
  label: string;
}

const variants = {
  approved: "bg-winning-bg text-winning-text",
  rejected: "bg-losing-bg text-losing-text",
  pending: "bg-testing-bg text-testing-text",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap",
        variants[status]
      )}
    >
      <span className="w-[5px] h-[5px] rounded-full bg-current shrink-0" />
      {label}
    </span>
  );
}
