"use client";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";
import api from "@/lib/axios";
import { Logo } from "@/components/layout/Logo";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.password !== form.password_confirmation)
      next.password_confirmation = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setServerError(null);
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      setSuccess(true);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data;
      if (data?.errors) {
        // Map validation errors from API (field → first message)
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(data.errors)) {
          mapped[key] = msgs[0];
        }
        setErrors(mapped);
      } else {
        setServerError(data?.message ?? "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[900px] min-h-[540px] bg-card flex rounded-xl overflow-hidden shadow-lg ring-1 ring-foreground/10">
      {/* Left panel — navy brand */}
      <div className="hidden md:flex flex-col w-[280px] shrink-0 bg-foreground p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-primary opacity-90" />
        <div className="absolute right-14 bottom-8 w-20 h-20 rounded-full bg-background/10" />

        <div className="relative z-10 space-y-4">
          <div className="font-mono text-[10px] tracking-[0.12em] text-background/60 uppercase">
            JOIN THE PLATFORM
          </div>
          <h2 className="text-white text-[22px] font-semibold leading-tight tracking-tight">
            Stock your shelves without stocking your spreadsheet.
          </h2>
          <ul className="space-y-2.5">
            {[
              "600+ vetted wholesale brands",
              "Net-60 payment terms",
              "Free returns on opening orders",
              "No exclusivity requirements",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12px] text-background/60">
                <span className="text-primary mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto relative z-10 font-mono text-[10px] text-background/50 uppercase tracking-[0.06em]">
          Trusted by 4,200+ wholesale teams
        </div>
      </div>

      {/* Right panel — form or success */}
      <div className="flex-1 flex flex-col justify-center px-10 py-10">
        <div className="mb-8">
          <Logo />
        </div>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-start gap-4">
            <CheckCircle size={40} className="text-emerald-600" />
            <div>
              <h2 className="text-[20px] font-semibold tracking-tight text-foreground mb-2">
                Application submitted!
              </h2>
              <p className="text-[14px] text-muted-foreground leading-relaxed max-w-sm">
                Registration successful. Your account is pending approval before you can log in.
                We&apos;ll email you at <strong className="text-foreground">{form.email}</strong> once
                your account has been reviewed.
              </p>
            </div>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "mt-2 h-10 px-5 text-sm no-underline")}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          /* Registration form */
          <>
            <div className="font-mono text-[10px] tracking-[0.1em] text-primary uppercase mb-2">
              CREATE ACCOUNT
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-1">
              Apply for buyer access
            </h1>
            <p className="text-[13px] text-muted-foreground mb-6">
              Use your business email. We&apos;ll review your application within 1–2 business days.
            </p>

            {serverError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-[13px] text-destructive">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <Label className="mb-1.5 text-xs font-medium text-foreground">
                  Full name
                </Label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Maya Okafor"
                  required
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  className="h-10 md:text-sm"
                />
                {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <Label className="mb-1.5 text-xs font-medium text-foreground">
                  Work email
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className="h-10 md:text-sm"
                />
                {errors.email && <p className="text-[11px] text-destructive mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <Label className="mb-1.5 text-xs font-medium text-foreground">
                  Password
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className="h-10 md:text-sm"
                />
                {errors.password ? (
                  <p className="text-[11px] text-destructive mt-1">{errors.password}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground mt-1">Minimum 8 characters.</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <Label className="mb-1.5 text-xs font-medium text-foreground">
                  Confirm password
                </Label>
                <Input
                  type="password"
                  value={form.password_confirmation}
                  onChange={update("password_confirmation")}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  aria-invalid={!!errors.password_confirmation}
                  className="h-10 md:text-sm"
                />
                {errors.password_confirmation && (
                  <p className="text-[11px] text-destructive mt-1">{errors.password_confirmation}</p>
                )}
              </div>

              <Button type="submit" size="lg" disabled={loading} className="mt-1 h-10 w-full text-sm">
                {loading && <Loader2 className="animate-spin" />}
                Submit application
              </Button>
            </form>

            <p className="mt-5 text-[12px] text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
