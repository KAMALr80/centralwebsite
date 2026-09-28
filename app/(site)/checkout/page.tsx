"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, Plus, Pencil, ArrowRight, Loader2 } from "lucide-react";
import { useRequireApproved } from "@/components/auth/withAuth";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useAddresses, useCreateAddress, useUpdateAddress, type Address, type NewAddress } from "@/hooks/useAddresses";
import api from "@/lib/axios";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "w-full cursor-pointer rounded-lg p-4 text-left outline-none ring-1 transition-all focus-visible:ring-2 focus-visible:ring-ring/50",
        selected
          ? "bg-primary/5 ring-2 ring-primary"
          : "bg-card ring-border hover:ring-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {address.label && (
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {address.label}
            </div>
          )}
          <div className="text-sm font-medium text-foreground">
            {address.first_name} {address.last_name}
          </div>
          {address.company && (
            <div className="text-xs text-muted-foreground">{address.company}</div>
          )}
          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {address.address_1}
            {address.address_2 && <>, {address.address_2}</>}
            <br />
            {address.city}, {address.state} {address.postcode}
            <br />
            {address.country}
          </div>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit address"
            aria-label="Edit address"
          >
            <Pencil />
          </Button>
          {selected && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Address Selector ─────────────────────────────────────────────────────────

function AddressSelector({
  title,
  addresses,
  selected,
  onSelect,
  onAdd,
  onEdit,
  extra,
}: {
  title: string;
  addresses: Address[];
  selected: Address | null;
  onSelect: (addr: Address) => void;
  onAdd: () => void;
  onEdit: (addr: Address) => void;
  extra?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus data-icon="inline-start" /> Add new
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {addresses.length === 0 && (
          <p className="text-sm text-muted-foreground">No saved addresses.</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={selected?.id === addr.id}
              onSelect={() => onSelect(addr)}
              onEdit={() => onEdit(addr)}
            />
          ))}
        </div>
        {extra}
      </CardContent>
    </Card>
  );
}

// ─── Address Modal ────────────────────────────────────────────────────────────

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
};

function AddressField({
  label,
  value,
  onChange,
  required,
  half,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  half?: boolean;
}) {
  return (
    <div className={half ? "flex-1" : "w-full"}>
      <Label className="mb-1.5 text-xs font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-9 md:text-sm"
      />
    </div>
  );
}

function AddressModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Address;
  onSave: (addr: Address) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<NewAddress>(
    initial
      ? {
          label: initial.label ?? "",
          first_name: initial.first_name,
          last_name: initial.last_name,
          company: initial.company ?? "",
          address_1: initial.address_1,
          address_2: initial.address_2 ?? "",
          city: initial.city,
          state: initial.state ?? "",
          postcode: initial.postcode,
          country: initial.country,
          phone: initial.phone ?? "",
        }
      : EMPTY_FORM
  );
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: createAsync, isPending: isCreating } = useCreateAddress();
  const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdateAddress();
  const isPending = isCreating || isUpdating;

  const set = (k: keyof NewAddress, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const addr = initial
        ? await updateAsync({ id: initial.id, data: form })
        : await createAsync(form);
      onSave(addr);
    } catch {
      setError("Failed to save address. Please check your details and try again.");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit address" : "New address"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="flex gap-3">
              <AddressField label="First name" value={form.first_name} onChange={(v) => set("first_name", v)} required half />
              <AddressField label="Last name" value={form.last_name} onChange={(v) => set("last_name", v)} required half />
            </div>
            <div className="flex gap-3">
              <AddressField label="Label (e.g. Home)" value={form.label ?? ""} onChange={(v) => set("label", v)} half />
              <AddressField label="Company" value={form.company ?? ""} onChange={(v) => set("company", v)} half />
            </div>
            <AddressField label="Address line 1" value={form.address_1} onChange={(v) => set("address_1", v)} required />
            <AddressField label="Address line 2" value={form.address_2 ?? ""} onChange={(v) => set("address_2", v)} />
            <div className="flex gap-3">
              <AddressField label="City" value={form.city} onChange={(v) => set("city", v)} required half />
              <AddressField label="State / Province" value={form.state ?? ""} onChange={(v) => set("state", v)} half />
            </div>
            <div className="flex gap-3">
              <AddressField label="Postcode" value={form.postcode} onChange={(v) => set("postcode", v)} required half />
              <AddressField label="Country" value={form.country} onChange={(v) => set("country", v)} required half />
            </div>
            <AddressField label="Phone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} required />
          </div>

          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

          <DialogFooter className="mt-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isPending ? "Saving…" : initial ? "Update address" : "Save address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────

interface ModalState {
  initial?: Address;
  onSave: (addr: Address) => void;
}

const TH = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

export default function CheckoutPage() {
  const { isLoading, isAuthenticated, isApproved } = useRequireApproved();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { data: addresses = [] } = useAddresses();
  const router = useRouter();

  const [billingAddr, setBillingAddr] = useState<Address | null>(null);
  const [shippingAddr, setShippingAddr] = useState<Address | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  useEffect(() => {
    if (addresses.length === 0) return;
    const timer = window.setTimeout(() => {
      const fallback = addresses.find((address) => address.is_default) ?? addresses[0];
      setBillingAddr((current) =>
        current ? addresses.find((address) => address.id === current.id) ?? fallback : fallback
      );
      setShippingAddr((current) =>
        current ? addresses.find((address) => address.id === current.id) ?? fallback : fallback
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [addresses]);

  function openAddModal(onSave: (addr: Address) => void) {
    setModal({ onSave });
  }

  function openEditModal(addr: Address) {
    setModal({
      initial: addr,
      onSave: (updated) => {
        // Keep selections in sync if this address is currently selected
        if (billingAddr?.id === updated.id) setBillingAddr(updated);
        if (shippingAddr?.id === updated.id) setShippingAddr(updated);
      },
    });
  }

  if (isLoading || !isAuthenticated || !isApproved) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!billingAddr || !shippingAddr) {
      setError("Please select a billing and shipping address.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      billing_first_name: billingAddr.first_name,
      billing_last_name: billingAddr.last_name,
      billing_company: billingAddr.company,
      billing_address_1: billingAddr.address_1,
      billing_address_2: billingAddr.address_2,
      billing_city: billingAddr.city,
      billing_state: billingAddr.state,
      billing_postcode: billingAddr.postcode,
      billing_country: billingAddr.country,
      billing_email: user?.email ?? "",
      billing_phone: billingAddr.phone ?? "",
      shipping_first_name: shippingAddr.first_name,
      shipping_last_name: shippingAddr.last_name,
      shipping_company: shippingAddr.company,
      shipping_address_1: shippingAddr.address_1,
      shipping_address_2: shippingAddr.address_2,
      shipping_city: shippingAddr.city,
      shipping_state: shippingAddr.state,
      shipping_postcode: shippingAddr.postcode,
      shipping_country: shippingAddr.country,
      customer_note: note || undefined,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await api.post<{ data: { id: number } }>("/orders", payload);
      clearCart();
      router.push(`/orders/${res.data.data.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosErr?.response?.status;
      if (status === 422) {
        setError("One or more products are no longer available. Please review your cart.");
      } else if (status === 403) {
        setError("Your account is not approved for ordering yet.");
      } else {
        setError("Failed to place order. Please try again.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-border bg-card px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-start justify-between gap-4">
          <h1 className="font-heading text-3xl font-semibold leading-none text-foreground">
            Checkout
          </h1>
          <StepIndicator step={2} />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-4 py-6 sm:px-8 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          <AddressSelector
            title="Billing address"
            addresses={addresses}
            selected={billingAddr}
            onSelect={setBillingAddr}
            onAdd={() => openAddModal(setBillingAddr)}
            onEdit={openEditModal}
          />

          <AddressSelector
            title="Shipping address"
            addresses={addresses}
            selected={shippingAddr}
            onSelect={setShippingAddr}
            onAdd={() => openAddModal(setShippingAddr)}
            onEdit={openEditModal}
            extra={
              billingAddr && shippingAddr?.id !== billingAddr?.id ? (
                <Button variant="link" size="sm" className="px-0" onClick={() => setShippingAddr(billingAddr)}>
                  Use same as billing
                </Button>
              ) : null
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>Order note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Customer note / P.O. reference (optional)"
                rows={3}
                className="resize-none md:text-sm"
              />
            </CardContent>
          </Card>

          <Card className="gap-0 pb-0">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle>
                Order review · {items.length} line{items.length !== 1 ? "s" : ""}
              </CardTitle>
              <CardAction>
                <Link href="/cart" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "no-underline")}>
                  <ChevronLeft data-icon="inline-start" /> Edit in cart
                </Link>
              </CardAction>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className={cn(TH, "pl-4")}>Product</TableHead>
                  <TableHead className={cn(TH, "w-16 text-right")}>Qty</TableHead>
                  <TableHead className={cn(TH, "w-24 text-right")}>Unit price</TableHead>
                  <TableHead className={cn(TH, "w-24 pr-4 text-right")}>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.product_id} className="text-[12.5px]">
                    <TableCell className="whitespace-normal pl-4">
                      <div className="text-foreground">{item.name}</div>
                      <div className="font-mono text-[10.5px] text-muted-foreground">{item.sku}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="pr-4 text-right font-mono font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <Card className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[320px]">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono font-medium text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">TBD</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3">
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs leading-snug text-destructive">{error}</p>
            )}

            <Button
              size="lg"
              onClick={handlePlaceOrder}
              disabled={submitting || !billingAddr || !shippingAddr || items.length === 0}
              className="h-10 w-full text-sm"
            >
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? "Placing order…" : "Place order"}
              {!submitting && <ArrowRight data-icon="inline-end" />}
            </Button>

            <Link href="/cart" className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}>
              <ChevronLeft data-icon="inline-start" /> Back to cart
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Address modal — single instance, prevents simultaneous edits */}
      {modal && (
        <AddressModal
          key={modal.initial?.id ?? "new"}
          initial={modal.initial}
          onSave={(addr) => {
            modal.onSave(addr);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
