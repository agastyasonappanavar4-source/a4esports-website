"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
  "http://localhost:5000/api/auth/signup",
  {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Account created successfully!");

      router.replace("/login");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-orange-100 via-white to-orange-50 px-5 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}

        <div className="bg-linear-to-r from-orange-500 via-red-500 to-purple-600 p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Trophy size={42} />
          </div>

          <h1 className="text-3xl font-black">Create Account</h1>

          <p className="mt-2 text-white/90">
            Join India&apos;s fastest growing FF Scrims platform.
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

          {/* Username */}

          <label className="mb-2 block font-semibold">Username</label>

          <div className="mb-5 flex items-center rounded-2xl border px-4 transition focus-within:border-orange-500">
            <User className="text-gray-500" size={20} />

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-4 outline-none"
            />
          </div>

          {/* Email */}

          <label className="mb-2 block font-semibold">Email</label>

          <div className="mb-5 flex items-center rounded-2xl border px-4 transition focus-within:border-orange-500">
            <Mail className="text-gray-500" size={20} />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-4 outline-none"
            />
          </div>

          {/* Password */}

          <label className="mb-2 block font-semibold">Password</label>

          <div className="mb-5 flex items-center rounded-2xl border px-4 transition focus-within:border-orange-500">
            <Lock className="text-gray-500" size={20} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-4 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 transition hover:text-orange-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}

          <label className="mb-2 block font-semibold">
            Confirm Password
          </label>

          <div className="flex items-center rounded-2xl border px-4 transition focus-within:border-orange-500">
            <Lock className="text-gray-500" size={20} />

            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-4 outline-none"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="mt-8 text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-orange-500 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}