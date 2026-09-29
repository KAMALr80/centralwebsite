import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-8">
      <div className="text-xs font-medium uppercase tracking-wide text-primary">
        Error 404
      </div>
      <h1 className="text-center font-heading text-5xl font-semibold leading-none tracking-tight text-foreground sm:text-6xl">
        Page not found
      </h1>
      <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-10 px-4 text-sm no-underline")}>
          <ChevronLeft data-icon="inline-start" /> Back to home
        </Link>
        <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "h-10 px-5 text-sm no-underline")}>
          Browse shop <ArrowRight data-icon="inline-end" />
        </Link>
      </div>
    </div>
  );
}
