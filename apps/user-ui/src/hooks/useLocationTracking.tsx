"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const LOCATION_STORAGE_KEY = "user_location";
const LOACTION_EXPIRY_DAYS = 20;

const getStoredLocation = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!stored) return null;


  try {
    const parsedData = JSON.parse(stored);
    const expiry = LOACTION_EXPIRY_DAYS * 24 * 60 * 60 * 1000; //20 days in ms
    const isExpired = Date.now() - parsedData.timestamp > expiry;
    return isExpired ? null : parsedData;
  } catch (error) {
    console.error("Error parsing stored location", error);
    return null;
  }
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<{
    country: string;
    city: string;
    timestamp: number;
  } | null>(getStoredLocation());
  useEffect(() => {
    if (location) return;

    const fetchLocation = async () => {
      try {
        const response = await axiosInstance.get("https://ip-api.com/json");
        const { country, city } = response.data;
        setLocation({ country, city, timestamp: Date.now() });
        localStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify({
            country,
            city,
            timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error fetching location", error);
      }
    };
  }, []);
  return location;
};

export default useLocationTracking;
