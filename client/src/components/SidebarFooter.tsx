// client/src/components/SidebarFooter.tsx
// Compact, separator-free version + copyright footer for every sidebar.
// Version is injected at build time via vite.config.ts define block.

export interface SidebarFooterProps {
  /** Optional white-label operator name shown above the "Powered by" line */
  operatorName?: string;
}

export function SidebarFooter({ operatorName }: SidebarFooterProps) {
  const version = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? '6.2.0';
  const brand = operatorName ?? 'DealerSuite360';
  const powered = operatorName ? 'Powered by DS360' : null;

  return (
    <div style={{ padding: '8px 16px 16px', marginTop: 'auto' }}>
      <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{brand}</p>
      <p style={{ margin: '2px 0 0', fontSize: 10, color: '#9ca3af' }}>
        v{version} · © 2026
      </p>
      {powered && (
        <p style={{ margin: '1px 0 0', fontSize: 9, color: '#d1d5db' }}>{powered}</p>
      )}
    </div>
  );
}

export default SidebarFooter;
