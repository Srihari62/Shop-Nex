import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  ShoppingBag,
  CheckCircle,
  Truck,
} from "lucide-react";

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#47718F]  mx-auto max-w-[100%] shadow-sm">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-tr from-indigo-100 via-purple-50 to-transparent blur-[120px] rounded-full opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-gradient-to-bl from-pink-100 via-rose-50 to-transparent blur-[120px] rounded-full opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="flex flex-col items-start gap-8 max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium text-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              New Summer Collection 2026
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.15] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
                Everyday Style
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Discover our latest arrivals featuring premium quality materials,
              innovative designs, and unmatched comfort. Shop the trends
              everyone is talking about.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-2 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link
                href="/products"
                className="group relative flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,0,0,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingBag size={20} />
                  Shop Now
                </span>
              </Link>
              <Link
                href="/categories"
                className="group flex items-center gap-2 bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-semibold transition-all hover:bg-gray-50 hover:border-gray-300"
              >
                Explore Collections
                <ArrowRight
                  size={20}
                  className="text-gray-400 group-hover:text-gray-900 transition-colors"
                />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 animate-in fade-in duration-700 delay-500">
              <div className="flex -space-x-3">
                <Image
                  src="https://i.pravatar.cc/100?img=1"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white shadow-sm"
                  unoptimized
                />
                <Image
                  src="https://i.pravatar.cc/100?img=2"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white shadow-sm"
                  unoptimized
                />
                <Image
                  src="https://i.pravatar.cc/100?img=3"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white shadow-sm"
                  unoptimized
                />
                <Image
                  src="https://i.pravatar.cc/100?img=4"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white shadow-sm"
                  unoptimized
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  <span className="text-gray-900 font-bold">4.9/5</span> from
                  10k+ reviews
                </p>
              </div>
            </div>
          </div>

          {/* Image/Visual Content */}
          <div className="relative w-full h-[400px] lg:h-[550px] animate-in fade-in zoom-in-95 duration-1000 delay-300">
            {/* Decorative background shapes for the image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-indigo-100 to-pink-100 rounded-[2rem] rotate-3 opacity-70 blur-md"></div>

            {/* Main Image Container */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-white rounded-[2rem] shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"
                alt="Premium Wireless Headphones"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
                priority
              />
            </div>

            {/* Floating feature card 1 */}
            <div
              className="absolute bottom-8 left-0 lg:-left-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 animate-bounce"
              style={{ animationDuration: "3.5s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Top Rated</p>
                  <p className="text-sm font-bold text-gray-900">
                    Premium Quality
                  </p>
                </div>
              </div>
            </div>

            {/* Floating feature card 2 */}
            <div
              className="absolute top-8 right-0 lg:-right-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 animate-bounce"
              style={{ animationDuration: "4.2s", animationDelay: "1s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Free Shipping
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    On Orders Over $50
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
