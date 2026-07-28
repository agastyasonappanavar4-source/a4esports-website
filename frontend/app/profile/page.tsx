"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Trophy, LogOut, ArrowLeft, Home, Edit3, Shield, KeyRound, Phone, Gamepad2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getMyRegistrations, type MyRegistration } from "@/services/registrations";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AVATAR_PRESETS = [
  "🔥", "⚔️", "🎯", "👑", "⚡", "🎮", "🐺", "🐉", "💀", "🛡️"
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Profile Form States
  const [username, setUsername] = useState("");
  const [inGameName, setInGameName] = useState("");
  const [uid, setUid] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?next=/profile");
    }
    if (user) {
      setUsername(user.username || "");
      setInGameName(user.inGameName || "");
      setUid(user.uid || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "🔥");
      getMyRegistrations().then(setRegistrations).catch(() => setRegistrations([]));
    }
  }, [loading, user, router]);

  const handleSaveProfile = async () => {
    setUpdating(true);
    try {
      await updateProfile({
        username,
        inGameName,
        uid,
        phone,
        avatar,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      showToast("Profile updated successfully!", "success");
      setEditing(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update profile.", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Loading profile...</p>
      </main>
    );
  }

  const confirmedCount = registrations.filter(
    (r) => r.paymentStatus === "PAID" || r.scrim.fee === 0
  ).length;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 border border-border bg-panel px-4 py-2 font-mono text-xs sm:text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 border border-cyan/40 bg-cyan/10 px-4 py-2 font-mono text-xs sm:text-sm font-semibold uppercase text-cyan transition hover:bg-cyan/20"
          >
            <Edit3 size={16} />
            {editing ? "Cancel Editing" : "Customize Profile"}
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="border border-border bg-panel p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-ember font-display text-4xl font-bold text-void [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))] shadow-lg">
              {user.avatar || user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-foreground truncate">
                  {user.username}
                </h1>
                {user.isAdmin && (
                  <span className="border border-ember bg-ember/10 px-2 py-0.5 font-mono text-[10px] uppercase text-ember font-bold">
                    Admin
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
              
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-3 font-mono text-xs text-muted-foreground">
                {user.inGameName && (
                  <span className="flex items-center gap-1 text-cyan border border-border px-2.5 py-1 bg-panel-2">
                    <Gamepad2 size={13} /> IGN: {user.inGameName}
                  </span>
                )}
                {user.uid && (
                  <span className="flex items-center gap-1 text-amber border border-border px-2.5 py-1 bg-panel-2">
                    UID: {user.uid}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="border border-border bg-panel p-5 text-center">
            <Trophy className="mx-auto mb-2 h-6 w-6 text-amber" />
            <p className="font-mono text-xl sm:text-2xl font-semibold text-foreground">{registrations.length}</p>
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
              Joined Scrims
            </p>
          </div>
          <div className="border border-border bg-panel p-5 text-center">
            <Shield className="mx-auto mb-2 h-6 w-6 text-cyan" />
            <p className="font-mono text-xl sm:text-2xl font-semibold text-foreground">{confirmedCount}</p>
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
              Confirmed Slots
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 border border-border bg-panel p-5 text-center">
            <Mail className="mx-auto mb-2 h-6 w-6 text-ember" />
            <p className="break-all font-mono text-xs sm:text-sm font-semibold text-foreground truncate">{user.email}</p>
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
              Account Email
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        {editing ? (
          <div className="mt-6 border border-cyan/40 bg-panel p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-xl font-bold uppercase text-foreground flex items-center gap-2">
              <Edit3 size={20} className="text-cyan" /> Edit Profile & In-Game Info
            </h2>

            {/* Avatar Select */}
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Select Profile Avatar Badge
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`h-10 w-10 text-xl flex items-center justify-center border transition ${
                      avatar === emoji
                        ? "border-cyan bg-cyan/20 scale-110"
                        : "border-border bg-panel-2 hover:border-cyan"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Free Fire In-Game Name (IGN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SK_SABIR_07"
                  value={inGameName}
                  onChange={(e) => setInGameName(e.target.value)}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Free Fire Player UID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-display text-base font-bold uppercase text-foreground flex items-center gap-2">
                <KeyRound size={16} className="text-ember" /> Change Password (Optional)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={updating}
                className="btn-press flex-1 bg-ember py-3.5 font-display text-base font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50"
              >
                {updating ? "Saving Changes..." : "Save Profile"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="border border-border px-6 py-3.5 font-mono text-xs uppercase text-muted-foreground transition hover:border-cyan hover:text-cyan"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 border border-border bg-panel p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-lg font-bold uppercase text-foreground">
              Profile Summary
            </h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Username</span>
                <span className="text-foreground font-semibold">{user.username}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">In-Game Name</span>
                <span className="text-cyan font-semibold">{user.inGameName || "Not set"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Player UID</span>
                <span className="text-amber font-semibold">{user.uid || "Not set"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Phone</span>
                <span className="text-foreground">{user.phone || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Email</span>
                <span className="text-foreground">{user.email}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 border border-destructive/40 bg-destructive/10 py-3.5 font-display font-bold uppercase text-destructive transition hover:bg-destructive/20"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <Footer />
    </main>
  );
}