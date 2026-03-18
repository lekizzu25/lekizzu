// ============================================================
// Platform-wide TypeScript types
// ============================================================

export type ShopType = 'baqala' | 'barber' | 'tailor' | 'food_truck' | 'kiosk' | 'cafe';
export type PlanType = 'mobile' | 'basic' | 'growth' | 'pro';
export type UserRole = 'owner' | 'employee' | 'admin';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit' | 'mixed';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type OrderStatus = 'received' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
export type SubStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

// ── Shop Modules (feature flags) ─────────────────────────
export const MODULE_KEYS = {
  POS: 'pos',
  INVENTORY: 'inventory',
  CUSTOMERS: 'customers',
  REPORTS: 'reports',
  CREDIT: 'credit',
  LOYALTY: 'loyalty',
  APPOINTMENTS: 'appointments',
  TAILOR_ORDERS: 'tailor_orders',
  WHATSAPP: 'whatsapp',
  SUPPLIERS: 'suppliers',
} as const;

export type ModuleKey = typeof MODULE_KEYS[keyof typeof MODULE_KEYS];

// Plan → modules mapping
export const PLAN_MODULES: Record<PlanType, ModuleKey[]> = {
  mobile: ['pos', 'customers', 'reports'],
  basic: ['pos', 'customers', 'reports', 'loyalty', 'appointments', 'tailor_orders'],
  growth: ['pos', 'inventory', 'customers', 'reports', 'credit', 'loyalty', 'whatsapp', 'appointments', 'tailor_orders'],
  pro: ['pos', 'inventory', 'customers', 'reports', 'credit', 'loyalty', 'whatsapp', 'appointments', 'tailor_orders', 'suppliers'],
};

// ── Database types ────────────────────────────────────────
export interface Shop {
  id: string;
  name: string;
  type: ShopType;
  plan: PlanType;
  enabled_modules: ModuleKey[];
  phone?: string;
  address?: string;
  city?: string;
  logo_url?: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  trial_ends_at?: string;
  owner_id?: string;
  created_at: string;
}

export interface User {
  id: string;
  shop_id: string;
  auth_id?: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  loyalty_points: number;
  credit_balance: number;
  credit_limit: number;
  total_spent: number;
  visit_count: number;
  last_visit_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id?: string;
  name: string;
  name_ar?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  unit: string;
  image_url?: string;
  is_active: boolean;
  track_inventory: boolean;
  // Joined
  inventory?: { quantity: number; low_stock_threshold: number };
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id?: string;
  product_name: string;
  product_barcode?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  product?: Product;
}

export interface Sale {
  id: string;
  shop_id: string;
  customer_id?: string;
  employee_id?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: PaymentMethod;
  points_earned: number;
  points_redeemed: number;
  credit_used: number;
  notes?: string;
  receipt_number: string;
  is_void: boolean;
  created_at: string;
  // Joined
  customer?: Pick<Customer, 'id' | 'name' | 'phone'>;
  employee?: Pick<User, 'id' | 'name'>;
  items?: SaleItem[];
}

export interface Appointment {
  id: string;
  shop_id: string;
  customer_id?: string;
  employee_id?: string;
  service_id?: string;
  customer_name?: string;
  customer_phone?: string;
  scheduled_at: string;
  duration_mins: number;
  status: AppointmentStatus;
  price?: number;
  commission_pct?: number;
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
}

export interface TailorOrder {
  id: string;
  shop_id: string;
  customer_id?: string;
  employee_id?: string;
  order_number: string;
  description: string;
  garment_type?: string;
  measurements?: Record<string, number>;
  fabric_details?: string;
  special_notes?: string;
  price?: number;
  deposit_paid: number;
  due_date?: string;
  status: OrderStatus;
  image_urls: string[];
  reminder_sent: boolean;
  created_at: string;
}

// ── POS Cart types ────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  customer?: Customer | null;
  payment_method: PaymentMethod;
  discount_amount: number;
  points_to_redeem: number;
  notes: string;
}

// ── API response wrapper ──────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Dashboard stats ───────────────────────────────────────
export interface DashboardStats {
  today: {
    total_revenue: number;
    total_transactions: number;
    average_basket: number;
    by_payment_method: Record<string, number>;
  };
  monthly_revenue: number;
  total_customers: number;
  low_stock_count: number;
  revenue_chart: Array<{ date: string; revenue: number; transactions: number }>;
}
