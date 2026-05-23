import { useLocation } from 'wouter';

export default function EditProduct() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('products')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">Edit Product / Service</div><div className="detail-meta">Plan A — Monthly Subscription</div></div>
      </div>
      <div className="pn"><div className="form-grid">
        <div className="form-group"><label>Name</label><input defaultValue="Plan A — Monthly Subscription" /></div>
        <div className="form-group"><label>Category</label><select defaultValue="Subscription"><option>Subscription</option><option>Claim Fee</option><option>Service Add-on</option><option>Part / Physical Item</option><option>Custom</option></select></div>
        <div className="form-group"><label>Price</label><input defaultValue="$349.00" /></div>
        <div className="form-group"><label>Pricing Type</label><select defaultValue="Fixed amount"><option>Fixed amount</option><option>Percentage of claim</option><option>Variable</option></select></div>
        <div className="form-group"><label>Billing Frequency</label><select defaultValue="Monthly"><option>One-time</option><option>Monthly</option><option>Quarterly</option><option>Annual</option><option>Per claim</option><option>Per unit</option></select></div>
        <div className="form-group"><label>Tax</label><select defaultValue="HST 13%"><option>HST 13%</option><option>GST 5%</option><option>GST + QST</option><option>No Tax</option></select></div>
        <div className="form-group full"><label>Description</label><textarea defaultValue="Monthly platform subscription including claims processing and warranty management."></textarea></div>
        <div className="form-group"><label>Status</label><select defaultValue="Active"><option>Active</option><option>Inactive</option></select></div>
        <div className="form-group"><label>Dealers Currently Using</label><input defaultValue="18" readOnly style={{background: '#f3f4f6', color: '#888'}} /></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={() => navigate('products')}>Save Changes</button><button className="btn btn-o" onClick={() => navigate('products')}>Cancel</button><button className="btn btn-d" style={{marginLeft: 'auto'}}>Delete Product</button></div></div>
    </div>
  );
}
