"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/layout/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarCollapsed(true)}
        />
        <main
          className={`pt-16 transition-all duration-300 ${
            sidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-60"
          }`}
        >
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
