import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/layout/BackToHome";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <div className="mx-auto w-full max-w-4xl px-5 py-10">
        <BackToHome
          className="mb-6 inline-flex items-center gap-2 border border-border bg-panel px-4 py-2 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
          iconSize={16}
        />

        <div className="border border-border bg-panel p-6 sm:p-10 space-y-6">
          <div className="border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-cyan h-8 w-8" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-foreground">
                Privacy Notice
              </h1>
            </div>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Last updated: July 24, 2026 · A4 ESPORTS
            </p>
          </div>

          <p className="font-mono text-sm leading-relaxed text-muted-foreground">
            This Privacy Notice for <strong>A4 ESPORTS</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you visit or interact with our platform.
          </p>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">Summary of Key Points</h2>
            <ul className="list-disc list-inside space-y-2 font-mono text-sm text-muted-foreground">
              <li><strong>Personal Information:</strong> We process information like username, email, phone number, and in-game details when you voluntarily register on our platform.</li>
              <li><strong>Sensitive Data:</strong> We do not process sensitive personal information.</li>
              <li><strong>Third Parties:</strong> Information is only shared for necessary operational, security, legal, or transaction fulfillment reasons.</li>
              <li><strong>Contact:</strong> For questions or exercising your data rights, contact us at <a href="mailto:a4esportsindia@gmail.com" className="text-cyan underline">a4esportsindia@gmail.com</a>.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">1. Information We Collect</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              We collect personal information that you voluntarily provide to us when you create an account, register for tournaments, or communicate with us. Automatically collected information includes standard log details like IP address, browser type, and device characteristics for security and operational monitoring.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">2. How We Process Your Information</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              We process information to facilitate account authentication, manage tournament registrations, deliver custom match details, send notifications, prevent fraud, and comply with applicable laws.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">3. Social Logins & Third Parties</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              If you register or log in using third-party services like Google, we process your account profile details (such as email, name, and profile picture) to simplify your access to A4 ESPORTS.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">4. Contact Us</h2>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              If you have any questions or feedback about this notice, reach out to us at:
            </p>
            <div className="border border-border bg-panel-2 p-4 font-mono text-sm text-foreground">
              <p className="font-bold">A4 ESPORTS Support</p>
              <p className="text-cyan">Email: a4esportsindia@gmail.com</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
