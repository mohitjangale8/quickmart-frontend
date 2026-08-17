export type Role = 'BUYER' | 'SELLER';

export interface AuthResponse {
  token?: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Product {
  id: number;
  sellerId: number;
  name: string;
  brand?: string;
  description?: string;
  price: number;
  stockQty: number;
  category?: string;
  imageUrl?: string;
}

export interface ProductRequest {
  name: string;
  brand?: string;
  description?: string;
  price: number;
  stockQty: number;
  category?: string;
  imageUrl?: string;
}

export interface CartItemResponse {
  id: number;
  productId: number;
  sellerId: number;
  name: string;
  brand?: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  maxStock: number;
}

export interface CartResponse {
  buyerId: number;
  items: CartItemResponse[];
  subtotal: number;
  totalCount: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'SHIPPED';

export interface OrderItem {
  id: number;
  productId: number;
  sellerId: number;
  productName: string;
  brand?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  buyerId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderCreateRequest {
  items: { productId: number; quantity: number }[];
}

export interface CheckoutResponse {
  paymentId: number;
  orderId: number;
  amount: number;
  gatewayTxnId: string;
  redirectUrl: string;
}

export interface PaymentResponse {
  paymentId: number;
  orderId: number;
  amount: number;
  status: string;
  gatewayTxnId: string;
}
