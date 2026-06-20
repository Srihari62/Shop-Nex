"use client";

import useSidebar from "@/hooks/useSidebar";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import useSeller from "@/hooks/useSeller";
import Logo from "@/assets/svgs/logo";
import SidebarItem from "./sidebar.item";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  HandCoins,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
} from "lucide-react";
import SidebarMenu from "./sidebar.menu";

const SideBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const router = useRouter();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/logout");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const getIconColor = (path: string) => {
    return activeSidebar === path ? "#0085ff" : "#969696";
  };
  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
        borderRight: "0.5px solid #1f2326",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<LayoutDashboard fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/accounts")}
                  />
                }
                isActive={activeSidebar === "/dashboard/orders"}
                href="/dashboard/orders"
              />
              <SidebarItem
                title="Payments"
                icon={
                  <HandCoins
                    size={24}
                    color={getIconColor("/dashboard/payments")}
                  />
                }
                isActive={activeSidebar === "/dashboard/payments"}
                href="/dashboard/payments"
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                icon={
                  <SquarePlus
                    size={24}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
                isActive={activeSidebar === "/dashboard/create-product"}
                href="/dashboard/create-product"
              />
              <SidebarItem
                title="All Products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
                isActive={activeSidebar === "/dashboard/all-products"}
                href="/dashboard/all-products"
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                icon={
                  <CalendarPlus
                    size={24}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
                isActive={activeSidebar === "/dashboard/create-event"}
                href="/dashboard/create-event"
              />
              <SidebarItem
                title="All Events"
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
                isActive={activeSidebar === "/dashboard/all-events"}
                href="/dashboard/all-events"
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                icon={
                  <Mail size={20} color={getIconColor("/dashboard/inbox")} />
                }
                isActive={activeSidebar === "/dashboard/inbox"}
                href="/dashboard/inbox"
              />
              <SidebarItem
                title="Settings"
                icon={
                  <Settings
                    size={20}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
                isActive={activeSidebar === "/dashboard/settings"}
                href="/dashboard/settings"
              />
              <SidebarItem
                title="Notifications"
                icon={
                  <BellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
                isActive={activeSidebar === "/dashboard/notifications"}
                href="/dashboard/notifications"
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                icon={
                  <TicketPercent
                    size={22}
                    color={getIconColor("/dashboard/discount-codes")}
                  />
                }
                isActive={activeSidebar === "/dashboard/discount-codes"}
                href="/dashboard/discount-codes"
              />
              <SidebarItem
                title="Logout"
                icon={
                  <LogOut size={20} color={getIconColor("/dashboard/logout")} />
                }
                onClick={handleLogout}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SideBarWrapper;
