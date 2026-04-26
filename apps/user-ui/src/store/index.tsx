import { create } from "zustand";

import { persist } from "zustand/middleware";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: string,
    deviceInfo: string,
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: string,
    deviceInfo: string,
  ) => void;
  decrementQuantity: (
    id: string,
    user: any,
    location: string,
    deviceInfo: string,
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: string,
    deviceInfo: string,
  ) => void;
  removeFromWishlist: (
    id: string,
    user: any,
    location: string,
    deviceInfo: string,
  ) => void;
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
                  ? { ...item, quantity: (item?.quantity ?? 1) + 1 }
                  : item,
              ),
            };
          }
          return { cart: [...state?.cart, { ...product, quantity: 1 }] };
        });
      },

      removeFromCart: async (id, user, location, deviceInfo) => {
        set((state) => ({
          cart: state?.cart?.filter((item) => item?.id !== id),
        }));
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
      },

      removeFromWishlist: async (id, user, location, deviceInfo) => {
        const removedProduct = get().wishlist?.find((item) => item?.id === id);
        set((state) => ({
          wishlist: state?.wishlist?.filter((item) => item?.id !== id),
        }));
      },
    }),
    { name: "store-storage" },
  ),
);
