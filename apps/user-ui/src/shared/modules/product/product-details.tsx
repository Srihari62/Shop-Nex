"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Store,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import ProductCard from "../../components/cards/product-cards";
import { useStore } from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import { toast } from "react-hot-toast";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    productDetails?.sizes?.[0] || "",
  );

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);

  const isWishlisted = wishlist.some(
    (item: any) => item.id === productDetails?.id,
  );
  const isInCart = cart.some((item: any) => item.id === productDetails?.id);

  const { data: relatedProducts, isLoading: loadingRelated } = useQuery({
    queryKey: ["related-products", productDetails?.category],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?categories=${encodeURIComponent(productDetails?.category)}&limit=10`,
      );

      return res.data.products.filter((p: any) => p.id !== productDetails.id);
    },
    enabled: !!productDetails?.category,
  });

  const handleAddToCart = () => {
    const productForStore = {
      id: productDetails.id,
      title: productDetails.title,
      price: productDetails.sale_price,
      image: productDetails.images?.[0]?.url || "/placeholder-image.jpg",
      shopId: productDetails.shopId,
      quantity: quantity,
    };
    addToCart(productForStore, user, location, deviceInfo);
    toast.success("Added to cart!");
  };

  const handleWishlistToggle = () => {
    const productForStore = {
      id: productDetails.id,
      title: productDetails.title,
      price: productDetails.sale_price,
      image: productDetails.images?.[0]?.url || "/placeholder-image.jpg",
      shopId: productDetails.shopId,
    };
    if (isWishlisted) {
      removeFromWishlist(productDetails.id, user, location, deviceInfo);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(productForStore, user, location, deviceInfo);
      toast.success("Added to wishlist!");
    }
  };

  const discountPercentage = Math.round(
    ((productDetails?.regular_price - productDetails?.sale_price) /
      productDetails?.regular_price) *
      100,
  );

  const rating = productDetails?.ratings ?? 5;

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < Math.round(rating) ? "#facc15" : "none"}
        className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8">
      <div className="w-[90%] md:w-[80%] mx-auto">
        {/* Main Product Section */}
        <div className="bg-white rounded-sm shadow-sm overflow-hidden flex flex-col md:flex-row gap-8 p-4 md:p-6">
          {/* Left: Image Gallery */}
          <div className="flex-1 space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center relative group">
              <img
                src={
                  productDetails?.images?.[activeImage]?.url ||
                  "/placeholder-image.jpg"
                }
                alt={productDetails?.title}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              />
              <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {productDetails?.images?.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-md border-2 overflow-hidden transition-all ${
                    activeImage === idx
                      ? "border-orange-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Product Info */}
          <div className="flex-[1.5] flex flex-col">
            <h1 className="text-xl md:text-2xl font-medium text-gray-800 leading-tight">
              {productDetails?.title}
            </h1>

            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                {renderStars(rating)}
                <span className="text-blue-500 hover:underline cursor-pointer ml-1">
                  ({productDetails?.reviews?.length || 0} Reviews)
                </span>
              </div>
              <div className="h-3 w-px bg-gray-300" />
              <div className="text-gray-500">
                Brand:{" "}
                <span className="text-blue-500 hover:underline cursor-pointer">
                  {productDetails?.brand || "No Brand"}
                </span>
              </div>
            </div>

            <hr className="my-5 border-gray-100" />

            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-orange-600">
                  ${productDetails?.sale_price}
                </span>
                {productDetails?.regular_price > productDetails?.sale_price && (
                  <>
                    <span className="text-gray-400 line-through text-lg">
                      ${productDetails?.regular_price}
                    </span>
                    <span className="text-gray-700 font-medium bg-gray-100 px-1.5 py-0.5 rounded text-sm">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Sizes */}
              {productDetails?.sizes?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-gray-500 text-sm block">Size:</span>
                  <div className="flex flex-wrap gap-2">
                    {productDetails.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] px-3 py-1.5 border rounded text-sm transition-all ${
                          selectedSize === size
                            ? "bg-gray-800 text-white border-gray-800"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-gray-500 text-sm w-12">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded overflow-hidden h-9">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 bg-gray-50 hover:bg-gray-100 transition-colors border-r border-gray-300"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-12 text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 bg-gray-50 hover:bg-gray-100 transition-colors border-l border-gray-300"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {productDetails?.stock} In Stock (Stock{" "}
                  {productDetails?.stock})
                </span>
              </div>

              <div className="flex gap-3 pt-6 flex-wrap md:flex-nowrap">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-[#FF4700] hover:bg-[#e64000] text-white font-medium rounded transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {isInCart ? "In Cart" : "Add to Cart"}
                </button>
                <button
                  className="flex-1 h-12 bg-[#26ABD4] hover:bg-[#2199be] text-white font-medium rounded transition-colors"
                  onClick={() => {
                    if (!isInCart) handleAddToCart();
                    window.location.href = "/cart";
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Right: Delivery & Seller */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6 space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Delivery Options
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Standard Delivery</div>
                  <div className="text-xs text-gray-500">
                    Petaling Jaya, Malaysia
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-700">$5.00</div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Return & Warranty
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-gray-400 mt-1" />
                <div className="text-sm">7 Days Returns</div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-400 mt-1" />
                <div className="text-sm text-gray-500">
                  Warranty not available
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {productDetails?.shop?.name || "Becodemy"}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                      Official Store
                    </div>
                  </div>
                </div>
                <button className="text-blue-500 text-xs font-bold flex items-center gap-1 hover:underline">
                  <MessageCircle className="w-4 h-4" />
                  Chat Now
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg text-center mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Seller Rating
                  </div>
                  <div className="text-sm font-bold text-gray-800">88%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">On Time</div>
                  <div className="text-sm font-bold text-gray-800">100%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Response</div>
                  <div className="text-sm font-bold text-gray-800">100%</div>
                </div>
              </div>

              <button className="w-full py-2.5 text-blue-500 border border-blue-500 rounded text-sm font-bold hover:bg-blue-50 transition-colors uppercase tracking-tight">
                Go to Store
              </button>
            </div>
          </div>
        </div>

        {/* Product Details & Reviews Tabs */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-sm shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                Product Details of {productDetails?.title}
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="whitespace-pre-wrap">
                  {productDetails?.description}
                </p>
                {productDetails?.detailed_description && (
                  <div
                    className="mt-6 border-t pt-6 max-h-[600px] overflow-y-auto max-w-full [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words custom-scrollbar"
                    dangerouslySetInnerHTML={{
                      __html: productDetails.detailed_description,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Reviews Card */}
            <div className="bg-white rounded-sm shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                Ratings & Reviews
              </h2>
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <Star className="w-12 h-12" />
                </div>
                <p className="text-lg font-medium">No Reviews available yet!</p>
                <p className="text-sm">Be the first to review this product</p>
              </div>
            </div>
          </div>

          {/* Sidebar / Recommendations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm shadow-sm p-4 sticky top-8">
              <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                Related Items
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              </h3>
              <div className="space-y-4">
                {loadingRelated ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-16 h-16 bg-gray-100 rounded" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : relatedProducts?.length > 0 ? (
                  relatedProducts.slice(0, 5).map((p: any) => (
                    <div
                      key={p.id}
                      className="flex gap-3 group cursor-pointer items-center"
                      onClick={() =>
                        (window.location.href = `/product/${p.slug}`)
                      }
                    >
                      <div className="w-16 h-16 rounded bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 p-1">
                        <img
                          src={p.images?.[0]?.url}
                          alt={p.title}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-semibold line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </h4>
                        <div className="text-orange-600 font-bold text-xs mt-1">
                          ${p.sale_price}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 py-4 text-center">
                    No related items found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like - Large Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              You May Also Like
              <span className="text-sm font-normal text-gray-400">
                Based on your browsing
              </span>
            </h2>
          </div>
          {loadingRelated ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-100 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {relatedProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
