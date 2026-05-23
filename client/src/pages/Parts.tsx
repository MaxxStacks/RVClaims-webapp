import { useLocation } from 'wouter';

export default function Parts() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Dealers request parts. You source, price, and track delivery. <strong>Shop coming soon.</strong></div><button className="btn btn-p btn-sm" onClick={() => navigate('svc-parts-new')}>+ New Parts Order</button></div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Open Orders</div><div className="sc-v" style={{color: "#2563eb"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Shipped</div><div className="sc-v" style={{color: "#a855f7"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Order Value (MTD)</div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg Fulfillment</div><div className="sc-v">—</div></div>
      </div>
      <div className="pn">
        <div className="filter-bar"><input type="text" placeholder="Search orders..." /><select><option>All Statuses</option><option>New Request</option><option>Sourcing</option><option>Quoted</option><option>Ordered</option><option>Shipped</option><option>Delivered</option></select><select><option>All Dealers</option><option>Smith's RV</option><option>Atlantic RV</option></select></div>
        <div className="tw"><table><thead><tr><th>Order #</th><th>Dealer</th><th>Items</th><th>Related Claim</th><th>Est. Cost</th><th>Status</th><th>ETA</th><th>Updated</th><th>Action</th></tr></thead><tbody>
          <tr><td colSpan={9} style={{textAlign:'center',padding:24,color:'#888'}}>No parts orders yet</td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
