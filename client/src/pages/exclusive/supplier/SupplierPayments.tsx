// client/src/pages/exclusive/supplier/SupplierPayments.tsx
// Route: /supplier/payments — Placeholder

import { useLanguage } from '@/hooks/use-language';

export default function SupplierPayments() {
  const { t } = useLanguage();
  return (
    <div style={{ padding: '28px 32px', maxWidth: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Payments</h1>
      <p style={{ color: '#64748b', fontSize: 14 }}>Stripe billing integration for the $99/month listing fee coming soon.</p>
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '32px 28px', textAlign: 'center', marginTop: 32,
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>◈</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Subscription: $99/month</div>
        <div style={{ fontSize: 13, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
          Payment management, billing history, and subscription control will be available here once Stripe integration is live.
        </div>
      </div>
    </div>
  );
}
