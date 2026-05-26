// server/db/seedDealJacket.ts — Seed default deal jacket permissions for a dealership

import { db } from "../db";
import { dealJacketPermissions, DEAL_JACKET_PERMISSION_SECTIONS } from "@shared/schema";
import { and, eq } from "drizzle-orm";

// Default permission matrix:
// financial_manager → full access to all sections
// shop_manager → warranty + pdi + photos only
// service_manager → warranty + pdi + photos only
// dealer_staff → warranty + pdi + photos only
// technician → warranty + pdi + photos only

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  financial_manager: {
    full_jacket: true,
    warranty_docs: true,
    financing_details: true,
    fi_products: true,
    pdi_record: true,
    upload_documents: true,
    photos: true,
  },
  shop_manager: {
    full_jacket: false,
    warranty_docs: true,
    financing_details: false,
    fi_products: false,
    pdi_record: true,
    upload_documents: false,
    photos: true,
  },
  service_manager: {
    full_jacket: false,
    warranty_docs: true,
    financing_details: false,
    fi_products: false,
    pdi_record: true,
    upload_documents: false,
    photos: true,
  },
  dealer_staff: {
    full_jacket: false,
    warranty_docs: true,
    financing_details: false,
    fi_products: false,
    pdi_record: true,
    upload_documents: false,
    photos: true,
  },
  technician: {
    full_jacket: false,
    warranty_docs: true,
    financing_details: false,
    fi_products: false,
    pdi_record: true,
    upload_documents: false,
    photos: true,
  },
};

export async function seedDealJacketPermissions(dealershipId: string): Promise<void> {
  const rows: typeof dealJacketPermissions.$inferInsert[] = [];

  for (const [role, sections] of Object.entries(DEFAULT_PERMISSIONS)) {
    for (const section of DEAL_JACKET_PERMISSION_SECTIONS) {
      const allowed = sections[section] ?? false;
      rows.push({
        dealershipId,
        role,
        section,
        allowed,
      });
    }
  }

  // Upsert each row (insert or ignore on conflict — Postgres doesn't have
  // a uniqueIndex on (dealershipId, role, section) yet in Drizzle without
  // explicit unique constraint, so we do a check-then-insert approach)
  for (const row of rows) {
    const existing = await db
      .select()
      .from(dealJacketPermissions)
      .where(
        and(
          eq(dealJacketPermissions.dealershipId, row.dealershipId),
          eq(dealJacketPermissions.role, row.role),
          eq(dealJacketPermissions.section, row.section as any),
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(dealJacketPermissions).values(row);
    }
  }
}
