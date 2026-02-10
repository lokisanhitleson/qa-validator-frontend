import { SidebarItem } from "@/interfaces";

export const APP_NAME = "QA Validator";

export const ZENSAR_LOGO_URL =
  "https://images.ctfassets.net/bjl3f17nyta4/6IUeLrHvOQVPUxczuwnpG6/0b21114df102b72adf6e79d941c05e3b/zensar-logo-white.svg";

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Analytics", href: "/analytics", icon: "analytics" },
  { label: "Reports", href: "/reports", icon: "reports" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export const HARDCODED_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export const DEFAULT_USER = {
  username: "admin",
  name: "Admin User",
  role: "Administrator",
};
