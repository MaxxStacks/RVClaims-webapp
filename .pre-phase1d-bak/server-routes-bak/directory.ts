// server/routes/directory.ts — Public dealer directory routes (no auth required)

import { Router } from 'express';
import { db } from '../db';
import {
  dealerListings, crmPipeline, crmActivities,
  dealerReviews, dealerMessages, quoteRequests,
} from '@shared/schema';
import { eq, and, or, ilike, desc, asc, sql, ne } from 'drizzle-orm';

const router = Router();

// ─── GET /api/dealers — Search/browse ───
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 24, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const brand = req.query.brand as string;
    const province = req.query.province as string;
    const country = req.query.country as string;
    const claimed = req.query.claimed as string;

    const conditions: any[] = [eq(dealerListings.listingStatus, 'active')];

    if (search) {
      conditions.push(or(
        ilike(dealerListings.name, `%${search}%`),
        ilike(dealerListings.city, `%${search}%`),
        ilike(dealerListings.stateProvince, `%${search}%`),
        ilike(dealerListings.postalCode, `%${search}%`),
      ));
    }
    if (province) conditions.push(ilike(dealerListings.stateProvince, `%${province}%`));
    if (country) conditions.push(eq(dealerListings.country, country.toUpperCase()));
    if (claimed === 'true') conditions.push(eq(dealerListings.isClaimed, true));

    const dealers = await db.select({
      id: dealerListings.id,
      name: dealerListings.name,
      slug: dealerListings.slug,
      city: dealerListings.city,
      stateProvince: dealerListings.stateProvince,
      country: dealerListings.country,
      phone: dealerListings.phone,
      email: dealerListings.email,
      website: dealerListings.website,
      logoUrl: dealerListings.logoUrl,
      brandsCarried: dealerListings.brandsCarried,
      servicesOffered: dealerListings.servicesOffered,
      isVerified: dealerListings.isVerified,
      isClaimed: dealerListings.isClaimed,
      listingTier: dealerListings.listingTier,
      pageViews: dealerListings.pageViews,
    }).from(dealerListings)
      .where(and(...conditions))
      .orderBy(desc(dealerListings.isVerified), desc(dealerListings.isClaimed), asc(dealerListings.name))
      .limit(limit)
      .offset(offset);

    // Filter by brand (array contains)
    const filtered = brand
      ? dealers.filter(d => d.brandsCarried?.some(b => b.toLowerCase().includes(brand.toLowerCase())))
      : dealers;

    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(dealerListings).where(and(...conditions));

    res.json({
      dealers: filtered,
      pagination: {
        page, limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// ─── GET /api/dealers/provinces — Province list with counts ───
router.get('/provinces', async (req, res) => {
  try {
    const country = (req.query.country as string)?.toUpperCase();
    const conditions: any[] = [eq(dealerListings.listingStatus, 'active')];
    if (country) conditions.push(eq(dealerListings.country, country));

    const rows = await db.select({
      stateProvince: dealerListings.stateProvince,
      country: dealerListings.country,
      count: sql<number>`count(*)`,
    }).from(dealerListings)
      .where(and(...conditions))
      .groupBy(dealerListings.stateProvince, dealerListings.country)
      .orderBy(desc(sql`count(*)`));

    res.json(rows.filter(r => r.stateProvince));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch provinces' });
  }
});

// ─── GET /api/dealers/brands — Brands list ───
router.get('/brands', async (_req, res) => {
  try {
    const dealers = await db.select({ brands: dealerListings.brandsCarried })
      .from(dealerListings).where(eq(dealerListings.listingStatus, 'active'));

    const brandSet = new Set<string>();
    for (const d of dealers) {
      if (d.brands) d.brands.forEach(b => brandSet.add(b));
    }

    res.json(Array.from(brandSet).sort());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// ─── GET /api/dealers/:slug — Single dealer page ───
router.get('/:slug', async (req, res) => {
  try {
    const [dealer] = await db.select().from(dealerListings)
      .where(and(
        eq(dealerListings.slug, req.params.slug),
        ne(dealerListings.listingStatus, 'suspended'),
      )).limit(1);

    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    // Increment page views
    await db.update(dealerListings)
      .set({ pageViews: (dealer.pageViews || 0) + 1 })
      .where(eq(dealerListings.id, dealer.id));

    // Load approved reviews
    const reviews = await db.select({
      id: dealerReviews.id,
      reviewerName: dealerReviews.reviewerName,
      rating: dealerReviews.rating,
      title: dealerReviews.title,
      body: dealerReviews.body,
      dealerResponse: dealerReviews.dealerResponse,
      createdAt: dealerReviews.createdAt,
    }).from(dealerReviews)
      .where(and(
        eq(dealerReviews.dealerListingId, dealer.id),
        eq(dealerReviews.status, 'approved'),
      )).orderBy(desc(dealerReviews.createdAt));

    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

    res.json({ dealer, reviews, avgRating, reviewCount: reviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dealer' });
  }
});

// ─── POST /api/dealers/:slug/review — Submit review ───
router.post('/:slug/review', async (req, res) => {
  try {
    const [dealer] = await db.select({ id: dealerListings.id })
      .from(dealerListings).where(eq(dealerListings.slug, req.params.slug)).limit(1);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    const { reviewerName, reviewerEmail, rating, title, body } = req.body;
    if (!reviewerName || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Name and rating (1-5) are required' });
    }

    const [review] = await db.insert(dealerReviews).values({
      dealerListingId: dealer.id,
      reviewerName,
      reviewerEmail,
      rating: parseInt(rating),
      title,
      body,
      status: 'pending',
    }).returning();

    // Log CRM activity
    await db.insert(crmActivities).values({
      dealerListingId: dealer.id,
      activityType: 'review_received',
      title: `New review: ${rating} stars from ${reviewerName}`,
      description: body?.substring(0, 200),
      createdBy: 'system',
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// ─── POST /api/dealers/:slug/message — Send message to dealer ───
router.post('/:slug/message', async (req, res) => {
  try {
    const [dealer] = await db.select({ id: dealerListings.id })
      .from(dealerListings).where(eq(dealerListings.slug, req.params.slug)).limit(1);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    const { senderName, senderEmail, senderPhone, messageType, subject, body, interestedBrand, interestedModel } = req.body;
    if (!senderName || !senderEmail || !body) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const [message] = await db.insert(dealerMessages).values({
      dealerListingId: dealer.id,
      senderName, senderEmail,
      senderPhone: senderPhone || undefined,
      messageType: messageType || 'general',
      subject: subject || undefined,
      body,
      interestedBrand: interestedBrand || undefined,
      interestedModel: interestedModel || undefined,
    }).returning();

    await db.update(dealerListings)
      .set({ contactClicks: sql`${dealerListings.contactClicks} + 1` })
      .where(eq(dealerListings.id, dealer.id));

    await db.insert(crmActivities).values({
      dealerListingId: dealer.id,
      activityType: 'message_received',
      title: `Message from ${senderName} (${senderEmail})`,
      description: body.substring(0, 200),
      createdBy: 'system',
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ─── POST /api/dealers/:slug/quote — Submit quote request ───
router.post('/:slug/quote', async (req, res) => {
  try {
    const [dealer] = await db.select({ id: dealerListings.id })
      .from(dealerListings).where(eq(dealerListings.slug, req.params.slug)).limit(1);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    const { customerName, customerEmail, customerPhone, requestType, brand, model, yearRange, budgetRange, additionalNotes } = req.body;
    if (!customerName || !customerEmail || !requestType) {
      return res.status(400).json({ error: 'Name, email and request type are required' });
    }

    const [quote] = await db.insert(quoteRequests).values({
      dealerListingId: dealer.id,
      customerName, customerEmail,
      customerPhone: customerPhone || undefined,
      requestType,
      brand: brand || undefined,
      model: model || undefined,
      yearRange: yearRange || undefined,
      budgetRange: budgetRange || undefined,
      additionalNotes: additionalNotes || undefined,
    }).returning();

    await db.insert(crmActivities).values({
      dealerListingId: dealer.id,
      activityType: 'quote_request',
      title: `Quote request from ${customerName}`,
      description: `${requestType}${brand ? ` — ${brand}` : ''}${model ? ` ${model}` : ''}`,
      createdBy: 'system',
    });

    res.status(201).json({ success: true, quote });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quote request' });
  }
});

// ─── POST /api/dealers/:slug/claim — Start claim process ───
router.post('/:slug/claim', async (req, res) => {
  try {
    const [dealer] = await db.select().from(dealerListings)
      .where(eq(dealerListings.slug, req.params.slug)).limit(1);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    if (dealer.isClaimed) return res.status(400).json({ error: 'This listing is already claimed' });

    const { claimerName, claimerEmail, claimerPhone, claimerTitle } = req.body;
    if (!claimerName || !claimerEmail) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Mark as claimed
    const now = new Date();
    await db.update(dealerListings).set({
      isClaimed: true,
      claimedAt: now,
      listingTier: 'claimed',
      dataQuality: 'claimed',
      updatedAt: now,
    }).where(eq(dealerListings.id, dealer.id));

    // Update pipeline stage
    const [pipeline] = await db.select().from(crmPipeline)
      .where(eq(crmPipeline.dealerListingId, dealer.id)).limit(1);

    if (pipeline) {
      await db.update(crmPipeline).set({
        stage: 'claimed_page',
        leadSource: 'claimed_page',
        stageChangedAt: now,
        updatedAt: now,
      }).where(eq(crmPipeline.id, pipeline.id));
    } else {
      await db.insert(crmPipeline).values({
        dealerListingId: dealer.id,
        stage: 'claimed_page',
        leadSource: 'claimed_page',
      });
    }

    await db.insert(crmActivities).values({
      dealerListingId: dealer.id,
      activityType: 'page_claimed',
      title: `Page claimed by ${claimerName} (${claimerEmail})`,
      description: claimerTitle ? `Title: ${claimerTitle}` : undefined,
      createdBy: 'system',
      metadata: { claimerName, claimerEmail, claimerPhone, claimerTitle },
    });

    res.json({ success: true, dealer: { ...dealer, isClaimed: true } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim listing' });
  }
});

// ─── POST /api/dealers/:slug/click — Track website/contact clicks ───
router.post('/:slug/click', async (req, res) => {
  try {
    const [dealer] = await db.select({ id: dealerListings.id, websiteClicks: dealerListings.websiteClicks, contactClicks: dealerListings.contactClicks })
      .from(dealerListings).where(eq(dealerListings.slug, req.params.slug)).limit(1);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    const { type } = req.body;
    if (type === 'website') {
      await db.update(dealerListings).set({ websiteClicks: sql`${dealerListings.websiteClicks} + 1` }).where(eq(dealerListings.id, dealer.id));
    } else {
      await db.update(dealerListings).set({ contactClicks: sql`${dealerListings.contactClicks} + 1` }).where(eq(dealerListings.id, dealer.id));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track click' });
  }
});

export default router;
