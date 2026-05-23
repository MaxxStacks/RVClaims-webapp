import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function CRMKanban() {
  const [crmPipelineData, setCrmPipelineData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    apiFetch<any>('/api/crm/pipeline').then(d => setCrmPipelineData(d.stages || {})).catch(() => {});
  }, []);

  const stages = ['prospect', 'claimed_page', 'contacted', 'demo_scheduled', 'demo_done', 'negotiating', 'onboarded', 'active_customer'];

  return (
    <div className="page active">
      <div className="detail-header">
        <div className="detail-info">
          <div className="detail-title">Pipeline Kanban</div>
          <div className="detail-meta">Drag dealers between stages to update pipeline</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
        {stages.map(stage => {
          const dealers = crmPipelineData[stage] || [];
          const stageLabel = stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return (
            <div
              key={stage}
              style={{ minWidth: 200, background: '#f8fafc', borderRadius: 10, padding: '12px 10px', border: '1px solid #e5e7eb', flexShrink: 0 }}
              onDragOver={e => e.preventDefault()}
              onDrop={async e => {
                e.preventDefault();
                const dealerId = e.dataTransfer.getData('dealerId');
                if (!dealerId) return;
                try {
                  await apiFetch(`/api/crm/pipeline/${dealerId}/stage`, { method: 'PUT', body: JSON.stringify({ stage }) });
                  const d = await apiFetch<any>('/api/crm/pipeline');
                  setCrmPipelineData(d.stages || {});
                } catch {}
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>{stageLabel}</span>
                <span style={{ background: '#e5e7eb', borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>{dealers.length}</span>
              </div>
              {dealers.map((d: any) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('dealerId', String(d.dealerId || d.id))}
                  style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', marginBottom: 8, border: '1px solid #e5e7eb', cursor: 'grab', fontSize: 13 }}
                  onClick={() => {
                    sessionStorage.setItem('crmDealerId', String(d.id || d.dealerId));
                    alert('Navigate to CRM Dealer Detail — routes wired in Session 3');
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.name || d.dealerName}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{d.city}{d.stateProvince ? `, ${d.stateProvince}` : ''} · {d.country}</div>
                  {d.isClaimed && <div style={{ marginTop: 4, fontSize: 10, color: '#22c55e', fontWeight: 600 }}>● Claimed</div>}
                </div>
              ))}
              {dealers.length === 0 && <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: '20px 0' }}>Drop here</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
