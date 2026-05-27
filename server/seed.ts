// server/seed.ts — Database seed script
// Run: npx tsx server/seed.ts
// Creates the operator admin account and sample dealership for development

import { db } from "./db";
import { users, dealerships, products, platformSettings, walletFundingTiers, financingPartners } from "@shared/schema";
import { hashPassword } from "./lib/auth";
import { eq } from "drizzle-orm";
import { seedModules } from "./db/seedModules";
import { seedPDI } from "./db/seedPDI";

async function seed() {
  console.log("🌱 Seeding database...");

  // ==================== OPERATOR ADMIN ====================
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@dealersuite360.com"))
    .limit(1);

  if (!existingAdmin) {
    const passwordHash = await hashPassword("Admin@2026!");
    await db.insert(users).values({
      email: "admin@dealersuite360.com",
      passwordHash,
      firstName: "Jonathan",
      lastName: "D.",
      role: "operator_admin",
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Operator admin created: admin@dealersuite360.com / Admin@2026!");
  } else {
    console.log("  ⏭️  Operator admin already exists");
  }

  // ==================== OPERATOR STAFF ====================
  const [existingStaff] = await db
    .select()
    .from(users)
    .where(eq(users.email, "staff@dealersuite360.com"))
    .limit(1);

  if (!existingStaff) {
    const passwordHash = await hashPassword("Staff@2026!");
    await db.insert(users).values({
      email: "staff@dealersuite360.com",
      passwordHash,
      firstName: "Sarah",
      lastName: "K.",
      role: "operator_staff",
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Operator staff created: staff@dealersuite360.com / Staff@2026!");
  } else {
    console.log("  ⏭️  Operator staff already exists");
  }

  // ==================== SAMPLE DEALERSHIP ====================
  let dealershipId: string;

  const [existingDealership] = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.email, "mike@smithsrv.ca"))
    .limit(1);

  if (!existingDealership) {
    const [newDealership] = await db
      .insert(dealerships)
      .values({
        name: "Smith's RV Centre",
        legalName: "Smith's RV Centre Inc.",
        email: "mike@smithsrv.ca",
        phone: "(613) 555-0123",
        website: "https://smithsrv.ca",
        businessNumber: "123456789RT0001",
        street: "1250 Highway 17 West",
        city: "Arnprior",
        province: "Ontario",
        postalCode: "K7S 3G8",
        country: "Canada",
        contactName: "Mike Smith",
        contactEmail: "mike@smithsrv.ca",
        contactPhone: "(613) 555-0123",
        contactTitle: "Owner",
        plan: "plan_a",
        monthlyFee: "349.00",
        manufacturers: ["Jayco", "Forest River", "Keystone"],
        status: "active",
        primaryColor: "#08235d",
        accentColor: "#22c55e",
      })
      .returning();

    dealershipId = newDealership.id;
    console.log("  ✅ Sample dealership created: Smith's RV Centre");
  } else {
    dealershipId = existingDealership.id;
    console.log("  ⏭️  Sample dealership already exists");
  }

  // ==================== DEALER OWNER ====================
  const [existingDealerOwner] = await db
    .select()
    .from(users)
    .where(eq(users.email, "mike@smithsrv.ca"))
    .limit(1);

  if (!existingDealerOwner) {
    const passwordHash = await hashPassword("Dealer@2026!");
    await db.insert(users).values({
      email: "mike@smithsrv.ca",
      passwordHash,
      firstName: "Mike",
      lastName: "Smith",
      phone: "(613) 555-0123",
      role: "dealer_owner",
      dealershipId,
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Dealer owner created: mike@smithsrv.ca / Dealer@2026!");
  } else {
    console.log("  ⏭️  Dealer owner already exists");
  }

  // ==================== DEALER STAFF ====================
  const [existingDealerStaff] = await db
    .select()
    .from(users)
    .where(eq(users.email, "jen@smithsrv.ca"))
    .limit(1);

  if (!existingDealerStaff) {
    const passwordHash = await hashPassword("Staff@2026!");
    await db.insert(users).values({
      email: "jen@smithsrv.ca",
      passwordHash,
      firstName: "Jen",
      lastName: "L.",
      phone: "(613) 555-0124",
      role: "dealer_staff",
      dealershipId,
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Dealer staff created: jen@smithsrv.ca / Staff@2026!");
  } else {
    console.log("  ⏭️  Dealer staff already exists");
  }

  // ==================== CLIENT ====================
  const [existingCustomer] = await db
    .select()
    .from(users)
    .where(eq(users.email, "robert.martin@email.com"))
    .limit(1);

  if (!existingCustomer) {
    const passwordHash = await hashPassword("Client@2026!");
    await db.insert(users).values({
      email: "robert.martin@email.com",
      passwordHash,
      firstName: "Robert",
      lastName: "Martin",
      phone: "(819) 555-0456",
      role: "client",
      dealershipId,
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Client created: robert.martin@email.com / Client@2026!");
  } else {
    console.log("  ⏭️  Client already exists");
  }

  // ==================== BIDDER ====================
  const [existingBidder] = await db
    .select()
    .from(users)
    .where(eq(users.email, "bidder@email.com"))
    .limit(1);

  if (!existingBidder) {
    const passwordHash = await hashPassword("Bidder@2026!");
    await db.insert(users).values({
      email: "bidder@email.com",
      passwordHash,
      firstName: "Alex",
      lastName: "B.",
      role: "bidder",
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Bidder created: bidder@email.com / Bidder@2026!");
  } else {
    console.log("  ⏭️  Bidder already exists");
  }

  // ==================== PRODUCTS & SERVICES ====================
  const [existingProduct] = await db.select().from(products).limit(1);

  if (!existingProduct) {
    await db.insert(products).values([
      { name: "Plan A Monthly Subscription", category: "subscription", price: "349.00", pricingType: "fixed", billingFrequency: "monthly", taxRate: "hst_13", description: "Essential claims processing plan" },
      { name: "Plan B Monthly Subscription", category: "subscription", price: "749.00", pricingType: "fixed", billingFrequency: "monthly", taxRate: "hst_13", description: "Professional claims processing plan" },
      { name: "Claim Processing Fee (10%)", category: "claim_fee", price: "10.00", pricingType: "percentage", billingFrequency: "per_claim", taxRate: "hst_13", description: "Standard claim processing fee" },
      { name: "DAF Inspection Fee", category: "claim_fee", price: "125.00", pricingType: "fixed", billingFrequency: "per_unit", taxRate: "hst_13", description: "Dealer Authorization Form processing" },
      { name: "PDI Processing Fee", category: "claim_fee", price: "95.00", pricingType: "fixed", billingFrequency: "per_unit", taxRate: "hst_13", description: "Pre-Delivery Inspection processing" },
      { name: "Financing Services", category: "service_addon", price: "199.00", pricingType: "fixed", billingFrequency: "per_unit", taxRate: "hst_13", description: "Lender shopping and approval optimization" },
      { name: "F&I Services", category: "service_addon", price: "299.00", pricingType: "fixed", billingFrequency: "per_unit", taxRate: "hst_13", description: "Finance & Insurance product presentation" },
      { name: "Parts Sourcing Fee", category: "service_addon", price: "25.00", pricingType: "fixed", billingFrequency: "per_claim", taxRate: "hst_13", description: "Parts research and sourcing" },
    ]);
    console.log("  ✅ Products & Services catalog seeded (8 items)");
  } else {
    console.log("  ⏭️  Products already exist");
  }

  // ==================== PLATFORM SETTINGS ====================
  const defaults = [
    { key: "claim_fee_percent", value: "10.00" },
    { key: "claim_fee_min", value: "75.00" },
    { key: "claim_fee_max", value: "500.00" },
    { key: "daf_fee", value: "125.00" },
    { key: "pdi_fee", value: "95.00" },
    { key: "default_tax_rate", value: "0.13" },
    { key: "platform_version", value: "2.0.0" },
    { key: "company_name", value: "Dealer Suite 360" },
    { key: "company_email", value: "hello@dealersuite360.com" },
    { key: "support_email", value: "support@dealersuite360.com" },
  ];

  for (const setting of defaults) {
    const [existing] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, setting.key))
      .limit(1);

    if (!existing) {
      await db.insert(platformSettings).values({ key: setting.key, value: setting.value });
    }
  }
  console.log("  ✅ Platform settings initialized");

  // ==================== SERVICE MODULES ====================
  await seedModules();

  // ==================== FINANCING PARTNERS ====================
  const existingPartners = await db.select().from(financingPartners).limit(1);
  if (existingPartners.length === 0) {
    await db.insert(financingPartners).values([
      // Canadian partners
      { name: "PayBright",  country: "CA", referralFeePercent: "2.5", minAmount: "500",   maxAmount: "25000", availableTerms: [3, 6, 12, 24] },
      { name: "Financeit",  country: "CA", referralFeePercent: "3.0", minAmount: "1000",  maxAmount: "50000", availableTerms: [6, 12, 24]    },
      { name: "iFinance",   country: "CA", referralFeePercent: "2.0", minAmount: "500",   maxAmount: "20000", availableTerms: [3, 6, 12]     },
      // US partners
      { name: "Affirm",     country: "US", referralFeePercent: "3.5", minAmount: "500",   maxAmount: "30000", availableTerms: [3, 6, 12, 24] },
      { name: "Bread",      country: "US", referralFeePercent: "3.0", minAmount: "750",   maxAmount: "25000", availableTerms: [6, 12, 24]    },
      { name: "Synchrony",  country: "US", referralFeePercent: "2.8", minAmount: "500",   maxAmount: "35000", availableTerms: [3, 6, 12, 24] },
    ]);
    console.log("  ✅ Financing partners seeded (6 partners: 3 CA, 3 US)");
  } else {
    console.log("  ⏭️  Financing partners already exist");
  }

  // ==================== PDI TEMPLATES ====================
  await seedPDI();

  // ==================== WALLET FUNDING TIERS ====================
  const existingTiers = await db.select().from(walletFundingTiers).limit(1);
  if (existingTiers.length === 0) {
    await db.insert(walletFundingTiers).values([
      { minAmount: "1000",  maxAmount: "4999",  bonusPercentage: "5",  isActive: true },
      { minAmount: "5000",  maxAmount: "9999",  bonusPercentage: "10", isActive: true },
      { minAmount: "10000", maxAmount: "14999", bonusPercentage: "15", isActive: true },
      { minAmount: "15000", maxAmount: "24999", bonusPercentage: "18", isActive: true },
      { minAmount: "25000", maxAmount: null,    bonusPercentage: "20", isActive: true },
    ]);
    console.log("  ✅ Wallet funding tiers seeded (5 tiers: 5%/10%/15%/18%/20%)");
  } else {
    console.log("  ⏭️  Wallet funding tiers already exist");
  }

  console.log("\n🎉 Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Operator Admin:  admin@dealersuite360.com   / Admin@2026!    → /operator");
  console.log("  Operator Staff:  staff@dealersuite360.com   / Staff@2026!    → /operator");
  console.log("  Dealer Owner:    mike@smithsrv.ca           / Dealer@2026!   → /dealer");
  console.log("  Dealer Staff:    jen@smithsrv.ca            / Staff@2026!    → /dealer");
  console.log("  Client:          robert.martin@email.com    / Client@2026!   → /client");
  console.log("  Bidder:          bidder@email.com           / Bidder@2026!   → /bidder");
  console.log("");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
