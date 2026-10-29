
"use client";

import Label from "@/components/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/features/auth/auth.service";
import { Button, Input } from "@heroui/react";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";

      setError(
        message.includes("Invalid login credentials")
          ? "Incorrect email or password. Please try again."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/40 sm:p-8">
        {/* Back navigation */}
        <Link
          href="/"
          className="mb-9 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#6844C7]"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6844C7]/10 text-[#6844C7]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              className="h-6 w-6"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10V7a4 4 0 018 0v3m-4 5v2"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back
          </h1>

          <p className="text-sm leading-6 text-gray-500">
            Sign in to access your ICT booking dashboard.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              className="mt-0.5 h-5 w-5 shrink-0"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Sign-in form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit();
          }}
        >
          <div className="space-y-5">
            <div>
              <Label>
                Email <span className="text-danger">*</span>
              </Label>

              <div className="mt-2">
                <Input
                  className="w-full"
                  type="email"
                  autoComplete="email"
                  placeholder="info@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>
                Password <span className="text-danger">*</span>
              </Label>

              <div className="relative mt-2">
                <Input
                  className="w-full"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-[#6844C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6844C7]"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeIcon className="fill-current" />
                  ) : (
                    <EyeCloseIcon className="fill-current" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#6844C7] font-medium text-white shadow-md shadow-purple-600/15 transition-colors hover:bg-[#5635A8]"
              size="lg"
              isDisabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-100 pt-5">
          <p className="text-center text-xs leading-5 text-gray-400">
            Secure access to your ICT booking management system.
          </p>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        Sistem Tempahan ICT
        <span className="mx-2 text-gray-300">•</span>
        Simple. Secure. Organized.
      </p>
    </div>
  );
}
