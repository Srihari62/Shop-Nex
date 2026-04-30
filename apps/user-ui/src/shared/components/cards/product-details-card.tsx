"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Star, X, ShoppingCart, Heart } from "lucide-react";
import { useStore } from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import toast from "react-hot-toast";

interface ProductDetailsCardProps {
  product: any;
  onClose: () => void;
}

const ProductDetailsCard = ({ product, onClose }: ProductDetailsCardProps) => {
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const masterSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item?.id === product?.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item?.id === product?.id);

  const [activeImage, setActiveImage] = useState(
    product?.images?.[0]?.url || "https://via.placeholder.com/600",
  );

  useEffect(() => {
    if (product?.images?.[0]?.url) {
      setActiveImage(product.images[0].url);
    }
  }, [product]);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!mounted || !product) return null;

  const rating = product?.ratings ?? product?.rating ?? 5;
  const price = product?.sale_price ?? product?.price ?? 0;
  const originalPrice = product?.regular_price ?? product?.price;
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-gradient-to-br from-[#47718F] via-[#47718F] to-[#365870] rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/20 animate-zoom-in flex flex-col md:flex-row max-h-[95vh] overflow-y-auto md:overflow-hidden">
        {/* Close Icon */}
        <X
          size={18}
          onClick={onClose}
          className="absolute top-5 right-5 z-[100] text-white/50 hover:text-white cursor-pointer transition-colors"
        />

        {/* Left Section: Images */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center bg-white/5 border-b md:border-b-0 md:border-r border-white/10">
          <div className="relative w-full aspect-square mb-6 bg-white/5 rounded-3xl overflow-hidden group border border-white/10">
            <Image
              src={activeImage}
              alt={product?.title || "Product"}
              fill
              className="object-contain p-8 transition-all duration-700 group-hover:scale-105"
              unoptimized
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 self-start overflow-x-auto pb-2 w-full custom-scrollbar">
            {product?.images?.map((img: any, idx: number) => (
              <div
                key={idx}
                onClick={() => setActiveImage(img.url)}
                className={`w-20 h-20 shrink-0 rounded-xl border-2 transition-all overflow-hidden bg-white/10 cursor-pointer shadow-lg ${activeImage === img.url ? "border-white scale-105 shadow-white/20" : "border-white/10 grayscale hover:grayscale-0 hover:border-white/40"}`}
              >
                <Image
                  src={img.url}
                  alt={`thumb-${idx}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 md:pt-20 text-white flex flex-col relative">
          {/* Seller Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-white/20 flex items-center justify-center shadow-lg text-white font-bold text-xl uppercase">
                {product?.shop?.name?.[0] ||
                  product?.seller?.name?.[0] ||
                  product?.title?.[0] ||
                  "S"}
              </div>
              <div>
                <h4 className="font-bold text-sm leading-none mb-1">
                  {product?.shop?.name ||
                    product?.seller?.name ||
                    "Premium Seller"}
                </h4>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill="#facc15"
                      className="text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  {product?.shop?.address || "Verified Merchant"}
                </p>
              </div>
            </div>
            <button className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[10px] font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg active:scale-95 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Chat with Seller
            </button>
          </div>

          {/* Product Info */}
          <div className="mb-6">
            <h1 className="text-4xl font-black mb-2 tracking-tight">
              {product?.title || product?.name || "Untitled Product"}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
              {product?.description ||
                "Experience premium quality with this state-of-the-art product designed for excellence."}
            </p>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
              Size:
            </h3>
            <div className="flex flex-wrap gap-3">
              {masterSizes.map((size) => {
                const isAvailable = product?.sizes?.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAvailable) setSelectedSize(size);
                    }}
                    className={`relative w-12 h-10 rounded-xl font-bold text-xs transition-all border ${
                      selectedSize === size
                        ? "bg-white text-[#365870] border-white shadow-xl scale-110 z-10"
                        : isAvailable
                          ? "bg-white/5 text-white border-white/10 hover:bg-white/10"
                          : "bg-white/5 text-white/20 border-white/5 cursor-not-allowed overflow-hidden"
                    }`}
                  >
                    <span className={!isAvailable ? "opacity-30" : ""}>
                      {size}
                    </span>
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-[1px] bg-white/20 rotate-45" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coupons Section */}
          {product?.discount_details && product.discount_details.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
                Available Coupons:
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.discount_details.map((discount: any) => (
                  <div
                    key={discount.id}
                    className="bg-white/5 border border-dashed border-white/20 rounded-xl p-2 flex items-center gap-3 group relative cursor-pointer hover:bg-white/10 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(discount.discountCode);
                      toast.success(`Copied code: ${discount.discountCode}`);
                    }}
                  >
                    <div className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded">
                      {discount.discountValue}% OFF
                    </div>
                    <div className="text-sm font-black text-white tracking-wider">
                      {discount.discountCode}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-black tracking-tighter">
              ${price}
            </span>
            {originalPrice > price && (
              <div className="flex items-center gap-3">
                <span className="text-xl text-white/30 line-through font-bold">
                  ${originalPrice}
                </span>
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                  {discount}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 mb-8">
            {/* Quantity Selector */}
            <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 p-1 shadow-inner">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => {
                if (isInCart) {
                  removeFromCart(product?.id, user, location, deviceInfo);
                } else {
                  addToCart(
                    {
                      ...product,
                      quantity,
                      price: product.sale_price || product.price,
                      image:
                        product.images?.[0]?.url ||
                        "https://via.placeholder.com/300",
                      discount_details: product.discount_details,
                      regular_price: product.regular_price,
                      category: product.category,
                    },
                    user,
                    location,
                    deviceInfo,
                  );
                }
              }}
              className={`flex-1 ${isInCart ? "bg-indigo-600 hover:bg-indigo-700" : "bg-red-600 hover:bg-red-700"} text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs`}
            >
              <ShoppingCart
                size={18}
                fill={isInCart ? "currentColor" : "none"}
              />
              {isInCart ? "Remove from Cart" : "Add to Cart"}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                if (isWishlisted) {
                  removeFromWishlist(product?.id, user, location, deviceInfo);
                } else {
                  addToWishlist(product, user, location, deviceInfo);
                }
              }}
              className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all shadow-lg"
            >
              <Heart
                size={20}
                fill={isWishlisted ? "red" : "none"}
                className={`${isWishlisted ? "text-red-500" : "text-white/70"} hover:text-red-500 transition-colors`}
              />
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-green-500 text-xs font-black uppercase tracking-widest">
                In Stock
              </span>
            </div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Estimated Delivery:{" "}
              <span className="text-white/60">Mon May 12 2025</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProductDetailsCard;
