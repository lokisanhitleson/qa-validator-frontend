"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const NAV_LINKS = [
  { label: "Projects", href: "/projects" },
  { label: "Users", href: "/users" },
  { label: "Settings", href: "/settings" },
];

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-navbar-bg px-4 shadow-md">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <Logo width={110} height={28} />
      </div>

      {/* Center: nav links (desktop) */}
      <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 sm:flex">
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right: mobile grid menu + user + logout */}
      <div className="flex items-center gap-4">
        {/* Mobile grid menu toggle */}
        <div ref={menuRef} className="relative sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 ${
              mobileMenuOpen ? "bg-white/15" : ""
            }`}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <rect width="4" height="4" rx="1" fill="currentColor" />
              <rect y="6" width="4" height="4" rx="1" fill="currentColor" />
              <rect y="12" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="6" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="6" y="6" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="6" y="12" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="12" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="12" y="6" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="12" y="12" width="4" height="4" rx="1" fill="currentColor" />
            </svg>
          </button>

          {/* Dropdown */}
          {mobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/10 bg-navbar-bg p-2 shadow-lg">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <span className="hidden text-sm text-white/70 sm:inline">
          {user?.name}
        </span>
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
          aria-label="Logout"
          title="Logout"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
