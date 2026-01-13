"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const CHAR_LIMIT = 180;

const formatTime = (value) => {
  const ts = typeof value === "number" ? value : new Date(value).getTime();
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [draft, setDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [posts, setPosts] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [status, setStatus] = useState("");

  const usernames = useMemo(() => {
    const unique = new Map();
    posts.forEach((p) => {
      if (!unique.has(p.author.username)) {
        unique.set(p.author.username, p.author);
      }
    });
    return Array.from(unique.values());
  }, [posts]);

  const remaining = CHAR_LIMIT - draft.length;

  const loadUser = async () => {
    const res = await fetch("/api/me", { cache: "no-store" });
    const data = await res.json();
    setLoadingUser(false);
    if (!data.user) {
      router.push("/auth");
      return;
    }
    setCurrentUser(data.user);
  };

  const loadFeed = async (username = activeProfile) => {
    setLoadingFeed(true);
    const query = username ? `?username=${encodeURIComponent(username)}` : "";
    const res = await fetch(`/api/feed${query}`, { cache: "no-store" });
    const data = await res.json();
    setPosts(data.posts || []);
    setLoadingFeed(false);
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadFeed(activeProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile, currentUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/auth");
  };

  const handlePost = async () => {
    if (!currentUser) return;
    const content = draft.trim();
    if (!content || content.length > CHAR_LIMIT) return;
    setStatus("");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error || "Could not post");
      return;
    }
    setDraft("");
    loadFeed();
  };

  const toggleLike = async (postId) => {
    if (!currentUser) return;
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    loadFeed();
  };

  const handleReply = async (postId) => {
    if (!currentUser) return;
    const content = (replyDrafts[postId] || "").trim();
    if (!content || content.length > CHAR_LIMIT) return;
    const res = await fetch(`/api/posts/${postId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error || "Could not reply");
      return;
    }
    setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
    loadFeed();
  };

  const handleProfileFilter = (username) => {
    setActiveProfile((prev) => (prev === username ? null : username));
  };

  if (loadingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-amber-400"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-lg shadow-slate-950/50">
        <div>
          <h1 className="text-2xl font-bold">Microblog</h1>
        </div>
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2 text-sm">
              <p className="font-semibold">{currentUser.name}</p>
                <p className="text-slate-300">@{currentUser.username}</p>
            </div>
            <button
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-400 hover:text-amber-200"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}
      </header>

      {status && (
        <div className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
          {status}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Compose</h2>
              <span className={`text-sm ${remaining < 0 ? "text-rose-300" : "text-slate-400"}`}>
                {remaining}
              </span>
            </div>
            <textarea
              className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-slate-100 focus:border-amber-400 focus:outline-none"
              rows={3}
              maxLength={260}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={currentUser ? "Share something short..." : "Login to post"}
              disabled={!currentUser}
            />
            <div className="mt-3 flex justify-end">
              <button
                className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                onClick={handlePost}
                disabled={!currentUser || !draft.trim() || draft.length > CHAR_LIMIT}
              >
                Post
              </button>
            </div>
            {!currentUser && <p className="mt-2 text-sm text-slate-400">Login to post updates and replies.</p>}
          </div>

          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold">Feed</h2>
            {activeProfile && (
              <button
                className="text-sm text-amber-300 underline underline-offset-4"
                onClick={() => setActiveProfile(null)}
              >
                Clear profile filter
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {loadingFeed && (
              <p className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 px-4 py-6 text-center text-slate-300">
                Loading feed...
              </p>
            )}
            {!loadingFeed && posts.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 px-4 py-6 text-center text-slate-300">
                No posts yet. Be the first to drop an update.
              </p>
            )}
            {!loadingFeed &&
              posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          className="font-semibold hover:text-amber-300 cursor-pointer"
                          href={`/users/${post.author.username}`}
                        >
                          {post.author.name}
                        </a>
                        <a
                          className="text-slate-400 hover:text-amber-300 cursor-pointer"
                          href={`/users/${post.author.username}`}
                        >
                          @{post.author.username}
                        </a>
                        <span className="text-sm text-slate-500">• {formatTime(post.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-slate-100">{post.content}</p>
                    </div>
                    <button
                      className={`rounded-full px-3 py-1 text-sm font-semibold transition ${post.likes.some((l) => l.userId === currentUser?.id) ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-100"}`}
                      onClick={() => toggleLike(post.id)}
                      disabled={!currentUser}
                    >
                      ♥ {post.likes.length}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    {post.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            className="text-sm font-semibold hover:text-amber-300"
                            onClick={() => handleProfileFilter(reply.author.username)}
                          >
                            {reply.author.name}
                          </button>
                          <span className="text-xs text-slate-400">@{reply.author.username}</span>
                          <span className="text-xs text-slate-500">• {formatTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-100">{reply.content}</p>
                        <button
                          className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition ${reply.likes.some((l) => l.userId === currentUser?.id) ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-100"}`}
                          onClick={() => toggleLike(reply.id)}
                          disabled={!currentUser}
                        >
                          ♥ {reply.likes.length}
                        </button>
                      </div>
                    ))}

                    <div className="mt-1 flex flex-col gap-2">
                      <textarea
                        className="w-full resize-none rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
                        rows={2}
                        maxLength={260}
                        value={replyDrafts[post.id] || ""}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder={currentUser ? "Reply..." : "Login to reply"}
                        disabled={!currentUser}
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{CHAR_LIMIT - (replyDrafts[post.id]?.length || 0)} left</span>
                        <button
                          className="rounded-md bg-slate-800 px-3 py-1 font-semibold text-slate-100 transition hover:bg-amber-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                          onClick={() => handleReply(post.id)}
                          disabled={!currentUser || !(replyDrafts[post.id] || "").trim() || (replyDrafts[post.id] || "").length > CHAR_LIMIT}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
            <h3 className="text-lg font-semibold">Profiles</h3>
            <p className="text-sm text-slate-400">Tap a name to view their posts.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {usernames.map((profile) => (
                <button
                  key={profile.username}
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition ${activeProfile === profile.username ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-100 hover:border-amber-300"}`}
                  onClick={() => handleProfileFilter(profile.username)}
                >
                  {profile.name} @{profile.username}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
            <h3 className="text-lg font-semibold">Constraints</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>Global feed, no follower graph.</li>
              <li>No private messages or reposts.</li>
              <li>Posts limited to {CHAR_LIMIT} chars.</li>
              <li>Replies are one level deep.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
