"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useState } from "react";
import { useRequireAuth } from "@/components/auth/withAuth";
import { useAuth, type User } from "@/context/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import api from "@/lib/axios";

function EditProfileForm({
  user,
  updateUser,
}: {
  user: User;
  updateUser: (patch: Partial<User>) => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.patch<{ user: { name: string; email: string; phone?: string; address?: string } }>(
        `/users/${user.id}`,
        { name, email, phone: phone || undefined, address: address || undefined }
      );
      updateUser({ name: res.data.user.name, email: res.data.user.email, phone: res.data.user.phone, address: res.data.user.address });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const INPUT = "h-9 md:text-sm";
  const LABEL = "mb-1.5 text-xs font-medium text-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label className={LABEL}>Full Name</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={INPUT}
          required
          maxLength={255}
        />
      </div>

      <div>
        <Label className={LABEL}>Email Address</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT}
          required
        />
      </div>

      <div>
        <Label className={LABEL}>Phone Number</Label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={INPUT}
          maxLength={20}
          placeholder="Optional"
        />
      </div>

      <div>
        <Label className={LABEL}>Address</Label>
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="resize-none md:text-sm"
          rows={3}
          maxLength={500}
          placeholder="Optional"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Profile updated successfully.</p>
      )}

      <Button type="submit" size="lg" disabled={saving} className="h-9 w-full text-sm">
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}

export default function EditProfilePage() {
  const { isLoading } = useRequireAuth();
  const { user, updateUser } = useAuth();

  if (isLoading || !user) return null;

  return (
    <div className="bg-background min-h-screen pb-20">
      <PageHeader crumbs={[{ label: "Account", href: "/account/profile" }, { label: "Edit Profile" }]} title="Edit Profile" />
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-8">
        <Card>
          <CardContent>
            <EditProfileForm key={user.id} user={user} updateUser={updateUser} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
