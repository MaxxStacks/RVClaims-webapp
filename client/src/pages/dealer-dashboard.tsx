import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/components/page-layout';
import { useLanguage } from '@/hooks/use-language';

type DashTab = 'listing' | 'reviews' | 'messages' | 'analytics';

export default function DealerDashboardPage() {
  const { language } = useLanguage();
  const qc = useQueryClient();
  const [tab, setTab] = useState<DashTab>('listing');
  const [editMode, setEditMode] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  // Fetch claimed dealer info — in practice would use auth token to identify owner
  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['/api/crm/my-listing'],
    queryFn: async () => {
      const res = await fetch('/api/crm/my-listing', { credentials: 'include' });
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
  });

  const dealer = data?.dealer;

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      const res = await fetch(`/api/crm/dealers/${dealer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/crm/my-listing'] });
      setEditMode(false);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, text }: { reviewId: number; text: string }) => {
      const res = await fetch(`/api/dealers/${dealer.slug}/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reply: text }),
      });
      if (!res.ok) throw new Error('Failed to reply');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/crm/my-listing'] });
      setReplyingTo(null);
      setReplyText('');
    },
  });

  if (isLoading) return (
    <PageLayout seoTitle="My Dealer Dashboard — Dealer Suite 360" seoDescription="">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    </PageLayout>
  );

  if (isError || !dealer) return (
    <PageLayout seoTitle="My Dealer Dashboard — Dealer Suite 360" seoDescription="">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'fr' ? 'Accès restreint' : 'Access Restricted'}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          {language === 'fr'
            ? 'Vous devez avoir réclamé une fiche pour accéder à ce tableau de bord.'
            : 'You must have a claimed listing to access this dashboard.'}
        </p>
        <Link href="/dealers">
          <button className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            {language === 'fr' ? 'Parcourir les fiches' : 'Browse Listings'}
          </button>
        </Link>
      </div>
    </PageLayout>
  );

  const reviews: any[] = dealer.reviews ?? [];
  const messages: any[] = dealer.messages ?? [];
  const avgRating = reviews.length
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const tabs: { id: DashTab; label: string; labelFr: string }[] = [
    { id: 'listing',   label: 'Listing Manager', labelFr: 'Gestion de la fiche' },
    { id: 'reviews',   label: 'Reviews',          labelFr: 'Avis clients' },
    { id: 'messages',  label: 'Messages & Quotes', labelFr: 'Messages & Devis' },
    { id: 'analytics', label: 'Analytics',         labelFr: 'Analytiques' },
  ];

  return (
    <PageLayout
      seoTitle={`${dealer.name} — My Dashboard | Dealer Suite 360`}
      seoDescription=""
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-blue-800 text-white pt-24 pb-10 px-4">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              {language === 'fr' ? 'Tableau de bord' : 'Dealer Dashboard'}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{dealer.name}</h1>
            <p className="text-blue-200 text-sm">{dealer.city}{dealer.stateProvince ? `, ${dealer.stateProvince}` : ''}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href={`/dealers/listing/${dealer.slug}`}>
              <button className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {language === 'fr' ? 'Voir ma fiche' : 'View Listing'}
              </button>
            </Link>
            <Link href="/book-demo">
              <button className="bg-white text-primary font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                {language === 'fr' ? 'Démo DS360' : 'Get DS360 Demo'}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="max-w-4xl mx-auto py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: language === 'fr' ? 'Vues de page' : 'Page Views',      value: dealer.pageViews ?? 0 },
            { label: language === 'fr' ? 'Clics contact' : 'Contact Clicks', value: dealer.contactClicks ?? 0 },
            { label: language === 'fr' ? 'Clics site web' : 'Website Clicks', value: dealer.websiteClicks ?? 0 },
            { label: language === 'fr' ? 'Note moyenne' : 'Avg Rating',       value: avgRating ? `${avgRating} ★` : '—' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-200 px-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'fr' ? t.labelFr : t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* ── LISTING MANAGER ── */}
        {tab === 'listing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {language === 'fr' ? 'Informations de la fiche' : 'Listing Information'}
              </h2>
              {!editMode
                ? <button onClick={() => { setEditMode(true); setEditForm({ description: dealer.description ?? '', phone: dealer.phone ?? '', website: dealer.website ?? '', email: dealer.email ?? '' }); }}
                    className="text-sm font-medium text-primary border border-primary px-4 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">
                    {language === 'fr' ? 'Modifier' : 'Edit'}
                  </button>
                : <div className="flex gap-2">
                    <button onClick={() => updateMutation.mutate(editForm)} disabled={updateMutation.isPending}
                      className="text-sm font-semibold bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
                      {updateMutation.isPending ? '…' : (language === 'fr' ? 'Sauvegarder' : 'Save')}
                    </button>
                    <button onClick={() => setEditMode(false)}
                      className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                  </div>
              }
            </div>
            {updateMutation.isError && <p className="text-red-500 text-sm">{String(updateMutation.error)}</p>}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {[
                { key: 'description', label: language === 'fr' ? 'Description' : 'Description', multiline: true },
                { key: 'phone',   label: language === 'fr' ? 'Téléphone' : 'Phone' },
                { key: 'email',   label: language === 'fr' ? 'Courriel' : 'Email' },
                { key: 'website', label: language === 'fr' ? 'Site web' : 'Website' },
              ].map(field => (
                <div key={field.key} className="p-4 flex gap-4">
                  <span className="w-32 text-sm text-gray-500 flex-shrink-0 pt-0.5">{field.label}</span>
                  {editMode
                    ? field.multiline
                      ? <textarea value={editForm[field.key] ?? ''} onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                          rows={3} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                      : <input value={editForm[field.key] ?? ''} onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    : <span className="flex-1 text-sm text-gray-900">{(dealer as any)[field.key] || <span className="text-gray-400 italic">{language === 'fr' ? 'Non renseigné' : 'Not set'}</span>}</span>
                  }
                </div>
              ))}
            </div>

            {/* Hours notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <p className="font-semibold mb-1">{language === 'fr' ? 'Heures d\'ouverture' : 'Business Hours'}</p>
              <p className="text-blue-600">{language === 'fr' ? 'Contactez notre équipe pour mettre à jour vos heures d\'ouverture.' : 'Contact our team to update your business hours.'}</p>
            </div>

            {/* DS360 upgrade teaser */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">
                    {language === 'fr' ? 'Passer à Dealer Suite 360' : 'Upgrade to Dealer Suite 360'}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    {language === 'fr'
                      ? 'Gérez vos réclamations de garantie, financement, F&I, pièces et plus — tout sur une seule plateforme.'
                      : 'Manage warranty claims, financing, F&I, parts orders, and more — all in one platform.'}
                  </p>
                  <Link href="/book-demo">
                    <button className="text-sm font-semibold text-primary hover:underline">
                      {language === 'fr' ? 'Demander une démo →' : 'Request a Demo →'}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {language === 'fr' ? 'Avis clients' : 'Customer Reviews'}
              </h2>
              {avgRating && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{avgRating}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= Math.round(parseFloat(avgRating)) ? '#F59E0B' : '#E5E7EB'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{reviews.length} {language === 'fr' ? 'avis' : 'reviews'}</p>
                  </div>
                </div>
              )}
            </div>

            {reviews.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-gray-500 text-sm">{language === 'fr' ? 'Aucun avis pour l\'instant.' : 'No reviews yet.'}</p>
              </div>
            )}

            {reviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.authorName}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill={n <= review.rating ? '#F59E0B' : '#E5E7EB'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                    {review.status}
                  </span>
                </div>
                {review.title && <p className="font-medium text-gray-900 text-sm mb-1">{review.title}</p>}
                <p className="text-gray-600 text-sm mb-3">{review.body}</p>

                {review.ownerReply
                  ? <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
                      <p className="font-semibold text-blue-700 mb-1">{language === 'fr' ? 'Votre réponse:' : 'Your reply:'}</p>
                      <p className="text-blue-700">{review.ownerReply}</p>
                    </div>
                  : review.status === 'approved' && (
                    replyingTo === review.id
                      ? <div className="space-y-2">
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder={language === 'fr' ? 'Votre réponse…' : 'Your reply…'}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => replyMutation.mutate({ reviewId: review.id, text: replyText })} disabled={replyMutation.isPending || !replyText.trim()}
                              className="text-sm bg-primary text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                              {replyMutation.isPending ? '…' : (language === 'fr' ? 'Envoyer' : 'Send')}
                            </button>
                            <button onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                              {language === 'fr' ? 'Annuler' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      : <button onClick={() => setReplyingTo(review.id)}
                          className="text-sm text-primary font-medium hover:underline">
                          {language === 'fr' ? 'Répondre →' : 'Reply →'}
                        </button>
                  )
                }
              </div>
            ))}
          </div>
        )}

        {/* ── MESSAGES & QUOTES ── */}
        {tab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'fr' ? 'Messages & Demandes de devis' : 'Messages & Quote Requests'}
            </h2>

            {messages.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-500 text-sm">{language === 'fr' ? 'Aucun message pour l\'instant.' : 'No messages yet.'}</p>
              </div>
            )}

            {messages.map((msg: any) => (
              <div key={msg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{msg.senderName}</p>
                    <p className="text-xs text-gray-400">{msg.senderEmail}{msg.senderPhone ? ` · ${msg.senderPhone}` : ''}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                {msg.subject && <p className="font-medium text-gray-700 text-sm mb-1">{msg.subject}</p>}
                <p className="text-gray-600 text-sm">{msg.body}</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a href={`mailto:${msg.senderEmail}`}
                    className="text-sm text-primary font-medium hover:underline">
                    {language === 'fr' ? 'Répondre par courriel →' : 'Reply by email →'}
                  </a>
                </div>
              </div>
            ))}

            {/* Upgrade note */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-50 border border-blue-100 rounded-2xl p-5 text-sm">
              <p className="font-semibold text-primary mb-1">{language === 'fr' ? 'Messagerie avancée disponible dans DS360' : 'Advanced messaging available in DS360'}</p>
              <p className="text-gray-600">{language === 'fr' ? 'Répondez directement aux messages, gérez vos devis et suivez vos leads depuis votre portail DS360.' : 'Reply directly to messages, manage quotes, and track leads from your DS360 portal.'}</p>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'fr' ? 'Analytiques de la fiche' : 'Listing Analytics'}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: language === 'fr' ? 'Vues totales' : 'Total Views',         value: dealer.pageViews ?? 0,     icon: '👁' },
                { label: language === 'fr' ? 'Clics contact' : 'Contact Clicks',    value: dealer.contactClicks ?? 0, icon: '📞' },
                { label: language === 'fr' ? 'Clics site web' : 'Website Clicks',    value: dealer.websiteClicks ?? 0, icon: '🌐' },
                { label: language === 'fr' ? 'Avis reçus' : 'Reviews Received',      value: reviews.length,            icon: '⭐' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Premium analytics teaser */}
            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">{language === 'fr' ? 'Analytiques avancées dans DS360' : 'Advanced Analytics in DS360'}</p>
                  <p className="text-blue-200 text-sm mb-4">
                    {language === 'fr'
                      ? 'Obtenez des données détaillées: sources de trafic, entonnoir de conversion, tendances hebdomadaires, et plus.'
                      : 'Get detailed data: traffic sources, conversion funnel, weekly trends, lead scoring, and more.'}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Link href="/pricing">
                      <button className="bg-white text-primary font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                        {language === 'fr' ? 'Voir les plans' : 'View Plans'}
                      </button>
                    </Link>
                    <Link href="/book-demo">
                      <button className="border border-white/40 text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                        {language === 'fr' ? 'Demander une démo' : 'Request a Demo'}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="font-semibold text-gray-900 mb-4">{language === 'fr' ? 'Ce qui est inclus gratuitement:' : 'Included in your free listing:'}</p>
              <ul className="space-y-2">
                {(language === 'fr'
                  ? ['Page de fiche publique sur dealersuite360.com', 'Vues de page et clics de contact', 'Formulaire de contact + demandes de devis', 'Collecte d\'avis clients', 'Réponse aux avis']
                  : ['Public listing page on dealersuite360.com', 'Page view and contact click tracking', 'Contact form + quote request inbox', 'Customer review collection', 'Owner reply to reviews']
                ).map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="mt-0.5 flex-shrink-0 text-emerald-500" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
