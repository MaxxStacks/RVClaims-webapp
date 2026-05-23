import { useLocation } from 'wouter';

export default function Marketing() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="al-g" style={{marginBottom: 20}}>
        <div className="al"><div className="al-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><div className="al-c"><div className="al-t">Marketing Services — Launching Q2 2026</div><div className="al-d">Campaigns, lead capture, SEO & PPC managed by DS360</div></div></div>
      </div>
      <div className="pn" style={{padding: 40, textAlign: 'center'}}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{margin: '0 auto 16px'}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <div style={{fontSize: 20, fontWeight: 700, marginBottom: 8}}>Digital Marketing Services</div>
        <div style={{fontSize: 13, color: '#666', lineHeight: '1.6', maxWidth: 480, margin: '0 auto 24px'}}>Dealer Suite 360 will manage your SEO, PPC campaigns, social media, and lead generation. Coming Q2 2026.</div>
        <div style={{display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24}}>
          {['SEO & Content','Google PPC','Social Media','Lead Generation','Email Campaigns','CRM Integration'].map(s => (
            <span key={s} style={{padding: '6px 14px', background: '#f0f4ff', borderRadius: 20, fontSize: 12, color: 'var(--brand)', fontWeight: 500}}>{s}</span>
          ))}
        </div>
        <button className="btn btn-s" style={{fontSize: 14, padding: '12px 32px'}} onClick={() => navigate('sales-services')}>View All Services</button>
      </div>
    </div>
  );
}
