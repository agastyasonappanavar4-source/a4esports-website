import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-black">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white">
          FF SCRIMS
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 text-white md:flex">
          <Link href="/">Home</Link>
          <Link href="/scrims">Scrims</Link>
          <Link href="/tournaments">Tournaments</Link>
          <Link href="/leaderboard">Leaderboard</Link>
        </div>

        {/* Login Button */}
        <Button>Login</Button>
      </div>
    </nav>
  );
}