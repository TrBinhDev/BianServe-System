export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  products: Product[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
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
  discountAmount: number | null;
  finalAmount: number | null;
  promotionCode: string | null;
  status: OrderStatus;
  cancelReason: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'PERCENT' | 'FIXED_AMOUNT';
  value: number;
  minOrderValue: number | null;
  endDate: string;
}

export interface StoredOrder {
  orderId: string;
  tableId: string;
  orderCode: string;
  createdAt: number;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}
