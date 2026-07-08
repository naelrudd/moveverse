'use client';

import { useState } from 'react';

export default function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all hover:bg-primary/10"
      title={label || 'Salin kode'}
    >
      {copied ? (
        <>
          <span className="text-green-600">✓</span>
          <span className="text-green-600">Tersalin!</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span className="text-primary">{label || 'Salin'}</span>
        </>
      )}
    </button>
  );
}
