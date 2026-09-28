"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { useRequireAuth } from "@/components/auth/withAuth";
import { PageHeader } from "@/components/shared/PageHeader";
import api from "@/lib/axios";

export default function ChangePasswordPage() {
  const { isLoading, isAuthenticated } = useRequireAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (isLoading || !isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setFieldErrors({ password_confirmation: ["Passwords do not match."] });
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch<{ access_token: string }>("/users/me/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      localStorage.setItem("auth_token", res.data.access_token);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
      setError(data?.message ?? "Failed to change password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const INPUT = "h-9 md:text-sm";
  const LABEL = "mb-1.5 text-xs font-medium text-foreground";

  return (
    <div className="bg-background min-h-screen pb-20">
      <PageHeader
        crumbs={[{ label: "Account", href: "/account/profile" }, { label: "Change Password" }]}
        title="Change Password"
      />
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-8">
        <Card>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className={LABEL}>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              aria-invalid={!!fieldErrors.current_password}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={INPUT}
              required
              autoComplete="current-password"
            />
            {fieldErrors.current_password && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.current_password[0]}</p>
            )}
          </div>

          <div>
            <Label className={LABEL}>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              aria-invalid={!!fieldErrors.password}
              onChange={(e) => setNewPassword(e.target.value)}
              className={INPUT}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div>
            <Label className={LABEL}>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              aria-invalid={!!fieldErrors.password_confirmation}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={INPUT}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {fieldErrors.password_confirmation && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.password_confirmation[0]}</p>
            )}
          </div>

          {error && !Object.keys(fieldErrors).length && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}
          {success && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Password changed successfully.</p>
          )}

          <Button type="submit" size="lg" disabled={saving} className="h-9 w-full text-sm">
            {saving ? "Saving…" : "Change Password"}
          </Button>
        </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
