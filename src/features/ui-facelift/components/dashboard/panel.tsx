import { ChevronRight, LucideIcon } from "lucide-react";

interface PanelProps {
  title: string;
  icon: LucideIcon;
  actionText?: string;
  actionHref?: string;
  children: React.ReactNode;
}

export function Panel({ title, icon: Icon, actionText, actionHref, children }: PanelProps) {
  return (
    <div className="bg-card-bg border border-card-border rounded-[14px] p-5 lg:p-6 transition-all duration-150 hover:border-border-default">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-text-primary">
          <Icon size={16} className="text-text-tertiary" />
          {title}
        </div>
        {actionText && actionHref && (
          <a
            href={actionHref}
            className="flex items-center gap-1 text-xs font-medium text-text-link no-underline transition-opacity duration-100 hover:opacity-75"
          >
            {actionText}
            <ChevronRight size={13} />
          </a>
        )}
      </div>
      {children}
    </div>
  );
}
