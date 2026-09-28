"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[55vh] items-center justify-center bg-background px-5 py-16">
      <Card className="w-full max-w-xl items-center p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Unexpected error
        </p>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          The page could not be displayed. Try loading it again or return to the home page.
        </p>
        <div className="mt-2 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" size="lg" className="h-10 px-6 text-sm" onClick={() => retry()}>
            Try again
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-6 text-sm no-underline")}>
            Return home
          </Link>
        </div>
      </Card>
    </main>
  );
}
