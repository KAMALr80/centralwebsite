"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

function buildPages(currentPage: number, lastPage: number): (number | "...")[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (currentPage > 3) pages.push("...");
  for (let p = Math.max(2, currentPage - 1); p <= Math.min(lastPage - 1, currentPage + 1); p++) {
    pages.push(p);
  }
  if (currentPage < lastPage - 2) pages.push("...");
  pages.push(lastPage);
  return pages;
}

export function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = buildPages(currentPage, lastPage);

  return (
    <PaginationRoot className="mx-0 w-auto justify-start">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
        </PaginationItem>

        {pages.map((p, i) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <Button
                variant={p === currentPage ? "outline" : "ghost"}
                size="icon"
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Button>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
