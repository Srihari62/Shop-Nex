import { create } from "zustand";

import { persist } from "zustand/middleware";
import { sendKafkaEvent } from "../actions/track-user";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
  discount_details?: any[];
  regular_price?: number;
  category?: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  decrementQuantity: (
    id: string,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  removeFromWishlist: (
    id: string,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  applyCoupon: (coupon: any) => void;
  removeCoupon: (code: string) => void;
  appliedCoupons: any[];
  clearCart: () => void;
  resetStore: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      //add to cart
      addToCart: async (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart?.find((item) => item?.id === product?.id);

          if (existing) {
            return {
              cart: state?.cart?.map((item) =>
                item?.id === product?.id
                  ? {
                      ...item,
                      quantity:
                        (item?.quantity ?? 0) + (product?.quantity ?? 1),
                    }
                  : item,
              ),
            };
          }
          return {
            cart: [
              ...state?.cart,
              { ...product, quantity: product?.quantity ?? 1 },
            ],
          };
        });
        // send kafka event
        sendKafkaEvent({
          userId: user?.id || "anonymous",
          productId: product?.id,
          shopId: product?.shopId,
          action: "add_to_cart",
          device: deviceInfo || "Unknown",
          country: location?.country || "Unknown",
          city: location?.city || "Unknown",
        });
      },

      removeFromCart: async (id, user, location, deviceInfo) => {
        const removedProduct = get().cart?.find((item) => item?.id === id);
        set((state) => ({
          cart: state?.cart?.filter((item) => item?.id !== id),
        }));
        // send kafka event
        sendKafkaEvent({
          userId: user?.id || "anonymous",
          productId: removedProduct?.id,
          shopId: removedProduct?.shopId,
          action: "remove_from_cart",
          device: deviceInfo || "Unknown",
          country: location?.country || "Unknown",
          city: location?.city || "Unknown",
        });
      },

      decrementQuantity: async (id, user, location, deviceInfo) => {
        set((state) => {
          const item = state.cart?.find((i) => i?.id === id);
          if (item && (item.quantity ?? 1) > 1) {
            return {
              cart: state?.cart?.map((i) =>
                i?.id === id ? { ...i, quantity: (i.quantity ?? 1) - 1 } : i,
              ),
            };
          }
          return { cart: state?.cart?.filter((i) => i?.id !== id) };
        });
      },

      addToWishlist: async (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.wishlist?.find(
            (item) => item?.id === product?.id,
          );
          if (existing) {
            return state;
          }
          return { wishlist: [...state?.wishlist, product] };
        });
        // send kafka event
        sendKafkaEvent({
          userId: user?.id || "anonymous",
          productId: product?.id,
          shopId: product?.shopId,
          action: "add_to_wishlist",
          device: deviceInfo || "Unknown",
          country: location?.country || "Unknown",
          city: location?.city || "Unknown",
        });
      },

      removeFromWishlist: async (id, user, location, deviceInfo) => {
        const removedProduct = get().wishlist?.find((item) => item?.id === id);
        set((state) => ({
          wishlist: state?.wishlist?.filter((item) => item?.id !== id),
        }));
        // send kafka event
        sendKafkaEvent({
          userId: user?.id || "anonymous",
          productId: removedProduct?.id,
          shopId: removedProduct?.shopId,
          action: "remove_from_wishlist",
          device: deviceInfo || "Unknown",
          country: location?.country || "Unknown",
          city: location?.city || "Unknown",
        });
      },
      appliedCoupons: [],
      applyCoupon: (coupon) => {
        set((state) => ({
          appliedCoupons: state.appliedCoupons.some(
            (c) => c.discountCode === coupon.discountCode,
          )
            ? state.appliedCoupons
            : [...state.appliedCoupons, coupon],
        }));
      },
      removeCoupon: (code) => {
        set((state) => ({
          appliedCoupons: state.appliedCoupons.filter((c) => c.discountCode !== code),
        }));
      },
      clearCart: () => set({ cart: [], appliedCoupons: [] }),
      resetStore: () => set({ cart: [], wishlist: [], appliedCoupons: [] }),
    }),
    { name: "store-storage" },
  ),
);
