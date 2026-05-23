import { useState } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function AddDealer() {
  const [, navigate] = useLocation();
  const [addDealerSaving, setAddDealerSaving] = useState(false);
  const [addDealerForm, setAddDealerForm] = useState({
    name: '', contactName: '', email: '', phone: '', street: '', city: '', plan: 'plan_a'
  });

  const handleCreateDealer = async () => {
    if (!addDealerForm.name) return;
    setAddDealerSaving(true);
    try {
      await apiFetch('/api/v6/dealerships', { method: 'POST', body: JSON.stringify(addDealerForm) });
      navigate('dealers');
    } catch {
      setAddDealerSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('dealers')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add New Dealer</div><div className="detail-meta">Create a new dealership account</div></div></div>
      <div className="pn"><div className="form-grid">
        <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Dealership Information</label></div>
        <div className="form-group"><label>Dealership Name</label><input placeholder="Enter dealership name" value={addDealerForm.name} onChange={e => setAddDealerForm(f => ({...f, name: e.target.value}))} /></div>
        <div className="form-group"><label>Primary Contact</label><input placeholder="Full name" value={addDealerForm.contactName} onChange={e => setAddDealerForm(f => ({...f, contactName: e.target.value}))} /></div>
        <div className="form-group"><label>Email</label><input placeholder="dealer@example.com" value={addDealerForm.email} onChange={e => setAddDealerForm(f => ({...f, email: e.target.value}))} /></div>
        <div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" value={addDealerForm.phone} onChange={e => setAddDealerForm(f => ({...f, phone: e.target.value}))} /></div>
        <div className="form-group"><label>Address</label><input placeholder="Street address" value={addDealerForm.street} onChange={e => setAddDealerForm(f => ({...f, street: e.target.value}))} /></div>
        <div className="form-group"><label>City, Province</label><input placeholder="Toronto, ON" value={addDealerForm.city} onChange={e => setAddDealerForm(f => ({...f, city: e.target.value}))} /></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Subscription</label></div>
        <div className="form-group"><label>Plan</label><select value={addDealerForm.plan} onChange={e => setAddDealerForm(f => ({...f, plan: e.target.value}))}><option value="plan_a">Plan A — Monthly ($349/mo)</option><option value="plan_b">Plan B — Pre-Funded Wallet</option><option value="custom">Custom</option></select></div>
        <div className="form-group"><label>Claim Fee %</label><input defaultValue="10" type="number" /></div>
        <div className="form-group"><label>Min Fee</label><input defaultValue="$50.00" /></div>
        <div className="form-group"><label>Max Fee Cap</label><input defaultValue="$500.00" /></div>
        <div className="form-group"><label>DAF Fee</label><input defaultValue="$25.00" /></div>
        <div className="form-group"><label>PDI Fee</label><input defaultValue="$15.00" /></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label>Notes</label><textarea placeholder="Internal notes about this dealership..."></textarea></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={handleCreateDealer} disabled={addDealerSaving}>{addDealerSaving ? 'Saving…' : 'Create Dealer'}</button><button className="btn btn-o" onClick={() => navigate('dealers')}>Cancel</button></div></div>
    </div>
  );
}
