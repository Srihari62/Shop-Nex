import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Package,
  Calendar,
  Users,
  Store,
  Terminal,
  Settings,
  Bell,
  Palette,
  LogOut,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
    ],
  },
  {
    title: "Main Menu",
    items: [
      {
        name: "Orders",
        icon: ShoppingCart,
        path: "/dashboard/orders",
      },
      {
        name: "Payments",
        icon: CreditCard,
        path: "/dashboard/payments",
      },
      {
        name: "Products",
        icon: Package,
        path: "/dashboard/products",
      },
      {
        name: "Events",
        icon: Calendar,
        path: "/dashboard/events",
      },
      {
        name: "Users",
        icon: Users,
        path: "/dashboard/users",
      },
      {
        name: "Sellers",
        icon: Store,
        path: "/dashboard/sellers",
      },
    ],
  },
  {
    title: "Controllers",
    items: [
      {
        name: "Loggers",
        icon: Terminal,
        path: "/dashboard/loggers",
      },
      {
        name: "Management",
        icon: Settings,
        path: "/dashboard/management",
      },
      {
        name: "Notifications",
        icon: Bell,
        path: "/dashboard/notifications",
      },
    ],
  },
  {
    title: "Customization",
    items: [
      {
        name: "All Customization",
        icon: Palette,
        path: "/dashboard/customization",
      },
    ],
  },
  {
    title: "Extras",
    items: [
      {
        name: "Logout",
        icon: LogOut,
        path: "/logout",
      },
    ],
  },
];
