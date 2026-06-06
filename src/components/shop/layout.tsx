import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Heart,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  User,
  X,
  Home as HomeIcon,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useShopStore, cartCount } from "@/store/shop-store";
import { useTheme } from "@/hooks/use-theme";
import { CATEGORIES, PRODUCTS, TRENDING_SEARCHES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

function useDebounced<T>(v: T, ms = 200) {
  const [d, setD] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}

export function Navbar() {
  const { theme, toggle } = useTheme();
  const count = useShopStore(cartCount);
  const wishlistCount = useShopStore((s) => s.wishlist.length);
  const recents = useShopStore((s) => s.recentSearches);
  const addRecent = useShopStore((s) => s.addRecentSearch);
  const clearRecents = useShopStore((s) => s.clearRecentSearches);

  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const dq = useDebounced(q, 150);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!dq) return [];
    const lower = dq.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower),
    ).slice(0, 6);
  }, [dq]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function submitSearch(value: string) {
    const v = value.trim();
    if (!v) return;
    addRecent(v);
    setFocused(false);
    setQ("");
    navigate({ to: "/products", search: { q: v } });
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-nav text-nav-foreground">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-3 sm:px-4">
          <MobileMenu />
          <Link to="/" className="flex items-center gap-1 text-lg font-bold tracking-tight">
            <span className="text-primary">shop</span>
            <span>verse</span>
          </Link>

          <div className="relative hidden flex-1 md:block" ref={boxRef}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(q);
              }}
              className="flex overflow-hidden rounded-md"
            >
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                placeholder="Search Shopverse"
                className="rounded-none border-0 bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Search size={18} />
              </Button>
            </form>
            <AnimatePresence>
              {focused && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-xl"
                >
                  {dq && suggestions.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">
                      No results for "{dq}"
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <ul className="max-h-72 overflow-y-auto">
                      {suggestions.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => submitSearch(p.title)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                          >
                            <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{p.title}</div>
                              <div className="text-xs text-muted-foreground">
                                in {p.category}
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!dq && (
                    <div className="p-3">
                      {recents.length > 0 && (
                        <div className="mb-3">
                          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            Recent
                            <button
                              type="button"
                              onClick={clearRecents}
                              className="text-xs font-normal hover:text-foreground"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {recents.map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => submitSearch(r)}
                                className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-accent"
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">
                        Trending
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_SEARCHES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => submitSearch(t)}
                            className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-accent"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="hidden h-9 w-9 place-items-center rounded hover:bg-nav-sub sm:grid"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/wishlist"
            className="relative hidden h-9 w-9 place-items-center rounded hover:bg-nav-sub sm:grid"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center bg-primary px-1 text-[10px] text-primary-foreground">
                {wishlistCount}
              </Badge>
            )}
          </Link>

          <button
            className="relative hidden h-9 w-9 place-items-center rounded hover:bg-nav-sub sm:grid"
            aria-label="Account"
          >
            <User size={20} />
          </button>

          <Link
            to="/cart"
            className="relative grid h-9 w-9 place-items-center rounded hover:bg-nav-sub"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </Badge>
            )}
          </Link>
        </div>

        {/* Mobile search */}
        <div className="px-3 pb-3 md:hidden" ref={boxRef}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(q);
            }}
            className="flex overflow-hidden rounded-md"
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search Shopverse"
              className="rounded-none border-0 bg-background text-foreground"
            />
            <Button
              type="submit"
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Sub-nav categories */}
      <div className="hidden bg-nav-sub text-nav-foreground md:block">
        <nav className="mx-auto flex max-w-screen-2xl items-center gap-1 overflow-x-auto px-3 py-1.5 text-sm">
          <Link
            to="/products"
            className="rounded px-2 py-1 hover:bg-white/10"
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/products"
              search={{ category: c.name }}
              className="whitespace-nowrap rounded px-2 py-1 hover:bg-white/10"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="grid h-9 w-9 place-items-center rounded hover:bg-nav-sub md:hidden" aria-label="Menu">
          <Menu size={20} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="bg-nav p-4 text-nav-foreground">
          <div className="flex items-center gap-2 font-semibold">
            <User size={20} /> Hello, sign in
          </div>
        </div>
        <div className="p-2">
          <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
            Shop by Category
          </div>
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/products"
              search={{ category: c.name }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded px-2 py-2 hover:bg-muted"
            >
              <span className="text-xl">{c.emoji}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const count = useShopStore(cartCount);
  const wishlistCount = useShopStore((s) => s.wishlist.length);
  const items = [
    { to: "/", icon: HomeIcon, label: "Home" },
    { to: "/products", icon: LayoutGrid, label: "Shop" },
    { to: "/wishlist", icon: Heart, label: "Wishlist", badge: wishlistCount },
    { to: "/cart", icon: ShoppingCart, label: "Cart", badge: count },
  ] as const;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t bg-background/95 backdrop-blur md:hidden">
      {items.map((it) => {
        const active = path === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "relative flex flex-col items-center gap-0.5 py-2 text-xs",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <it.icon size={20} />
            {it.label}
            {"badge" in it && it.badge ? (
              <Badge className="absolute right-[28%] top-1 h-4 min-w-4 justify-center bg-primary px-1 text-[10px] text-primary-foreground">
                {it.badge}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-nav text-nav-foreground">
      <div className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="mb-2 font-bold">
            <span className="text-primary">shop</span>verse
          </div>
          <p className="text-sm text-nav-foreground/70">
            Your modern shopping destination for everything you love.
          </p>
        </div>
        {[
          { h: "Get to Know Us", l: ["About", "Careers", "Press"] },
          { h: "Make Money", l: ["Sell", "Affiliate", "Advertise"] },
          { h: "Let Us Help You", l: ["Shipping", "Returns", "Help Center"] },
        ].map((col) => (
          <div key={col.h}>
            <div className="mb-3 font-semibold">{col.h}</div>
            <ul className="space-y-1.5 text-sm text-nav-foreground/70">
              {col.l.map((x) => (
                <li key={x}>
                  <a href="#" className="hover:text-primary">
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-nav-foreground/60">
        © 2026 Shopverse. Crafted with care.
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
