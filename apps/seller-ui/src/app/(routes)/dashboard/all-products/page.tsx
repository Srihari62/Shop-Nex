"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";

import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import DeleteConfirmationModal from "../../../shared/components/modals/delete.confirmation.modal";

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res?.data?.products;
};
const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`);
};
const restoreProduct = async (productId: string) => {
  await axiosInstance.put(`/product/api/restore-product/${productId}`);
};
const ProducList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          const imageUrl =
            row.original.images?.[0]?.url || "https://via.placeholder.com/150";
          return (
            <Image
              src={imageUrl}
              alt={row.original.title || "Product Image"}
              width={48}
              height={48}
              className="w-12 h-12 rounded-md object-cover"
              unoptimized
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? row.original.title.slice(0, 25) + "..."
              : row.original.title;
          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-indigo-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => {
          return <span>${row.original.sale_price}</span>;
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => {
          return (
            <span
              className={
                row.original.stock < 10 ? "text-red-500" : "text-gray-300"
              }
            >
              {row.original.stock} left
            </span>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => {
          return <span className="text-gray-300">{row.original.category}</span>;
        },
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => {
          return (
            <div className="flex items-center gap-1">
              <Star fill="#fde047" className="text-yellow-400" size={16} />{" "}
              <span className="text-gray-300">{row.original.ratings || 5}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-4">
              <Link
                href={`/product/${row.original.id}`}
                className="text-indigo-400 hover:text-indigo-300 transition"
              >
                <Eye size={16} />
              </Link>
              <Link
                href={`/product/edit/${row.original.id}`}
                className="text-yellow-400 hover:text-yellow-300 transition"
              >
                <Pencil size={16} />
              </Link>
              <button className="text-green-400 hover:text-green-300 transition">
                <BarChart size={16} />
              </button>
              {row.original.isDeleted ? (
                <button
                  className="text-green-400 hover:text-green-300 transition"
                  onClick={() => openDeleteModal(row.original)}
                  title="Restore Product"
                >
                  <RefreshCcw size={16} />
                </button>
              ) : (
                <button
                  className="text-red-400 hover:text-red-300 transition"
                  onClick={() => openDeleteModal(row.original)}
                  title="Delete Product"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });
  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full mx-auto p-8 bg-[#0B0A10] min-h-screen text-white font-sans">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">All Products</h2>
          <div className="flex items-center text-sm text-[#8c8c9e]">
            <Link
              href="/dashboard"
              className="hover:text-indigo-400 transition"
            >
              Dashboard
            </Link>
            <ChevronRight size={14} className="mx-1" />
            <span className="text-gray-400">All Products</span>
          </div>
        </div>
        <Link
          href="/dashboard/create-product"
          className="flex items-center gap-2 bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white font-medium px-4 py-2 rounded-md transition"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="mb-6 relative w-full bg-[#181824] rounded-lg">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </div>
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="bg-transparent border border-transparent text-gray-300 text-sm rounded-lg focus:ring-1 focus:ring-[#6c5ce7] block w-full pl-11 p-3.5 outline-none transition-all placeholder-gray-500"
          placeholder="Search products..."
        />
      </div>

      <div className="overflow-x-auto rounded-lg bg-[#181824] shadow-sm">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-white font-semibold bg-[#181824] border-b border-[#2d2d3f]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-5 whitespace-nowrap">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#2d2d3f]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  Loading products...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-gray-400"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-transparent hover:bg-[#1f1f33] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
        />
      )}
    </div>
  );
};

export default ProducList;
