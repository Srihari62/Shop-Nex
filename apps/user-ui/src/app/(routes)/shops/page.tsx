"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ShopCard from "@/shared/components/cards/shop-card";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  Search,
  Store,
  Loader2,
  Package,
  Globe,
  MapPin,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────
const CATEGORIES = [
  "Clothing",
  "Electronics",
  "Grocery",
  "Restaurant",
  "Beauty",
  "Furniture",
  "Automotive",
  "Books",
  "Toys",
  "Sports",
  "Hardware",
  "Pet",
  "Medical",
  "Jewelry",
  "Florist",
  "Baby",
  "Art",
  "Music",
  "Technology",
  "Garden",
];

const COUNTRIES = ["Bangladesh", "USA", "UK", "India"];

const ShopsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── State ──────────────────────────────────────────────────────────
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ─── Sync URL -> State ─────────────────────────────────────────────
  useEffect(() => {
    const cats = searchParams.get("categories")?.split(",") || [];
    const counts = searchParams.get("countries")?.split(",") || [];
    setSelectedCategories(cats.filter(Boolean));
    setSelectedCountries(counts.filter(Boolean));
    setCurrentPage(Number(searchParams.get("page")) || 1);
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // ─── Debounce Search ───────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Sync State -> URL ─────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length)
      params.set("categories", selectedCategories.join(","));
    if (selectedCountries.length)
      params.set("countries", selectedCountries.join(","));
    if (currentPage > 1) params.set("page", String(currentPage));
    if (debouncedSearch) params.set("q", debouncedSearch);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [selectedCategories, selectedCountries, currentPage, debouncedSearch]);

  // ─── Fetch Shops ──────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "filtered-shops",
      selectedCategories,
      selectedCountries,
      currentPage,
      debouncedSearch,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategories.length)
        params.set("categories", selectedCategories.join(","));
      if (selectedCountries.length)
        params.set("countries", selectedCountries.join(","));
      params.set("page", String(currentPage));
      params.set("limit", "6");
      if (debouncedSearch) params.set("q", debouncedSearch);

      const res = await axiosInstance.get(
        `/product/api/get-filtered-shops?${params.toString()}`,
      );
      return res.data;
    },
  });

  const shops = data?.shops || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // ─── Handlers ──────────────────────────────────────────────────────
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
    setCurrentPage(1);
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ─── Header Section ─── */}
      <div className="bg-gradient-to-r from-[#47718F] to-[#365870] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

        <div className="w-[90%] md:w-[80%] mx-auto py-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Explore Shops
                <span className="ml-4 text-xs font-bold bg-white/10 text-white/90 px-3 py-1 rounded-full tracking-normal">
                  {data?.pagination?.total || 0} Total
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-white/60 font-medium">
                <span className="hover:text-white/90 cursor-pointer transition-colors">
                  Home
                </span>
                <span className="text-white/30">·</span>
                <span className="text-white/90">All Shops</span>
              </div>
            </div>

            <div className="relative w-full md:w-[400px] group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-4 focus:ring-white/10 focus:border-white/40 outline-none transition-all font-medium text-white placeholder:text-white/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="w-[90%] md:w-[80%] mx-auto py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8">
            {/* Category Filter */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#47718F]" />
                  Categories
                </h3>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-wider"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedCategories.includes(cat)
                        ? "bg-[#47718F] text-white shadow-md shadow-[#47718F]/20"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        selectedCategories.includes(cat)
                          ? "border-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedCategories.includes(cat) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-[13px] font-bold tracking-tight">
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Country Filter */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={16} className="text-[#47718F]" />
                  Countries
                </h3>
                {selectedCountries.length > 0 && (
                  <button
                    onClick={() => setSelectedCountries([])}
                    className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-wider"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {COUNTRIES.map((country) => (
                  <label
                    key={country}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedCountries.includes(country)
                        ? "bg-[#47718F] text-white shadow-md shadow-[#47718F]/20"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        selectedCountries.includes(country)
                          ? "border-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedCountries.includes(country) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-[13px] font-bold tracking-tight">
                      {country}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Promo Card */}
            <div className="bg-gradient-to-br from-[#47718F] to-[#365870] p-6 rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Store size={160} />
              </div>
              <h4 className="text-xl font-black mb-2 relative z-10">
                Become a Seller
              </h4>
              <p className="text-white/70 text-xs font-medium mb-6 relative z-10 leading-relaxed">
                Start your online business journey with our platform today.
              </p>
              <button className="w-full py-3 bg-white text-[#47718F] rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all relative z-10">
                Register Now
              </button>
            </div>
          </aside>

          {/* Shops Grid Area */}
          <div className="flex-1">
            {/* Mobile Filters Toggle & Toolbar */}
            <div className="flex items-center justify-between mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm lg:hidden">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 text-slate-700 font-bold text-sm px-4 py-2"
              >
                <SlidersHorizontal size={18} />
                Filters
                {(selectedCategories.length > 0 ||
                  selectedCountries.length > 0) && (
                  <span className="bg-[#47718F] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {selectedCategories.length + selectedCountries.length}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-4 px-4 text-slate-400">
                <LayoutGrid size={20} className="text-[#47718F]" />
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[400px] bg-white rounded-3xl animate-pulse border border-slate-100"
                  />
                ))}
              </div>
            ) : shops.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {shops.map((shop: any) => (
                    <div key={shop.id} className="h-full">
                      <ShopCard shop={shop} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-3">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${
                          currentPage === i + 1
                            ? "bg-[#47718F] text-white shadow-xl shadow-[#47718F]/20 scale-110"
                            : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Store size={40} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">
                  No shops found
                </h3>
                <p className="text-slate-500 font-medium">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── Mobile Filters Drawer ─── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                Filters
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-10">
              {/* Categories */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                  Categories
                </h4>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        selectedCategories.includes(cat)
                          ? "bg-[#47718F]/10 text-[#47718F]"
                          : "text-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="hidden"
                      />
                      <span className="text-sm font-bold flex-1">{cat}</span>
                      {selectedCategories.includes(cat) && (
                        <div className="w-2 h-2 bg-[#47718F] rounded-full" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                  Countries
                </h4>
                <div className="space-y-2">
                  {COUNTRIES.map((country) => (
                    <label
                      key={country}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        selectedCountries.includes(country)
                          ? "bg-[#47718F]/10 text-[#47718F]"
                          : "text-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country)}
                        onChange={() => toggleCountry(country)}
                        className="hidden"
                      />
                      <span className="text-sm font-bold flex-1">
                        {country}
                      </span>
                      {selectedCountries.includes(country) && (
                        <div className="w-2 h-2 bg-[#47718F] rounded-full" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <button
                onClick={clearFilters}
                className="py-4 text-xs font-black uppercase tracking-widest text-slate-400"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="py-4 bg-[#47718F] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShopsPage = () => {
  return (
    <React.Suspense fallback={null}>
      <ShopsPageContent />
    </React.Suspense>
  );
};

export default ShopsPage;
