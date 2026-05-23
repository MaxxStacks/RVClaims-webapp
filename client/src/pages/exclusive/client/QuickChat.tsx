import { useLocation } from 'wouter';

export default function QuickChat() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Quick Chat with Smith's RV Centre</span><span style={{fontSize: 12, color: '#888'}}>For quick questions that don't need a ticket</span></div>
          <div className="comm-box" style={{margin: 0, border: 'none', borderRadius: 0, maxHeight: 400, overflowY: 'auto'}}>
            <div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">Smith's RV Centre</div><div className="comm-text">Hey Robert! Feel free to drop any quick questions here. For anything that needs tracking (claims, parts, billing), use Support Tickets instead.</div><div className="comm-time">Feb 10</div></div></div>
            <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">What are your service hours this Saturday?</div><div className="comm-time">Mar 15, 3:20 PM</div></div></div>
            <div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">Smith's RV Centre</div><div className="comm-text">We're open 9am - 2pm on Saturdays. Want to book something?</div><div className="comm-time">Mar 15, 3:45 PM</div></div></div>
            <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">No just wondering, thanks!</div><div className="comm-time">Mar 15, 4:00 PM</div></div></div>
          </div>
          <div style={{padding: '16px 20px', borderTop: '1px solid #f0f0f0'}}>
            <textarea placeholder="Type a quick message..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea>
            <div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div>
          </div>
        </div>
        <div>
          <div style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16}}>
            <div style={{fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 8}}>Need to track something?</div>
            <div style={{fontSize: 12, color: '#3b82f6', lineHeight: '1.5', marginBottom: 12}}>Quick Chat is for simple questions. For claims, parts, billing, or anything that needs a status, create a Support Ticket instead.</div>
            <button className="btn btn-o btn-sm" style={{width: '100%', justifyContent: 'center', borderColor: '#93c5fd', color: '#2563eb'}} onClick={() => navigate('new-ticket')}>Create Support Ticket</button>
          </div>
          <div className="cd-section" style={{marginTop: 16}}><div className="cd-section-h">Dealer Info</div>
            <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value">Smith's RV Centre</span></div>
            <div className="cd-row"><span className="cd-label">Hours</span><span className="cd-value">Mon-Fri 8-5, Sat 9-2</span></div>
            <div className="cd-row"><span className="cd-label">Phone</span><span className="cd-value">(905) 555-0100</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
