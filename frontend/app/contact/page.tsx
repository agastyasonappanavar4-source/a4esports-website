import { Mail, MessageCircle, Clock3 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
  </svg>
);

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <span className="font-mono text-xs uppercase tracking-widest text-cyan">
          Get In Touch
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase text-foreground">
          Contact Us
        </h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          Questions about a tournament, payment, or your registration? Reach out.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <a href="mailto:a4esportsindia@gmail.com" className="group border border-border bg-panel p-7 transition hover:border-ember/50">
            <Mail className="mb-4 h-8 w-8 text-ember" />
            <h2 className="font-display text-lg font-bold uppercase text-foreground">Email</h2>
            <p className="mt-2 break-all font-mono text-sm text-muted-foreground">a4esportsindia@gmail.com</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Replies within 24 hours</p>
          </a>

          <a href="https://whatsapp.com/channel/0029VbDE3Kk8fewlNG9cAQ1V" target="_blank" rel="noopener noreferrer" className="group border border-border bg-panel p-7 transition hover:border-cyan/50">
            <MessageCircle className="mb-4 h-8 w-8 text-cyan" />
            <h2 className="font-display text-lg font-bold uppercase text-foreground">WhatsApp Channel</h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">Join our official WhatsApp channel for announcements</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Fast updates & room releases</p>
          </a>

          <a href="https://discord.gg/Jm5DWuNCH" target="_blank" rel="noopener noreferrer" className="group border border-border bg-panel p-7 transition hover:border-indigo-500/50">
            <DiscordIcon className="mb-4 h-8 w-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <h2 className="font-display text-lg font-bold uppercase text-foreground">Discord Server</h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">Connect with other players and join queries lobby</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">24/7 community support</p>
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
