"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CHAR_LIMIT = 180;

export default function UserProfilePage({ params }) {
  const { username } = params;
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [status, setStatus] = useState("");
  const router = useRouter();
  // Load current user for like/reply permissions
  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user || null));
  }, []);
  // Like a post
  const toggleLike = async (postId) => {
    if (!currentUser) return;
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    // Refresh user profile data
    fetch(`/api/users/${username}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  };

  // Reply to a post
  const handleReply = async (postId) => {
    if (!currentUser) return;
    const content = (replyDrafts[postId] || "").trim();
    if (!content || content.length > CHAR_LIMIT) return;
    setStatus("");
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
    // Refresh user profile data
    fetch(`/api/users/${username}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  };

  useEffect(() => {
    if (!username) return;
    fetch(`/api/users/${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUser(data);
      })
      .catch(() => setError("Failed to load user profile."));
  }, [username]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-rose-400">{error}</div>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-amber-300">{user.name}</h1>
          <p className="text-slate-400">@{user.username}</p>
          <p className="text-xs text-slate-500 mt-2">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="mb-4 text-lg font-semibold text-slate-200">Posts</div>
        {user.posts.length === 0 ? (
          <div className="text-slate-500">No posts yet.</div>
        ) : (
          <ul className="space-y-4">
            {user.posts.map((post) => (
              <li key={post.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-amber-300">{user.name}</span>
                      <span className="text-slate-400">@{user.username}</span>
                      <span className="text-sm text-slate-500">• {new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-slate-100">{post.content}</p>
                  </div>
                  <button
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${post.likes?.some?.((l) => l.userId === currentUser?.id) ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-100"}`}
                    onClick={() => toggleLike(post.id)}
                    disabled={!currentUser}
                  >
                    ♥ {post.likes?.length || 0}
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {post.replies?.map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-amber-300">{reply.author.name}</span>
                        <span className="text-xs text-slate-400">@{reply.author.username}</span>
                        <span className="text-xs text-slate-500">• {new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-100">{reply.content}</p>
                      <button
                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition ${reply.likes?.some?.((l) => l.userId === currentUser?.id) ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-100"}`}
                        onClick={() => toggleLike(reply.id)}
                        disabled={!currentUser}
                      >
                        ♥ {reply.likes?.length || 0}
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
