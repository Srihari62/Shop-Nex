import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

const fetchAdmin = async () => {
  const response: any = await axiosInstance.get("/api/logged-in-admin");
  return response.data.admin;
};

const useAdmin = () => {
  const {
    data: admin,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin"],
    queryFn: fetchAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  return { admin, isLoading, isError, refetch };
};

export default useAdmin;
