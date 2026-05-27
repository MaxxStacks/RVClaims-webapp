// client/src/pages/exclusive/client/KnowledgeBase.tsx
// Knowledge Base / Resources page for the customer portal.
// Shows owner manuals, maintenance guides, how-to articles, and videos
// linked to the customer's specific unit.

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

const CONTENT_TYPE_LABELS: Record<string, string> = {
  owners_manual: "Owner's Manual",
  maintenance_schedule: 'Maintenance Schedule',
  how_to_article: 'How-To Guide',
  troubleshooting_guide: 'Troubleshooting',
  video: 'Video',
  warranty_guide: 'Warranty Guide',
  safety_bulletin: 'Safety Bulletin',
  recall_notice: 'Recall Notice',
};

const CONTENT_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  owners_manual:        { bg: '#dbeafe', color: '#1d4ed8' },
  maintenance_schedule: { bg: '#dcfce7', color: '#16a34a' },
  how_to_article:       { bg: '#ede9fe', color: '#6d28d9' },
  troubleshooting_guide: { bg: '#fff7ed', color: '#c2410c' },
  video:                { bg: '#fee2e2', color: '#b91c1c' },
  warranty_guide:       { bg: '#f0fdf4', color: '#15803d' },
  safety_bulletin:      { bg: '#fef3c7', color: '#b45309' },
  recall_notice:        { bg: '#fef2f2', color: '#dc2626' },
};

const CONTENT_TYPE_ICONS: Record<string, string> = {
  owners_manual: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  maintenance_schedule: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>',
  how_to_article: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  troubleshooting_guide: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  video: '<polygon points="5 3 19 12 5 21 5 3"/>',
  warranty_guide: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  safety_bulletin: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  recall_notice: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>',
};

export default function ClientKnowledgeBase() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [entries, setEntries] = useState<any[]>([]);
  const [unit, setUnit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setDataError(null);
      try {
        // Get the customer's unit first
        const unitData = await apiFetch<any>('/api/v6/units').catch(() => null);
        const units = unitData ? (Array.isArray(unitData) ? unitData : unitData.units || []) : [];
        const myUnit = units[0] || null;
        setUnit(myUnit);

        if (myUnit?.id) {
          const kbData = await apiFetch<any>(`/api/units/${myUnit.id}/knowledge`).catch(() => null);
          setEntries(Array.isArray(kbData?.entries) ? kbData.entries : []);
        } else {
          // Fallback: load general knowledge base
          const kbData = await apiFetch<any>('/api/knowledge-base').catch(() => null);
          setEntries(Array.isArray(kbData?.entries) ? kbData.entries : Array.isArray(kbData) ? kbData : []);
        }
      } catch (err: any) {
        setDataError(err?.message || 'Unable to load resources');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const contentTypes = Array.from(new Set(entries.map(e => e.contentType))).filter(Boolean);

  const filtered = entries.filter(e => {
    const matchesFilter = activeFilter === 'all' || e.contentType === activeFilter;
    const matchesSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="page active" style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="page active">
      {/* Page intro */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
          {unit
            ? `Resources for your ${unit.year} ${unit.manufacturer} ${unit.model} — owner manuals, maintenance guides, how-to articles, and more.`
            : "Owner manuals, maintenance guides, how-to articles, and resources for your RV."}
        </div>
      </div>

      {/* Search + filters */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input
          placeholder="Search resources…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
          <option value="all">All Types</option>
          {contentTypes.map(ct => (
            <option key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct] || ct}</option>
          ))}
        </select>
      </div>

      {/* Error state */}
      {dataError && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {dataError}
        </div>
      )}

      {/* Empty state */}
      {!dataError && filtered.length === 0 && (
        <div className="pn" style={{ padding: 48, textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 16 }}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No resources found</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            {search ? 'Try a different search term.' : 'Your dealer will add resources for your unit.'}
          </div>
        </div>
      )}

      {/* Resource cards */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((entry: any) => {
            const typeColor = CONTENT_TYPE_COLORS[entry.contentType] || { bg: '#f3f4f6', color: '#6b7280' };
            const iconPath = CONTENT_TYPE_ICONS[entry.contentType] || CONTENT_TYPE_ICONS.how_to_article;

            return (
              <div key={entry.id} className="pn" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                    background: typeColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColor.color} strokeWidth="2"
                      dangerouslySetInnerHTML={{ __html: iconPath }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {entry.title}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                        background: typeColor.bg, color: typeColor.color, flexShrink: 0,
                      }}>
                        {CONTENT_TYPE_LABELS[entry.contentType] || entry.contentType}
                      </span>
                    </div>
                    {entry.description && (
                      <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.description}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  {(entry.fileUrl || entry.externalUrl) ? (
                    <a
                      href={entry.fileUrl || entry.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flexShrink: 0, padding: '7px 14px', background: '#033280', color: '#fff',
                        borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 44, minHeight: 44, justifyContent: 'center',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {entry.contentType === 'video' ? 'Watch' : 'Open'}
                    </a>
                  ) : (
                    <span style={{ flexShrink: 0, fontSize: 11, color: '#9ca3af', padding: '4px 8px' }}>Coming soon</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact dealer note */}
      <div style={{ marginTop: 24, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#888', textAlign: 'center' as const }}>
        Can't find what you're looking for? Contact your dealer directly for specific documentation.
      </div>
    </div>
  );
}
