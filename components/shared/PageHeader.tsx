import { type ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";

interface PageHeaderProps {
  crumbs?: BreadcrumbItem[];
  title: string;
  accent?: string;
  meta?: string;
  actions?: ReactNode;
}

export function PageHeader({ crumbs, title, accent, meta, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-4 pb-5 pt-6 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          {crumbs && crumbs.length > 0 && <Breadcrumb items={crumbs} />}
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="m-0 font-heading text-3xl font-semibold leading-none tracking-tight text-foreground">
              {title}
              {accent && <span className="text-primary"> {accent}</span>}
            </h1>
            {meta && (
              <span className="text-xs text-muted-foreground">{meta}</span>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-1.5 text-xs">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
