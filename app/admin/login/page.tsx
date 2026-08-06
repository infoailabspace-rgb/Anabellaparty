"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError("Nepareizs e-pasts vai parole.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-gold/25 bg-navy/40 p-8"
      >
        <h1 className="font-display text-2xl font-bold text-gold">
          Anabella admin
        </h1>
        <p className="mt-1 text-sm text-text/60">Pieteikumu pārvaldība</p>

        <label className="mt-6 block text-sm text-text/70">
          E-pasts
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gold/25 bg-bg/60 px-4 py-2.5 text-text outline-none focus:border-gold"
          />
        </label>
        <label className="mt-4 block text-sm text-text/70">
          Parole
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gold/25 bg-bg/60 px-4 py-2.5 text-text outline-none focus:border-gold"
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-gold px-6 py-2.5 font-semibold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Pieslēdzas…" : "Pieslēgties"}
        </button>
      </form>
    </main>
  );
}
