'use client';

import { useState } from 'react';

type Props = {
  text: string;
  label?: string;
};

export default function CopyButton({ text, label = 'Copy' }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? 'bg-forest-100 text-forest-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
      }`}
      aria-label={copied ? 'Copied!' : `${label}: ${text}`}
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
              clipRule="evenodd"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11 3.5A1.5 1.5 0 0 0 9.5 2h-5A1.5 1.5 0 0 0 3 3.5v8A1.5 1.5 0 0 0 4.5 13h.75a.75.75 0 0 0 0-1.5H4.5a.25.25 0 0 1-.25-.25v-8a.25.25 0 0 1 .25-.25h5a.25.25 0 0 1 .25.25V4a.75.75 0 0 0 1.5 0V3.5Z"
              clipRule="evenodd"
            />
            <path d="M6.5 5.5A1.5 1.5 0 0 1 8 4h3.5A1.5 1.5 0 0 1 13 5.5v7a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 12.5v-7Z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
