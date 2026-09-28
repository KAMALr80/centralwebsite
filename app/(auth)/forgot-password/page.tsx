"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { Logo } from "@/components/layout/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (reason: unknown) {
      const message =
        (reason as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Unable to send the reset link. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-lg ring-1 ring-foreground/10 sm:p-10">
      <Logo />
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">Account recovery</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Reset your password</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Enter your account email and we&apos;ll send a reset link if the address is registered.
      </p>

      {sent ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          <div className="flex items-center gap-2 font-semibold"><CheckCircle size={17} /> Check your email</div>
          <p className="mt-1 leading-5">If that address is registered, a password reset link has been sent.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="reset-email" className="mb-1.5 text-xs font-medium text-foreground">Email address</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="h-11 md:text-sm"
            />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="h-11 w-full text-sm">
            {loading && <Loader2 className="animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}

      <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-primary/80">← Back to login</Link>
    </div>
  );
}
