// client/src/components/PrintButton.tsx
// Reusable print trigger. Hides itself in print output via no-print class.
// Sets document.title before calling window.print() so the browser tab
// and the default PDF filename reflect the document being printed.

import React from 'react';

interface PrintButtonProps {
  /** Document title shown in browser tab and PDF filename */
  title: string;
  className?: string;
}

export default function PrintButton({ title, className = '' }: PrintButtonProps): React.ReactElement {
  const handlePrint = () => {
    const original = document.title;
    document.title = title;
    window.print();
    // Restore after a short delay (print dialog may be async)
    setTimeout(() => {
      document.title = original;
    }, 1000);
  };

  return (
    <button
      className={`btn btn-o btn-sm no-print${className ? ' ' + className : ''}`}
      onClick={handlePrint}
      title={`Print: ${title}`}
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      {/* Printer icon (lucide-style inline SVG) */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Print
    </button>
  );
}
