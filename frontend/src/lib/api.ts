import axios, { AxiosError } from 'axios';
import { createBrowserClient } from '@supabase/ssr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// ── Axios instance ────────────────────────────────────────
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// ── Auth interceptor: attach Bearer token on every request ─
api.interceptors.request.use(async (config) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// ── Response interceptor: unwrap { success, data } ───────
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message: string }>) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  },
);

// ── Typed API methods ─────────────────────────────────────
export const posApi = {
  getSales: (params?: { limit?: number; offset?: number }) =>
    api.get('/pos/sales', { params }),
  getSale: (id: string) => api.get(`/pos/sales/${id}`),
  createSale: (body: unknown) => api.post('/pos/sales', body),
  voidSale: (id: string, reason: string) => api.post(`/pos/sales/${id}/void`, { reason }),
  searchProducts: (q: string) => api.get('/pos/products/search', { params: { q } }),
  getByBarcode: (barcode: string) => api.get(`/pos/products/barcode/${barcode}`),
};

export const inventoryApi = {
  list: (params?: unknown) => api.get('/inventory/products', { params }),
  create: (body: unknown) => api.post('/inventory/products', body),
  update: (id: string, body: unknown) => api.patch(`/inventory/products/${id}`, body),
  adjustStock: (id: string, body: unknown) => api.post(`/inventory/products/${id}/adjust`, body),
  getLowStock: () => api.get('/inventory/low-stock'),
};

export const customersApi = {
  list: (params?: unknown) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (body: unknown) => api.post('/customers', body),
  update: (id: string, body: unknown) => api.patch(`/customers/${id}`, body),
  history: (id: string) => api.get(`/customers/${id}/history`),
  creditHistory: (id: string) => api.get(`/customers/${id}/credit`),
  repayment: (id: string, body: unknown) => api.post(`/customers/${id}/repayment`, body),
};

export const appointmentsApi = {
  list: (params?: unknown) => api.get('/appointments', { params }),
  create: (body: unknown) => api.post('/appointments', body),
  update: (id: string, body: unknown) => api.patch(`/appointments/${id}`, body),
  updateStatus: (id: string, status: string) =>
    api.patch(`/appointments/${id}/status`, { status }),
};

export const tailorApi = {
  list: (params?: unknown) => api.get('/tailor-orders', { params }),
  get: (id: string) => api.get(`/tailor-orders/${id}`),
  create: (body: unknown) => api.post('/tailor-orders', body),
  update: (id: string, body: unknown) => api.patch(`/tailor-orders/${id}`, body),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tailor-orders/${id}/status`, { status }),
};

export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard'),
  daily: (date?: string) => api.get('/reports/daily', { params: { date } }),
  revenue: (start: string, end: string) =>
    api.get('/reports/revenue', { params: { start, end } }),
  topCustomers: () => api.get('/reports/top-customers'),
  lowStock: () => api.get('/reports/low-stock'),
};

export const shopsApi = {
  getMyShop: () => api.get('/shops/me'),
  update: (body: unknown) => api.patch('/shops/me', body),
};
