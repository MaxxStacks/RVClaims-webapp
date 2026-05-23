import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function Changelog() {
  const [, navigate] = useLocation();
  const [clTab, setClTab] = useState('cltab-cl-current');
  const [opFeatureRequests, setOpFeatureRequests] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/feature-requests').then(d => setOpFeatureRequests(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div className="tabs"><div className={`tab ${clTab === 'cltab-cl-current' ? 'active' : ''}`} onClick={() => setClTab('cltab-cl-current')}>Current Release</div><div className={`tab ${clTab === 'cltab-cl-past' ? 'active' : ''}`} onClick={() => setClTab('cltab-cl-past')}>Past Updates</div><div className={`tab ${clTab === 'cltab-cl-upcoming' ? 'active' : ''}`} onClick={() => setClTab('cltab-cl-upcoming')}>Upcoming</div><div className={`tab ${clTab === 'cltab-cl-requests' ? 'active' : ''}`} onClick={() => setClTab('cltab-cl-requests')}>Feature Requests</div></div>

      <div style={{display: clTab === 'cltab-cl-current' ? 'block' : 'none'}} className="pn">
        <div style={{padding: '24px 20px', borderBottom: '1px solid #f0f0f0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div><div style={{fontSize: 24, fontWeight: 700, color: 'var(--brand)', marginBottom: 4}}>v2.0.0</div><div style={{fontSize: 14, color: '#888'}}>Released March 17, 2026</div></div>
            <span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Latest</span>
          </div>
          <div style={{fontSize: 14, color: '#333', marginTop: 12, lineHeight: '1.6'}}>Complete platform rebuild — GEN2 architecture with three-portal system (Operator, Dealer, Customer), service marketplace, ticket-based communication, and white-label customer portals.</div>
        </div>
        <div style={{padding: 20}}>
          <div style={{marginBottom: 24}}>
            <div style={{fontSize: 13, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12}}>New Features</div>
            <div style={{fontSize: 13, color: '#333', lineHeight: 2}}>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Three-Portal System</strong> — Operator (36 pages), Dealer (25 pages), Customer (14 pages)</div>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Service Marketplace</strong> — Financing, F&I, Warranty Plans, Parts & Accessories</div>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Wave-style Invoice Builder</strong> — Line items, part search, tax calculation</div>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>RBAC</strong> — 4 roles: Operator Admin, Operator Staff, Dealer Owner, Dealer Staff</div>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Dark Mode + EN/FR</strong> — Persisted via localStorage across all portals</div>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Changelog System</strong> — Version tracking with current, past, upcoming, and feature requests</div>
            </div>
          </div>
          <div>
            <div style={{fontSize: 13, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12}}>Architecture</div>
            <div style={{fontSize: 13, color: '#333', lineHeight: 2}}>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginRight: 8}}></span>13-portal architecture with shared page components</div>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginRight: 8}}></span>React 18 + Express + TypeScript + Vite + Tailwind + shadcn/ui + PostgreSQL</div>
              <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginRight: 8}}></span>Multi-tenant design: dealers see their own data only</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display: clTab === 'cltab-cl-past' ? 'block' : 'none'}} className="pn">
        <div style={{padding: 20}}>
          <div style={{borderLeft: '3px solid #e5e7eb', paddingLeft: 20, marginBottom: 32}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700}}>v1.0.0</div><span style={{fontSize: 12, color: '#888'}}>November 2025</span></div>
            <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Original dealersuite360.com portal — single-portal claims tracking system</div>
            <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
              <div>• Basic claims tracking portal (operator only)</div>
              <div>• Bilingual website (EN/FR) with marketing pages</div>
              <div>• Pattern-matching chatbot (no AI)</div>
              <div>• In-memory data storage (no persistence)</div>
            </div>
          </div>
          <div style={{borderLeft: '3px solid #e5e7eb', paddingLeft: 20}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700}}>v0.1.0 — Beta</div><span style={{fontSize: 12, color: '#888'}}>October 2025</span></div>
            <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Initial build on Replit — marketing website only</div>
            <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}><div>• Marketing website with service pages</div><div>• Contact form</div><div>• React + Express + TypeScript foundation</div></div>
          </div>
        </div>
      </div>

      <div style={{display: clTab === 'cltab-cl-upcoming' ? 'block' : 'none'}} className="pn">
        <div style={{padding: 20}}>
          <div style={{marginBottom: 28}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: 'var(--brand)'}}>v2.1.0 — Phase 1</div><span className="bg pending" style={{padding: '4px 12px'}}>In Development</span></div>
            <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Foundation & Authentication — Target: April 2026</div>
            <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
              <div>• JWT authentication with refresh tokens</div>
              <div>• PostgreSQL database with full schema</div>
              <div>• Real API endpoints for all CRUD operations</div>
              <div>• RBAC middleware enforcement</div>
              <div>• File upload to cloud storage (S3/Cloudflare R2)</div>
            </div>
          </div>
          <div style={{marginBottom: 28}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#555'}}>v2.2.0 — Phase 2</div><span className="bg draft" style={{padding: '4px 12px'}}>Planned</span></div>
            <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Payments & Communication — Target: May 2026</div>
            <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}><div>• Stripe integration (subscriptions, one-time charges)</div><div>• Real-time WebSocket messaging</div><div>• Email notifications (SendGrid/SES)</div></div>
          </div>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#555'}}>v2.3.0 — Phase 3</div><span className="bg draft" style={{padding: '4px 12px'}}>Planned</span></div>
            <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>AI Integration & Mobile — Target: June 2026</div>
            <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}><div>• AI Document Scanner (OCR + field extraction)</div><div>• AI FRC Code Suggestions from photos</div><div>• PWA mobile app</div><div>• AI F&I Presenter (Tavus/D-ID video avatar)</div></div>
          </div>
        </div>
      </div>

      <div style={{display: clTab === 'cltab-cl-requests' ? 'block' : 'none'}} className="pn">
        <div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: 13, color: '#888'}}>Feature requests from dealers and internal team</span>
          <button className="btn btn-p btn-sm" onClick={() => navigate('add-feature-req')}>+ Add Request</button>
        </div>
        <div className="tw"><table><thead><tr><th>Request</th><th>Requested By</th><th>Priority</th><th>Status</th><th>Target</th></tr></thead><tbody>
          {opFeatureRequests.length === 0
            ? <tr><td colSpan={5} style={{textAlign:'center',color:'#888',padding:20}}>No feature requests yet</td></tr>
            : opFeatureRequests.map((fr: any) => {
              const priColor = fr.priority === 'high' ? '#dc2626' : fr.priority === 'low' ? '#22c55e' : '#d97706';
              return (
                <tr key={fr.id}>
                  <td style={{fontWeight: 500}}>{fr.title}</td>
                  <td>{fr.requestedBy || 'Internal'}</td>
                  <td><span style={{color: priColor, fontWeight: 600, fontSize: 12}}>{fr.priority ? fr.priority.charAt(0).toUpperCase() + fr.priority.slice(1) : 'Medium'}</span></td>
                  <td><span className={`bg ${fr.status === 'planned' ? 'submitted' : 'draft'}`}>{fr.status === 'planned' ? 'Planned' : 'Backlog'}</span></td>
                  <td>{fr.targetVersion || '—'}</td>
                </tr>
              );
            })
          }
        </tbody></table></div>
      </div>
    </div>
  );
}
