import { useLocation } from 'wouter';

export default function AddProduct() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('products')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">Add Product / Service</div><div className="detail-meta">Create a new billable item for invoicing</div></div>
      </div>
      <div className="pn"><div className="form-grid">
        <div className="form-group"><label>Name</label><input placeholder="e.g. Plan A Monthly Subscription" /></div>
        <div className="form-group"><label>Category</label><select><option>Subscription</option><option>Claim Fee</option><option>Service Add-on</option><option>Part / Physical Item</option><option>Custom</option></select></div>
        <div className="form-group"><label>Price</label><input placeholder="$0.00" /></div>
        <div className="form-group"><label>Pricing Type</label><select><option>Fixed amount</option><option>Percentage of claim</option><option>Variable</option></select></div>
        <div className="form-group"><label>Billing Frequency</label><select><option>One-time</option><option>Monthly</option><option>Quarterly</option><option>Annual</option><option>Per claim</option><option>Per unit</option></select></div>
        <div className="form-group"><label>Tax</label><select><option>HST 13%</option><option>GST 5%</option><option>GST + QST</option><option>No Tax</option></select></div>
        <div className="form-group full"><label>Description</label><textarea placeholder="Description visible on invoices..."></textarea></div>
        <div className="form-group"><label>Status</label><select><option>Active</option><option>Inactive</option></select></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={() => navigate('products')}>Save Product</button><button className="btn btn-o" onClick={() => navigate('products')}>Cancel</button></div></div>
    </div>
  );
}
