"use client";

import { FormEvent, useEffect, useState } from "react";

type Comment = {
  id: number;
  name: string;
  comment: string;
  created_at: string;
};

export default function UpdateComments({ updateId }: { updateId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadComments() {
      try {
        const response = await fetch(`/api/comments?updateId=${updateId}`, { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || !data.success) {
          if (response.status === 503) setAvailable(false);
          return;
        }
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } catch {
        if (!cancelled) setAvailable(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadComments();
    return () => {
      cancelled = true;
    };
  }, [updateId]);

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setPosting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId, name, email, comment, website }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setMessage(data.error || "Unable to post your comment.");
        if (response.status === 503) setAvailable(false);
        return;
      }

      if (data.comment) setComments((current) => [...current, data.comment]);
      setComment("");
      setMessage("Comment posted successfully.");
    } catch {
      setMessage("Unable to post your comment right now.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-gray-200 pb-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">Comments</p>
        <h2 className="mt-2 text-2xl font-black text-gray-900">
          {comments.length === 0 ? "Be the first to comment" : `${comments.length} Comment${comments.length === 1 ? "" : "s"}`}
        </h2>
      </div>

      {!loading && comments.length > 0 && (
        <div className="divide-y divide-gray-100">
          {comments.map((item) => (
            <article key={item.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-black text-gray-900">{item.name}</p>
                <time className="text-xs font-semibold text-gray-500">
                  {new Date(item.created_at).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-line leading-7 text-gray-700">{item.comment}</p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-xl font-black text-gray-900">Leave a Comment</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Your email is required for submission but will never be displayed publicly.
        </p>

        {!available ? (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900 ring-1 ring-amber-200">
            Comments are temporarily unavailable while the comment service is being configured.
          </div>
        ) : (
          <form onSubmit={submitComment} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-black text-gray-800">Your Comment</label>
              <textarea
                required
                minLength={2}
                maxLength={1500}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share your thoughts on this update..."
                rows={5}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-gray-800">Name *</label>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black text-gray-800">Email *</label>
                <input
                  required
                  type="email"
                  maxLength={160}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              className="hidden"
              aria-hidden="true"
              name="website"
            />

            {message && (
              <p className={`text-sm font-bold ${message.includes("successfully") ? "text-green-700" : "text-red-700"}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={posting}
              className="rounded-xl bg-green-700 px-6 py-3 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ color: "#ffffff" }}
            >
              {posting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
