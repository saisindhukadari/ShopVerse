import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/shop/layout";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/product-card";
import { CATEGORIES, getByTag, PRODUCTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shopverse — Modern Shopping, Reimagined" },
      {
        name: "description",
        content:
          "Shop trending electronics, fashion, home, books, gaming and beauty with fast delivery and premium picks.",
      },
      { property: "og:title", content: "Shopverse — Modern Shopping, Reimagined" },
      {
        property: "og:description",
        content: "Trending products, best sellers, and new arrivals all in one place.",
      },
    ],
  }),
  component: Home,
});

const BANNERS = [
  {
    title: "Mega Tech Sale",
    subtitle: "Up to 60% off on top electronics",
    cta: "Shop Electronics",
    category: "Electronics" as const,
    gradient: "from-[oklch(0.30_0.10_240)] to-[oklch(0.45_0.18_280)]",
    image: "https://picsum.photos/seed/banner-tech/1600/600",
  },
  {
    title: "Fashion Forward",
    subtitle: "Styles your wardrobe will thank you for",
    cta: "Explore Fashion",
    category: "Fashion" as const,
    gradient: "from-[oklch(0.35_0.12_350)] to-[oklch(0.50_0.15_30)]",
    image: "https://picsum.photos/seed/banner-fashion/1600/600",
  },
  {
    title: "Level Up Your Setup",
    subtitle: "Gaming gear built for victory",
    cta: "Shop Gaming",
    category: "Gaming" as const,
    gradient: "from-[oklch(0.25_0.12_290)] to-[oklch(0.35_0.18_320)]",
    image: "https://picsum.photos/seed/banner-gaming/1600/600",
  },
];

function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % BANNERS.length), 5500);
    return () => clearInterval(t);
  }, []);
  const b = BANNERS[i];
  return (
    <div className="relative mx-auto max-w-screen-2xl px-3 pt-4 sm:px-4">
      <div className="relative h-[260px] overflow-hidden rounded-2xl sm:h-[360px] md:h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`absolute inset-0 bg-gradient-to-br ${b.gradient}`}
          >
            <img
              src={b.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="relative flex h-full max-w-xl flex-col justify-center gap-4 p-6 text-white sm:p-12">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold tracking-tight sm:text-5xl"
              >
                {b.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-base text-white/90 sm:text-lg"
              >
                {b.subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/products" search={{ category: b.category }}>
                    {b.cta}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setI((x) => (x - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50"
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => setI((x) => (x + 1) % BANNERS.length)}
          className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50"
          aria-label="Next"
        >
          <ChevronRight />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4">
      <h2 className="mb-3 text-xl font-bold">Shop by Category</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.name}
            to="/products"
            search={{ category: c.name }}
            className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-3 transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full text-3xl transition group-hover:scale-110"
              style={{ background: c.color }}
            >
              {c.emoji}
            </div>
            <span className="text-center text-xs font-medium sm:text-sm">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductRow({ title, tag }: { title: string; tag: "trending" | "best-seller" | "new" | "recommended" }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);
  const items = getByTag(tag, 6);
  return (
    <section className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link to="/products" className="text-sm text-primary hover:underline">
          See all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function InfiniteFeed() {
  const [count, setCount] = useState(12);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 600 &&
        !loading &&
        count < PRODUCTS.length
      ) {
        setLoading(true);
        setTimeout(() => {
          setCount((c) => Math.min(c + 6, PRODUCTS.length));
          setLoading(false);
        }, 500);
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loading, count]);
  return (
    <section className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4">
      <h2 className="mb-3 text-xl font-bold">Inspired by your browsing</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PRODUCTS.slice(0, count).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {loading && Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={`s${i}`} />)}
      </div>
    </section>
  );
}

function Home() {
  return (
    <PageShell>
      <HeroCarousel />
      <CategoryGrid />
      <ProductRow title="Trending Now" tag="trending" />
      <ProductRow title="Best Sellers" tag="best-seller" />
      <ProductRow title="New Arrivals" tag="new" />
      <ProductRow title="Recommended For You" tag="recommended" />
      <InfiniteFeed />
    </PageShell>
  );
}
