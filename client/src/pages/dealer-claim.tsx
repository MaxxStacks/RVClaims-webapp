import { useState } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/page-layout';
import { useLanguage } from '@/hooks/use-language';

type Step = 'verify' | 'confirm' | 'success';

export default function DealerClaimPage() {
  const { language } = useLanguage();
  const [, params] = useRoute('/dealers/claim/:slug');
  const [, navigate] = useLocation();
  const slug = params?.slug;
  const [step, setStep] = useState<Step>('verify');
  const [form, setForm] = useState({ claimerName: '', claimerEmail: '', claimerPhone: '', claimerTitle: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['/api/dealers/claim-info', slug],
    queryFn: async () => {
      const res = await fetch(`/api/dealers/${slug}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !!slug,
  });

  const dealer = data?.dealer;

  const handleClaim = async () => {
    if (!form.claimerName || !form.claimerEmail) { setError(language === 'fr' ? 'Nom et courriel requis.' : 'Name and email are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/dealers/${slug}/claim`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Claim failed'); }
      setStep('success');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return (
    <PageLayout seoTitle="Claim Listing — Dealer Suite 360" seoDescription="">
      <div className="max-w-lg mx-auto px-4 pt-24 pb-16 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    </PageLayout>
  );

  if (isError || !dealer) return (
    <PageLayout seoTitle="Listing not found — Dealer Suite 360" seoDescription="">
      <div className="max-w-lg mx-auto px-4 pt-24 pb-16 text-center">
        <p className="text-gray-500 mb-4">{language === 'fr' ? 'Concessionnaire introuvable.' : 'Dealer not found.'}</p>
        <Link href="/dealers"><button className="text-primary underline">{language === 'fr' ? '← Retour' : '← Back'}</button></Link>
      </div>
    </PageLayout>
  );

  if (dealer.isClaimed) return (
    <PageLayout seoTitle="Already Claimed — Dealer Suite 360" seoDescription="">
      <div className="max-w-lg mx-auto px-4 pt-24 pb-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{language === 'fr' ? 'Déjà réclamé' : 'Already Claimed'}</h1>
        <p className="text-gray-500 mb-6">{language === 'fr' ? 'Cette page a déjà été réclamée par son propriétaire.' : 'This listing has already been claimed by its owner.'}</p>
        <Link href={`/dealers/listing/${slug}`}><button className="text-primary border border-primary px-5 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">{language === 'fr' ? 'Voir la fiche' : 'View listing'}</button></Link>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout
      seoTitle={`Claim ${dealer.name} — Dealer Suite 360`}
      seoDescription={`Claim your free dealer listing for ${dealer.name} on Dealer Suite 360.`}
    >
      <div className="bg-gradient-to-br from-primary to-blue-800 text-white pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {language === 'fr' ? 'Réclamation de fiche' : 'Claim Listing'}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{dealer.name}</h1>
          <p className="text-blue-200">{dealer.city}{dealer.stateProvince ? `, ${dealer.stateProvince}` : ''}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(['verify', 'confirm', 'success'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step === s || (s === 'success' && step === 'success') ? 'bg-primary text-white' : step === 'confirm' && s === 'verify' ? 'bg-emerald-500 text-white' : step === 'success' && s !== 'success' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {(step === 'confirm' && s === 'verify') || (step === 'success' && s !== 'success') ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${step === s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s === 'verify' ? (language === 'fr' ? 'Vérification' : 'Verify') : s === 'confirm' ? (language === 'fr' ? 'Confirmer' : 'Confirm') : (language === 'fr' ? 'Succès' : 'Success')}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {step === 'verify' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-1">{language === 'fr' ? 'Est-ce votre concessionnaire?' : 'Is this your dealership?'}</h2>
            <p className="text-gray-500 text-sm mb-6">{language === 'fr' ? 'Entrez vos coordonnées pour réclamer cette fiche gratuitement.' : 'Enter your details to claim this free listing.'}</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{language === 'fr' ? 'Nom complet *' : 'Full name *'}</label>
                  <input value={form.claimerName} onChange={e => setForm(f => ({ ...f, claimerName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{language === 'fr' ? 'Titre / Rôle' : 'Title / Role'}</label>
                  <input placeholder={language === 'fr' ? 'ex. Directeur' : 'e.g. General Manager'} value={form.claimerTitle}
                    onChange={e => setForm(f => ({ ...f, claimerTitle: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{language === 'fr' ? 'Courriel professionnel *' : 'Work email *'}</label>
                <input type="email" value={form.claimerEmail} onChange={e => setForm(f => ({ ...f, claimerEmail: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{language === 'fr' ? 'Téléphone' : 'Phone'}</label>
                <input type="tel" value={form.claimerPhone} onChange={e => setForm(f => ({ ...f, claimerPhone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={() => {
                  if (!form.claimerName || !form.claimerEmail) { setError(language === 'fr' ? 'Nom et courriel requis.' : 'Name and email required.'); return; }
                  setError(''); setStep('confirm');
                }}
                className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                {language === 'fr' ? 'Continuer' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-1">{language === 'fr' ? 'Confirmer la réclamation' : 'Confirm Your Claim'}</h2>
            <p className="text-gray-500 text-sm mb-6">{language === 'fr' ? 'Vérifiez vos informations avant de soumettre.' : 'Review your information before submitting.'}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">{language === 'fr' ? 'Concessionnaire' : 'Dealership'}</span><span className="font-medium">{dealer.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{language === 'fr' ? 'Emplacement' : 'Location'}</span><span className="font-medium">{dealer.city}{dealer.stateProvince ? `, ${dealer.stateProvince}` : ''}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{language === 'fr' ? 'Votre nom' : 'Your name'}</span><span className="font-medium">{form.claimerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{language === 'fr' ? 'Courriel' : 'Email'}</span><span className="font-medium">{form.claimerEmail}</span></div>
              {form.claimerTitle && <div className="flex justify-between"><span className="text-gray-500">{language === 'fr' ? 'Titre' : 'Title'}</span><span className="font-medium">{form.claimerTitle}</span></div>}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
              <p className="font-semibold mb-1">{language === 'fr' ? 'Ce que vous obtenez gratuitement:' : 'What you get for free:'}</p>
              <ul className="space-y-1">
                {['Edit your listing info (description, hours, contact)', 'Respond to customer reviews', 'Receive messages and quote requests', 'Basic analytics (page views, contact clicks)'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <svg className="mt-0.5 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={handleClaim} disabled={loading}
                className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
                {loading ? (language === 'fr' ? 'En cours…' : 'Claiming…') : (language === 'fr' ? 'Réclamer ma fiche' : 'Claim My Listing')}
              </button>
              <button onClick={() => setStep('verify')} className="px-5 py-3 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
                {language === 'fr' ? 'Retour' : 'Back'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{language === 'fr' ? 'Fiche réclamée!' : 'Listing Claimed!'}</h2>
            <p className="text-gray-500 mb-6 text-sm">
              {language === 'fr'
                ? `Félicitations! Vous avez réclamé la fiche de ${dealer.name}. Notre équipe va vérifier votre demande sous peu.`
                : `Congratulations! You've claimed ${dealer.name}'s listing. Our team will verify your request shortly.`}
            </p>
            <div className="space-y-3">
              <Link href="/dealer-dashboard">
                <button className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  {language === 'fr' ? 'Accéder à mon tableau de bord' : 'Go to My Dashboard'}
                </button>
              </Link>
              <Link href={`/dealers/listing/${slug}`}>
                <button className="w-full border border-gray-200 text-gray-600 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  {language === 'fr' ? 'Voir ma fiche publique' : 'View my public listing'}
                </button>
              </Link>
            </div>

            {/* DS360 teaser */}
            <div className="mt-8 bg-gradient-to-br from-primary/5 to-blue-50 border border-blue-100 rounded-xl p-5 text-left">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{language === 'fr' ? 'Envie d\'aller plus loin?' : 'Ready to go further?'}</p>
              <p className="text-sm text-gray-700 mb-3">
                {language === 'fr'
                  ? 'Dealer Suite 360 automatise vos réclamations de garantie, financement, F&I, et bien plus.'
                  : 'Dealer Suite 360 automates warranty claims, financing, F&I, parts, and more — all in one platform.'}
              </p>
              <Link href="/book-demo">
                <button className="text-sm text-primary font-semibold hover:underline">{language === 'fr' ? 'Demander une démo →' : 'Request a Demo →'}</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
