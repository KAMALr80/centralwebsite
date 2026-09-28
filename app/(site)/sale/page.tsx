"use client";

import { Suspense } from "react";
import { BrowseLayout } from "@/components/browse/BrowseLayout";

function SaleInner() {
  return (
    <div>
      {/* Promo banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-destructive px-4 py-2.5 text-white sm:px-8">
        <span className="text-xs font-semibold uppercase tracking-wide">
          Sale · Ends soon
        </span>
        <span className="text-xs text-white/80">
          Wholesale discounts on selected lines
        </span>
      </div>

      <BrowseLayout
        crumbs={[{ label: "Sale" }]}
        title="Sale & clearance"
        saleOnly
        showDiscountPct
      />
    </div>
  );
}

export default function SalePage() {
  return (
    <Suspense>
      <SaleInner />
    </Suspense>
  );
}
