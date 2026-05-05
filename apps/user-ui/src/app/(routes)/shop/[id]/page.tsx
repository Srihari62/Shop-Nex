import React from "react";
import { Metadata } from "next";
import axiosInstance from "@/utils/axiosInstance";
import ShopDetails from "@/shared/modules/shop/shop-details";

async function fetchShopDetails(id: string) {
  try {
    const response = await axiosInstance.get(`/product/api/get-shop/${id}`);
    return response.data.shop;
  } catch (error: any) {
    console.error(
      "Error fetching shop details:",
      error.response?.status,
      error.message,
    );
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const shop = await fetchShopDetails(params.id);

  if (!shop) {
    return { title: "Shop Not Found | ShopNex" };
  }

  return {
    title: `${shop.name} | ShopNex Marketplace`,
    description: shop.bio || shop.description || `Explore products from ${shop.name} on ShopNex`,
    openGraph: {
      title: shop.name,
      description: shop.bio || shop.description || "",
      images: [shop.avatarUrl || "/default-shop-image.jpg"],
      type: "website",
    },
  };
}

const ShopPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const shopDetails = await fetchShopDetails(params.id);

  if (!shopDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md">
          <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
          <p className="text-slate-500 font-medium mb-8">Oops! We couldn't find the shop you're looking for.</p>
          <a href="/shops" className="inline-block px-8 py-3 bg-[#47718F] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#365870] transition-all">
            Back to Shops
          </a>
        </div>
      </div>
    );
  }

  return <ShopDetails shop={shopDetails} />;
};

export default ShopPage;
