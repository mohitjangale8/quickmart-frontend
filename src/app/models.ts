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
  expectedRole?: Role;
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
  averageRating?: number;
  reviewCount?: number;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export interface CouponValidateRequest {
  code: string;
  orderTotal: number;
}

export interface CouponValidateResponse {
  code: string;
  discountAmount: number;
  payableAmount: number;
  message: string;
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

export type TrackingStatus =
  | 'ORDERED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export type ReturnStatus =
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'REFUND_INITIATED'
  | 'REFUNDED';

export interface Address {
  id: number;
  userId: number;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface AddressRequest {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

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
  couponCode?: string | null;
  discountAmount?: number;
  createdAt: string;
  trackingStatus?: TrackingStatus | null;
  returnStatus?: ReturnStatus | null;
  address?: Address | null;
  items: OrderItem[];
}

export interface TrackingEventResponse {
  id: number;
  type: 'DELIVERY' | 'RETURN';
  stage: string;
  note: string;
  createdAt: string;
}

export interface TrackingResponse {
  orderId: number;
  trackingStatus: TrackingStatus | null;
  returnStatus: ReturnStatus | null;
  events: TrackingEventResponse[];
}

export interface OrderCreateRequest {
  items: { productId: number; quantity: number }[];
  addressId: number;
  couponCode?: string;
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

export interface RazorpayOrderResponse {
  paymentId: number;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

export interface RazorpayVerifyRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
