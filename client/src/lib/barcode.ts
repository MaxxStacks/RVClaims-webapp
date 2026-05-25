// client/src/lib/barcode.ts — DS360 Barcode / QR utility
// Barcodes are deterministic: same entityType + entityId always generates same string.

import { useEffect, useRef, useState } from 'react';
import React from 'react';
import JsBarcode from 'jsbarcode';
import QRCodeLib from 'qrcode';

// ─── Type code map ────────────────────────────────────────────────────────────
const TYPE_CODES: Record<string, string> = {
  unit: 'UNIT',
  claim: 'CLM',
  workOrder: 'WO',
  invoice: 'INV',
  document: 'DOC',
  warranty: 'WRN',
  partsOrder: 'PRT',
};

// ─── URL path map ─────────────────────────────────────────────────────────────
const URL_PATHS: Record<string, string> = {
  unit: 'units',
  claim: 'claims',
  workOrder: 'work-orders',
  invoice: 'invoices',
  document: 'documents',
  warranty: 'warranties',
  partsOrder: 'parts-orders',
};

// ─── Generate deterministic barcode string ────────────────────────────────────
export function generateBarcodeString(entityType: string, entityId: string): string {
  const typeCode = TYPE_CODES[entityType] || 'UNK';
  const shortId = entityId.replace(/-/g, '').slice(0, 8).toUpperCase();

  // Deterministic checksum
  let sum = 0;
  for (let i = 0; i < shortId.length; i++) {
    sum += shortId.charCodeAt(i);
  }
  const checksum = String(sum % 100).padStart(2, '0');

  return `DS360-${typeCode}-${shortId}-${checksum}`;
}

// ─── Generate QR URL ─────────────────────────────────────────────────────────
export function generateQRUrl(entityType: string, entityId: string): string {
  const path = URL_PATHS[entityType] || entityType;
  return `https://dealersuite360.com/${path}/${entityId}`;
}

// ─── Parse DS360 barcode from scanned text ───────────────────────────────────
export function parseDS360Barcode(
  text: string
): { type: string; shortId: string; raw: string } | null {
  const match = text.match(/DS360-(UNIT|CLM|WO|INV|DOC|WRN|PRT)-([A-Z0-9]{8})-\d{2}/);
  if (!match) return null;

  const typeCodeMap: Record<string, string> = {
    UNIT: 'unit',
    CLM: 'claim',
    WO: 'workOrder',
    INV: 'invoice',
    DOC: 'document',
    WRN: 'warranty',
    PRT: 'partsOrder',
  };

  return {
    type: typeCodeMap[match[1]] || match[1].toLowerCase(),
    shortId: match[2],
    raw: match[0],
  };
}

// ─── BarcodeDisplay component ─────────────────────────────────────────────────
interface BarcodeDisplayProps {
  entityType: string;
  entityId: string;
  size?: 'sm' | 'md';
}

export function BarcodeDisplay({ entityType, entityId, size = 'sm' }: BarcodeDisplayProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const barcodeString = generateBarcodeString(entityType, entityId);
  const width = size === 'md' ? 200 : 120;

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      JsBarcode(canvasRef.current, barcodeString, {
        format: 'CODE128',
        width: 1.2,
        height: size === 'md' ? 40 : 28,
        displayValue: false,
        margin: 2,
        background: 'transparent',
      });
      setError(false);
    } catch {
      setError(true);
    }
  }, [barcodeString, size]);

  if (error) {
    return React.createElement(
      'div',
      {
        style: {
          fontSize: 9,
          fontFamily: 'monospace',
          color: '#555',
          background: '#f4f4f4',
          padding: '4px 6px',
          borderRadius: 4,
          letterSpacing: '0.02em',
          maxWidth: width,
          overflowX: 'hidden' as const,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' as const,
        },
      },
      barcodeString
    );
  }

  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 1 } },
    React.createElement('canvas', { ref: canvasRef, style: { maxWidth: width } }),
    React.createElement(
      'div',
      {
        style: {
          fontSize: 8,
          fontFamily: 'monospace',
          color: '#888',
          letterSpacing: '0.05em',
          textAlign: 'center' as const,
          maxWidth: width,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' as const,
        },
      },
      barcodeString
    )
  );
}

// ─── QRCodeDisplay component ──────────────────────────────────────────────────
interface QRCodeDisplayProps {
  entityType: string;
  entityId: string;
  url?: string;
  size?: number;
}

export function QRCodeDisplay({ entityType, entityId, url, size = 80 }: QRCodeDisplayProps): React.ReactElement {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const qrUrl = url || generateQRUrl(entityType, entityId);

  useEffect(() => {
    QRCodeLib.toDataURL(qrUrl, {
      width: size,
      margin: 1,
      color: { dark: '#1e293b', light: '#ffffff' },
    })
      .then((url: string) => setDataUrl(url))
      .catch(() => setDataUrl(null));
  }, [qrUrl, size]);

  if (!dataUrl) {
    return React.createElement(
      'div',
      {
        style: {
          width: size,
          height: size,
          background: '#f4f4f4',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      React.createElement(
        'div',
        { style: { fontSize: 8, color: '#aaa', textAlign: 'center' as const } },
        'QR'
      )
    );
  }

  return React.createElement('img', {
    src: dataUrl,
    alt: `QR code for ${entityType} ${entityId}`,
    style: { width: size, height: size, borderRadius: 4 },
    title: qrUrl,
  });
}
