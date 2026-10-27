"use client";

import { useState } from "react";

const field =
  "w-full border border-black/15 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-charcoal";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Your name
        </label>
        <input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" className={field} />
      </div>

      <div>
        <label htmlFor="contact" className="mb-2 block text-sm font-medium">
          Phone number or email
        </label>
        <input id="contact" name="contact" required minLength={3} maxLength={200} autoComplete="email" className={field} />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          Message
        </label>
        <textarea id="message" name="message" required minLength={5} maxLength={3000} rows={5} className={field} />
      </div>

      {/* Spam trap, hidden from people */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>

      {status === "sent" && (
        <p role="status" className="text-sm font-medium text-green-700">
          Thank you. Your message has been sent and we will get back to you soon.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-brand">
          {error}
        </p>
      )}
    </form>
  );
}