"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarItem } from "@/interfaces";

interface SidebarProps {
  isCollapsed: boolean;
  onClose: () => void;
  items: SidebarItem[];
}

const icons: Record<string, React.ReactNode> = {
  overview: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  requirements: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  ),
  "test-cases": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6l3 7H6L9 2z" />
      <path d="M6 9v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  traceability: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <line x1="9" y1="6" x2="15" y2="6" />
      <line x1="6" y1="9" x2="6" y2="15" />
      <line x1="18" y1="9" x2="18" y2="15" />
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
    </svg>
  ),
};

export default function Sidebar({ isCollapsed, onClose, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-sidebar-bg transition-all duration-300
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-60 translate-x-0"}
        `}
      >
        <nav className="flex flex-col gap-1 p-2 pt-4">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "lg:justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{icons[item.icon]}</span>
                {isCollapsed ? (
                  <span className="lg:hidden">{item.label}</span>
                ) : (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
