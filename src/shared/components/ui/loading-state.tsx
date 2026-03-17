"use client";

import { useEffect, useState } from "react";
import { Spinner } from "./spinner";

const AD_QUOTES = [
  { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
  { text: "Make it simple. Make it memorable. Make it inviting to look at.", author: "Leo Burnett" },
  { text: "An ad is finished only when you no longer can find a single element to remove.", author: "Robert Fleege" },
  { text: "Stopping advertising to save money is like stopping your watch to save time.", author: "Henry Ford" },
  { text: "Nobody counts the number of ads you run; they just remember the impression you make.", author: "Bill Bernbach" },
  { text: "You can't bore people into buying your product.", author: "David Ogilvy" },
  { text: "The consumer isn't a moron; she is your wife.", author: "David Ogilvy" },
  { text: "In advertising, not to be different is virtually the same as being invisible.", author: "Thornton Wilder" },
];

interface LoadingStateProps {
  /** Contextual message shown above the quote, e.g. "Scanning competitor ads…" */
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * AD_QUOTES.length));
  const [visible, setVisible] = useState(true);

  // Rotate quote every 4s with a brief fade
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % AD_QUOTES.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const quote = AD_QUOTES[idx];

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center select-none">
      {/* Spinner */}
      <Spinner className="h-8 w-8 text-accent opacity-70" />

      {/* Contextual message */}
      {message && (
        <p className="text-[13px] font-medium text-text-secondary">{message}</p>
      )}

      {/* Quote */}
      <div
        className="max-w-[380px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <p className="text-[13px] text-text-tertiary italic leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-[11px] text-text-tertiary mt-1.5 font-medium not-italic">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}
