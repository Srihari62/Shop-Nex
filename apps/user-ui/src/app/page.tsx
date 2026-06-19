"use client";

import React from "react";
import Hero from "../shared/modules/hero";
import SectionTitle from "../shared/components/section/section-title";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import ProductCard from "../shared/components/cards/product-cards";
import ShopCard from "../shared/components/cards/shop-card";
import Link from "next/link";
import { ArrowRight, Loader2, Store } from "lucide-react";

const Page = () => {
  // ─── Suggested Products ──────────────────────────────────────────
  const { data: products, isLoading: isSuggestedLoading } = useQuery({
    queryKey: ["suggested-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=5",
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  // ─── Latest Products ─────────────────────────────────────────────
  const { data: latestProducts, isLoading: isLatestLoading } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-filtered-products?page=1&limit=5&sort=newest",
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  // ─── Top Shops ───────────────────────────────────────────────────
  const { data: topShops, isLoading: isShopsLoading } = useQuery({
    queryKey: ["top-shops-home"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 5,
  });

  // ─── Top Offers ──────────────────────────────────────────────────
  const { data: offerProducts, isLoading: isOffersLoading } = useQuery({
    queryKey: ["top-offers-home"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-filtered-offers?page=1&limit=5&sort=price_asc",
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const renderProductGrid = (items: any[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[350px] bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm"
            />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-6">
        {items?.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <Hero />

      <div className="w-[90%] md:w-[80%] mx-auto space-y-20 mt-16">
        {/* ─── Recommended Products Section ─── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <SectionTitle title="Recommended For You" />
            <Link
              href="/products"
              className="group flex items-center gap-2 text-[#47718F] font-black text-xs uppercase tracking-widest hover:text-[#365870] transition-all"
            >
              See All Products
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
          {renderProductGrid(products || [], isSuggestedLoading)}
        </section>

        {/* ─── Latest Products Section ─── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <SectionTitle title="Latest Products" />
            <Link
              href="/products"
              className="group flex items-center gap-2 text-[#47718F] font-black text-xs uppercase tracking-widest hover:text-[#365870] transition-all"
            >
              See All Products
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
          {renderProductGrid(latestProducts || [], isLatestLoading)}
        </section>

        {/* ─── Top Shops Section ─── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <SectionTitle title="Top Performing Shops" />
            <Link
              href="/shops"
              className="group flex items-center gap-2 text-[#47718F] font-black text-xs uppercase tracking-widest hover:text-[#365870] transition-all"
            >
              Explore All Shops
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {isShopsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[300px] bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {topShops?.slice(0, 3).map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </section>

        {/* ─── Top Offers Section ─── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <SectionTitle title="Best Deals & Offers" />
            <Link
              href="/offers"
              className="group flex items-center gap-2 text-[#47718F] font-black text-xs uppercase tracking-widest hover:text-[#365870] transition-all"
            >
              View More Offers
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
          {renderProductGrid(offerProducts || [], isOffersLoading)}
        </section>
      </div>
    </div>
  );
};

export default Page;
