"use client";

import { useState, use } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/layout/AuthGuard";
import { getProjectSidebarItems } from "@/utils/constants";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const sidebarItems = getProjectSidebarItems(projectId);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarCollapsed(true)}
          items={sidebarItems}
        />
        <main
          className={`transition-all duration-300 ${sidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-60"
            }`}
        >
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
