"use client";
import { ChevronRight, Wand, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ImagePlaceHolder from "../../../shared/components/image-placeholder";
import Input from "packages/components/input";
import ColorSelector from "packages/components/color-selector";
import CustomSpecifications from "packages/components/custom-specifications";
import CustomProperties from "packages/components/custom-properties";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import RichTextEditor from "packages/components/rich-text-editor";
import SizeSelector from "packages/components/size-selector";
import Image from "next/image";
import { enhancements } from "apps/seller-ui/src/utils/ai.enchancement";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

interface ProductForm {
  title: string;
  description: string;
  tags: string;
  warranty: string;
  slug: string;
  brand?: string;
  cash_on_delivery: string;
  category: string;
  subCategory: string;
  detailed_description: string;
  video_url?: string;
  regular_price: number;
  sale_price: number;
  stock: number;
  images: any[];
  colors: string[];
  sizes: string[];
  custom_specifications: any[];
  custom_properties: any[];
  discountCodes: string[];
}

const CreateProduct = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    defaultValues: {
      cash_on_delivery: "yes",
      images: [null],
      custom_specifications: [],
      custom_properties: [],
      colors: [],
      sizes: [],
      discountCodes: [],
      title: "",
      description: "",
      tags: "",
      warranty: "",
      slug: "",
      category: "",
      subCategory: "",
      detailed_description: "",
    },
  });

  const [processing, setProcessing] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log("Error while fetching Categories:", error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
  const { data: discountCodes = [], isLoading: isDiscountCodeLoading } =
    useQuery({
      queryKey: ["shop-discounts"],
      queryFn: async () => {
        try {
          const res = await axiosInstance.get(
            "/product/api/get-discount-codes",
          );
          return res?.data?.discount_codes || [];
        } catch (error) {
          console.log("Error while fetching discount codes:", error);
        }
      },
      staleTime: 1000 * 60 * 5,
      retry: 2,
    });

  const categories = data?.categories || [];

  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  // console.log(categories, subCategories);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-product", data);
      router.push("/dashboard/all-products");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.data?.message || "An error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const convertFiletoBAse64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadingLoader(true);
    try {
      const fileName = await convertFiletoBAse64(file);
      const response = await axiosInstance.post(
        "/product/api/upload-product-image",
        { fileName },
      );
      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };
      const updatedImages = [...images];

      updatedImages[index] = uploadedImage;
      if (index === images.length - 1 && images.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoader(false);
    }
  };
  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageTODelete = updatedImages[index];
      if (imageTODelete && typeof imageTODelete === "object") {
        await axiosInstance.delete("/product/api/delete-product-image", {
          data: { fileId: imageTODelete.fileId },
        });
      }
      updatedImages.splice(index, 1);
      if (!updatedImages.includes(null) && updatedImages.length < 8)
        updatedImages.push(null);
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {}
  };

  const applyTransformations = async (effect: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(effect);
    try {
      const baseUrl = selectedImage.split("?")[0];
      console.log(selectedImage, "selectedImage");
      console.log(baseUrl, "baseUrl");
      const tranformedUrl = `${baseUrl}?tr=${effect}`;
      setSelectedImage(tranformedUrl);
    } catch (error) {
      console.log("Error applying transformation", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDraft = () => {};

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white "
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading and BreadCrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>
      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* left side - Image Upload Section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              images={images}
              pictureUploadingLoader={pictureUploadingLoader}
              onImageChange={handleImageChange}
              setSelectedImage={setSelectedImage}
              onRemove={handleRemoveImage}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4 ">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                key={index + 1}
                setOpenImageModal={setOpenImageModal}
                size="150 x 150"
                small={true}
                index={index + 1}
                images={images}
                setSelectedImage={setSelectedImage}
                pictureUploadingLoader={pictureUploadingLoader}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Form Input */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product Title Input */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Product Description * (max 150 words)"
                  placeholder="Enter product description"
                  {...register("description", {
                    required: "Description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description must be less than 150 words (Currently ${wordCount} words)`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>
              {/* Tags */}
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="Apple, Flagship, iPhone"
                  {...register("tags", {
                    required: "separate related product tags with commas , ",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>
              {/* Warranty */}
              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1year / No Warranty"
                  {...register("warranty", {
                    required: "Warranty is required",
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>
              {/* Slug */}
              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product-slug-example"
                  {...register("slug", {
                    required: "Slug is required",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Slug can only contain lowercase letters, numbers, and hyphens",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug cannot exceed 50 characters",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>
              {/* Brand */}
              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple, Samsung, Xiaomi"
                  {...register("brand")}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Please select an option",
                  })}
                  defaultValue="yes"
                  className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400">Loading Categories...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load Categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{
                    required: "Category is required",
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                    >
                      <option value="" className="bg-black">
                        Select a Category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  SubCategory *
                </label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{
                    required: "subCategory is required",
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                    >
                      <option value="" className="bg-black">
                        Select a SubCategory
                      </option>
                      {subCategories?.map((subCategory: string) => (
                        <option
                          key={subCategory}
                          value={subCategory}
                          className="bg-black"
                        >
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed Description is required",
                    validate: (value) => {
                      if (!value || typeof value !== "string") return "Detailed Description is required";
                      
                      // Strip HTML tags and replace common entities
                      const cleanText = value
                        .replace(/<[^>]*>/g, " ")
                        .replace(/&nbsp;/g, " ")
                        .replace(/&amp;/g, "&")
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">")
                        .trim();
                        
                      const wordCount = cleanText
                        .split(/\s+/)
                        .filter((word) => word.length > 0).length;

                      return (
                        wordCount >= 100 ||
                        `Detailed description must be at least 100 words (Currently ${wordCount} words)`
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {(errors as any).detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {(errors as any).detailed_description.message}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        "Invalid Youtube Embed URL! use format: https://www.youtube.com/embed/xyz123",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="20$"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Regular Price must be at least 1",
                    },
                    validate: (value) =>
                      !isNaN(value) || "Regular Price must be a valid number",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price"
                  placeholder="20$"
                  {...register("sale_price", {
                    required: "Sale Price is required",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Sale Price must be at least 1",
                    },
                    validate: (value) => {
                      if (isNaN(value)) {
                        return "Sale Price must be a valid number";
                      }
                      if (regularPrice && value >= regularPrice) {
                        return "Sale Price must be less than Regular Price";
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="2300"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Stock must be at least 1",
                    },
                    max: {
                      value: 1000,
                      message: "Stock must be at most 1000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) {
                        return "Stock must be a valid number";
                      }
                      if (!Number.isInteger(value)) {
                        return "Stock must be a whole number";
                      }
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (Optional)
                </label>
                {isDiscountCodeLoading ? (
                  <p className="text-gray-400">Loading Discount Codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((discount: any) => (
                      <button
                        key={discount.id}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border
                    ${
                      watch("discountCodes")?.includes(discount.id)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                    }`}
                        onClick={() => {
                          const currentSelection = watch("discountCodes") || [];
                          const updatedSelection = currentSelection?.includes(
                            discount.id,
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== discount.id,
                              )
                            : [...currentSelection, discount.id];
                          setValue("discountCodes", updatedSelection);
                        }}
                      >
                        {discount?.public_name} ({discount.discountValue}
                        {discount.discountType === "percentage" ? " %" : " $"})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white ">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(false)}
              />
            </div>
            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-500">
              <Image
                src={selectedImage}
                alt="product-image"
                layout="fill"
                className="object-contain"
                unoptimized
              />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2 ">
                <h3 className="text-white text-sm font-semibold">
                  AI Enchancement
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                  {enhancements.map(({ label, effect }) => (
                    <button
                      key={effect}
                      onClick={() => applyTransformations(effect)}
                      disabled={processing}
                      className={`p-2 rounded-md flex items-center gap-2 ${
                        activeEffect === effect
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <Wand size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Save Draft Button */}
      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Save Draft
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Creating" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CreateProduct;
