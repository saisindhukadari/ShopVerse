import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/shop/layout";
import { ProductCard } from "@/components/shop/product-card";
import { Stars } from "@/components/shop/stars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProduct, PRODUCTS } from "@/lib/mock-data";
import { useShopStore } from "@/store/shop-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.title} — Shopverse` : "Product — Shopverse" },
        { name: "description", content: p?.description.slice(0, 150) ?? "" },
        { property: "og:title", content: p?.title ?? "" },
        { property: "og:description", content: p?.description.slice(0, 150) ?? "" },
        { property: "og:image", content: p?.images[0] ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <PageShell>
      <div className="grid place-items-center py-24 text-center">
        <p className="text-2xl font-bold">Product not found</p>
        <Button asChild className="mt-4">
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    </PageShell>
  ),
  errorComponent: () => (
    <PageShell>
      <div className="py-24 text-center">Something went wrong.</div>
    </PageShell>
  ),
  component: ProductPage,
});

function ProductPage() {
  const loaderData = Route.useLoaderData() as { product: NonNullable<ReturnType<typeof getProduct>> };
  const { product } = loaderData;
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [qty, setQty] = useState(1);

  const addToCart = useShopStore((s) => s.addToCart);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const inWishlist = useShopStore((s) => s.wishlist.includes(product.id));

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 8);

  return (
    <PageShell>
      <div className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4">
        <nav className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          {" / "}
          <Link to="/products" search={{ category: product.category }} className="hover:text-primary">
            {product.category}
          </Link>
          {" / "}
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr_360px]">
          {/* Gallery */}
          <div className="flex gap-3 lg:col-span-1">
            <div className="hidden flex-col gap-2 sm:flex">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-lg border-2 transition",
                    active === i ? "border-primary" : "border-transparent hover:border-border",
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div
              className="relative aspect-square flex-1 overflow-hidden rounded-xl border bg-muted"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({
                  x: ((e.clientX - r.left) / r.width) * 100,
                  y: ((e.clientY - r.top) / r.height) * 100,
                });
              }}
              onMouseLeave={() => setZoom(null)}
            >
              <motion.img
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[active]}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300"
                style={
                  zoom
                    ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: "scale(2)" }
                    : undefined
                }
              />
            </div>
          </div>

          {/* Mobile thumbs carousel */}
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 sm:hidden">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2",
                  active === i ? "border-primary" : "border-transparent",
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">{product.brand}</div>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{product.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Stars value={product.rating} />
                <span className="font-medium">{product.rating}</span>
                <a href="#reviews" className="text-primary hover:underline">
                  {product.reviewCount.toLocaleString()} ratings
                </a>
              </div>
            </div>
            <hr />
            <div>
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground">-{discount}%</Badge>
              )}
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-price">${product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-muted-foreground line-through">
                    M.R.P: ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Inclusive of all taxes
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { i: Truck, t: "Free Delivery" },
                { i: RotateCcw, t: "10-day Returns" },
                { i: Shield, t: "1-yr Warranty" },
              ].map(({ i: Icon, t }) => (
                <div key={t} className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 text-center text-xs">
                  <Icon size={20} className="text-primary" />
                  {t}
                </div>
              ))}
            </div>

            <Accordion type="single" collapsible className="border-t pt-2">
              <AccordionItem value="specs">
                <AccordionTrigger>Product Specifications</AccordionTrigger>
                <AccordionContent>
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specs).map(([k, v]) => (
                        <tr key={k} className="border-b last:border-0">
                          <td className="py-2 font-medium text-muted-foreground">{k}</td>
                          <td className="py-2">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Buy box */}
          <aside className="lg:sticky lg:top-32 lg:h-fit">
            <div className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="text-2xl font-bold text-price">${product.price}</div>
              <div className="mt-1 text-sm">
                {product.inStock ? (
                  <span className="font-semibold text-success">In Stock</span>
                ) : (
                  <span className="font-semibold text-destructive">Out of Stock</span>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                FREE delivery by tomorrow
              </div>

              <div className="mt-4 flex items-center gap-2">
                <label className="text-sm">Qty:</label>
                <div className="flex items-center rounded border">
                  <button
                    className="px-3 py-1 hover:bg-muted"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >−</button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button
                    className="px-3 py-1 hover:bg-muted"
                    onClick={() => setQty((q) => q + 1)}
                  >+</button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                  disabled={!product.inStock}
                  onClick={() => {
                    addToCart(product, qty);
                    toast.success("Added to cart");
                  }}
                >
                  <ShoppingCart size={16} className="mr-2" /> Add to Cart
                </Button>
                <Button asChild className="w-full" size="lg" variant="secondary" disabled={!product.inStock}>
                  <Link
                    to="/checkout"
                    onClick={() => {
                      addToCart(product, qty);
                    }}
                  >
                    Buy Now
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      toggleWishlist(product.id);
                      toast(inWishlist ? "Removed from wishlist" : "Added to wishlist");
                    }}
                  >
                    <Heart
                      size={14}
                      className={cn("mr-2", inWishlist && "fill-destructive text-destructive")}
                    />
                    Wishlist
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={async () => {
                      try {
                        if (navigator.share)
                          await navigator.share({
                            title: product.title,
                            url: window.location.href,
                          });
                        else {
                          await navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied");
                        }
                      } catch {}
                    }}
                  >
                    <Share2 size={14} className="mr-2" /> Share
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Reviews */}
        <section id="reviews" className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Customer Reviews</h2>
          <ReviewList rating={product.rating} count={product.reviewCount} />
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Customers also viewed</h2>
            <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-4 sm:mx-0 sm:px-0">
              {related.map((p) => (
                <div key={p.id} className="w-52 shrink-0 sm:w-60">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

const REVIEWS = [
  { name: "Alex M.", title: "Exceeded expectations", body: "Quality is fantastic and shipping was lightning fast. Would absolutely recommend." },
  { name: "Priya S.", title: "Great value", body: "Solid build, looks premium. Battery / performance is great for the price." },
  { name: "Jordan K.", title: "Pretty good", body: "Does the job. Setup was straightforward and packaging is nice." },
  { name: "Sam L.", title: "Worth every penny", body: "I've used cheaper alternatives and this is on another level." },
  { name: "Maya R.", title: "Beautiful design", body: "Looks even better in person. Highly recommend this one." },
];

function ReviewList({ rating, count }: { rating: number; count: number }) {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pages = Math.ceil(REVIEWS.length / perPage);
  const visible = REVIEWS.slice(page * perPage, (page + 1) * perPage);
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-xl border bg-card p-4">
        <div className="text-5xl font-bold">{rating}</div>
        <Stars value={rating} size={18} />
        <div className="mt-1 text-sm text-muted-foreground">
          {count.toLocaleString()} global ratings
        </div>
        <div className="mt-4 space-y-1.5">
          {[5, 4, 3, 2, 1].map((s) => {
            const pct = Math.max(2, Math.round((s === Math.round(rating) ? 60 : 10) + Math.random() * 20));
            return (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className="w-6">{s}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-rating" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-4">
        {visible.map((r, i) => (
          <motion.div
            key={`${page}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {r.name[0]}
              </div>
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <Stars value={4 + Math.random()} />
              </div>
            </div>
            <div className="mt-2 font-semibold">{r.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
          </motion.div>
        ))}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "h-8 w-8 rounded-full text-sm",
                page === i ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
