import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { productService } from "@/lib/services";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { formatCurrency } from "@/lib/currency";
import { getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shop/ProductCard";
import { Separator } from "@/components/ui/separator";

const PLACEHOLDER = "/img/product-placeholder.jpg";

export const Route = createFileRoute("/shop/$id")({
  head: () => ({
    meta: [
      { title: "Product · Raddazle" },
      {
        name: "description",
        content: "Discover authentic luxury fragrances and essentials at Raddazle.",
      },
      { property: "og:title", content: "Product · Raddazle" },
      { property: "og:type", content: "product" },
    ],
  }),
  component: ProductDetailPage,
});

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ProductDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToCart = useCartStore((s) => s.addToCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [quantity, setQuantity] = useState(1);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [adding, setAdding] = useState(false);

  type ProductDetail = {
    _id: string;
    name: string;
    description?: string;
    brand?: string;
    image?: string;
    price: number;
    rating?: number;
    stock?: number;
    countInStock?: number;
    category?: { _id: string; name: string };
    reviews?: {
      _id?: string;
      user?: { _id?: string };
      name?: string;
      rating: number;
      comment: string;
      createdAt?: string;
    }[];
    createdAt?: string;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id),
  });

  const product = data?.product as ProductDetail | undefined;

  const { data: relatedData } = useQuery({
    queryKey: ["related", product?.category?._id, product?._id],
    queryFn: () => productService.getAll({ category: product?.category?._id, pageSize: 4 }),
    enabled: !!product?.category?._id,
  });

  const related = (relatedData?.products ?? []).filter((p) => p._id !== product?._id).slice(0, 4);
  const stock = product?.countInStock ?? product?.stock ?? 0;

  const handleAdd = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart.");
      navigate({ to: "/login" });
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    try {
      await productService.addReview(product._id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      toast.success("Review submitted");
      setReviewForm({ rating: 5, comment: "" });
      await queryClient.invalidateQueries({ queryKey: ["product", id] });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Unable to submit review";
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          It may have been removed or is no longer available.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const reviews = product.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : (product.rating ?? 0);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 pb-20 pt-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-3xl border border-border bg-card"
          >
            <div className="relative aspect-square bg-muted">
              <img
                src={imgSrc ?? getImageUrl(product.image)}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={() => setImgSrc(PLACEHOLDER)}
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {product.category?.name && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {product.category.name}
              </p>
            )}
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            {product.brand && (
              <p className="mt-1 text-sm text-muted-foreground">by {product.brand}</p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <StarRow value={avgRating} />
              <span className="text-sm text-muted-foreground">
                {reviews.length > 0
                  ? `${avgRating.toFixed(1)} (${reviews.length} reviews)`
                  : "No reviews yet"}
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-foreground">
                {formatCurrency(product.price)}
              </span>
              {stock > 0 ? (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  In stock
                </span>
              ) : (
                <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                  Out of stock
                </span>
              )}
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {stock > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid h-11 w-11 place-items-center rounded-l-full transition hover:bg-secondary"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="grid h-11 w-11 place-items-center rounded-r-full transition hover:bg-secondary"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button onClick={handleAdd} disabled={adding} size="lg" className="rounded-full">
                  <ShoppingBag className="h-4 w-4" />
                  {adding ? "Adding…" : "Add to Cart"}
                </Button>
              </div>
            )}

            <Separator className="my-8" />

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  label: "100% Authentic",
                  note: "Sourced from verified suppliers",
                },
                {
                  icon: Truck,
                  label: "Fast delivery",
                  note: "Ships nationwide in 2–4 days",
                },
                {
                  icon: RotateCcw,
                  label: "Easy returns",
                  note: "7-day hassle-free returns",
                },
              ].map(({ icon: Icon, label, note }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="mt-20 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Customer reviews</h2>
            <p className="text-sm text-muted-foreground">What others are saying.</p>
            <div className="mt-6 space-y-5">
              {reviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No reviews yet. Be the first to share your thoughts.
                  </p>
                </div>
              ) : (
                reviews.map((r, i) => (
                  <div
                    key={r._id ?? r.user?._id ?? i}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{r.name ?? "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <StarRow value={r.rating} />
                    </div>
                    <p className="mt-3 text-sm text-foreground/90">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground">Write a review</h3>
              {!isAuthenticated ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to share your experience.
                </p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Select
                      value={String(reviewForm.rating)}
                      onValueChange={(v) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          rating: Number(v),
                        }))
                      }
                    >
                      <SelectTrigger id="rating" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((v) => (
                          <SelectItem key={v} value={String(v)}>
                            {v} —{" "}
                            {v === 5
                              ? "Excellent"
                              : v === 4
                                ? "Good"
                                : v === 3
                                  ? "Average"
                                  : v === 2
                                    ? "Fair"
                                    : "Poor"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      rows={4}
                      required
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <Button type="submit" disabled={submittingReview} className="w-full rounded-full">
                    {submittingReview ? "Submitting…" : "Submit review"}
                  </Button>
                </form>
              )}
            </div>
          </aside>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold text-foreground">You may also like</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
