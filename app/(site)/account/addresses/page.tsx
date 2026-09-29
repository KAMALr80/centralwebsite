"use client";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { useRequireAuth } from "@/components/auth/withAuth";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  type Address,
  type NewAddress,
} from "@/hooks/useAddresses";
import { PageHeader } from "@/components/shared/PageHeader";

const EMPTY_FORM: NewAddress = {
  label: "",
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "US",
  phone: "",
  is_default: false,
};

function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: NewAddress;
  onSave: (data: NewAddress) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<NewAddress>(initial);
  const set = (field: keyof NewAddress) => (e: { target: { value: string } }) =>
    setForm((f: NewAddress) => ({ ...f, [field]: e.target.value }));

  const INPUT = "h-9 md:text-sm";
  const LABEL = "mb-1.5 text-xs font-medium text-foreground";

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="space-y-4 rounded-lg bg-card p-5 ring-1 ring-foreground/10"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className={LABEL}>First Name *</Label>
          <Input type="text" value={form.first_name} onChange={set("first_name")} className={INPUT} required maxLength={100} />
        </div>
        <div>
          <Label className={LABEL}>Last Name *</Label>
          <Input type="text" value={form.last_name} onChange={set("last_name")} className={INPUT} required maxLength={100} />
        </div>
      </div>

      <div>
        <Label className={LABEL}>Label (e.g. Home, Office)</Label>
        <Input type="text" value={form.label ?? ""} onChange={set("label")} className={INPUT} maxLength={50} placeholder="Optional" />
      </div>

      <div>
        <Label className={LABEL}>Company</Label>
        <Input type="text" value={form.company ?? ""} onChange={set("company")} className={INPUT} maxLength={255} placeholder="Optional" />
      </div>

      <div>
        <Label className={LABEL}>Address Line 1 *</Label>
        <Input type="text" value={form.address_1} onChange={set("address_1")} className={INPUT} required maxLength={255} />
      </div>

      <div>
        <Label className={LABEL}>Address Line 2</Label>
        <Input type="text" value={form.address_2 ?? ""} onChange={set("address_2")} className={INPUT} maxLength={255} placeholder="Optional" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className={LABEL}>City *</Label>
          <Input type="text" value={form.city} onChange={set("city")} className={INPUT} required maxLength={100} />
        </div>
        <div>
          <Label className={LABEL}>State / Region</Label>
          <Input type="text" value={form.state ?? ""} onChange={set("state")} className={INPUT} maxLength={100} placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className={LABEL}>Postcode *</Label>
          <Input type="text" value={form.postcode} onChange={set("postcode")} className={INPUT} required maxLength={20} />
        </div>
        <div>
          <Label className={LABEL}>Country *</Label>
          <Input type="text" value={form.country} onChange={set("country")} className={INPUT} required maxLength={2} placeholder="AU" />
        </div>
      </div>

      <div>
        <Label className={LABEL}>Phone</Label>
        <Input type="tel" value={form.phone ?? ""} onChange={set("phone")} className={INPUT} maxLength={20} placeholder="Optional" />
      </div>

      <Label className="cursor-pointer font-normal text-foreground">
        <Checkbox
          checked={!!form.is_default}
          onCheckedChange={(checked) => setForm((f) => ({ ...f, is_default: checked === true }))}
        />
        Set as default address
      </Label>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Address"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deleting,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  deleting: boolean;
}) {
  return (
    <div className={cn("relative rounded-lg bg-card p-4 ring-1", address.is_default ? "ring-2 ring-primary" : "ring-foreground/10")}>
      {address.is_default && (
        <Badge className="absolute right-3 top-3 font-mono">Default</Badge>
      )}
      {address.label && (
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{address.label}</p>
      )}
      <p className="text-sm font-medium text-foreground">
        {address.first_name} {address.last_name}
      </p>
      {address.company && (
        <p className="text-xs text-muted-foreground">{address.company}</p>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        {address.address_1}
        {address.address_2 ? `, ${address.address_2}` : ""}
      </p>
      <p className="text-xs text-muted-foreground">
        {address.city}{address.state ? `, ${address.state}` : ""} {address.postcode} {address.country}
      </p>
      {address.phone && (
        <p className="text-xs text-muted-foreground mt-0.5">{address.phone}</p>
      )}

      <div className="mt-3 flex items-center gap-1 -ml-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
        {!address.is_default && (
          <Button variant="ghost" size="sm" onClick={onSetDefault}>Set as default</Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDelete} disabled={deleting} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (authLoading || !isAuthenticated || isLoading) {
    return (
      <div className="bg-background min-h-screen pb-20">
        <PageHeader crumbs={[{ label: "Account", href: "/account/profile" }, { label: "Addresses" }]} title="Manage Addresses" />
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-8 sm:px-8">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-background min-h-screen pb-20">
        <PageHeader crumbs={[{ label: "Account", href: "/account/profile" }, { label: "Addresses" }]} title="Manage Addresses" />
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-8">
          <p className="text-xs text-muted-foreground">Addresses could not be loaded.</p>
          <Button type="button" onClick={() => refetch()}>Try again</Button>
        </div>
      </div>
    );
  }

  function handleCreate(data: NewAddress) {
    createAddress.mutate(data, { onSuccess: () => setShowForm(false) });
  }

  function handleUpdate(id: number, data: NewAddress) {
    updateAddress.mutate({ id, data }, { onSuccess: () => setEditingId(null) });
  }

  function handleDelete(id: number) {
    if (!window.confirm("Delete this address? This action cannot be undone.")) return;
    setDeletingId(id);
    deleteAddress.mutate(id, { onSettled: () => setDeletingId(null) });
  }

  function handleSetDefault(id: number) {
    updateAddress.mutate({ id, data: { is_default: true } });
  }

  const list = addresses ?? [];

  return (
    <div className="bg-background min-h-screen pb-20">
      <PageHeader crumbs={[{ label: "Account", href: "/account/profile" }, { label: "Addresses" }]} title="Manage Addresses" />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        {list.length === 0 && !showForm && (
          <p className="mb-6 text-sm text-muted-foreground">No addresses saved yet.</p>
        )}

        <div className="space-y-4 mb-6">
          {list.map((addr) =>
            editingId === addr.id ? (
              <AddressForm
                key={addr.id}
                initial={{
                  label: addr.label ?? "",
                  first_name: addr.first_name,
                  last_name: addr.last_name,
                  company: addr.company ?? "",
                  address_1: addr.address_1,
                  address_2: addr.address_2 ?? "",
                  city: addr.city,
                  state: addr.state ?? "",
                  postcode: addr.postcode,
                  country: addr.country,
                  phone: addr.phone ?? "",
                  is_default: addr.is_default,
                }}
                onSave={(data) => handleUpdate(addr.id, data)}
                onCancel={() => setEditingId(null)}
                saving={updateAddress.isPending}
              />
            ) : (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => setEditingId(addr.id)}
                onDelete={() => handleDelete(addr.id)}
                onSetDefault={() => handleSetDefault(addr.id)}
                deleting={deletingId === addr.id}
              />
            )
          )}
        </div>

        {showForm ? (
          <AddressForm
            initial={EMPTY_FORM}
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={createAddress.isPending}
          />
        ) : (
          <Button variant="outline" size="lg" className="h-9 px-4" onClick={() => setShowForm(true)}>
            <Plus data-icon="inline-start" /> Add address
          </Button>
        )}
      </div>
    </div>
  );
}
