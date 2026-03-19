// server/routes/marketplace-membership.ts — Membership signup, verification, Stripe subscription
// Dealers apply → RV Claims verifies → Dealer pays $499/year → Access granted

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { marketplaceMembers, membershipSignupSchema } from '../db/schema-marketplace';
import { eq, desc, and, or, ilike } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' });

// ==================== PUBLIC: Signup ====================

// POST /api/marketplace/signup — Dealer applies for marketplace access
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const data = membershipSignupSchema.parse(req.body);
    
    // Check for duplicate email
    const existing = await db.select().from(marketplaceMembers)
      .where(eq(marketplaceMembers.contactEmail, data.contactEmail))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An application with this email already exists' });
    }
    
    const [member] = await db.insert(marketplaceMembers).values({
      ...data,
      status: 'pending',
    }).returning();
    
    // TODO: Send notification to RV Claims staff for review
    // TODO: Send confirmation email to dealer
    
    res.status(201).json({ 
      message: 'Application submitted. Our team will verify your dealership within 1-2 business days.',
      memberId: member.id,
      status: member.status,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// ==================== OPERATOR: Manage Members ====================

// GET /api/marketplace/members — List all members (operator only)
router.get('/members', async (req: Request, res: Response) => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = db.select().from(marketplaceMembers);
    
    if (status && status !== 'all') {
      query = query.where(eq(marketplaceMembers.status, status as any));
    }
    if (search) {
      query = query.where(
        or(
          ilike(marketplaceMembers.dealershipName, `%${search}%`),
          ilike(marketplaceMembers.contactEmail, `%${search}%`),
          ilike(marketplaceMembers.contactName, `%${search}%`)
        )
      );
    }
    
    const members = await query
      .orderBy(desc(marketplaceMembers.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);
    
    res.json({ members, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/marketplace/members/:id — Get member details
router.get('/members/:id', async (req: Request, res: Response) => {
  try {
    const [member] = await db.select().from(marketplaceMembers)
      .where(eq(marketplaceMembers.id, req.params.id));
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// PUT /api/marketplace/members/:id/verify — Approve or reject application
router.put('/members/:id/verify', async (req: Request, res: Response) => {
  try {
    const { action, notes, rejectionReason } = req.body;
    // action: 'approve' | 'reject'
    
    const [member] = await db.select().from(marketplaceMembers)
      .where(eq(marketplaceMembers.id, req.params.id));
    if (!member) return res.status(404).json({ error: 'Member not found' });
    
    if (action === 'approve') {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: member.contactEmail,
        name: member.dealershipName,
        metadata: { memberId: member.id },
      });
      
      const [updated] = await db.update(marketplaceMembers)
        .set({
          status: 'approved',
          verifiedAt: new Date(),
          verifiedBy: req.body.operatorId, // From auth middleware
          verificationNotes: notes,
          stripeCustomerId: customer.id,
          updatedAt: new Date(),
        })
        .where(eq(marketplaceMembers.id, req.params.id))
        .returning();
      
      // TODO: Send email to dealer with payment link
      
      res.json({ message: 'Member approved. Payment link sent.', member: updated });
    } else if (action === 'reject') {
      const [updated] = await db.update(marketplaceMembers)
        .set({
          status: 'rejected',
          rejectionReason,
          verificationNotes: notes,
          updatedAt: new Date(),
        })
        .where(eq(marketplaceMembers.id, req.params.id))
        .returning();
      
      // TODO: Send rejection email
      
      res.json({ message: 'Application rejected.', member: updated });
    } else {
      res.status(400).json({ error: 'Invalid action. Use "approve" or "reject".' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify member' });
  }
});

// PUT /api/marketplace/members/:id/suspend — Suspend a member
router.put('/members/:id/suspend', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const [updated] = await db.update(marketplaceMembers)
      .set({ status: 'suspended', verificationNotes: reason, updatedAt: new Date() })
      .where(eq(marketplaceMembers.id, req.params.id))
      .returning();
    
    if (!updated) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member suspended.', member: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to suspend member' });
  }
});

// ==================== PAYMENT: Stripe Subscription ====================

// POST /api/marketplace/members/:id/subscribe — Create annual subscription checkout
router.post('/members/:id/subscribe', async (req: Request, res: Response) => {
  try {
    const [member] = await db.select().from(marketplaceMembers)
      .where(eq(marketplaceMembers.id, req.params.id));
    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (member.status !== 'approved') {
      return res.status(400).json({ error: 'Member must be approved before subscribing' });
    }
    
    // Create or get the $499/year price
    // In production, create this once in Stripe Dashboard and use the price ID
    const ANNUAL_PRICE_ID = process.env.STRIPE_MARKETPLACE_ANNUAL_PRICE_ID || '';
    
    const session = await stripe.checkout.sessions.create({
      customer: member.stripeCustomerId!,
      mode: 'subscription',
      line_items: [{
        price: ANNUAL_PRICE_ID,
        quantity: 1,
      }],
      success_url: `${process.env.APP_URL}/marketplace/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/marketplace/signup?cancelled=true`,
      metadata: { memberId: member.id },
    });
    
    res.json({ checkoutUrl: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/marketplace/webhooks/stripe — Handle subscription events
router.post('/webhooks/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_MARKETPLACE_WEBHOOK_SECRET || '';
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const memberId = session.metadata?.memberId;
        if (memberId) {
          await db.update(marketplaceMembers).set({
            status: 'active',
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          }).where(eq(marketplaceMembers.id, memberId));
        }
        break;
      }
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const members = await db.select().from(marketplaceMembers)
          .where(eq(marketplaceMembers.stripeSubscriptionId, subscription.id));
        
        if (members.length > 0) {
          const newStatus = subscription.status === 'active' ? 'active' : 'expired';
          await db.update(marketplaceMembers).set({
            status: newStatus,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          }).where(eq(marketplaceMembers.id, members[0].id));
        }
        break;
      }
    }
    
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

// ==================== STATS ====================

// GET /api/marketplace/stats — Dashboard stats (operator)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const allMembers = await db.select().from(marketplaceMembers);
    
    const stats = {
      totalMembers: allMembers.length,
      active: allMembers.filter(m => m.status === 'active').length,
      pending: allMembers.filter(m => m.status === 'pending').length,
      underReview: allMembers.filter(m => m.status === 'under_review').length,
      expired: allMembers.filter(m => m.status === 'expired').length,
      suspended: allMembers.filter(m => m.status === 'suspended').length,
      annualRevenue: allMembers.filter(m => m.status === 'active').length * 499,
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
