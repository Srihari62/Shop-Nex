import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Eye, ShoppingCart } from "lucide-react";
import ProductDetailsCard from "./product-details-card";
import { useStore } from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";

interface ProductCardProps {
  product: any;
  isEvent?: boolean;
}

const ProductCard = ({ product, isEvent }: ProductCardProps) => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const [open, setOpen] = React.useState(false);
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item?.id === product?.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item?.id === product?.id);

  const imageUrl =
    product?.images?.[0]?.url || "https://via.placeholder.com/300";
  const rating = product?.ratings ?? product?.rating ?? 5;
  const price = product?.sale_price ?? product?.price ?? 0;

  const discount =
    product.regular_price > price
      ? Math.round(((product.regular_price - price) / product.regular_price) * 100)
      : 0;

  return (
    <div className="group relative bg-gradient-to-br from-[#47718F] via-[#47718F] to-[#365870] rounded-2xl overflow-hidden shadow-xl border border-white/10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(71,113,143,0.4)] hover:-translate-y-2">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <Link href={`/product/${product.slug}`} className="block cursor-pointer">
        {/* Image */}
        <div className="relative w-full h-[320px] overflow-hidden">
          {isEvent && (
            <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xl flex items-center gap-1.5 animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
              LIVE EVENT
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-20 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl flex flex-col items-center leading-none">
              <span className="mb-0.5 tracking-tighter">OFFER</span>
              <span className="text-sm">{discount}% OFF</span>
            </div>
          )}
          {product?.stock < 5 && product?.stock > 0 && (
            <div className="absolute top-3 right-3 z-20 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg border border-white/20">
              Limited Stock
            </div>
          )}
          <Image
            src={imageUrl}
            alt={product?.title || "Product"}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
        </div>

        {/* Details */}
        <div className="p-4 relative z-10">
          <div className="flex justify-between items-start mb-3 gap-2">
            <h3 className="text-base font-bold text-white leading-tight group-hover:text-indigo-100 transition-colors line-clamp-1">
              {product?.title || product?.name || "Untitled"}
            </h3>
            <div className="flex items-center gap-0.5 shrink-0">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={10}
                  fill={index < Math.round(rating) ? "#facc15" : "none"}
                  className={
                    index < Math.round(rating)
                      ? "text-yellow-400"
                      : "text-white/20"
                  }
                />
              ))}
              <span className="text-[10px] font-bold text-white/90 ml-1">
                ({rating})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight">
                ${price}
              </span>
              {product?.regular_price > price && (
                <span className="text-[10px] text-indigo-200/50 line-through font-medium">
                  ${product.regular_price}
                </span>
              )}
            </div>

            <div className="text-[9px] font-bold bg-white/10 text-white px-2 py-0.5 rounded border border-white/10">
              {product?.category || "General"}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 relative z-10">
        <div className="flex items-center justify-around pt-3 border-t border-white/10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isWishlisted) {
                removeFromWishlist(product?.id, user, location, deviceInfo);
              } else {
                addToWishlist(
                  { ...product, quantity: 1 },
                  user,
                  location,
                  deviceInfo,
                );
              }
            }}
            className={`${isWishlisted ? "text-red-600 hover:text-red-500" : "text-white/70 hover:text-red-400"} transition-colors`}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isInCart) {
                removeFromCart(product?.id, user, location, deviceInfo);
              } else {
                addToCart(
                  { ...product, quantity: 1 },
                  user,
                  location,
                  deviceInfo,
                );
              }
            }}
            className={`${isInCart ? "text-indigo-500 hover:text-indigo-400" : "text-white/70 hover:text-indigo-300"} transition-colors`}
          >
            <ShoppingCart size={18} fill={isInCart ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {open && (
        <ProductDetailsCard product={product} onClose={() => setOpen(false)} />
      )}
    </div>

  );
};

export default ProductCard;
