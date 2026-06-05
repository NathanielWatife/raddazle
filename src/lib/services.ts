import api from "./api";

export interface Product {
  _id: string;
  name: string;
  brand?: string;
  description?: string;
  price: number;
  image?: string;
  images?: string[];
  category?: { _id: string; name: string } | string;
  stock?: number;
  countInStock?: number;
  isFeatured?: boolean;
  rating?: number;
  numReviews?: number;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  productCount?: number;
  updatedAt?: string;
}

export const productService = {
  getAll: async (params: Record<string, unknown> = {}) =>
    (await api.get("/products", { params })).data as {
      products: Product[];
      total?: number;
      page?: number;
      pages?: number;
    },
  getById: async (id: string) => (await api.get(`/products/${id}`)).data as { product: Product },
  getByCategory: async (categoryId: string) =>
    (await api.get(`/products/category/${categoryId}`)).data,
  create: async (payload: unknown) => (await api.post("/products", payload)).data,
  update: async (id: string, payload: unknown) => (await api.put(`/products/${id}`, payload)).data,
  delete: async (id: string) => (await api.delete(`/products/${id}`)).data,
  addReview: async (productId: string, payload: { rating: number; comment: string }) =>
    (await api.post(`/products/${productId}/reviews`, payload)).data,
  adjustInventory: async (
    productId: string,
    payload: { delta: number; reason: string; note?: string },
  ) => (await api.post(`/products/${productId}/inventory/adjust`, payload)).data,
  getInventoryHistory: async (productId: string, params: Record<string, unknown> = {}) =>
    (await api.get(`/products/${productId}/inventory/history`, { params })).data,
};

export const categoryService = {
  getAll: async (params: Record<string, unknown> = {}) =>
    (await api.get("/categories", { params })).data as {
      categories: Category[];
      page?: number;
      pages?: number;
      count?: number;
    },
  getById: async (id: string) => (await api.get(`/categories/${id}`)).data,
  create: async (payload: unknown) => (await api.post("/categories", payload)).data,
  update: async (id: string, payload: unknown) =>
    (await api.put(`/categories/${id}`, payload)).data,
  remove: async (id: string) => (await api.delete(`/categories/${id}`)).data,
};

export const orderService = {
  getAll: async (params: Record<string, unknown> = {}) =>
    (await api.get("/orders", { params })).data,
  getMyOrders: async () => (await api.get("/orders/myorders")).data,
  getById: async (id: string) => (await api.get(`/orders/${id}`)).data,
  create: async (orderData: unknown) => (await api.post("/orders", orderData)).data,
  cancel: async (id: string) => (await api.put(`/orders/${id}/cancel`)).data,
  deliver: async (id: string) => (await api.put(`/orders/${id}/deliver`)).data,
  updateStatus: async (id: string, status: string, note?: string) =>
    (await api.put(`/orders/${id}/status`, { status, note })).data,
  ship: async (id: string, payload: unknown) => (await api.put(`/orders/${id}/ship`, payload)).data,
};

export const paymentService = {
  getAll: async (params: Record<string, unknown> = {}) =>
    (await api.get("/payments", { params })).data,
  getById: async (id: string) => (await api.get(`/payments/${id}`)).data,
  updateStatus: async (id: string, status: string) =>
    (await api.put(`/payments/${id}`, { status })).data,
  refund: async (id: string) => (await api.post(`/payments/${id}/refund`)).data,
  initPaystack: async (orderId: string) =>
    (await api.post("/payments/paystack/init", { orderId })).data,
  verifyPaystack: async (reference: string, orderId: string) =>
    (await api.post("/payments/paystack/verify", { reference, orderId })).data,
  initFlutterwave: async (orderId: string) =>
    (await api.post("/payments/flutterwave/init", { orderId })).data,
  verifyFlutterwave: async (txRef: string) =>
    (await api.post("/payments/flutterwave/verify", { txRef })).data,
  getBankInfo: async () => (await api.get("/payments/bank-info")).data,
  submitBankTransfer: async (payload: unknown) =>
    (await api.post("/payments/bank-transfer/submit", payload)).data,
};

export const userService = {
  getProfile: async () => (await api.get("/users/profile")).data,
  updateProfile: async (payload: unknown) => (await api.put("/users/profile", payload)).data,
};

export const authService = {
  forgotPassword: async (email: string) =>
    (await api.post("/auth/forgot-password", { email })).data,
  resetPassword: async (payload: { email: string; token: string; newPassword: string }) =>
    (await api.post("/auth/reset-password", payload)).data,
  resendVerification: async (email: string) =>
    (await api.post("/auth/reset-verification", { email })).data,
};

export const contactService = {
  submit: async (payload: unknown) => (await api.post("/contact", payload)).data,
};

export const uploadService = {
  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append("image", file);
    const res = await api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data as { url?: string; imageUrl?: string; path?: string };
  },
};

export const adminService = {
  getDashboard: async () => (await api.get("/admin/dashboard")).data,
  getUsers: async (params: Record<string, unknown> = {}) =>
    (await api.get("/admin/users", { params })).data,
  updateUser: async (userId: string, userData: unknown) =>
    (await api.put(`/admin/users/${userId}`, userData)).data,
  deleteUser: async (userId: string) => (await api.delete(`/admin/users/${userId}`)).data,
  bulkAction: async (action: string, userIds: string[]) =>
    (await api.post("/admin/users/bulk", { action, userIds })).data,
  exportUsers: async () =>
    (await api.get("/admin/users/export", { responseType: "blob" })).data as Blob,
  getWebhookEvents: async (params: Record<string, unknown> = {}) =>
    (await api.get("/admin/webhook-events", { params })).data,
};
