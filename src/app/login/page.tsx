"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { APP_NAME } from "@/utils/constants";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    const errorMsg = login({ username, password });
    if (errorMsg) {
      setError(errorMsg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl border border-card-border bg-card-bg p-8 shadow-lg">
          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-16 w-48 items-center justify-center rounded-xl bg-navbar-bg px-4">
              <Logo width={130} height={34} />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {APP_NAME}
            </h1>
            <p className="text-sm text-muted">
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Username"
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth className="mt-2">
              Login
            </Button>
          </form>

          {/* Demo Hint */}
          <p className="mt-6 text-center text-xs text-muted">
            Demo credentials: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
