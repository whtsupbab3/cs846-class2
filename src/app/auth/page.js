"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      if (data.user) {
        router.replace("/");
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const cleanName = name.trim();
    const cleanPassword = password.trim();


    if (tab === "register") {
      if (!cleanName || !cleanUsername || !cleanPassword) {
        setError("Name, username, and password are required.");
        setLoading(false);
        return;
      }
    } else {
      if (!cleanUsername || !cleanPassword) {
        setError("Username and password are required.");
        setLoading(false);
        return;
      }
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cleanName,
        username: cleanUsername,
        password: cleanPassword,
        isRegister: tab === "register"
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Authentication failed");
      setLoading(false);
      return;
    }

    setName("");
    setUsername("");
    setPassword("");
    router.replace("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Microblog</h1>
          <p className="mt-2 text-slate-400">Share your thoughts in 180 characters.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950">
          <div className="flex border-b border-slate-800">
            <button
              className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                tab === "login"
                  ? "border-b-2 border-amber-400 text-amber-300"
                  : "text-slate-300 hover:text-slate-100"
              }`}
              onClick={() => {
                setTab("login");
                setError("");
              }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                tab === "register"
                  ? "border-b-2 border-amber-400 text-amber-300"
                  : "text-slate-300 hover:text-slate-100"
              }`}
              onClick={() => {
                setTab("register");
                setError("");
              }}
            >
              Create Profile
            </button>
          </div>

          <form className="space-y-4 px-6 py-8" onSubmit={handleSubmit}>
            {tab === "login" && (
              <>
                <div className="text-sm text-slate-300">
                  Sign in with your username and password to continue where you left off.
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase text-slate-400">Username</label>
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ada"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase text-slate-400">Password</label>
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                  />
                </div>
              </>
            )}

            {tab === "register" && (
              <>
                <div className="text-sm text-slate-300">
                  Create a profile to start posting and sharing ideas.
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Display Name
                  </label>
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ada Lovelace"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Username
                  </label>
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ada"
                  />
                  <p className="text-xs text-slate-500">Lowercase letters, numbers, and underscores only.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Password
                  </label>
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-lg border border-rose-800/50 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-300 px-4 py-2.5 font-semibold text-slate-900 transition hover:from-amber-300 hover:to-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Connecting..." : tab === "login" ? "Sign In" : "Create Profile"}
            </button>

            <p className="text-center text-xs text-slate-400">
              {tab === "login" ? "New here? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setTab(tab === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-amber-300 hover:text-amber-200"
              >
                {tab === "login" ? "Create a profile" : "Sign in"}
              </button>
            </p>
          </form>
        </div>

        <div className="mt-8 grid gap-4 text-center text-xs text-slate-400">
          <div className="h-px bg-slate-800"></div>
          <p>Global feed, real conversations, one level deep.</p>
        </div>
      </div>
    </main>
  );
}
