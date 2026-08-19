import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <div className="mx-auto w-full max-w-4xl px-5 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 border border-border bg-panel px-4 py-2 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="border border-border bg-panel p-6 sm:p-10 space-y-6">
          <div className="border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <ScrollText className="text-ember h-8 w-8" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-foreground">
                Terms & Conditions
              </h1>
            </div>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              A4 ESPORTS Legal Terms & Conditions
            </p>
          </div>

          <p className="font-mono text-sm leading-relaxed text-muted-foreground">
            By accessing or using the services provided by <strong>A4 ESPORTS</strong>, you agree to be bound by these Legal Terms and Conditions. Please read them carefully.
          </p>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">1. Eligibility & User Conduct</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              You must adhere to competitive gaming integrity. Cheating, hacking, use of unauthorized third-party scripts/emulators (where forbidden by tournament rules), or offensive behavior will lead to an immediate ban and forfeiture of tournament eligibility.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">2. Tournament & Room Rules</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              Room ID and passwords are provided prior to match start times. Participants are expected to join their assigned slots on time. A4 ESPORTS reserves the right to modify tournament schedules or rules to ensure fair play.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">3. Social Media & Content License</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              By participating in matches, streaming, or submitting match highlights, you grant A4 ESPORTS a non-exclusive license to display non-sensitive tournament footage and leaderboards for promotional and platform purposes.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">4. Governing Law</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              These Legal Terms shall be governed by and defined following the laws of India. Courts of India shall have exclusive jurisdiction regarding any dispute.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">5. Contact</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              For any queries regarding legal terms and platform rules, reach out to <a href="mailto:support@a4esports.in" className="text-cyan underline">support@a4esports.in</a>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
