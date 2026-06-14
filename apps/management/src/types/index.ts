// ─── Auth ────────────────────────────────────────────────────
export type Role = "admin" | "staff";

export interface User {
  id: string;
  code: string;
  role: Role;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ─── Account ─────────────────────────────────────────────────
export interface Account {
  id: string;
  code: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

// ─── Table ───────────────────────────────────────────────────
export type TableStatus = "available" | "occupied";

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  qrCode: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Category ────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Product ─────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  category?: { id: string; name: string };
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ───────────────────────────────────────────────────
export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: { id: string; name: string; imageUrl: string | null };
  quantity: number;
  unitPrice: number;
  note: string | null;
}

export interface Order {
  id: string;
  orderCode: string;
  tableId: string;
  table: { id: string; tableNumber: string };
  totalAmount: number;
  status: OrderStatus;
  cancelReason: string | null;
  cancelledBy: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Promotion ───────────────────────────────────────────────
export type DiscountType = "PERCENT" | "FIXED_AMOUNT";

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  timeStart: string | null;
  timeEnd: string | null;
  dayOfWeek: number[];
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Feedback ────────────────────────────────────────────────
export interface Feedback {
  id: string;
  orderId: string;
  order: { orderCode: string };
  tableId: string;
  table: { tableNumber: string };
  rating: number;
  comment: string | null;
  createdAt: string;
}

// ─── Pagination ──────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── API Response ────────────────────────────────────────────
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}