"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface BackToHomeProps {
  className?: string;
  iconSize?: number;
}

export default function BackToHome({
  className = "mb-4 flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-cyan transition w-fit bg-panel/80 px-3 py-1.5 rounded-md border border-border",
  iconSize = 14,
}: BackToHomeProps) {
  const { user } = useAuth();

  return (
    <Link href={user ? "/platform" : "/"} className={className}>
      <ArrowLeft size={iconSize} />
      Back to Home
    </Link>
  );
}
