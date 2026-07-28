import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-panel py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 font-mono text-sm text-muted-foreground md:flex-row">
        <p>© 2026 A4esports. All rights reserved.</p>
        <div className="flex gap-6 uppercase tracking-widest text-xs">
          <Link href="/privacy" className="transition hover:text-cyan">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-cyan">
            Terms & Conditions
          </Link>
          <Link href="/contact" className="transition hover:text-cyan">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}