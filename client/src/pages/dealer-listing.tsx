import { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/page-layout';
import { useLanguage } from '@/hooks/use-language';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function BusinessHours({ hours }: { hours: Record<string, string> }) {
  const days = [
    ['mon', 'Monday / Lundi'], ['tue', 'Tuesday / Mardi'], ['wed', 'Wednesday / Mercredi'],
    ['thu', 'Thursday / Jeudi'], ['fri', 'Friday / Vendredi'], ['sat', 'Saturday / Samedi'], ['sun', 'Sunday / Dimanche'],
  ];
  return (
    <div className="space-y-1">
      {days.map(([key, label]) => (
        <div key={key} className="flex justify-between text-sm">
          <span className="text-gray-500">{label}</span>
          <span className="font-medium text-gray-900">{hours[key] || 'Closed'}</span>
        </div>
      ))}
    </div>
  );
}

export default function DealerListingPage() {
  const { language } = useLanguage();
  const [, params] = useRoute('/dealers/listing/:slug');
  const slug = params?.slug;
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', reviewerEmail: '', rating: 5, title: '', body: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [msgForm, setMsgForm] = useState({ senderName: '', senderEmail: '', senderPhone: '', messageType: 'general', subject: '', body: '' });
  const [msgSent, setMsgSent] = useState(false);

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['/api/dealers/listing', slug],
    queryFn: async () => {
      const res = await fetch(`/api/dealers/${slug}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <PageLayout seoTitle="Loading… — Dealer Suite 360" seoDescription="">
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError || !data?.dealer) {
    return (
      <PageLayout seoTitle="Dealer not found — Dealer Suite 360" seoDescription="">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {language === 'fr' ? 'Concessionnaire introuvable' : 'Dealer not found'}
          </h1>
          <Link href="/dealers">
            <button className="text-primary underline">{language === 'fr' ? '← Retour au répertoire' : '← Back to directory'}</button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const { dealer, reviews, avgRating, reviewCount } = data;

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealer.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: dealer.address,
      addressLocality: dealer.city,
      addressRegion: dealer.stateProvince,
      postalCode: dealer.postalCode,
      addressCountry: dealer.country,
    },
    telephone: dealer.phone,
    url: dealer.website || `https://dealersuite360.com/dealers/listing/${dealer.slug}`,
    ...(avgRating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating.toFixed(1), reviewCount } } : {}),
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.reviewerName || !reviewForm.rating) return;
    await fetch(`/api/dealers/${slug}/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewForm),
    });
    setReviewSubmitted(true);
    setShowReviewForm(false);
  };

  const handleMessageSubmit = async () => {
    if (!msgForm.senderName || !msgForm.senderEmail || !msgForm.body) return;
    await fetch(`/api/dealers/${slug}/message`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgForm),
    });
    setMsgSent(true);
    setShowMessageForm(false);
  };

  const trackClick = (type: 'website' | 'contact') => {
    fetch(`/api/dealers/${slug}/click`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
  };

  return (
    <PageLayout
      seoTitle={dealer.metaTitle || `${dealer.name} — RV Dealer in ${dealer.city}, ${dealer.stateProvince} | Dealer Suite 360`}
      seoDescription={dealer.metaDescription || `${dealer.name} is an RV dealer in ${dealer.city}, ${dealer.stateProvince}. ${dealer.brandsCarried?.slice(0, 3).join(', ') || 'RV sales and service'}. Contact them today.`}
      canonical={`/dealers/listing/${dealer.slug}`}
      schema={[localBusiness]}
    >
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-800 text-white pt-24 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/dealers">
            <button className="text-blue-200 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              {language === 'fr' ? 'Retour au répertoire' : 'Back to directory'}
            </button>
          </Link>
          <div className="flex items-start gap-5">
            {dealer.logoUrl ? (
              <img src={dealer.logoUrl} alt={dealer.name} className="w-20 h-20 rounded-xl object-contain bg-white/10 border border-white/20 flex-shrink-0 p-2" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7">
                  <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/>
                </svg>
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {dealer.isVerified && <span className="bg-blue-500/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">✓ DS360 Verified</span>}
                {dealer.isClaimed && !dealer.isVerified && <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">Claimed</span>}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{dealer.name}</h1>
              <p className="text-blue-200">{dealer.address ? `${dealer.address}, ` : ''}{dealer.city}{dealer.stateProvince ? `, ${dealer.stateProvince}` : ''} · {dealer.country}</p>
              {avgRating && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={avgRating} />
                  <span className="text-blue-200 text-sm">{avgRating.toFixed(1)} ({reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>
          {/* Contact bar */}
          <div className="flex flex-wrap gap-3 mt-6">
            {dealer.phone && (
              <a href={`tel:${dealer.phone}`} onClick={() => trackClick('contact')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm px-4 py-2 rounded-lg transition-colors border border-white/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18H5a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
                {dealer.phone}
              </a>
            )}
            {dealer.email && (
              <a href={`mailto:${dealer.email}`} onClick={() => trackClick('contact')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm px-4 py-2 rounded-lg transition-colors border border-white/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {language === 'fr' ? 'Courriel' : 'Email'}
              </a>
            )}
            {dealer.website && (
              <a href={dealer.website} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('website')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm px-4 py-2 rounded-lg transition-colors border border-white/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                {language === 'fr' ? 'Site web' : 'Website'}
              </a>
            )}
            <button onClick={() => setShowMessageForm(true)}
              className="flex items-center gap-2 bg-white text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              {language === 'fr' ? 'Envoyer un message' : 'Send Message'}
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* About + Details */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {dealer.description && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-3">{language === 'fr' ? 'À propos' : 'About'}</h2>
                <p className="text-gray-600 leading-relaxed">{dealer.description}</p>
              </div>
            )}

            {dealer.brandsCarried && dealer.brandsCarried.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">{language === 'fr' ? 'Marques' : 'Brands Carried'}</h2>
                <div className="flex flex-wrap gap-2">
                  {dealer.brandsCarried.map((b: string) => (
                    <span key={b} className="bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full font-medium border border-blue-100">{b}</span>
                  ))}
                </div>
              </div>
            )}

            {dealer.servicesOffered && dealer.servicesOffered.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">{language === 'fr' ? 'Services offerts' : 'Services Offered'}</h2>
                <div className="flex flex-wrap gap-2">
                  {dealer.servicesOffered.map((s: string) => (
                    <span key={s} className="bg-emerald-50 text-emerald-700 text-sm px-3 py-1.5 rounded-full font-medium border border-emerald-100">
                      <svg className="inline mr-1" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">{language === 'fr' ? 'Informations' : 'Details'}</h3>
              <dl className="space-y-2 text-sm">
                {dealer.yearEstablished && (
                  <div><dt className="text-gray-500">{language === 'fr' ? 'Établi en' : 'Established'}</dt><dd className="font-medium text-gray-900">{dealer.yearEstablished}</dd></div>
                )}
                {dealer.numberOfLocations && dealer.numberOfLocations > 1 && (
                  <div><dt className="text-gray-500">{language === 'fr' ? 'Emplacements' : 'Locations'}</dt><dd className="font-medium text-gray-900">{dealer.numberOfLocations}</dd></div>
                )}
                {dealer.estimatedUnitVolume && (
                  <div><dt className="text-gray-500">{language === 'fr' ? 'Volume de ventes' : 'Unit Volume'}</dt><dd className="font-medium text-gray-900 capitalize">{dealer.estimatedUnitVolume}</dd></div>
                )}
                <div><dt className="text-gray-500">{language === 'fr' ? 'Annonce' : 'Listing'}</dt>
                  <dd className={`font-medium text-sm ${dealer.isVerified ? 'text-blue-600' : dealer.isClaimed ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {dealer.isVerified ? '✓ DS360 Verified' : dealer.isClaimed ? 'Claimed' : 'Basic'}
                  </dd>
                </div>
              </dl>
            </div>

            {dealer.businessHours && Object.keys(dealer.businessHours).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">{language === 'fr' ? 'Heures d\'ouverture' : 'Business Hours'}</h3>
                <BusinessHours hours={dealer.businessHours} />
              </div>
            )}

            {/* Map placeholder */}
            {(dealer.latitude || dealer.city) && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-100 h-36 flex items-center justify-center">
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${dealer.name} ${dealer.city} ${dealer.stateProvince}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-xs">{language === 'fr' ? 'Voir sur Google Maps' : 'View on Google Maps'}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Unclaimed CTA */}
            {!dealer.isClaimed && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-semibold text-amber-900 text-sm mb-2">{language === 'fr' ? 'Est-ce votre concessionnaire?' : 'Is this your dealership?'}</h3>
                <p className="text-amber-700 text-xs mb-3">{language === 'fr' ? 'Réclamez cette page gratuitement pour mettre à jour vos informations.' : 'Claim this free listing to update your info, respond to reviews, and manage messages.'}</p>
                <Link href={`/dealers/claim/${dealer.slug}`}>
                  <button className="w-full bg-amber-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-amber-600 transition-colors">
                    {language === 'fr' ? 'Réclamer cette page' : 'Claim This Page'}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'fr' ? `Avis (${reviewCount})` : `Reviews (${reviewCount})`}
            </h2>
            {!reviewSubmitted && (
              <button onClick={() => setShowReviewForm(s => !s)}
                className="text-sm text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                {language === 'fr' ? '+ Laisser un avis' : '+ Leave a Review'}
              </button>
            )}
          </div>

          {reviewSubmitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-emerald-700 text-sm">
              {language === 'fr' ? 'Merci pour votre avis! Il sera publié après modération.' : 'Thank you! Your review will be published after moderation.'}
            </div>
          )}

          {showReviewForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">{language === 'fr' ? 'Écrire un avis' : 'Write a Review'}</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{language === 'fr' ? 'Note:' : 'Rating:'}</span>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill={s <= reviewForm.rating ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input placeholder={language === 'fr' ? 'Votre nom *' : 'Your name *'} value={reviewForm.reviewerName}
                    onChange={e => setReviewForm(f => ({ ...f, reviewerName: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input placeholder={language === 'fr' ? 'Courriel (privé)' : 'Email (private)'} value={reviewForm.reviewerEmail}
                    onChange={e => setReviewForm(f => ({ ...f, reviewerEmail: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <input placeholder={language === 'fr' ? 'Titre de l\'avis' : 'Review title'} value={reviewForm.title}
                  onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <textarea rows={3} placeholder={language === 'fr' ? 'Votre expérience…' : 'Your experience…'} value={reviewForm.body}
                  onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <div className="flex gap-3">
                  <button onClick={handleReviewSubmit} className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {language === 'fr' ? 'Soumettre l\'avis' : 'Submit Review'}
                  </button>
                  <button onClick={() => setShowReviewForm(false)} className="text-gray-500 text-sm px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              <p>{language === 'fr' ? 'Aucun avis pour l\'instant. Soyez le premier!' : 'No reviews yet. Be the first!'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{review.reviewerName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  {review.title && <p className="font-medium text-gray-900 text-sm mb-1">{review.title}</p>}
                  {review.body && <p className="text-gray-600 text-sm leading-relaxed">{review.body}</p>}
                  {review.dealerResponse && (
                    <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-blue-50 p-3 rounded-r-lg">
                      <p className="text-xs font-semibold text-primary mb-1">{language === 'fr' ? 'Réponse du concessionnaire:' : 'Dealer response:'}</p>
                      <p className="text-sm text-gray-600">{review.dealerResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message modal */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMessageForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-4">{language === 'fr' ? `Contacter ${dealer.name}` : `Contact ${dealer.name}`}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder={language === 'fr' ? 'Nom *' : 'Name *'} value={msgForm.senderName}
                  onChange={e => setMsgForm(f => ({ ...f, senderName: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input placeholder={language === 'fr' ? 'Téléphone' : 'Phone'} value={msgForm.senderPhone}
                  onChange={e => setMsgForm(f => ({ ...f, senderPhone: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <input placeholder={language === 'fr' ? 'Courriel *' : 'Email *'} value={msgForm.senderEmail}
                onChange={e => setMsgForm(f => ({ ...f, senderEmail: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <select value={msgForm.messageType} onChange={e => setMsgForm(f => ({ ...f, messageType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="general">{language === 'fr' ? 'Renseignements généraux' : 'General Inquiry'}</option>
                <option value="quote_request">{language === 'fr' ? 'Demande de prix' : 'Quote Request'}</option>
                <option value="appointment_request">{language === 'fr' ? 'Rendez-vous' : 'Appointment Request'}</option>
                <option value="service_inquiry">{language === 'fr' ? 'Service et réparations' : 'Service Inquiry'}</option>
              </select>
              <textarea rows={4} placeholder={language === 'fr' ? 'Votre message *' : 'Your message *'} value={msgForm.body}
                onChange={e => setMsgForm(f => ({ ...f, body: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              <div className="flex gap-3 pt-2">
                <button onClick={handleMessageSubmit} className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  {language === 'fr' ? 'Envoyer' : 'Send Message'}
                </button>
                <button onClick={() => setShowMessageForm(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {msgSent && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50">
          {language === 'fr' ? '✓ Message envoyé!' : '✓ Message sent!'}
        </div>
      )}

      {/* DS360 CTA */}
      <section className="bg-gradient-to-r from-primary to-blue-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">
            {language === 'fr' ? 'Gérez vos réclamations plus intelligemment' : 'Manage warranty claims smarter'}
          </h2>
          <p className="text-blue-100 mb-6 text-sm">
            {language === 'fr'
              ? 'Dealer Suite 360 automatise le traitement des réclamations pour les concessionnaires VR en Amérique du Nord.'
              : 'Dealer Suite 360 automates warranty claims processing for RV dealerships across North America.'}
          </p>
          <Link href="/book-demo">
            <button className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              {language === 'fr' ? 'Demander une démo' : 'Request a Demo'}
            </button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
