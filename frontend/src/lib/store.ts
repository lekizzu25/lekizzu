import { create } from 'zustand';
import { Cart, CartItem, Customer, PaymentMethod, Product } from '../types';

interface CartStore {
  cart: Cart;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setDiscount: (amount: number) => void;
  setPointsToRedeem: (points: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  // Computed
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const emptyCart = (): Cart => ({
  items: [],
  customer: null,
  payment_method: 'cash',
  discount_amount: 0,
  points_to_redeem: 0,
  notes: '',
});

export const useCartStore = create<CartStore>((set, get) => ({
  cart: emptyCart(),

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.cart.items.find((i) => i.product.id === product.id);

      if (existing) {
        return {
          cart: {
            ...state.cart,
            items: state.cart.items.map((i) =>
              i.product.id === product.id
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    subtotal: (i.quantity + quantity) * i.unit_price - i.discount,
                  }
                : i,
            ),
          },
        };
      }

      const newItem: CartItem = {
        product,
        quantity,
        unit_price: product.price,
        discount: 0,
        subtotal: product.price * quantity,
      };

      return {
        cart: { ...state.cart, items: [...state.cart.items, newItem] },
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      cart: {
        ...state.cart,
        items: state.cart.items.filter((i) => i.product.id !== productId),
      },
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      cart: {
        ...state.cart,
        items: state.cart.items.map((i) =>
          i.product.id === productId
            ? { ...i, quantity, subtotal: quantity * i.unit_price - i.discount }
            : i,
        ),
      },
    }));
  },

  setCustomer: (customer) => {
    set((state) => ({ cart: { ...state.cart, customer } }));
  },

  setPaymentMethod: (payment_method) => {
    set((state) => ({ cart: { ...state.cart, payment_method } }));
  },

  setDiscount: (discount_amount) => {
    set((state) => ({ cart: { ...state.cart, discount_amount } }));
  },

  setPointsToRedeem: (points_to_redeem) => {
    set((state) => ({ cart: { ...state.cart, points_to_redeem } }));
  },

  setNotes: (notes) => {
    set((state) => ({ cart: { ...state.cart, notes } }));
  },

  clearCart: () => {
    set({ cart: emptyCart() });
  },

  getSubtotal: () => {
    return get().cart.items.reduce((sum, i) => sum + i.subtotal, 0);
  },

  getTotal: () => {
    const { cart } = get();
    const subtotal = get().getSubtotal();
    const pointsDiscount = cart.points_to_redeem / 10; // 10 points = 1 SAR
    return Math.max(0, subtotal - cart.discount_amount - pointsDiscount);
  },

  getItemCount: () => {
    return get().cart.items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

// ── Auth/Shop store ───────────────────────────────────────
import { Shop, User } from '../types';

interface AppStore {
  shop: Shop | null;
  user: User | null;
  setShop: (shop: Shop) => void;
  setUser: (user: User) => void;
  hasModule: (module: string) => boolean;
}

export const useAppStore = create<AppStore>((set, get) => ({
  shop: null,
  user: null,

  setShop: (shop) => set({ shop }),
  setUser: (user) => set({ user }),

  hasModule: (module) => {
    const { shop } = get();
    return shop?.enabled_modules?.includes(module as any) ?? false;
  },
}));
