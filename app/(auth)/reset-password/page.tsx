"use client";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { Logo } from "@/components/layout/Logo";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) return setError("This reset link is missing its token.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmation) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        email: email.trim(),
        password,
        password_confirmation: confirmation,
      });
      setSuccess(true);
    } catch (reason: unknown) {
      const message =
        (reason as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Unable to reset the password. Please request a new link.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-lg ring-1 ring-foreground/10 sm:p-10">
      <Logo />
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">Account recovery</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Choose a new password</h1>

      {success ? (
        <div className="mt-6">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
            <div className="flex items-center gap-2 font-semibold"><CheckCircle size={17} /> Password updated</div>
          </div>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "mt-5 h-11 px-5 text-sm no-underline")}>Sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Label className="flex-col items-start gap-1.5 text-xs font-medium text-foreground">Email address
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="h-11 md:text-sm" />
          </Label>
          <Label className="flex-col items-start gap-1.5 text-xs font-medium text-foreground">New password
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="h-11 md:text-sm" />
          </Label>
          <Label className="flex-col items-start gap-1.5 text-xs font-medium text-foreground">Confirm new password
            <Input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} autoComplete="new-password" className="h-11 md:text-sm" />
          </Label>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" size="lg" disabled={loading || !token} className="h-11 w-full text-sm">
            {loading && <Loader2 className="animate-spin" />}
            Reset password
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}><ResetPasswordForm /></Suspense>;
}
