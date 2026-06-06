export type Category =
  | "Electronics"
  | "Fashion"
  | "Home & Kitchen"
  | "Books"
  | "Gaming"
  | "Beauty";

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  images: string[];
  description: string;
  specs: Record<string, string>;
  tags: ("trending" | "best-seller" | "new" | "recommended")[];
}

export const CATEGORIES: { name: Category; emoji: string; color: string }[] = [
  { name: "Electronics", emoji: "📱", color: "oklch(0.85 0.08 240)" },
  { name: "Fashion", emoji: "👗", color: "oklch(0.88 0.08 350)" },
  { name: "Home & Kitchen", emoji: "🍳", color: "oklch(0.88 0.08 80)" },
  { name: "Books", emoji: "📚", color: "oklch(0.85 0.08 150)" },
  { name: "Gaming", emoji: "🎮", color: "oklch(0.82 0.10 290)" },
  { name: "Beauty", emoji: "💄", color: "oklch(0.88 0.08 20)" },
];

const BRANDS_BY_CAT: Record<Category, string[]> = {
  Electronics: ["Sony", "Samsung", "Apple", "Bose", "JBL", "LG"],
  Fashion: ["Levi's", "Zara", "H&M", "Nike", "Adidas", "Puma"],
  "Home & Kitchen": ["Philips", "Prestige", "Bosch", "Cuisinart", "Tefal"],
  Books: ["Penguin", "HarperCollins", "Random House", "Bloomsbury"],
  Gaming: ["Sony", "Microsoft", "Nintendo", "Razer", "Logitech"],
  Beauty: ["L'Oréal", "Maybelline", "Nivea", "MAC", "Lakmé"],
};

const TITLES: Record<Category, string[]> = {
  Electronics: [
    "Wireless Noise-Cancelling Headphones",
    "Smart 4K OLED TV 55-inch",
    "Bluetooth Portable Speaker",
    "Smartphone Pro Max 256GB",
    "Wireless Earbuds with ANC",
    "Mirrorless Camera Body",
    "Smart Fitness Watch",
    "Mechanical Keyboard RGB",
  ],
  Fashion: [
    "Classic Denim Jacket",
    "Slim Fit Cotton T-Shirt",
    "Running Shoes Lightweight",
    "Leather Crossbody Bag",
    "Wool Blend Overcoat",
    "Casual Sneakers Low-Top",
    "Performance Joggers",
  ],
  "Home & Kitchen": [
    "Air Fryer 5L Digital",
    "Stainless Steel Cookware Set",
    "Robot Vacuum Cleaner",
    "Espresso Machine Auto",
    "Memory Foam Pillow Pack of 2",
    "LED Floor Lamp Modern",
  ],
  Books: [
    "Atomic Habits Hardcover",
    "The Psychology of Money",
    "Deep Work Paperback",
    "Sapiens: A Brief History",
    "The Midnight Library",
    "Project Hail Mary",
  ],
  Gaming: [
    "Next-Gen Gaming Console",
    "Wireless Gaming Controller",
    "Gaming Headset 7.1 Surround",
    "Gaming Mouse 16K DPI",
    "Curved Gaming Monitor 27\"",
    "Mechanical Gaming Keyboard",
  ],
  Beauty: [
    "Hydrating Serum Vitamin C",
    "Matte Lipstick Long-Lasting",
    "Sunscreen SPF 50+ PA++++",
    "Retinol Night Cream",
    "Hair Dryer Ionic 2200W",
    "Foundation Liquid Full Coverage",
  ],
};

// Deterministic pseudo-random
function seeded(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function placeholderImage(cat: Category, idx: number) {
  // Picsum seeded images — reliable, themed-ish
  const seed = `${cat.replace(/\W/g, "")}-${idx}`;
  return `https://picsum.photos/seed/${seed}/600/600`;
}

export const PRODUCTS: Product[] = (() => {
  const rng = seeded(42);
  const out: Product[] = [];
  let id = 1;
  for (const cat of CATEGORIES.map((c) => c.name)) {
    const titles = TITLES[cat];
    const brands = BRANDS_BY_CAT[cat];
    for (let i = 0; i < titles.length; i++) {
      const price = Math.round(20 + rng() * 980);
      const originalPrice = Math.round(price * (1 + rng() * 0.5 + 0.05));
      const rating = Math.round((3.4 + rng() * 1.6) * 10) / 10;
      const tags: Product["tags"] = [];
      if (rng() > 0.55) tags.push("trending");
      if (rng() > 0.6) tags.push("best-seller");
      if (rng() > 0.7) tags.push("new");
      if (rng() > 0.5) tags.push("recommended");
      const images = [
        placeholderImage(cat, i * 4 + 1),
        placeholderImage(cat, i * 4 + 2),
        placeholderImage(cat, i * 4 + 3),
        placeholderImage(cat, i * 4 + 4),
      ];
      out.push({
        id: String(id++),
        title: titles[i],
        brand: brands[Math.floor(rng() * brands.length)],
        category: cat,
        price,
        originalPrice,
        rating,
        reviewCount: Math.floor(20 + rng() * 4000),
        inStock: rng() > 0.12,
        images,
        description: `Experience premium quality with the ${titles[i]}. Crafted with attention to detail, this product delivers exceptional performance and lasting value. Perfect for everyday use, it combines modern design with reliable functionality.`,
        specs: {
          Brand: brands[Math.floor(rng() * brands.length)],
          Category: cat,
          Warranty: "1 Year Manufacturer Warranty",
          "Country of Origin": "Global",
          "Model Year": "2025",
          "Item Weight": `${(0.2 + rng() * 3).toFixed(2)} kg`,
        },
        tags: tags.length ? tags : ["recommended"],
      });
    }
  }
  return out;
})();

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function getByTag(tag: Product["tags"][number], limit = 8) {
  return PRODUCTS.filter((p) => p.tags.includes(tag)).slice(0, limit);
}

export const TRENDING_SEARCHES = [
  "wireless earbuds",
  "air fryer",
  "running shoes",
  "smart watch",
  "vitamin c serum",
  "gaming console",
];
