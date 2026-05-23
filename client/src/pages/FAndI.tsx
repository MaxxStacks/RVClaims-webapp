import { useLocation } from 'wouter';

export default function FAndI() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Dealers flag deals needing F&I products. You recommend packages, handle paperwork, and track what's sold.</div><button className="btn btn-p btn-sm" onClick={() => navigate('svc-fi-new')}>+ New F&I Deal</button></div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Deals</div><div className="sc-v" style={{color: "#2563eb"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Products Sold (MTD)</div><div className="sc-v" style={{color: "#22c55e"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Revenue (MTD)</div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg Products/Deal</div><div className="sc-v">—</div></div>
      </div>
      <div className="pn">
        <div className="filter-bar"><input type="text" placeholder="Search deals..." /><select><option>All Statuses</option><option>New Deal</option><option>Recommending</option><option>Paperwork</option><option>Completed</option></select></div>
        <div className="tw"><table><thead><tr><th>Deal #</th><th>Dealer</th><th>Customer</th><th>Unit</th><th>Products Recommended</th><th>Products Sold</th><th>Revenue</th><th>Status</th><th>Action</th></tr></thead><tbody>
          <tr><td colSpan={9} style={{textAlign:'center',padding:24,color:'#888'}}>No F&I deals yet</td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
