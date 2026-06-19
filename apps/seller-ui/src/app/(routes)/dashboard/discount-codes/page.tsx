"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { ChevronRight, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import Input from "@packages/components/input";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DeleteDiscountCodeModal from "../../../shared/components/modals/delete.discount-codes";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-discount-codes");
        return res?.data?.discount_codes || [];
      } catch (error) {
        console.log("Error while fetching discount codes:", error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/product/api/create-discount-code", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModal(false);
    },
    onError: (error) => {
      console.log("Error while creating discount code:", error);
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId: string) => {
      await axiosInstance.delete(
        `/product/api/delete-discount-code/${discountId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      setShowDeleteModal(false);
    },
    onError: (error) => {
      console.log("Error while deleting discount code:", error);
    },
  });

  const handleDeleteClick = async (discount: any) => {
    setShowDeleteModal(true);
    setSelectedDiscount(discount);
  };

  const onsubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create 8 discount codes!");
      return;
    }
    createDiscountCodeMutation.mutate(data);
    setShowModal(false);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1 ">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          Create Discount Code
        </button>
      </div>
      {/* BreadCrumb */}
      <div className="flex items-center text-white">
        <Link href="/dashboard" className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg ">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className="text-gray-400 text-center ">Loading Discounts</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left ">Title</th>
                <th className="p-3 text-left ">Type</th>
                <th className="p-3 text-left ">Value</th>
                <th className="p-3 text-left ">Code</th>
                <th className="p-3 text-left ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes?.map((discount: any) => (
                <tr
                  key={discount?.id}
                  className="border-b border-gray-700 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{discount?.public_name}</td>
                  <td className="p-3 capitalize">
                    {discount?.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Flat ($)"}
                  </td>
                  <td className="p-3 capitalize">
                    {discount?.discountType === "percentage"
                      ? `${discount?.discountValue}%`
                      : `$${discount?.discountValue}`}
                  </td>
                  <td className="p-3">{discount?.discountCode}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteClick(discount)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {discountCodes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    No Discount Codes Available!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* create discount modal */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
              <h3 className="text-white text-2xl font-semibold">
                Create Discount Code
              </h3>
              <X
                className="text-gray-400 hover:text-white"
                size={22}
                onClick={() => setShowModal(false)}
              />
            </div>
            <form onSubmit={handleSubmit(onsubmit)} className="mt-4">
              {/* Title */}
              <Input
                label="Title (Public Name)"
                {...register("public_name", { required: "Title is required" })}
              />
              {errors.public_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.public_name.message}
                </p>
              )}
              {/*Discount Type */}
              <div className="mt-4">
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  rules={{ required: "Discount Type is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white bg-gray-600"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount ($) </option>
                    </select>
                  )}
                />
              </div>

              {/* Discount Value */}
              <div className="mt-2">
                <Input
                  label="Discount Value"
                  type="number"
                  min={1}
                  placeholder="Enter discount value"
                  {...register("discountValue", {
                    required: "Discount Value is required",
                  })}
                />
              </div>

              {/* Discount Code */}
              <div className="mt-2">
                <Input
                  label="Discount Code"
                  placeholder="Enter discount code"
                  {...register("discountCode", {
                    required: "Discount Code is required",
                  })}
                />
              </div>

              {/* submit buttons */}
              <div className="flex items-center justify-end mt-6">
                <button
                  type="submit"
                  disabled={createDiscountCodeMutation.isPending}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 font-semibold text-white flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer"
                >
                  <Plus size={18} />
                  {createDiscountCodeMutation.isPending
                    ? "Creating..."
                    : "Create Discount Code"}
                </button>
                {createDiscountCodeMutation.isError && (
                  <p className="text-red-500 text-xs mt-2">
                    {(
                      createDiscountCodeMutation.error as AxiosError<{
                        message: string;
                      }>
                    )?.response?.data?.message || "Something Went Wrong"}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() =>
            deleteDiscountCodeMutation.mutate(selectedDiscount?.id)
          }
        />
      )}
    </div>
  );
};

export default Page;
