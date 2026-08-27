"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Landing Page Components
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import UpcomingScrims from "@/components/home/UpcomingScrims";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/platform");
    }
  }, [user, loading, router]);

  // While loading authentication, show a neutral loading page to avoid flashing the landing page
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center font-mono text-sm text-muted-foreground animate-pulse">
          Loading A4esports...
        </div>
      </main>
    );
  }

  // If authenticated, render nothing (the useEffect will redirect to /platform)
  if (user) {
    return null;
  }

  // If not authenticated, render the landing page
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <UpcomingScrims />
      <Footer />
    </main>
  );
}