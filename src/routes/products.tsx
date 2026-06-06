import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { PageShell } from "@/components/shop/layout";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/product-card";
import { CATEGORIES, PRODUCTS, type Category } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Stars } from "@/components/shop/stars";

interface Search {
  q?: string;
  category?: Category;
}

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category:
      typeof s.category === "string" &&
      CATEGORIES.some((c) => c.name === s.category)
        ? (s.category as Category)
        : undefined,
  }),
  head: ({ match }) => {
    const s = match.search as Search;
    const title = s.category
      ? `${s.category} — Shopverse`
      : s.q
        ? `"${s.q}" — Shopverse`
        : "All Products — Shopverse";
    return {
      meta: [
        { title },
        { name: "description", content: "Browse all products on Shopverse with advanced filters and sorting." },
      ],
    };
  },
  component: ProductsPage,
});

type Sort = "popularity" | "price-asc" | "price-desc" | "rating" | "newest";

function ProductsPage() {
  const { q, category } = Route.useSearch();
  const navigate = Route.useNavigate();

  const allBrands = useMemo(
    () => Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort(),
    [],
  );
  const maxPrice = useMemo(() => Math.max(...PRODUCTS.map((p) => p.price)), []);

  const [price, setPrice] = useState<[number, number]>([0, maxPrice]);
  const [minRating, setMinRating] = useState(0);
  const [cats, setCats] = useState<Category[]>(category ? [category] : []);
  const [brands, setBrands] = useState<string[]>([]);
  const [brandQuery, setBrandQuery] = useState("");
  const [availability, setAvailability] = useState<{ inStock: boolean; outOfStock: boolean }>({
    inStock: true,
    outOfStock: true,
  });
  const [sort, setSort] = useState<Sort>("popularity");
  const [loading] = useState(false);

  const results = useMemo(() => {
    let r = [...PRODUCTS];
    if (q) {
      const l = q.toLowerCase();
      r = r.filter(
        (p) =>
          p.title.toLowerCase().includes(l) ||
          p.brand.toLowerCase().includes(l) ||
          p.category.toLowerCase().includes(l),
      );
    }
    if (cats.length) r = r.filter((p) => cats.includes(p.category));
    if (brands.length) r = r.filter((p) => brands.includes(p.brand));
    r = r.filter((p) => p.price >= price[0] && p.price <= price[1]);
    if (minRating > 0) r = r.filter((p) => p.rating >= minRating);
    if (!availability.inStock) r = r.filter((p) => !p.inStock);
    if (!availability.outOfStock) r = r.filter((p) => p.inStock);
    switch (sort) {
      case "price-asc": r.sort((a, b) => a.price - b.price); break;
      case "price-desc": r.sort((a, b) => b.price - a.price); break;
      case "rating": r.sort((a, b) => b.rating - a.rating); break;
      case "newest": r.sort((a, b) => Number(b.id) - Number(a.id)); break;
      default: r.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return r;
  }, [q, cats, brands, price, minRating, availability, sort]);

  const filteredBrandList = allBrands.filter((b) =>
    b.toLowerCase().includes(brandQuery.toLowerCase()),
  );

  function toggle<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function clearAll() {
    setPrice([0, maxPrice]);
    setMinRating(0);
    setCats([]);
    setBrands([]);
    setAvailability({ inStock: true, outOfStock: true });
    navigate({ search: {} });
  }

  const Filters = (
    <div className="space-y-6">
      <FilterSection title="Price">
        <div className="px-1">
          <Slider
            min={0}
            max={maxPrice}
            step={10}
            value={price}
            onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
          />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="rounded border bg-muted px-2 py-1">${price[0]}</span>
            <span className="text-muted-foreground">to</span>
            <span className="rounded border bg-muted px-2 py-1">${price[1]}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Customer Rating">
        <div className="space-y-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === r ? 0 : r)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition ${
                minRating === r ? "bg-accent" : "hover:bg-muted"
              }`}
            >
              <Stars value={r} />
              <span className="text-muted-foreground">& above</span>
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Category">
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c.name} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={cats.includes(c.name)}
                onCheckedChange={() => setCats(toggle(cats, c.name))}
              />
              {c.name}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Brand">
        <Input
          value={brandQuery}
          onChange={(e) => setBrandQuery(e.target.value)}
          placeholder="Search brand"
          className="mb-2 h-8"
        />
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {filteredBrandList.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={brands.includes(b)}
                onCheckedChange={() => setBrands(toggle(brands, b))}
              />
              {b}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={availability.inStock}
              onCheckedChange={(v) => setAvailability((a) => ({ ...a, inStock: !!v }))}
            />
            In Stock
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={availability.outOfStock}
              onCheckedChange={(v) => setAvailability((a) => ({ ...a, outOfStock: !!v }))}
            />
            Out of Stock
          </label>
        </div>
      </FilterSection>

      <Button variant="outline" className="w-full" onClick={clearAll}>
        <X size={14} className="mr-1" /> Clear All
      </Button>
    </div>
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              {q ? `Results for "${q}"` : category ?? "All Products"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Filter size={14} className="mr-1" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-4">
                <h2 className="mb-4 text-lg font-bold">Filters</h2>
                {Filters}
              </SheetContent>
            </Sheet>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="sticky top-32 hidden h-[calc(100vh-9rem)] w-64 shrink-0 overflow-y-auto rounded-xl border bg-card p-4 lg:block">
            <h2 className="mb-4 text-lg font-bold">Filters</h2>
            {Filters}
          </aside>

          <div className="flex-1">
            {results.length === 0 ? (
              <div className="grid place-items-center rounded-xl border bg-card py-20 text-center">
                <div className="text-5xl">🔍</div>
                <p className="mt-3 text-lg font-semibold">No products found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/products">Reset</Link>
                </Button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
              >
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : results.map((p) => <ProductCard key={p.id} product={p} />)}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}
