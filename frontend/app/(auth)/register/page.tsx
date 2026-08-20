"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-tactical-grid px-4 py-8">
      <div className="text-center font-mono text-sm text-muted-foreground animate-pulse">
        Redirecting to login...
      </div>
    </main>
  );
}
