import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api';
import { categories as defaultCategories } from "@/data/products";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/site/ProductCard";

const search = z.object({
  category: z.enum(["objects", "paper", "textiles", "scent", "edibles"]).optional(),
  sort: z.enum(["new", "low", "high", "rating"]).optional(),
}).optional();

export const Route = createFileRoute("/shop/")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop — SOUVENIR" },
      { name: "description", content: "Browse the full collection — editioned objects, paper, textiles, scent, and edibles from around the world." },
    ],
  }),
  component: Shop,
});

const sortOptions = [
  { v: "new", l: "Newest" },
  { v: "low", l: "Price: low to high" },
  { v: "high", l: "Price: high to low" },
  { v: "rating", l: "Most loved" },
] as const;

function Shop() {
  const { category, sort } = Route.useSearch() ?? {};
  const [maxPrice, setMaxPrice] = useState(200);

  const { data: dbProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const categories = defaultCategories; // Can also be fetched from API

  const filtered = useMemo(() => {
    let list = [...dbProducts];
    if (category) list = list.filter((p) => p.category === category || p.category?.name === category);
    list = list.filter((p) => p.price <= maxPrice);
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    else if (sort === "high") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [dbProducts, category, sort, maxPrice]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
      {/* Header */}
      <header className="py-16 lg:py-24 border-b hairline">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">The collection</p>
        <h1 className="mt-4 font-serif text-6xl lg:text-8xl leading-[0.9]">
          {category ? categories.find((c) => c.slug === category)?.name : <>All <em className="italic">objects</em>.</>}
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          {filtered.length} small things, each made by hand, each with a place of origin.
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-10 py-10">
        {/* Filters */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-28 space-y-10">
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.25} /> Category
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/shop" search={{}} className={`flex justify-between hover:opacity-60 ${!category ? "font-medium" : ""}`}>
                    <span>All</span><span className="text-muted-foreground tabular-nums">{dbProducts.length}</span>
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link to="/shop" search={{ category: c.slug }} className={`flex justify-between hover:opacity-60 ${category === c.slug ? "font-medium" : ""}`}>
                      <span>{c.name}</span><span className="text-muted-foreground tabular-nums">{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Price</h3>
              <input type="range" min={20} max={250} step={10} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-foreground" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2 tabular-nums">
                <span>€20</span><span>Up to €{maxPrice}</span>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Origin</h3>
              <div className="flex flex-wrap gap-2">
                {["Kyoto", "Lisbon", "Paris", "Oaxaca", "Florence", "Amalfi", "Copenhagen", "Marrakech"].map((o) => (
                  <button key={o} className="text-xs px-3 py-1.5 border hairline hover:bg-secondary">{o}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between border-b hairline pb-4 mb-10">
            <p className="text-sm text-muted-foreground tabular-nums">{filtered.length} objects</p>
            <div className="relative">
              <select
                value={sort ?? "new"}
                onChange={(e) => {
                  const v = e.target.value as typeof sortOptions[number]["v"];
                  window.location.search = new URLSearchParams({ ...(category && { category }), sort: v }).toString();
                }}
                className="appearance-none bg-transparent text-[11px] uppercase tracking-[0.25em] pr-6 cursor-pointer outline-none"
              >
                {sortOptions.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <ChevronDown className="h-3 w-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
            </div>
          </div>

          {isLoading ? (
            <div className="py-32 text-center text-muted-foreground animate-pulse">Loading collection...</div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="font-serif text-3xl italic">Nothing in this corner.</p>
              <p className="mt-3 text-muted-foreground text-sm">Try widening the price or another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
              {filtered.map((p, i) => <ProductCard key={p.id || i} product={p} index={i} />)}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-20 flex items-center justify-center gap-2 text-sm">
            {[1, 2, 3].map((n) => (
              <button key={n} className={`h-9 w-9 ${n === 1 ? "bg-foreground text-background" : "hover:bg-secondary"}`}>{n}</button>
            ))}
            <span className="px-2 text-muted-foreground">…</span>
            <button className="h-9 px-3 hover:bg-secondary text-[11px] uppercase tracking-[0.2em]">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
