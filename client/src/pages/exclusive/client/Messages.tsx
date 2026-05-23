export default function Messages() {
  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, height: 520}}>
        <div className="pn" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 13}}>Inbox</div>
          {[
            {name: "Smith's RV Centre", msg: 'Your claim CLM-0248 is being processed.', time: '2h ago', unread: true},
            {name: "Smith's RV Centre", msg: 'Parts ordered for your warranty repair.', time: '3d ago', unread: false},
          ].map((m, i) => (
            <div key={i} style={{padding: '12px 16px', borderBottom: '1px solid #f8f8f8', cursor: 'pointer', background: m.unread ? '#f0f4ff' : 'white', display: 'flex', gap: 10}}>
              <div style={{width: 36, height: 36, borderRadius: '50%', background: '#08235d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0}}>SR</div>
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
          <div style={{padding: '12px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 14}}>Smith's RV Centre</div>
          <div style={{flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10}}>
            <div style={{background: '#f0f4ff', borderRadius: 12, padding: '12px 16px', maxWidth: '80%', fontSize: 13, alignSelf: 'flex-start'}}>Hi Robert — your claim CLM-0248 has been submitted to Jayco. Expected response within 5-7 business days. We'll keep you updated!</div>
            <div style={{background: '#08235d', color: 'white', borderRadius: 12, padding: '12px 16px', maxWidth: '80%', fontSize: 13, alignSelf: 'flex-end'}}>Thanks! Is there anything I need to do on my end?</div>
            <div style={{background: '#f0f4ff', borderRadius: 12, padding: '12px 16px', maxWidth: '80%', fontSize: 13, alignSelf: 'flex-start'}}>Nothing for now. We have all the photos we need. The part has been ordered and should arrive by May 3rd.</div>
          </div>
          <div style={{padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8}}>
            <input placeholder="Reply to Smith's RV Centre..." style={{flex: 1, padding: '8px 14px', border: '1px solid #e0e0e0', borderRadius: 20, fontSize: 13, fontFamily: 'inherit'}} />
            <button className="btn btn-p" style={{borderRadius: 20}} onClick={() => alert('Message sent')}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
