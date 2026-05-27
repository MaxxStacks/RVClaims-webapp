// client/src/components/SidebarFooter.tsx
// Compact version + copyright footer for every sidebar.
// Version is injected at build time via vite.config.ts define block.

interface SidebarFooterProps {
  /** Optional white-label operator name shown above the "Powered by" line */
  operatorName?: string;
}

export default function SidebarFooter({ operatorName }: SidebarFooterProps) {
  // Fallback to package.json version string if Vite define isn't available
  const version: string =
    (typeof import.meta.env !== 'undefined' && (import.meta.env as any).VITE_APP_VERSION) ||
    '1.0.0';

  return (
    <div className="ds360-sidebar-version-footer">
      {operatorName && (
        <div style={{ fontWeight: 500, color: '#6b7280', fontSize: 11, marginBottom: 2 }}>
          {operatorName}
        </div>
      )}
      <div>
        <span className="ds360-version-number">v{version}</span>
        {' '}
        <span style={{ color: '#d1d5db' }}>·</span>
        {' '}
        <span>© 2026 Dealer Suite 360</span>
      </div>
      {operatorName && (
        <div className="ds360-powered-by">Powered by DS360</div>
      )}
    </div>
  );
}
