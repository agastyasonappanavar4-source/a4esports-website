export default function Footer() {
  return (
    <footer className="border-t border-border bg-panel py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 font-mono text-sm text-muted-foreground md:flex-row">
        <p>© 2026 FF Scrims. All rights reserved.</p>
        <div className="flex gap-6 uppercase tracking-widest text-xs">
          <a href="#" className="transition hover:text-cyan">Privacy</a>
          <a href="#" className="transition hover:text-cyan">Terms</a>
          <a href="#" className="transition hover:text-cyan">Contact</a>
        </div>
      </div>
    </footer>
  );
}