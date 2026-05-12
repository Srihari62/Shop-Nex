import ProductDetails from "@/shared/modules/product/product-details";
import axiosInstance from "@/utils/axiosInstance";
import { Metadata } from "next";
import React from "react";

async function fetchProductDetails(slug: string) {
  try {
    const response = await axiosInstance.get(
      `/product/api/get-product/${slug}`,
    );
    return response.data.product;
  } catch (error: any) {
    console.error(
      "Error fetching product details:",
      error.response?.status,
      error.message,
    );
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await fetchProductDetails(params.slug);

  if (!product) {
    return { title: "Product Not Found | ShopNex" };
  }

  return {
    title: `${product.title} | ShopNex`,
    description:
      product?.description ||
      "Discover high-quality products on ShopNex Marketplace",
    openGraph: {
      title: product?.title,
      description: product?.description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      type: "website",
      siteName: "ShopNex",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title,
      description: product?.description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
    },
  };
}

const ProductPage = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const productDetails = await fetchProductDetails(params?.slug);

  if (!productDetails) {
    return <div className="p-8">Product not found or error loading data.</div>;
  }

  return <ProductDetails productDetails={productDetails} />;
};

export default ProductPage;
