import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

const fetchSellerShop = async () => {
  const response = await axiosInstance.get("/product/api/get-seller-shop");
  return response.data.shop;
};

const useSellerShop = () => {
  const {
    data: shop,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: fetchSellerShop,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return { shop, isLoading, isError, refetch };
};

export default useSellerShop;
