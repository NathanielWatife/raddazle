export interface Product {
  id: string;
  slug: string;
  name: string;
  origin: string;
  category: "objects" | "paper" | "textiles" | "scent" | "edibles";
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  badge?: "New" | "Edition" | "Last few" | "Restock";
  description: string;
  details: string[];
  images: string[];
  inStock: boolean;
}

export interface CartItem { product: Product; quantity: number; }
