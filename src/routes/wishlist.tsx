import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3x3, Heart, List, ShoppingCart, Trash2 } from "lucide-react";
import { PageShell } from "@/components/shop/layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { useShopStore } from "@/store/shop-store";
import { PRODUCTS } from "@/lib/mock-data";
import { Stars } from "@/components/shop/stars";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Your Wishlist — Shopverse" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const wishlist = useShopStore((s) => s.wishlist);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const moveWishlistToCart = useShopStore((s) => s.moveWishlistToCart);
  const [view, setView] = useState<"grid" | "list">("grid");

  const items = PRODUCTS.filter((p) => wishlist.includes(p.id));

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="text-7xl">💖</div>
          <h1 className="mt-4 text-2xl font-bold">Your wishlist is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Tap the heart on any product to save it for later.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/products">Discover products</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-sm text-muted-foreground">{items.length} items</p>
          </div>
          <div className="flex rounded-md border">
            <button
              onClick={() => setView("grid")}
              className={cn("p-2", view === "grid" ? "bg-accent" : "hover:bg-muted")}
              aria-label="Grid view"
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-2", view === "list" ? "bg-accent" : "hover:bg-muted")}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <AnimatePresence>
              {items.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 rounded-xl border bg-card p-3"
                >
                  <Link to="/product/$id" params={{ id: p.id }}>
                    <img src={p.images[0]} alt={p.title} className="h-24 w-24 rounded-lg object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      to="/product/$id"
                      params={{ id: p.id }}
                      className="font-medium hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs">
                      <Stars value={p.rating} />
                      <span className="text-muted-foreground">({p.reviewCount})</span>
                    </div>
                    <div className="mt-1 text-lg font-bold text-price">${p.price}</div>
                    <div className="text-xs">
                      {p.inStock ? (
                        <span className="text-success">In Stock</span>
                      ) : (
                        <span className="text-destructive">Out of Stock</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      disabled={!p.inStock}
                      onClick={() => moveWishlistToCart(p)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <ShoppingCart size={14} className="mr-1" /> Move to Cart
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleWishlist(p.id)}>
                      <Trash2 size={14} className="mr-1" /> Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageShell>
  );
}
