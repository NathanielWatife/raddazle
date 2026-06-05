import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { productService, categoryService, type Category } from "@/lib/services";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { ProductCard } from "@/components/shop/ProductCard";
import { formatCurrency } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["name", "price", "-price", "-createdAt"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop · Raddazle" },
      {
        name: "description",
        content: "Browse Raddazle's full collection of luxury fragrances and daily essentials.",
      },
      { property: "og:title", content: "Shop · Raddazle" },
      {
        property: "og:description",
        content: "Authentic luxury scents and essentials, delivered fast.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://id-preview--89866652-cda9-419f-93b6-fb9fe880600b.lovable.app/shop",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const addToCart = useCartStore((s) => s.addToCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [localSearch, setLocalSearch] = useState(search.search ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== (search.search ?? "")) {
        navigate({
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            search: localSearch || undefined,
          }),
        });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () =>
      productService.getAll({
        search: search.search,
        category: search.category,
        minPrice: search.minPrice,
        maxPrice: search.maxPrice,
        sort: search.sort ?? "name",
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll({ includeCounts: true }),
  });

  const products = useMemo(() => productsData?.products ?? [], [productsData]);
  const categories = useMemo(
    () =>
      (categoriesData?.categories ?? []) as (Category & {
        productCount?: number;
      })[],
    [categoriesData],
  );

  const maxPrice = search.maxPrice ?? 500;

  const updateFilter = (key: string, value: string | number | undefined) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        [key]: value || undefined,
      }),
    });
  };

  const clearFilters = () => {
    setLocalSearch("");
    navigate({ search: {} });
  };

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (search.search) list.push({ key: "search", label: `"${search.search}"` });
    if (search.category) {
      const c = categories.find((x) => x._id === search.category);
      if (c) list.push({ key: "category", label: c.name });
    }
    if (search.maxPrice)
      list.push({
        key: "maxPrice",
        label: `Under ${formatCurrency(search.maxPrice)}`,
      });
    return list;
  }, [search, categories]);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart.");
      navigate({ to: "/login" });
      return;
    }
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart");
    }
  };

  const FiltersPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
          Categories
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateFilter("category", undefined)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${!search.category ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"}`}
          >
            <span>All products</span>
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat._id}
              onClick={() => updateFilter("category", cat._id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${search.category === cat._id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <span>{cat.name}</span>
              {typeof cat.productCount === "number" && (
                <span className="text-xs opacity-70">{cat.productCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
          Max price
        </h3>
        <Slider
          value={[maxPrice]}
          min={0}
          max={500}
          step={10}
          onValueChange={(v) => updateFilter("maxPrice", v[0])}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(maxPrice)}</span>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-hero">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              The Collection
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Signature grooming &amp; hygiene essentials
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Hand-picked luxury fragrances and daily care, sourced authentic and delivered to your
              door.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pb-6">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products, brands…"
              className="h-11 rounded-full pl-10"
            />
          </div>

          <Select
            value={search.sort ?? "name"}
            onValueChange={(v) => updateFilter("sort", v === "name" ? undefined : v)}
          >
            <SelectTrigger className="h-11 w-[180px] rounded-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="-price">Price: High to Low</SelectItem>
              <SelectItem value="-createdAt">Newest</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 rounded-full lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px]">
              <SheetHeader>
                <SheetTitle className="font-display">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{FiltersPanel}</div>
            </SheetContent>
          </Sheet>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  if (f.key === "search") setLocalSearch("");
                  updateFilter(f.key, undefined);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground transition hover:bg-foreground hover:text-background"
              >
                {f.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">{FiltersPanel}</div>
          </aside>

          <div>
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                <p className="font-display text-lg font-semibold text-foreground">
                  No products match your filters
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try clearing filters or adjusting your search.
                </p>
                <Button onClick={clearFilters} variant="outline" className="mt-4 rounded-full">
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    index={i}
                    onAddToCart={() => handleAddToCart(p._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
