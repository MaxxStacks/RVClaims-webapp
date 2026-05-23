export default function Messages() {
  const threads = [
    {name: 'DS360 Team', msg: 'Your claim CLM-0248 has been submitted to Jayco.', time: '2h ago', unread: true},
    {name: 'CLM-0243 Thread', msg: 'Payment of $3,920 has been processed.', time: '1d ago', unread: false},
    {name: 'DS360 Team', msg: 'New feature: TechFlow work orders.', time: '3d ago', unread: false},
  ];

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: 560}}>
        <div className="pn" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 13}}>Inbox</div>
          {threads.map((m, i) => (
            <div key={i} style={{padding: '12px 16px', borderBottom: '1px solid #f8f8f8', cursor: 'pointer', background: m.unread ? '#f0f4ff' : 'white', display: 'flex', gap: 10}}>
              <div style={{width: 36, height: 36, borderRadius: '50%', background: '#08235d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0}}>{m.name[0]}</div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontWeight: m.unread ? 600 : 400, fontSize: 13, marginBottom: 2}}>{m.name}</div>
                <div style={{fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{m.msg}</div>
                <div style={{fontSize: 11, color: '#aaa', marginTop: 2}}>{m.time}</div>
              </div>
              {m.unread && <div style={{width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 4}}></div>}
            </div>
          ))}
        </div>
        <div className="pn" style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{padding: '12px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 14}}>DS360 Team</div>
          <div style={{flex: 1, padding: 20, overflowY: 'auto'}}>
            <div style={{background: '#f0f4ff', borderRadius: 12, padding: '12px 16px', maxWidth: '80%', marginBottom: 12, fontSize: 13}}>Your claim CLM-0248 has been submitted to Jayco for review. Expected turnaround: 5-7 business days.</div>
          </div>
          <div style={{padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8}}>
            <input placeholder="Reply..." style={{flex: 1, padding: '8px 14px', border: '1px solid #e0e0e0', borderRadius: 20, fontSize: 13, fontFamily: 'inherit'}} />
            <button className="btn btn-p" style={{borderRadius: 20}} onClick={() => alert('Message sent')}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
