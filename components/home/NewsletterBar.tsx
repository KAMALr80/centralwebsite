"use client";

import { useState } from "react";
import { Send } from "lucide-react";

// TODO(backend): wire to real newsletter subscribe endpoint once available.
export function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className="bg-brand-blue text-white px-4 sm:px-8 md:px-16 py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
      <div className="flex items-center gap-2.5 shrink-0">
        <Send size={16} />
        <span className="font-mono text-[12px] tracking-[0.06em] uppercase">Sign up to Newsletter</span>
      </div>

      {submitted ? (
        <p className="text-[14px] sm:ml-auto">Thanks — we&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 sm:w-72 h-10 px-3 text-[13px] text-brand-ink bg-white rounded-[var(--brand-radius)] focus:outline-none placeholder:text-brand-muted"
          />
          <button
            type="submit"
            className="h-10 px-5 bg-brand-ink text-white font-mono text-[11px] tracking-[0.08em] uppercase rounded-[var(--brand-radius)] hover:bg-brand-navy transition-colors shrink-0"
          >
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
}
