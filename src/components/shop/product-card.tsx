import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Stars } from "./stars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShopStore } from "@/store/shop-store";
import type { Product } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const inWishlist = useShopStore((s) => s.wishlist.includes(product.id));
  const addToCart = useShopStore((s) => s.addToCart);
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative flex flex-col rounded-xl border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition hover:scale-110"
      >
        <Heart
          size={18}
          className={cn(
            "transition-colors",
            inWishlist ? "fill-destructive text-destructive" : "text-muted-foreground",
          )}
        />
      </button>

      {discount > 0 && (
        <Badge className="absolute left-2 top-2 z-10 bg-destructive text-destructive-foreground">
          -{discount}%
        </Badge>
      )}

      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block overflow-hidden rounded-t-xl bg-muted"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </div>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-medium hover:text-primary"
        >
          {product.title}
        </Link>

        <div className="flex items-center gap-1.5 text-xs">
          <Stars value={product.rating} />
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-price">${product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        <div className="text-xs">
          {product.inStock ? (
            <span className="text-success">In Stock</span>
          ) : (
            <span className="text-destructive">Out of Stock</span>
          )}
        </div>

        <Button
          size="sm"
          variant="default"
          disabled={!product.inStock}
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
          className="mt-auto gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ShoppingCart size={14} />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border bg-card">
      <div className="shimmer aspect-square rounded-t-xl">
        <div className="shimmer-overlay" />
      </div>
      <div className="space-y-2 p-3">
        <div className="shimmer h-3 w-1/3 rounded">
          <div className="shimmer-overlay" />
        </div>
        <div className="shimmer h-4 w-full rounded">
          <div className="shimmer-overlay" />
        </div>
        <div className="shimmer h-4 w-2/3 rounded">
          <div className="shimmer-overlay" />
        </div>
        <div className="shimmer h-6 w-1/2 rounded">
          <div className="shimmer-overlay" />
        </div>
        <div className="shimmer h-8 w-full rounded">
          <div className="shimmer-overlay" />
        </div>
      </div>
    </div>
  );
}
