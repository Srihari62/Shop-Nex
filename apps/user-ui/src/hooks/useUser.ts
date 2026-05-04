import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import axiosInstance from "../utils/axiosInstance";
import useAuthStore from "../store/authStore";
import { isProtected } from "../utils/protected";

//fetch user data from api

const fetchUSer = async (isLoggedIn: boolean) => {
  const config = isLoggedIn ? isProtected : {};
  const response = await axiosInstance.get("/api/logged-in-user", config);

  return response.data.user;
};

const useUser = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();
  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["user", isLoggedIn],
    queryFn: () => fetchUSer(isLoggedIn),
    staleTime: 1000 * 6 * 5,
    retry: false,
  });

  useEffect(() => {
    if (user && !isLoggedIn) {
      setLoggedIn(true);
    } else if (isError && isLoggedIn) {
      setLoggedIn(false);
    }
  }, [user, isError, isLoggedIn, setLoggedIn]);

  return { user: user as any, isLoading: isPending, isError };
};


export default useUser;

