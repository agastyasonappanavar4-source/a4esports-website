import { Mail, MessageCircle, Clock3 } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <span className="font-mono text-xs uppercase tracking-widest text-cyan">
          Get In Touch
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase text-foreground">
          Contact Us
        </h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          Questions about a tournament, payment, or your registration? Reach out.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <a href="mailto:support@ffscrims.example" className="group border border-border bg-panel p-7 transition hover:border-ember/50">
            <Mail className="mb-4 h-8 w-8 text-ember" />
            <h2 className="font-display text-lg font-bold uppercase text-foreground">Email</h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">support@ffscrims.example</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Replies within 24 hours</p>
          </a>

          <a href="https://wa.me/910000000000" target="_blank" rel="noopener noreferrer" className="group border border-border bg-panel p-7 transition hover:border-cyan/50">
            <MessageCircle className="mb-4 h-8 w-8 text-cyan" />
            <h2 className="font-display text-lg font-bold uppercase text-foreground">WhatsApp</h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">Fastest way to reach the organizers</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">9 AM to 11 PM IST</p>
          </a>
        </div>

        <div className="mt-6 flex items-center gap-3 border border-border bg-panel p-6 font-mono text-sm text-muted-foreground">
          <Clock3 size={18} className="text-ember" />
          For match-day room ID issues, contact us at least 15 minutes before your scheduled match time.
        </div>
      </div>
    </main>
  );
}