"use client";

import { useState } from "react";

type Props = {
  value: string | null;
  onChange: (value: string) => void;
};

export default function PaymentQrField({ value, onChange }: Props) {
  const [error, setError] = useState("");

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 1024 * 1024) {
      setError("Choose a PNG, JPEG or WebP image smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setError("");
    };
    reader.onerror = () => setError("Could not read the QR image. Try another file.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3 rounded-lg border border-cyan/20 bg-cyan/5 p-4">
      <label className="block font-mono text-xs uppercase tracking-widest text-foreground">
        Payment QR for this lobby
      </label>
      <p className="font-mono text-xs text-muted-foreground">
        Upload a scanner for this lobby. Replacing it updates the payment page for pending registrations when they refresh.
      </p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        className="w-full border border-border bg-panel-2 p-2 font-mono text-xs text-foreground file:mr-3 file:border file:border-cyan/40 file:bg-cyan/10 file:px-3 file:py-1 file:text-cyan"
      />
      {error && <p role="alert" className="font-mono text-xs text-destructive">{error}</p>}
      {value ? (
        <div className="flex flex-wrap items-center gap-4">
          <img src={value} alt="Lobby payment QR preview" className="h-32 w-32 rounded-lg border border-border bg-white object-contain p-2" />
          <button
            type="button"
            onClick={() => { onChange(""); setError(""); }}
            className="border border-destructive/40 px-3 py-2 font-mono text-xs text-destructive transition hover:bg-destructive/10"
          >
            Remove QR image
          </button>
        </div>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          {value === null ? "This lobby currently uses the previous default payment details." : "No QR image selected."}
        </p>
      )}
      <p className="font-mono text-[11px] text-muted-foreground">Save the lobby settings to apply the change.</p>
    </div>
  );
}
