"use client";

import Navbar from "@/components/layout/Navbar";
import AuthGuard from "@/components/layout/AuthGuard";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
