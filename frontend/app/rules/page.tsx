import { ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const sections = [
  {
    title: "General Conduct",
    rules: [
      "Every player must use their real, verified Free Fire UID for registration.",
      "Disrespectful behaviour toward organizers, casters, or other players is not tolerated.",
      "Organizer decisions on disputes are final.",
    ],
  },
  {
    title: "Fair Play",
    rules: [
      "Emulator players are not allowed unless a tournament explicitly states otherwise.",
      "Any use of hacks, mods, or exploits results in an immediate and permanent ban.",
      "Teaming with rival squads during a match is strictly prohibited.",
    ],
  },
  {
    title: "Match Day",
    rules: [
      "Room ID and password are typically released 15 minutes before the match.",
      "Teams must be online and ready 10 minutes before the scheduled start time.",
      "Internet or device issues during a match are the player's responsibility.",
      "Entry fees are non-refundable once a payment is confirmed.",
    ],
  },
  {
    title: "Registration",
    rules: [
      "One team name can only register once per tournament.",
      "Slots are allocated on a first-come, first-served basis.",
      "Providing false team or contact details may result in disqualification.",
    ],
  },
];

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <span className="font-mono text-xs uppercase tracking-widest text-cyan">
          Platform Guidelines
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase text-foreground">
          Rules &amp; Fair Play
        </h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          These rules apply across all A4 ESPORTS tournaments. Individual events may add extra rules on their tournament page.
        </p>

        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="border border-border bg-panel p-7">
              <h2 className="mb-5 font-display text-xl font-bold uppercase text-foreground">
                {section.title}
              </h2>
              <ul className="space-y-3 font-mono text-sm text-muted-foreground">
                {section.rules.map((rule, i) => (
                  <li key={i}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
