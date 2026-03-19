// server/seed.ts — Database seed script
// Run: npx tsx server/seed.ts
// Creates the operator admin account and sample dealership for development

import { db } from "./db";
import { users, dealerships, products, platformSettings } from "@shared/schema";
import { hashPassword } from "./lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // ==================== OPERATOR ADMIN ====================
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@rvclaims.ca"))
    .limit(1);

  if (!existingAdmin) {
    const passwordHash = await hashPassword("Admin@2026!");
    await db.insert(users).values({
      email: "admin@rvclaims.ca",
      passwordHash,
      firstName: "Jonathan",
      lastName: "D.",
      role: "operator_admin",
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Operator admin created: admin@rvclaims.ca / Admin@2026!");
  } else {
    console.log("  ⏭️  Operator admin already exists");
  }

  // ==================== OPERATOR STAFF ====================
  const [existingStaff] = await db
    .select()
    .from(users)
    .where(eq(users.email, "staff@rvclaims.ca"))
    .limit(1);

  if (!existingStaff) {
    const passwordHash = await hashPassword("Staff@2026!");
    await db.insert(users).values({
      email: "staff@rvclaims.ca",
      passwordHash,
      firstName: "Sarah",
      lastName: "K.",
      role: "operator_staff",
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Operator staff created: staff@rvclaims.ca / Staff@2026!");
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

  // ==================== CUSTOMER ====================
  const [existingCustomer] = await db
    .select()
    .from(users)
    .where(eq(users.email, "robert.martin@email.com"))
    .limit(1);

  if (!existingCustomer) {
    const passwordHash = await hashPassword("Customer@2026!");
    await db.insert(users).values({
      email: "robert.martin@email.com",
      passwordHash,
      firstName: "Robert",
      lastName: "Martin",
      phone: "(819) 555-0456",
      role: "customer",
      dealershipId,
      language: "en",
      isActive: true,
    });
    console.log("  ✅ Customer created: robert.martin@email.com / Customer@2026!");
  } else {
    console.log("  ⏭️  Customer already exists");
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
    { key: "company_name", value: "RV Claims Canada" },
    { key: "company_email", value: "hello@rvclaims.ca" },
    { key: "support_email", value: "support@rvclaims.ca" },
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

  console.log("\n🎉 Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Operator Admin:  admin@rvclaims.ca     / Admin@2026!");
  console.log("  Operator Staff:  staff@rvclaims.ca     / Staff@2026!");
  console.log("  Dealer Owner:    mike@smithsrv.ca      / Dealer@2026!");
  console.log("  Customer:        robert.martin@email.com / Customer@2026!");
  console.log("");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
