"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/layout/Logo";

export default function LoginPage() {
  const { login } = useAuth();
  const { refreshPrices } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(false);
    setLoading(true);

    try {
      await login(email, password);
      await refreshPrices();
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const destination =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : "/";
      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "";

      if (status === 403 || message.toLowerCase().includes("pending")) {
        setIsPending(true);
      } else if (status === 401 || status === 422) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[900px] min-h-[540px] bg-card flex rounded-xl overflow-hidden shadow-lg ring-1 ring-foreground/10">
      {/* Left panel — navy brand */}
      <div className="hidden md:flex flex-col w-[280px] shrink-0 bg-foreground p-8 relative overflow-hidden">
        {/* Decorative orange circle */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-primary opacity-90" />
        <div className="absolute right-14 bottom-8 w-20 h-20 rounded-full bg-background/10" />

        <div className="relative z-10">
          <div className="font-mono text-[10px] tracking-[0.12em] text-background/60 uppercase mb-4">
            WHOLESALE OS
          </div>
          <h2 className="text-white text-[22px] font-semibold leading-tight tracking-tight mb-3">
            Built for buyers, suppliers, and everyone in&nbsp;between.
          </h2>
          <p className="text-background/60 text-[13px] leading-relaxed">
            Net terms, custom catalogs, and approval flows — without the spreadsheets.
          </p>
        </div>

        <div className="mt-auto relative z-10 font-mono text-[10px] text-background/50 uppercase tracking-[0.06em]">
          Trusted by 4,200+ wholesale teams
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-10 py-10">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="font-mono text-[10px] tracking-[0.1em] text-primary uppercase mb-2">
          SIGN IN
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-1">
          Welcome back
        </h1>
        <p className="text-[13px] text-muted-foreground mb-6">
          Sign in to access your wholesale account.
        </p>

        {/* Pending approval notice */}
        {isPending && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-[13px] text-foreground font-medium">Account pending approval</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Your account is under review. You&apos;ll receive an email once approved.
            </p>
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-[13px] text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 text-xs font-medium text-foreground">
              Email address
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="h-10 md:text-sm"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <Label className="text-xs font-medium text-foreground">
                Password
              </Label>
              <Link href="/forgot-password" className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-10 md:text-sm"
            />
          </div>

          <Button type="submit" size="lg" disabled={loading} className="mt-2 h-10 w-full text-sm">
            {loading && <Loader2 className="animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-[12px] text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Apply for access
          </Link>
        </p>
      </div>
    </div>
  );
}
