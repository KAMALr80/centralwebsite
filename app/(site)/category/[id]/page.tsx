"use client";

import { Suspense } from "react";
import { use } from "react";
import { BrowseLayout } from "@/components/browse/BrowseLayout";
import { useCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

function CategoryBrowse({ id }: { id: string }) {
  const { data: category, isLoading, isError, refetch } = useCategory(id);
  const numericId = Number(id);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!Number.isInteger(numericId) || numericId <= 0 || isError || !category) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Category not found.</p>
        {isError && <Button type="button" onClick={() => refetch()}>Try again</Button>}
      </div>
    );
  }

  return (
    <BrowseLayout
      categoryId={numericId}
      categoryName={category?.name}
      subCategories={category?.children ?? []}
      crumbs={[
        { label: "Shop", href: "/shop" },
        { label: category?.name ?? "Category" },
      ]}
      title={category?.name ?? "Category"}
    />
  );
}

export default function CategoryPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense>
      <CategoryBrowse id={id} />
    </Suspense>
  );
}
