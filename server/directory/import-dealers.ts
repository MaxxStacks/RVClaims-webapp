// server/directory/import-dealers.ts
// CSV import utility for dealer listings
// CSV format: name,address,city,state_province,postal_code,country,phone,email,website,brands_carried,latitude,longitude,year_established,data_source,external_id

import { db } from '../db';
import { dealerListings, crmPipeline } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';

interface DealerImportRow {
  name: string;
  address?: string;
  city: string;
  state_province: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  brands_carried?: string;
  latitude?: string;
  longitude?: string;
  year_established?: string;
  data_source?: string;
  external_id?: string;
}

function parseCSV(content: string): DealerImportRow[] {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/ /g, '_'));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row as unknown as DealerImportRow;
  }).filter(r => r.name && r.city);
}

function normalizeString(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export function generateSlug(name: string, city: string, stateProvince: string): string {
  const parts = [name, city, stateProvince]
    .map(s => s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
  return parts.join('-').substring(0, 295);
}

export async function importDealersFromCSV(filePath: string): Promise<{ imported: number; skipped: number; errors: number }> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(fileContent);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const normalizedName = normalizeString(row.name);
      const existing = await db.select().from(dealerListings)
        .where(and(eq(dealerListings.city, row.city), eq(dealerListings.country, row.country)));

      if (existing.some(e => normalizeString(e.name) === normalizedName)) {
        skipped++;
        continue;
      }

      let slug = generateSlug(row.name, row.city, row.state_province);
      // Ensure slug uniqueness
      const slugExists = await db.select({ id: dealerListings.id }).from(dealerListings).where(eq(dealerListings.slug, slug));
      if (slugExists.length > 0) slug = `${slug}-${Date.now()}`;

      const brands = row.brands_carried ? row.brands_carried.split('|').map(b => b.trim()).filter(Boolean) : [];

      const [dealer] = await db.insert(dealerListings).values({
        name: row.name,
        slug,
        address: row.address || undefined,
        city: row.city,
        stateProvince: row.state_province,
        postalCode: row.postal_code || undefined,
        country: row.country || 'CA',
        phone: row.phone || undefined,
        email: row.email || undefined,
        website: row.website || undefined,
        brandsCarried: brands.length > 0 ? brands : undefined,
        latitude: row.latitude ? row.latitude : undefined,
        longitude: row.longitude ? row.longitude : undefined,
        yearEstablished: row.year_established ? parseInt(row.year_established) : undefined,
        dataSource: row.data_source || 'csv_import',
        externalId: row.external_id || undefined,
        listingStatus: 'active',
        dataQuality: 'imported',
      }).returning();

      await db.insert(crmPipeline).values({
        dealerListingId: dealer.id,
        stage: 'prospect',
        leadSource: 'imported',
      });

      imported++;
    } catch (error) {
      console.error(`[Import] Error importing ${row.name}:`, error);
      errors++;
    }
  }

  console.log(`[Import] Complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);
  return { imported, skipped, errors };
}
