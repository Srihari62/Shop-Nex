"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ProductCard from "@/shared/components/cards/product-cards";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  Search,
  Package,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────
const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Health & Beauty",
  "Sports & Outdoors",
  "Toys & Games",
  "Automotive",
  "Books & Media",
];

const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Magenta", hex: "#D946EF" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Pink", hex: "#FFC0CB" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Popular", value: "popular" },
];

// ─── Filter Section Component ────────────────────────────────────────
const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-sm font-bold text-slate-800 hover:text-[#47718F] transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────
const ProductsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Read URL state helper ──
  const getParam = (key: string) => searchParams.get(key);

  // ── Filter state ──
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([
    Number(getParam("minPrice") || 0),
    Number(getParam("maxPrice") || 10000),
  ]);
  const [priceMin, setPriceMin] = useState(Number(getParam("minPrice") || 0));
  const [priceMax, setPriceMax] = useState(
    Number(getParam("maxPrice") || 10000),
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    getParam("categories")?.split(",").filter(Boolean) || [],
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    getParam("colors")?.split(",").filter(Boolean) || [],
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    getParam("sizes")?.split(",").filter(Boolean) || [],
  );
  const [currentPage, setCurrentPage] = useState(Number(getParam("page") || 1));
  const [sortBy, setSortBy] = useState(getParam("sort") || "newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(getParam("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // ── Debounce Search ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Sync state to URL ──
  useEffect(() => {
    const params = new URLSearchParams();
    if (appliedPriceRange[0] > 0)
      params.set("minPrice", String(appliedPriceRange[0]));
    if (appliedPriceRange[1] < 10000)
      params.set("maxPrice", String(appliedPriceRange[1]));
    if (selectedCategories.length)
      params.set("categories", selectedCategories.join(","));
    if (selectedColors.length) params.set("colors", selectedColors.join(","));
    if (selectedSizes.length) params.set("sizes", selectedSizes.join(","));
    if (currentPage > 1) params.set("page", String(currentPage));
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (searchQuery) params.set("q", searchQuery);

    const qs = params.toString();
    router.replace(`/offers${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [
    appliedPriceRange,
    selectedCategories,
    selectedColors,
    selectedSizes,
    currentPage,
    sortBy,
    searchQuery,
    router,
  ]);

  // ── Apply price filter ──
  const applyPriceFilter = () => {
    setAppliedPriceRange([priceMin, priceMax]);
    setCurrentPage(1);
  };

  // ── Sync slider to inputs ──
  const handleSliderChange = (val: number) => {
    setPriceMax(val);
    setAppliedPriceRange([priceMin, val]);
    setCurrentPage(1);
  };

  // ── Fetch products ──
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "filtered-offers",
      appliedPriceRange,
      selectedCategories,
      selectedColors,
      selectedSizes,
      currentPage,
      sortBy,
      debouncedSearch,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("priceRange", appliedPriceRange.join(","));
      params.set("page", String(currentPage));
      params.set("limit", "12");
      params.set("sort", sortBy);
      if (debouncedSearch) params.set("q", debouncedSearch);

      if (selectedCategories.length)
        params.set("categories", selectedCategories.join(","));
      if (selectedColors.length) params.set("colors", selectedColors.join(","));
      if (selectedSizes.length) params.set("sizes", selectedSizes.join(","));

      const res = await axiosInstance.get(
        `/product/api/get-filtered-offers?${params.toString()}`,
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  // ── Toggle helpers ──
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
    setCurrentPage(1);
  };

  const toggleColor = (colorHex: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorHex)
        ? prev.filter((c) => c !== colorHex)
        : [...prev, colorHex],
    );
    setCurrentPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setPriceMin(0);
    setPriceMax(10000);
    setAppliedPriceRange([0, 10000]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSearchQuery("");
    setCurrentPage(1);
    setSortBy("newest");
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedColors.length +
    selectedSizes.length +
    (appliedPriceRange[0] > 0 || appliedPriceRange[1] < 10000 ? 1 : 0);

  // ── Render Filter Sidebar ──
  const renderFilters = () => (
    <div className="space-y-0">
      {/* Price Filter */}
      <FilterSection title="Price Filter">
        <div className="space-y-4">
          <input
            type="range"
            min={0}
            max={10000}
            value={priceMax}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#47718F]"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPriceMin(val);
                  setAppliedPriceRange([val, priceMax]);
                  setCurrentPage(1);
                }}
                className="w-20 h-8 text-xs font-bold text-center border border-slate-200 rounded-md focus:outline-none focus:border-[#47718F]"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPriceMax(val);
                  setAppliedPriceRange([priceMin, val]);
                  setCurrentPage(1);
                }}
                className="w-20 h-8 text-xs font-bold text-center border border-slate-200 rounded-md focus:outline-none focus:border-[#47718F]"
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="text-[10px] font-bold text-white bg-[#47718F] px-3 py-1.5 rounded hover:bg-[#365870] transition-colors uppercase tracking-wider"
            >
              Apply
            </button>
          </div>
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="flex items-center w-full gap-3 py-1 cursor-pointer group text-left"
            >
              <div
                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                  selectedCategories.includes(cat)
                    ? "bg-[#47718F] border-[#47718F]"
                    : "border-slate-300 group-hover:border-[#47718F]"
                }`}
              >
                {selectedCategories.includes(cat) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  selectedCategories.includes(cat)
                    ? "text-[#47718F] font-bold"
                    : "text-slate-600 group-hover:text-slate-800"
                }`}
              >
                {cat}
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Filter by Color">
        <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.hex)}
              className="flex items-center w-full gap-3 py-1 cursor-pointer group text-left"
            >
              <div
                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                  selectedColors.includes(color.hex)
                    ? "bg-[#47718F] border-[#47718F]"
                    : "border-slate-300 group-hover:border-[#47718F]"
                }`}
              >
                {selectedColors.includes(color.hex) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div
                className="w-4 h-4 rounded-full border border-slate-200"
                style={{ backgroundColor: color.hex }}
              />
              <span
                className={`text-sm transition-colors ${
                  selectedColors.includes(color.hex)
                    ? "text-[#47718F] font-bold"
                    : "text-slate-600 group-hover:text-slate-800"
                }`}
              >
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Filter by Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`min-w-[44px] h-9 px-3 text-xs font-bold rounded-md border transition-all ${
                selectedSizes.includes(size)
                  ? "bg-[#47718F] text-white border-[#47718F] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#47718F] hover:text-[#47718F]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-gradient-to-r from-[#47718F] to-[#365870] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="w-[90%] md:w-[80%] mx-auto py-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Special Offers
            <span className="ml-4 text-xs font-bold bg-white/10 text-white/90 px-3 py-1 rounded-full tracking-normal">
              {pagination.total} Total
            </span>
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-white/60 font-medium">
            <span className="hover:text-white/90 cursor-pointer transition-colors">
              Home
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/90">Offers</span>
          </div>
        </div>

      </div>

      {/* ── Main Content ── */}
      <div className="w-[90%] md:w-[80%] mx-auto py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#47718F] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="text-xs text-slate-500 font-medium">
            {pagination.total} Products found
          </div>
        </div>

        <div className="flex gap-8">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 px-5 sticky top-[120px]">
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[10px] font-bold text-red-500 uppercase tracking-wider hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {renderFilters()}
            </div>
          </aside>

          {/* ── Mobile Filter Drawer ── */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-[9999] lg:hidden">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Filters
                  </h2>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="px-5">{renderFilters()}</div>
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="flex-1 py-3 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 py-3 bg-[#47718F] text-white rounded-lg text-sm font-bold hover:bg-[#365870]"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Product Grid ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 px-5 py-3 mb-6 flex items-center justify-between gap-4">
              {/* Search within results */}
              <div className="flex items-center flex-1 max-w-xs relative">
                <Search size={14} className="absolute left-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search in results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-[#47718F] text-slate-600 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-4">
                {/* Result count */}
                <span className="hidden md:block text-xs text-slate-500 font-medium whitespace-nowrap">
                  {pagination.total} results
                </span>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-3 text-xs font-bold border border-slate-200 rounded-md focus:outline-none focus:border-[#47718F] text-slate-600 bg-white cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#47718F]/10 text-[#47718F] text-xs font-bold rounded-full hover:bg-[#47718F]/20 transition-colors"
                  >
                    {cat}
                    <X size={12} />
                  </button>
                ))}
                {selectedColors.map((colorHex) => {
                  const colorObj = COLORS.find((c) => c.hex === colorHex);
                  return (
                    <button
                      key={colorHex}
                      onClick={() => toggleColor(colorHex)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#47718F]/10 text-[#47718F] text-xs font-bold rounded-full hover:bg-[#47718F]/20 transition-colors"
                    >
                      Color: {colorObj?.name || colorHex}
                      <X size={12} />
                    </button>
                  );
                })}
                {selectedSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#47718F]/10 text-[#47718F] text-xs font-bold rounded-full hover:bg-[#47718F]/20 transition-colors"
                  >
                    Size: {size}
                    <X size={12} />
                  </button>
                ))}
                {(appliedPriceRange[0] > 0 || appliedPriceRange[1] < 10000) && (
                  <button
                    onClick={() => {
                      setPriceMin(0);
                      setPriceMax(10000);
                      setAppliedPriceRange([0, 10000]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#47718F]/10 text-[#47718F] text-xs font-bold rounded-full hover:bg-[#47718F]/20 transition-colors"
                  >
                    ${appliedPriceRange[0]} - ${appliedPriceRange[1]}
                    <X size={12} />
                  </button>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-red-500 hover:underline px-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 rounded-2xl h-[320px]" />
                    <div className="mt-3 space-y-2 px-1">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {!isLoading && (
              <div
                className={`relative ${isFetching ? "opacity-40 pointer-events-none" : ""} transition-opacity duration-300`}
              >
                {isFetching && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[#47718F] animate-spin" />
                  </div>
                )}
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {products.map((product: any) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Package size={36} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      No products found
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-[300px] text-center">
                      Try adjusting your filters or search terms to find what
                      you&apos;re looking for.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2.5 bg-[#47718F] text-white text-sm font-bold rounded-lg hover:bg-[#365870] transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#47718F] hover:text-white hover:border-[#47718F] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from(
                  { length: Math.min(pagination.totalPages, 7) },
                  (_, i) => {
                    let page: number;
                    if (pagination.totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= pagination.totalPages - 3) {
                      page = pagination.totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                          currentPage === page
                            ? "bg-[#47718F] text-white shadow-md"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.totalPages, currentPage + 1),
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#47718F] hover:text-white hover:border-[#47718F] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  return (
    <React.Suspense fallback={null}>
      <ProductsPageContent />
    </React.Suspense>
  );
};

export default ProductsPage;
