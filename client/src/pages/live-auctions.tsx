import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { SeoMeta } from '@/components/seo-meta';
import { NotificationBar } from '@/components/notification-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Gavel, Shield, Clock, CreditCard, Trophy, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, ArrowRight, Eye, Banknote, Users,
} from 'lucide-react';

// Auction window: May 8, 2026 12:00 PM EDT (UTC-4) → 16:00 UTC
const AUCTION_START = new Date('2026-05-08T16:00:00Z');
const AUCTION_END   = new Date('2026-05-10T16:00:00Z');

type AuctionState = 'pre' | 'live' | 'ended';
type UserState    = 'guest' | 'registered' | 'bidder';

function getAuctionState(now: Date): AuctionState {
  if (now < AUCTION_START) return 'pre';
  if (now < AUCTION_END)   return 'live';
  return 'ended';
}

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      done:    diff === 0,
    };
  };
  const [countdown, setCountdown] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setCountdown(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return countdown;
}

// ─── Mock auction units ───────────────────────────────────────────────────────
const MOCK_UNITS = [
  { id: 'PA-0201', unit: '2024 Grand Design Imagine 2800BH', type: 'Travel Trailer', specs: "28' · 3 Slides · 2 Bunks · Sleeps 8", minBid: 34900, currentBid: 38200, reserve: 37000, bids: 9, watchers: 22, province: 'ON' },
  { id: 'PA-0202', unit: '2023 Keystone Montana 3855BR', type: 'Fifth Wheel', specs: "42' · 4 Slides · King Bed · Sleeps 6", minBid: 52000, currentBid: 56500, reserve: 55000, bids: 14, watchers: 31, province: 'AB' },
  { id: 'PA-0203', unit: '2024 Jayco Jay Flight 264BH', type: 'Travel Trailer', specs: "28' · 1 Slide · 2 Bunks · Sleeps 8", minBid: 29900, currentBid: 31400, reserve: 30500, bids: 6, watchers: 18, province: 'BC' },
  { id: 'PA-0204', unit: '2023 Forest River Cherokee 304BH', type: 'Travel Trailer', specs: "34' · 2 Slides · Bunk Room · Sleeps 10", minBid: 36500, currentBid: 39000, reserve: 38000, bids: 11, watchers: 27, province: 'ON' },
  { id: 'PA-0205', unit: '2024 Heartland Landmark 365CB', type: 'Fifth Wheel', specs: "40' · 5 Slides · Residential Fridge · Sleeps 4", minBid: 68000, currentBid: 71500, reserve: 70000, bids: 8, watchers: 15, province: 'SK' },
  { id: 'PA-0206', unit: '2024 Coachmen Sportscoach 403QS', type: 'Class A Motorhome', specs: "40' · 3 Slides · Full Bay · Sleeps 4", minBid: 145000, currentBid: 152000, reserve: 149000, bids: 5, watchers: 12, province: 'QC' },
];

const FAQ = [
  { q: 'Who can bid?', a: 'Any adult Canadian resident. Create a free account, add a credit card, and you\'re ready to bid. No dealer license required.' },
  { q: 'What is the $250 hold?', a: 'When you place your first bid, Dealer Suite 360 places a $250 authorization hold on your card. This hold is released automatically if you lose the auction. If you win, the $250 is applied toward your purchase price.' },
  { q: 'How does payment work if I win?', a: 'You have 72 hours to arrange full payment through Dealer Suite 360. Financing is available. If payment is not received in 72 hours, the unit goes to the second-highest bidder and your $250 hold is forfeited.' },
  { q: 'Is financing available?', a: 'Yes. Dealer Suite 360 partners with Canadian lenders. Apply during or after the auction. Pre-approval is recommended before bidding on high-value units.' },
  { q: 'Who are the sellers?', a: 'All units are listed by verified Canadian RV dealerships. Dealer identities are hidden during the auction. You deal exclusively through Dealer Suite 360 as escrow.' },
  { q: 'What happens if the reserve is not met?', a: 'If the winning bid is below the seller\'s reserve price, the unit is not sold and all holds are released.' },
  { q: 'How often are public auctions held?', a: 'Once per month, running for 48 hours. Sign up for notifications to be alerted when the next event is announced.' },
];

// ─── CountdownBlock ───────────────────────────────────────────────────────────
function CountdownBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white text-primary rounded-2xl w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-3xl md:text-4xl font-bold shadow-lg tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="mt-2 text-sm text-white/80 uppercase tracking-widest font-medium">{label}</span>
    </div>
  );
}

// ─── BidUnitCard ──────────────────────────────────────────────────────────────
function BidUnitCard({ unit, userState, onBidClick }: {
  unit: typeof MOCK_UNITS[0];
  userState: UserState;
  onBidClick: (unitId: string) => void;
}) {
  const [bidInput, setBidInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const reserveMet = unit.currentBid >= unit.reserve;

  const handleBid = () => {
    const amt = parseFloat(bidInput.replace(/[^0-9.]/g, ''));
    if (!amt || amt <= unit.currentBid) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setBidInput('');
  };

  return (
    <Card className="border border-gray-200 hover:border-primary/40 transition-colors overflow-hidden">
      <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        <span>Unit Photo</span>
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-primary/70">{unit.id}</span>
          <Badge variant="outline" className="text-xs">{unit.province}</Badge>
        </div>
        <div className="font-bold text-gray-900 mb-1 leading-tight">{unit.unit}</div>
        <div className="text-xs text-gray-500 mb-1">{unit.type}</div>
        <div className="text-xs text-gray-500 mb-3">{unit.specs}</div>

        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div>
            <div className="text-xs text-gray-400">Current Bid</div>
            <div className="text-xl font-bold text-primary">${unit.currentBid.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">{unit.bids} bids · {unit.watchers} watching</div>
            <div className="mt-1">
              {reserveMet
                ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Reserve Met</Badge>
                : <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">Reserve Not Met</Badge>
              }
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium py-2">
            <CheckCircle className="w-4 h-4" /> Bid placed!
          </div>
        ) : userState === 'bidder' ? (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={`Min $${(unit.currentBid + 500).toLocaleString()}`}
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white px-4" onClick={handleBid}>
              Bid
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => onBidClick(unit.id)}
          >
            Register to Bid
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveAuctions() {
  const [, navigate] = useLocation();
  const now = new Date();
  const [auctionState] = useState<AuctionState>(getAuctionState(now));
  const [userState]    = useState<UserState>('guest');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [devMode, setDevMode] = useState(false);

  // Countdown to appropriate target
  const countdownTarget = auctionState === 'pre' ? AUCTION_START : AUCTION_END;
  const countdown = useCountdown(countdownTarget);

  // In dev mode, allow toggling state
  const displayState: AuctionState = devMode ? 'live' : auctionState;

  const goToBidderPortal = () => navigate('/bidder-login');

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SeoMeta
        title="Public Auction — Dealer Suite 360"
        description="Bid on Canadian RV dealership units in the Dealer Suite 360 monthly public auction. No dealer license required. $250 refundable hold. Dealer Suite 360 acts as escrow."
      />
      <NotificationBar />
      <Navigation />

      {/* ── DEV TOGGLE (remove in prod) ── */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setDevMode(!devMode)}
          className="text-xs bg-gray-800 text-gray-200 px-3 py-1.5 rounded-full opacity-50 hover:opacity-100 transition-opacity"
        >
          [Dev] {devMode ? 'Showing: LIVE' : `Showing: ${auctionState.toUpperCase()}`}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════
          PRE-AUCTION GATE
      ════════════════════════════════════════════════════ */}
      {displayState === 'pre' && (
        <>
          {/* Hero / Countdown */}
          <section className="pt-28 pb-20 bg-gradient-to-b from-primary to-[#061b48] text-white">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Gavel className="w-4 h-4" />
                Monthly Public Auction · May 8, 2026
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Dealer Suite 360 Public Auction
              </h1>
              <p className="text-xl text-white/80 mb-3 max-w-2xl mx-auto">
                Shop real Canadian RV dealership inventory at auction prices.
                No dealer license required.
              </p>
              <p className="text-white/60 text-sm mb-12">
                Next auction opens May 8, 2026 at 12:00 PM EDT · Runs 48 hours
              </p>

              {/* Countdown */}
              <div className="flex items-center justify-center gap-4 md:gap-8 mb-12">
                <CountdownBlock label="Days"    value={countdown.days} />
                <span className="text-white/40 text-4xl font-light mb-6">:</span>
                <CountdownBlock label="Hours"   value={countdown.hours} />
                <span className="text-white/40 text-4xl font-light mb-6">:</span>
                <CountdownBlock label="Minutes" value={countdown.minutes} />
                <span className="text-white/40 text-4xl font-light mb-6">:</span>
                <CountdownBlock label="Seconds" value={countdown.seconds} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 font-semibold text-base px-8"
                  onClick={goToBidderPortal}
                >
                  Register to Bid
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 text-base px-8"
                  onClick={() => {}}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Get Notified
                </Button>
              </div>
              <p className="text-white/40 text-xs mt-4">
                Free to register · No purchase obligation
              </p>
            </div>
          </section>

          {/* What is this? */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Dealer Suite 360 connects the public directly with verified Canadian dealerships — once a month, for 48 hours.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <CreditCard className="w-6 h-6 text-primary" />,
                    step: '01',
                    title: 'Register & Add a Card',
                    body: 'Create a free account and add a credit card. No charge until you win a bid.',
                  },
                  {
                    icon: <Gavel className="w-6 h-6 text-primary" />,
                    step: '02',
                    title: 'Bid on Auction Day',
                    body: 'When the auction opens, browse units from verified dealerships and place real-time bids. A $250 hold is placed when you bid — refunded automatically if you lose.',
                  },
                  {
                    icon: <Trophy className="w-6 h-6 text-primary" />,
                    step: '03',
                    title: 'Win & Complete Purchase',
                    body: 'If you win, you have 72 hours to complete payment through Dealer Suite 360 escrow. Financing available. The $250 hold applies toward your total.',
                  },
                ].map((item) => (
                  <Card key={item.step} className="border-2 border-gray-100 relative pt-2">
                    <div className="absolute -top-4 left-6 bg-primary text-white text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center">
                      {item.step}
                    </div>
                    <CardHeader className="pt-8">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                        {item.icon}
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Trust & Rules */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Dealer Suite 360 Acts as Escrow</h2>
                  <div className="space-y-4">
                    {[
                      { icon: <Shield className="w-5 h-5 text-primary" />, text: 'All transactions go through Dealer Suite 360 — you never deal directly with the seller.' },
                      { icon: <Banknote className="w-5 h-5 text-primary" />, text: '$250 hold is placed when you bid. Refunded automatically if you lose. Applied to purchase if you win.' },
                      { icon: <Clock className="w-5 h-5 text-primary" />, text: '72-hour payment window after winning. If you cannot pay, the unit goes to the second-highest bidder.' },
                      { icon: <Users className="w-5 h-5 text-primary" />, text: 'All units are from verified Canadian RV dealerships. Seller identities are revealed only after payment.' },
                      { icon: <CheckCircle className="w-5 h-5 text-primary" />, text: 'Financing available through Dealer Suite 360 lending partners. Pre-approval recommended for bids over $40,000.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{item.icon}</div>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/10">
                  <h3 className="font-bold text-gray-900 text-lg mb-5">Auction Rules at a Glance</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    {[
                      ['Auction Window', '48 hours — May 8 at 12 PM EDT to May 10 at 12 PM EDT'],
                      ['Who Can Bid', 'Any adult Canadian resident'],
                      ['Bid Hold', '$250 per auction (not per unit)'],
                      ['Hold Refund', 'Automatic within 5 business days if you lose'],
                      ['Payment Window', '72 hours from auction close'],
                      ['Commission', 'No buyer commission — only sellers pay'],
                      ['Reserve Price', 'Hidden — shown as "Reserve Met" when reached'],
                      ['Auto-Extend', 'Last 2 minutes: extended 5 min on new bid'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-3 pb-3 border-b border-primary/10 last:border-0 last:pb-0">
                        <span className="font-semibold text-primary shrink-0 w-36">{k}</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQ.map((faq, i) => (
                  <Card key={i} className="border border-gray-200 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                      {openFaq === i
                        ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      }
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="py-16 bg-primary text-white">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for May 8?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Register now — it's free. Add your card before auction day so you're ready to bid the moment doors open.
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 font-semibold text-base px-10"
                onClick={goToBidderPortal}
              >
                Register to Bid — Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════════════
          LIVE AUCTION
      ════════════════════════════════════════════════════ */}
      {displayState === 'live' && (
        <>
          {/* Live Header */}
          <section className="pt-24 pb-8 bg-gradient-to-b from-primary to-[#061b48] text-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                      LIVE NOW
                    </span>
                    <span className="text-white/60 text-sm">May 8, 2026 Public Auction</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-1">Dealer Suite 360 Public Auction</h1>
                  <p className="text-white/70 text-sm">{MOCK_UNITS.length} units · All from verified Canadian dealers · Dealer Suite 360 escrow</p>
                </div>
                <div className="flex flex-col items-center bg-white/10 border border-white/20 rounded-2xl px-8 py-4">
                  <span className="text-white/70 text-xs uppercase tracking-widest mb-1">Closes In</span>
                  <div className="flex items-center gap-2 text-white font-bold text-2xl tabular-nums">
                    <span>{String(countdown.hours).padStart(2,'0')}</span>
                    <span className="opacity-60">:</span>
                    <span>{String(countdown.minutes).padStart(2,'0')}</span>
                    <span className="opacity-60">:</span>
                    <span>{String(countdown.seconds).padStart(2,'0')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bidder status bar */}
          {userState !== 'bidder' && (
            <div className="bg-amber-50 border-b border-amber-200 py-3">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-800 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {userState === 'guest'
                    ? 'You must register and add a credit card to place bids.'
                    : 'Add a credit card to activate bidding. Your $250 hold is refunded if you don\'t win.'}
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shrink-0" onClick={goToBidderPortal}>
                  {userState === 'guest' ? 'Register to Bid' : 'Add Card'}
                </Button>
              </div>
            </div>
          )}

          {/* Unit Grid */}
          <section className="py-10 bg-gray-50 min-h-[60vh]">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_UNITS.map((unit) => (
                  <BidUnitCard
                    key={unit.id}
                    unit={unit}
                    userState={userState}
                    onBidClick={goToBidderPortal}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════════════
          AUCTION ENDED
      ════════════════════════════════════════════════════ */}
      {displayState === 'ended' && (
        <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Gavel className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">May 2026 Auction Has Ended</h1>
            <p className="text-gray-600 text-lg mb-8">
              All units have been settled. The next public auction will be announced shortly.
              Sign up for notifications to be the first to know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" onClick={() => {}}>
                Get Notified for Next Auction
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/network-marketplace'}>
                Browse Dealer Marketplace
              </Button>
            </div>
          </div>
        </section>
      )}

            <Footer />
    </div>
  );
}
