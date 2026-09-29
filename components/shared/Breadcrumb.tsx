import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem as BreadcrumbListItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        {items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbListItem>
              {item.href ? (
                <BreadcrumbLink render={<Link href={item.href} />}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbListItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
