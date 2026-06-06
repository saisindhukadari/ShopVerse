import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PageShell } from "@/components/shop/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShopStore, cartSubtotal } from "@/store/shop-store";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Shopverse" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useShopStore((s) => s.cart);
  const subtotal = useShopStore(cartSubtotal);
  const updateQty = useShopStore((s) => s.updateQty);
  const removeFromCart = useShopStore((s) => s.removeFromCart);
  const saveForLater = useShopStore((s) => s.saveForLater);
  const moveToCart = useShopStore((s) => s.moveToCart);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);

  const active = cart.filter((i) => !i.savedForLater);
  const saved = cart.filter((i) => i.savedForLater);

  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "ok" | "bad">("idle");
  const discount = promoState === "ok" ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 6.99;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  if (active.length === 0 && saved.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="text-7xl">🛒</div>
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Browse products and add your favorites to get started.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/products">Continue shopping</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4">
        <h1 className="mb-4 text-2xl font-bold">Shopping Cart</h1>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {active.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3 rounded-xl border bg-card p-3 sm:gap-4 sm:p-4"
                >
                  <Link
                    to="/product/$id"
                    params={{ id: item.product.id }}
                    className="shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="h-24 w-24 rounded-lg object-cover sm:h-32 sm:w-32"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      to="/product/$id"
                      params={{ id: item.product.id }}
                      className="line-clamp-2 font-medium hover:text-primary"
                    >
                      {item.product.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {item.product.brand} · {item.product.category}
                    </div>
                    <div className="mt-1 text-xs">
                      {item.product.inStock ? (
                        <span className="text-success">In Stock</span>
                      ) : (
                        <span className="text-destructive">Out of Stock</span>
                      )}
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                      <div className="flex items-center rounded border">
                        <button
                          className="p-1.5 hover:bg-muted"
                          onClick={() => updateQty(item.product.id, item.quantity - 1)}
                          aria-label="Decrease"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          className="p-1.5 hover:bg-muted"
                          onClick={() => updateQty(item.product.id, item.quantity + 1)}
                          aria-label="Increase"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <Separator />
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={12} className="mr-1 inline" /> Remove
                      </button>
                      <Separator />
                      <button
                        onClick={() => saveForLater(item.product.id)}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        Save for later
                      </button>
                      <Separator />
                      <button
                        onClick={() => {
                          toggleWishlist(item.product.id);
                          removeFromCart(item.product.id);
                        }}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        <Heart size={12} className="mr-1 inline" /> Move to wishlist
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-lg font-bold text-price">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {saved.length > 0 && (
              <div>
                <h2 className="mb-2 mt-6 text-lg font-bold">Saved for later ({saved.length})</h2>
                <div className="space-y-3">
                  {saved.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 rounded-xl border bg-card p-3"
                    >
                      <img src={item.product.images[0]} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      <div className="flex-1">
                        <Link
                          to="/product/$id"
                          params={{ id: item.product.id }}
                          className="line-clamp-1 text-sm font-medium hover:text-primary"
                        >
                          {item.product.title}
                        </Link>
                        <div className="text-sm font-bold text-price">${item.product.price}</div>
                        <div className="mt-2 flex gap-3 text-xs">
                          <button
                            onClick={() => moveToCart(item.product.id)}
                            className="text-primary hover:underline"
                          >
                            Move to cart
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-32 lg:h-fit">
            <div className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-lg font-bold">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>${subtotal.toFixed(2)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <dt>Promo (SAVE10)</dt>
                    <dd>−${discount.toFixed(2)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Tax</dt>
                  <dd>${tax.toFixed(2)}</dd>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <dt>Total</dt>
                  <dd>${total.toFixed(2)}</dd>
                </div>
              </dl>

              <div className="mt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code (try SAVE10)"
                    value={promo}
                    onChange={(e) => {
                      setPromo(e.target.value);
                      setPromoState("idle");
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (promo.trim().toUpperCase() === "SAVE10") {
                        setPromoState("ok");
                        toast.success("Promo applied — 10% off");
                      } else {
                        setPromoState("bad");
                        toast.error("Invalid code");
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
                {promoState === "ok" && (
                  <p className="mt-1 text-xs text-success">10% discount applied</p>
                )}
                {promoState === "bad" && (
                  <p className="mt-1 text-xs text-destructive">Invalid promo code</p>
                )}
              </div>

              <Button asChild size="lg" className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={active.length === 0}>
                <Link to="/checkout">
                  <ShoppingBag size={16} className="mr-2" /> Proceed to Checkout
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function Separator() {
  return <span className="hidden text-muted-foreground/50 sm:inline">|</span>;
}
