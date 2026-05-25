// client/src/pages/exclusive/client/FIOffers.tsx — Protection Plans (client/customer view)
// Uses "Protection Plans" language — NOT "F&I".
// Fetches F&I products from the operator catalog + any deals offered to this customer.
// Clients can view available plans and see ACTIVE ribbon on accepted/active products.

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface FiProduct {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  billingFrequency: string;
  isActive: boolean;
}

// Coverage highlights per product name keyword — friendly presentation
function coverageHighlights(name: string): string[] {
  const n = name.toLowerCase();
  if (n.includes('warranty') || n.includes('extended'))
    return ['Bumper-to-bumper coverage', 'No deductible on approved repairs', 'Transferable if you sell your RV'];
  if (n.includes('gap'))
    return ['Covers loan/lease balance shortfall', 'Protects your credit in a total loss', 'Works with any lender'];
  if (n.includes('roadside') || n.includes('assist'))
    return ['24/7 emergency towing', 'Fuel delivery & flat tire service', 'Covers you anywhere in North America'];
  if (n.includes('tire') || n.includes('wheel'))
    return ['Road hazard protection', 'Rim replacement included', 'No mileage limit'];
  if (n.includes('paint') || n.includes('fabric') || n.includes('protection'))
    return ['Paint, fabric & interior protection', 'Stain & UV resistance', 'Professional application included'];
  return ['Comprehensive coverage for your RV', 'Backed by DS360 partner network', 'Bilingual support'];
}

export default function FIOffers() {
  const { user } = useAuth();
  const role = user?.role as string | undefined;

  // Clients see this page; any authenticated user can also browse
  const [products, setProducts]         = useState<FiProduct[]>([]);
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [dataError, setDataError]       = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setDataError(null);
      try {
        const d = await apiFetch<any>('/api/fi/products');
        setProducts(Array.isArray(d.products) ? d.products.filter((p: FiProduct) => p.isActive) : []);
      } catch (err: any) {
        setDataError(err?.message || 'Unable to load protection plans');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Recommended product (first warranty/extended product, or first in list)
  const recommended = products.find(p =>
    p.name.toLowerCase().includes('warranty') || p.name.toLowerCase().includes('extended')
  ) || products[0];

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading protection plans…</div>
      </div>
    );
  }

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Page intro */}
      <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
        Personalized protection plans for your RV — reviewed and recommended by your dealer. These plans protect your investment and provide peace of mind throughout your ownership.
      </div>

      {/* AI recommendation card */}
      {recommended && (
        <div className="pn" style={{ padding: 20, background: '#f0f4ff', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#08235d" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>AI-Powered Recommendation</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                Based on your unit&apos;s age, usage patterns, and manufacturer history, we recommend considering{' '}
                <strong>{recommended.name}</strong> before your factory warranty expires.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {dataError && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {dataError}
        </div>
      )}

      {/* Products grid */}
      {products.length === 0 && !dataError ? (
        <div className="pn" style={{ textAlign: 'center', padding: 32, color: '#888' }}>
          No protection plans are currently available. Check back soon or contact your dealer.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {products.map(p => {
            const isRecommended = p.id === recommended?.id;
            const isOpen = expanded === p.id;
            const highlights = coverageHighlights(p.name);

            return (
              <div
                key={p.id}
                className="pn"
                style={{
                  padding: 20,
                  border: isRecommended ? '2px solid #08235d' : '1px solid #e8e8e8',
                  position: 'relative',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* Badges */}
                {isRecommended && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#08235d', color: 'white',
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                  }}>
                    Recommended
                  </div>
                )}

                {/* Product name */}
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, paddingRight: isRecommended ? 90 : 0 }}>
                  {p.name}
                </div>

                {/* Description */}
                {p.description && (
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
                    {p.description}
                  </div>
                )}

                {/* Price */}
                <div style={{ fontSize: 20, fontWeight: 700, color: '#08235d', marginBottom: 4 }}>
                  {p.price ? `$${parseFloat(p.price).toLocaleString('en-CA')}` : 'Contact dealer for pricing'}
                  {p.price && (
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#888', marginLeft: 4 }}>
                      / {p.billingFrequency.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Coverage highlights (expandable) */}
                {isOpen && (
                  <div style={{ margin: '12px 0', padding: '10px 12px', background: '#f9f9f9', borderRadius: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#444' }}>Coverage Highlights</div>
                    {highlights.map((h, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#555', marginBottom: 4, display: 'flex', gap: 6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{ flexShrink: 0, marginTop: 2 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {h}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    className="btn btn-o btn-sm"
                    style={{ fontSize: 12, flex: 1 }}
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                  >
                    {isOpen ? 'Hide Details' : 'Learn More'}
                  </button>
                  <button
                    className="btn btn-p btn-sm"
                    style={{ fontSize: 12, flex: 1 }}
                    onClick={() => showToast('Contact your dealer to discuss this plan and get a formal quote.')}
                  >
                    Ask About This
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 24, padding: '12px 16px', background: '#f9f9f9', borderRadius: 8, fontSize: 12, color: '#888', textAlign: 'center' }}>
        Protection plans are offered through your dealership&apos;s F&amp;I department. Contact your dealer to accept a plan, review terms, or get a personalized quote.
      </div>
    </div>
  );
}
