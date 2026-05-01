"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../utils/axiosInstance";
import { 
  ArrowLeft, 
  Package, 
  Store, 
  Tag, 
  Loader2,
  AlertCircle,
  Star,
  Info,
  Layers,
  Palette,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  ImageIcon
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const fetchProductDetail = async (id: string) => {
  const response: any = await axiosInstance.get(`/admin/api/products/${id}`);
  return response.data.product;
};

const ProductDetailPage = () => {
  const router = useRouter();
  const { productId } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => fetchProductDetail(productId as string),
    enabled: !!productId,
  });

  if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" /></div>;
  if (isError || !product) return <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-slate-500"><AlertCircle size={48} /><p>Product not found</p></div>;

  const isHex = (str: string) => /^#([0-9A-F]{3}){1,2}$/i.test(str);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-[#4A876E] transition-colors group">
          <div className="p-2 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] group-hover:-translate-x-1 transition-transform">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Back to Catalog</span>
        </button>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${product.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            {product.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery Section */}
        <div className="space-y-6">
            <div className="aspect-square rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f] p-8">
                <div className="w-full h-full rounded-[30px] bg-white dark:bg-slate-800 shadow-inner overflow-hidden flex items-center justify-center p-4">
                    {product.images?.[activeImage]?.url ? (
                        <img key={activeImage} src={product.images[activeImage].url} className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-500" alt="product" />
                    ) : (
                        <Package size={100} strokeWidth={1} className="text-slate-200" />
                    )}
                </div>
            </div>
            
            {/* Thumbnails */}
            {product.images?.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {product.images.map((img: any, idx: number) => (
                        <button 
                            key={idx}
                            onClick={() => setActiveImage(idx)}
                            className={`flex-shrink-0 w-20 h-20 rounded-2xl p-1 bg-[#e0e5ec] dark:bg-[#1a1c20] transition-all ${activeImage === idx ? 'shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] ring-2 ring-[#4A876E]/50' : 'shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]'}`}
                        >
                            <img src={img.url} className="w-full h-full object-cover rounded-xl" />
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-[30px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f] flex flex-col items-center text-center gap-2">
                    <TrendingUp className="text-[#4A876E]" size={20} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Sales</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100">{product.totalSales}</span>
                </div>
                <div className="p-6 rounded-[30px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f] flex flex-col items-center text-center gap-2">
                    <Star className="text-amber-500" size={20} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Rating</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100">{product.ratings.toFixed(1)}</span>
                </div>
                <div className="p-6 rounded-[30px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f] flex flex-col items-center text-center gap-2">
                    <BarChart3 className="text-blue-500" size={20} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stock</span>
                    <span className={`text-lg font-black ${product.stock < 10 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>{product.stock}</span>
                </div>
            </div>
        </div>

        {/* Dynamic Product Specs */}
        <div className="space-y-10">
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-white/50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-white/20">
                            {product.brand || 'No Brand'}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-[#4A876E]/10 text-[10px] font-black uppercase tracking-widest text-[#4A876E]">
                            {product.category}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 leading-tight tracking-tight">{product.title}</h1>
                </div>

                <div onClick={() => router.push(`/dashboard/sellers/${product.shopId}`)} className="p-6 rounded-[30px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f] group cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center overflow-hidden">
                                {product.shop?.avatarUrl ? <img src={product.shop.avatarUrl} className="w-full h-full object-cover" /> : <Store className="text-slate-300" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Managed By</span>
                                <span className="text-base font-black text-slate-800 dark:text-slate-100 group-hover:text-[#4A876E] transition-colors">{product.shop?.name}</span>
                            </div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 shadow-inner group-hover:translate-x-1 transition-transform">
                            <ArrowLeft size={16} className="rotate-180 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f]">
                    <div className="flex items-center gap-2 mb-4">
                        <Info size={16} className="text-[#4A876E]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Core Description</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        {product.description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-20px_40px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-20px_40px_#26292f] space-y-4">
                        <div className="flex items-center gap-2">
                            <Palette size={16} className="text-purple-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Colors</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.colors?.length ? product.colors.map((c: string) => (
                                <div key={c} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-transform hover:scale-105">
                                    {(isHex(c) || c.startsWith('rgb')) ? (
                                        <div className="w-3 h-3 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: c }} />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: c.toLowerCase() }} />
                                    )}
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize">{c}</span>
                                </div>
                            )) : <span className="text-[10px] font-bold text-slate-400">Not Specified</span>}
                        </div>
                    </div>
                    <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-20px_40px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-20px_40px_#26292f] space-y-4">
                        <div className="flex items-center gap-2">
                            <Maximize2 size={16} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size Variants</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes?.length ? product.sizes.map((s: string) => (
                                <span key={s} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">{s}</span>
                            )) : <span className="text-[10px] font-bold text-slate-400">One Size</span>}
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-20px_40px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-20px_40px_#26292f] space-y-4">
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {product.tags?.length ? product.tags.map((t: string) => (
                            <span key={t} className="text-[11px] font-bold text-[#4A876E] hover:underline cursor-pointer">#{t}</span>
                        )) : <span className="text-[10px] font-bold text-slate-400">No tags added.</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f] space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Warranty</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <ShieldCheck size={14} className="text-[#4A876E]" /> {product.warranty || 'No Warranty'}
                        </div>
                    </div>
                    <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-20px_40px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-20px_40px_#26292f] space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-right block">Pricing</span>
                        <div className="flex items-baseline justify-end gap-2">
                            {product.sale_price < product.regular_price && <span className="text-xs font-bold text-slate-400 line-through">${product.regular_price}</span>}
                            <span className="text-2xl font-black text-[#4A876E]">${product.sale_price || product.regular_price}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
