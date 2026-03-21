import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  CheckCircle2, Calendar, Clock, ChevronLeft, ChevronRight,
  Phone, Shield, Check, AlertCircle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTEREST_KEYS = ['claims','financing','fi','warranty','marketplace','auctions','fullDemo'] as const;
type InterestKey = typeof INTEREST_KEYS[number];

const PROVINCE_CODES = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'] as const;

const TIME_SLOTS = [
  { value: '09:00', display: '9:00 AM' },
  { value: '10:00', display: '10:00 AM' },
  { value: '11:00', display: '11:00 AM' },
  { value: '13:00', display: '1:00 PM' },
  { value: '14:00', display: '2:00 PM' },
  { value: '15:00', display: '3:00 PM' },
  { value: '16:00', display: '4:00 PM' },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getAvailableDateSet(): Set<string> {
  const set = new Set<string>();
  const today = new Date();
  today.setHours(0,0,0,0);
  const cur = new Date(today);
  cur.setDate(cur.getDate() + 1);
  let count = 0;
  while (count < 21) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) { set.add(toDateKey(cur)); count++; }
    cur.setDate(cur.getDate() + 1);
  }
  return set;
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function generateICS(date: Date, timeValue: string, dealership: string) {
  const [h, m] = timeValue.split(':').map(Number);
  // EDT = UTC-4; all bookings within the next ~4 weeks fall in EDT (March–November 2026)
  const startUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h + 4, m, 0));
  const endUTC   = new Date(startUTC.getTime() + 30 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:.]/g,'').slice(0,15) + 'Z';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dealer Suite 360//Discovery Call//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(startUTC)}`,
    `DTEND:${fmt(endUTC)}`,
    'SUMMARY:Dealer Suite 360 — Discovery Call',
    `DESCRIPTION:30-minute discovery call with a Dealer Suite 360 advisor.\\nDealership: ${dealership}`,
    'ORGANIZER;CN=Dealer Suite 360:MAILTO:hello@dealersuite360.com',
    `UID:${Date.now()}@dealersuite360.com`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'dealersuite360-discovery-call.ics';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({
  selectedDate, onSelect, availableDates,
}: {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  availableDates: Set<string>;
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay  = new Date(viewYear, viewMonth + 1, 0);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(viewYear, viewMonth, d));

  const canGoBack = viewYear > today.getFullYear() || viewMonth > today.getMonth();

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prev} disabled={!canGoBack}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const key      = toDateKey(day);
          const available = availableDates.has(key);
          const past     = day <= today;
          const weekend  = day.getDay() === 0 || day.getDay() === 6;
          const selected = selectedDate && toDateKey(selectedDate) === key;
          const clickable = available && !past && !weekend;
          return (
            <button
              key={key}
              onClick={() => clickable && onSelect(day)}
              disabled={!clickable}
              className={`
                h-9 w-full rounded-md text-sm font-medium transition-all
                ${selected  ? 'bg-primary text-white shadow-sm' : ''}
                ${clickable && !selected ? 'hover:bg-primary/10 text-foreground cursor-pointer' : ''}
                ${!clickable ? 'text-muted-foreground/40 cursor-default' : ''}
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {labels.map((label, i) => {
        const step   = i + 1;
        const done   = current > step;
        const active = current === step;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${done   ? 'bg-primary text-white' : ''}
                ${active ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                ${!done && !active ? 'bg-muted text-muted-foreground' : ''}
              `}>
                {done ? <Check className="w-4 h-4" /> : step}
              </div>
              <span className={`text-xs mt-1 font-medium whitespace-nowrap hidden sm:block ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-5 transition-colors ${done ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FormData = {
  firstName: string;
  lastName: string;
  dealership: string;
  email: string;
  phone: string;
  province: string;
  notes: string;
};

export default function BookDemo() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<Set<InterestKey>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', dealership: '', email: '', phone: '', province: '', notes: '',
  });
  const [errors, setErrors]           = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [bookingResult, setBookingResult] = useState<{ date: Date; time: string } | null>(null);

  const availableDates = useMemo(() => getAvailableDateSet(), []);
  const stepLabels  = t('bookingPage.stepLabels') as unknown as string[];
  const panelPoints = t('bookingPage.panelPoints') as unknown as string[];

  const toggleInterest = (key: InterestKey) => {
    setSelectedInterests(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const validateStep3 = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!formData.firstName.trim())  errs.firstName  = 'Required';
    if (!formData.lastName.trim())   errs.lastName   = 'Required';
    if (!formData.dealership.trim()) errs.dealership = 'Required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Valid email required';
    if (!formData.province) errs.province = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:       formData.firstName,
          lastName:        formData.lastName,
          email:           formData.email,
          phone:           formData.phone || undefined,
          dealershipName:  formData.dealership,
          province:        formData.province,
          serviceInterest: Array.from(selectedInterests),
          scheduledDate:   toDateKey(selectedDate!),
          scheduledTime:   selectedTime!,
          notes:           formData.notes || undefined,
          language,
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setBookingResult({ date: selectedDate!, time: selectedTime! });
      setStep(4);
    } catch {
      setSubmitError(t('bookingPage.errorSubmit') as string);
    } finally {
      setSubmitting(false);
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Dealer Suite 360 Discovery Call Booking",
    "provider": { "@type": "Organization", "name": "Dealer Suite 360" },
    "description": "Schedule a free 30-minute discovery call with a Dealer Suite 360 advisor.",
    "url": "https://dealersuite360.com/book-demo",
  };

  return (
    <PageLayout
      seoTitle={t('bookingPage.seoTitle') as string}
      seoDescription={t('bookingPage.seoDescription') as string}
      seoKeywords="book a demo, Dealer Suite 360, discovery call, RV dealer consultation, schedule a call"
      canonical="/book-demo"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-10 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-5 border border-primary/20 px-3 py-1 text-xs" variant="outline">
            <Calendar className="mr-2 h-3 w-3" />
            {t('bookingPage.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t('bookingPage.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('bookingPage.description')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[320px_1fr] gap-10 items-start">

            {/* ── Left Info Panel ── */}
            <div className="lg:sticky lg:top-24 bg-card rounded-2xl border border-border p-7">
              <h2 className="font-bold text-lg mb-5">{t('bookingPage.panelTitle')}</h2>
              <ul className="space-y-3 mb-7">
                {Array.isArray(panelPoints) && panelPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-5 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>30 min · Eastern Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href="tel:8884432204" className="hover:text-primary transition-colors">(888) 443-2204</a>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>No pressure · No obligation</span>
                </div>
              </div>
            </div>

            {/* ── Right Wizard ── */}
            <div className="bg-card rounded-2xl border border-border p-7">
              {step < 4 && (
                <StepIndicator
                  current={step}
                  labels={Array.isArray(stepLabels) ? stepLabels : ['1','2','3','4']}
                />
              )}

              {/* ══ Step 1: Interests ══ */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('bookingPage.step1Title')}</h2>
                  <p className="text-muted-foreground text-sm mb-6">{t('bookingPage.step1Subtitle')}</p>

                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {INTEREST_KEYS.map((key) => {
                      const selected = selectedInterests.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleInterest(key)}
                          className={`
                            text-left p-4 rounded-xl border-2 transition-all duration-200
                            ${selected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40 bg-background'}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`
                              w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors
                              ${selected ? 'bg-primary border-primary' : 'border-border'}
                            `}>
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground">
                                {t(`bookingPage.interests.${key}Label`)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {t(`bookingPage.interests.${key}Desc`)}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setStep(2)} disabled={selectedInterests.size === 0} size="lg">
                      {t('bookingPage.next')}
                    </Button>
                  </div>
                </div>
              )}

              {/* ══ Step 2: Date & Time ══ */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('bookingPage.step2Title')}</h2>
                  <p className="text-muted-foreground text-sm mb-6">{t('bookingPage.step2Subtitle')}</p>

                  <div className="grid md:grid-cols-[1.1fr_1fr] gap-4 mb-8">
                    {/* Calendar */}
                    <div className="bg-background rounded-xl border border-border p-4">
                      <MiniCalendar
                        selectedDate={selectedDate}
                        onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                        availableDates={availableDates}
                      />
                    </div>

                    {/* Time slots */}
                    <div className="bg-background rounded-xl border border-border p-4">
                      {selectedDate ? (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                            {formatDisplayDate(selectedDate)}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {TIME_SLOTS.map(slot => (
                              <button
                                key={slot.value}
                                onClick={() => setSelectedTime(slot.value)}
                                className={`
                                  py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all
                                  ${selectedTime === slot.value
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-border hover:border-primary/40 bg-card text-foreground'}
                                `}
                              >
                                {slot.display}
                              </button>
                            ))}
                          </div>
                          {!selectedTime && (
                            <p className="text-xs text-muted-foreground mt-3">
                              {t('bookingPage.selectTimePlaceholder')}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-sm text-muted-foreground py-10 text-center px-2">
                          {t('bookingPage.selectDateFirst')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" />{t('bookingPage.back')}
                    </Button>
                    <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} size="lg">
                      {t('bookingPage.next')}
                    </Button>
                  </div>
                </div>
              )}

              {/* ══ Step 3: Contact Info ══ */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('bookingPage.step3Title')}</h2>
                  <p className="text-muted-foreground text-sm mb-6">{t('bookingPage.step3Subtitle')}</p>

                  <div className="space-y-4 mb-8">
                    {/* Name row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(['firstName', 'lastName'] as const).map(field => (
                        <div key={field}>
                          <label className="text-sm font-medium text-foreground block mb-1.5">
                            {t(`bookingPage.${field}`)}
                          </label>
                          <input
                            type="text"
                            value={formData[field]}
                            onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                            className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors[field] ? 'border-red-400' : 'border-border'}`}
                          />
                          {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Dealership */}
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">
                        {t('bookingPage.dealership')}
                      </label>
                      <input
                        type="text"
                        value={formData.dealership}
                        onChange={e => setFormData(p => ({ ...p, dealership: e.target.value }))}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.dealership ? 'border-red-400' : 'border-border'}`}
                      />
                      {errors.dealership && <p className="text-xs text-red-500 mt-1">{errors.dealership}</p>}
                    </div>

                    {/* Email + Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1.5">
                          {t('bookingPage.email')}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.email ? 'border-red-400' : 'border-border'}`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1.5">
                          {t('bookingPage.phone')}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    {/* Province */}
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">
                        {t('bookingPage.province')}
                      </label>
                      <select
                        value={formData.province}
                        onChange={e => setFormData(p => ({ ...p, province: e.target.value }))}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.province ? 'border-red-400' : 'border-border'}`}
                      >
                        <option value="">— Select —</option>
                        {PROVINCE_CODES.map(code => (
                          <option key={code} value={code}>{t(`bookingPage.provinces.${code}`)}</option>
                        ))}
                      </select>
                      {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">
                        {t('bookingPage.notes')}
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                        placeholder={t('bookingPage.notesPlaceholder') as string}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      <ChevronLeft className="w-4 h-4 mr-1" />{t('bookingPage.back')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting} size="lg">
                      {submitting ? t('bookingPage.submitting') : t('bookingPage.submit')}
                    </Button>
                  </div>
                </div>
              )}

              {/* ══ Step 4: Confirmation ══ */}
              {step === 4 && bookingResult && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">{t('bookingPage.confirmedTitle')}</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {t('bookingPage.confirmedSubtitle')}
                  </p>

                  {/* Booking summary */}
                  <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 mb-8 text-left max-w-sm mx-auto space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('bookingPage.confirmedDate')}</span>
                      <span className="font-semibold text-right ml-4">{formatDisplayDate(bookingResult.date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('bookingPage.confirmedTime')}</span>
                      <span className="font-semibold">
                        {TIME_SLOTS.find(s => s.value === bookingResult.time)?.display} ET
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('bookingPage.confirmedWith')}</span>
                      <span className="font-semibold">{t('bookingPage.advisorName')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => generateICS(bookingResult.date, bookingResult.time, formData.dealership)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {t('bookingPage.addToCalendar')}
                    </Button>
                    <Button asChild>
                      <Link href="/">{t('bookingPage.backToHome')}</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
