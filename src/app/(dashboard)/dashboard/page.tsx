"use client";

import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl">
      {/* Welcome Card */}
      <div className="overflow-hidden rounded-2xl border border-card-border bg-card-bg shadow-sm">
        {/* Card Header with Logo */}
        <div className="flex items-center justify-center bg-navbar-bg px-4 py-6 sm:px-8 sm:py-8">
          <Logo width={150} height={40} className="sm:h-[48px] sm:w-[180px]" />
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 text-muted">
            You are logged in as{" "}
            <span className="font-medium text-primary">{user?.role}</span>
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-card-border p-4">
              <p className="text-sm text-muted">Role</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {user?.role}
              </p>
            </div>
            <div className="rounded-xl border border-card-border p-4">
              <p className="text-sm text-muted">Username</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {user?.username}
              </p>
            </div>
            <div className="rounded-xl border border-card-border p-4">
              <p className="text-sm text-muted">Status</p>
              <p className="mt-1 text-lg font-semibold text-green-600">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
