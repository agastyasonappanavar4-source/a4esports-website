"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(`Welcome back ${data.user.username}!`);

      router.push("/");
      router.refresh();

    } catch (error) {
      console.error(error);
      alert("Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-orange-100 via-white to-orange-50 px-5 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="bg-linear-to-r from-orange-500 via-red-500 to-purple-600 p-8 text-center text-white">

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Trophy size={42} />
          </div>

          <h1 className="text-3xl font-black">
            Welcome Back
          </h1>

          <p className="mt-2 text-white/90">
            Login to continue your scrim journey.
          </p>

        </div>

        <div className="p-8">

          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-gray-600 transition hover:text-orange-500"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <label className="mb-2 block font-semibold">
            Email
          </label>

          <div className="mb-6 flex items-center rounded-2xl border px-4 transition focus-within:border-orange-500">

            <Mail className="text-gray-500" size={20} />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 outline-none"
            />

          </div>

          <label className="mb-2 block font-semibold">
            Password
          </label>

          <div className="flex items-center rounded-2xl border px-4 transition focus-within:border-orange-500">

            <Lock className="text-gray-500" size={20} />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-orange-500"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

          <div className="mt-3 flex justify-between">

            <span className="text-sm text-gray-500">
              Secure Login
            </span>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-orange-500 hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-orange-600 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          <div className="my-8 flex items-center">

            <div className="h-px flex-1 bg-gray-200" />

            <span className="mx-4 text-sm font-semibold text-gray-400">
              OR
            </span>

            <div className="h-px flex-1 bg-gray-200" />

          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center">

            <h3 className="text-lg font-bold">
              New to FF SCRIMS?
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Create your account to register for tournaments, track your matches and manage your profile.
            </p>

            <Link href="/register">

              <button className="mt-5 w-full rounded-2xl border-2 border-orange-500 py-3 font-bold text-orange-500 transition hover:bg-orange-500 hover:text-white">
                Create Account
              </button>

            </Link>

          </div>

          <div className="mt-8 text-center text-sm text-gray-500">

            By logging in you agree to our{" "}

            <Link
              href="/rules"
              className="font-semibold text-orange-500 hover:underline"
            >
              Tournament Rules
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}