import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Package, Truck, Zap } from "lucide-react";
import { PageShell } from "@/components/shop/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useShopStore, cartSubtotal } from "@/store/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Shopverse" }] }),
  component: CheckoutPage,
});

const STEPS = ["Shipping", "Delivery", "Payment", "Review", "Done"] as const;

function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useShopStore((s) => s.cart.filter((i) => !i.savedForLater));
  const subtotal = useShopStore(cartSubtotal);
  const clearCart = useShopStore((s) => s.clearCart);
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({
    fullName: "", phone: "", email: "", address: "", city: "", state: "", zip: "",
  });
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("card");
  const [orderId] = useState(() => "SV-" + Math.random().toString(36).slice(2, 9).toUpperCase());

  const deliveryFee = delivery === "express" ? 12.99 : delivery === "sameday" ? 24.99 : subtotal > 50 ? 0 : 6.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + deliveryFee + tax;

  if (cart.length === 0 && step < 4) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md py-20 text-center">
          <p className="text-lg">Your cart is empty.</p>
          <Button asChild className="mt-4"><Link to="/products">Shop now</Link></Button>
        </div>
      </PageShell>
    );
  }

  function next() {
    if (step === 0) {
      const required = ["fullName", "phone", "email", "address", "city", "state", "zip"] as const;
      if (required.some((k) => !shipping[k].trim())) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function placeOrder() {
    setStep(4);
    clearCart();
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4">
        {/* Stepper */}
        <ol className="mb-8 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold transition",
                    i < step
                      ? "border-primary bg-primary text-primary-foreground"
                      : i === step
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className="mt-1 hidden text-xs sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("mx-2 h-px flex-1", i < step ? "bg-primary" : "bg-border")} />
              )}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            {step === 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold">Shipping Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" value={shipping.fullName} onChange={(v) => setShipping({ ...shipping, fullName: v })} />
                  <Field label="Phone" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} />
                  <Field label="Email" type="email" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} className="sm:col-span-2" />
                  <Field label="Address" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} className="sm:col-span-2" />
                  <Field label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                  <Field label="State" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
                  <Field label="ZIP Code" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-4 text-lg font-bold">Delivery Method</h2>
                <RadioGroup value={delivery} onValueChange={setDelivery} className="space-y-3">
                  {[
                    { id: "standard", icon: Truck, label: "Standard Delivery", desc: "3–5 business days", price: subtotal > 50 ? "Free" : "$6.99" },
                    { id: "express", icon: Package, label: "Express Delivery", desc: "1–2 business days", price: "$12.99" },
                    { id: "sameday", icon: Zap, label: "Same Day Delivery", desc: "Order before 12pm", price: "$24.99" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition",
                        delivery === opt.id ? "border-primary bg-accent" : "hover:bg-muted",
                      )}
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} />
                      <opt.icon className="text-primary" />
                      <div className="flex-1">
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-sm text-muted-foreground">{opt.desc}</div>
                      </div>
                      <div className="font-bold">{opt.price}</div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-4 text-lg font-bold">Payment</h2>
                <RadioGroup value={payment} onValueChange={setPayment} className="space-y-2">
                  {[
                    { id: "card", label: "Credit Card" },
                    { id: "debit", label: "Debit Card" },
                    { id: "upi", label: "UPI" },
                    { id: "paypal", label: "PayPal" },
                    { id: "cod", label: "Cash on Delivery" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition",
                        payment === opt.id ? "border-primary bg-accent" : "hover:bg-muted",
                      )}
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} />
                      {opt.label}
                    </label>
                  ))}
                </RadioGroup>
                {(payment === "card" || payment === "debit") && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field label="Card Number" placeholder="1234 5678 9012 3456" className="sm:col-span-2" />
                    <Field label="Expiry" placeholder="MM/YY" />
                    <Field label="CVV" placeholder="123" />
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="mb-4 text-lg font-bold">Review Your Order</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Shipping to</h3>
                    <p className="text-sm text-muted-foreground">
                      {shipping.fullName}, {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Delivery</h3>
                    <p className="text-sm text-muted-foreground capitalize">{delivery} delivery</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Payment</h3>
                    <p className="text-sm text-muted-foreground capitalize">{payment.replace("cod", "Cash on Delivery")}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Items ({cart.length})</h3>
                    <div className="space-y-2">
                      {cart.map((i) => (
                        <div key={i.product.id} className="flex items-center gap-3 rounded-lg border p-2">
                          <img src={i.product.images[0]} alt="" className="h-12 w-12 rounded object-cover" />
                          <div className="flex-1 text-sm">
                            <div className="line-clamp-1">{i.product.title}</div>
                            <div className="text-xs text-muted-foreground">Qty {i.quantity}</div>
                          </div>
                          <div className="font-semibold">${(i.product.price * i.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr />
                  <dl className="space-y-1 text-sm">
                    <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                    <Row label="Delivery" value={deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`} />
                    <Row label="Tax" value={`$${tax.toFixed(2)}`} />
                    <Row label="Total" value={`$${total.toFixed(2)}`} bold />
                  </dl>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success text-success-foreground"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-2xl font-bold"
                >
                  Order placed successfully!
                </motion.h2>
                <p className="mt-2 text-muted-foreground">Order number: <span className="font-mono font-semibold">{orderId}</span></p>
                <p className="text-sm text-muted-foreground">A confirmation has been sent to your email.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button onClick={() => navigate({ to: "/" })}>Track Order</Button>
                  <Button variant="outline" asChild><Link to="/products">Continue Shopping</Link></Button>
                </div>
              </div>
            )}

            {step < 4 && (
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ChevronLeft size={16} className="mr-1" /> Back
                </Button>
                {step < 3 ? (
                  <Button onClick={next} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Continue <ChevronRight size={16} className="ml-1" />
                  </Button>
                ) : (
                  <Button onClick={placeOrder} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Place Order
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, className,
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "border-t pt-2 text-base font-bold")}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
