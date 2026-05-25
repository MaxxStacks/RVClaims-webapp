// client/src/components/PrintHeader.tsx
// Visible ONLY in print output (hidden on screen via .print-only class).
// Renders a branded header at the top of every printed document.

import React from 'react';

interface PrintHeaderProps {
  /** Main document type label, e.g. "Unit Profile", "Claim Detail", "INVOICE" */
  title: string;
  /** Secondary line, e.g. "2023 Forest River Cherokee 274RK" */
  subtitle?: string;
  /** DS360 barcode string to display as text (not rendered as barcode in print header) */
  barcodeString?: string;
  /** Dealership name */
  dealerName?: string;
}

export default function PrintHeader({
  title,
  subtitle,
  barcodeString,
  dealerName,
}: PrintHeaderProps): React.ReactElement {
  const now = new Date();
  const printDate = now.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const printTime = now.toLocaleTimeString('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="print-header print-only">
      {/* Left: brand + document type */}
      <div>
        <div className="print-header-brand">DealerSuite360</div>
        <div style={{ fontSize: '13pt', fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '10pt', color: '#555', marginTop: 2 }}>{subtitle}</div>
        )}
        {dealerName && (
          <div style={{ fontSize: '10pt', color: '#555', marginTop: 2 }}>
            Dealership: {dealerName}
          </div>
        )}
      </div>

      {/* Right: date + barcode string */}
      <div className="print-header-meta">
        <div>Printed: {printDate} at {printTime}</div>
        <div style={{ marginTop: 4, fontSize: '8pt', color: '#777' }}>
          Confidential — For authorized use only
        </div>
        {barcodeString && (
          <div
            style={{
              marginTop: 6,
              fontFamily: 'monospace',
              fontSize: '8pt',
              letterSpacing: '0.05em',
              background: '#f8f9fa',
              padding: '2px 6px',
              borderRadius: 3,
              display: 'inline-block',
            }}
          >
            {barcodeString}
          </div>
        )}
      </div>
    </div>
  );
}
