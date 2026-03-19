// server/lib/search.ts — Reusable search and filter query helpers

import { sql, ilike, or, and, eq, gte, lte, desc, asc, type SQL } from "drizzle-orm";
import type { PgTable, PgColumn } from "drizzle-orm/pg-core";

interface SearchOptions {
  /** Search term to match against specified columns */
  q?: string;
  /** Columns to search across (ilike match) */
  searchColumns?: PgColumn[];
  /** Exact-match filters: { column: value } */
  filters?: Array<{ column: PgColumn; value: string | boolean }>;
  /** Date range filters */
  dateFilters?: Array<{ column: PgColumn; from?: string; to?: string }>;
  /** Sort column (defaults to createdAt desc) */
  sortBy?: PgColumn;
  sortOrder?: "asc" | "desc";
  /** Pagination */
  page?: number;
  limit?: number;
}

export function buildSearchConditions(options: SearchOptions): {
  where: SQL | undefined;
  orderBy: SQL;
  offset: number;
  limit: number;
} {
  const conditions: SQL[] = [];

  // Text search across multiple columns
  if (options.q && options.searchColumns?.length) {
    const searchTerm = `%${options.q}%`;
    const searchConditions = options.searchColumns.map((col) => ilike(col, searchTerm));
    if (searchConditions.length > 0) {
      conditions.push(or(...searchConditions)!);
    }
  }

  // Exact-match filters
  if (options.filters) {
    for (const filter of options.filters) {
      if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
        conditions.push(eq(filter.column, filter.value as any));
      }
    }
  }

  // Date range filters
  if (options.dateFilters) {
    for (const df of options.dateFilters) {
      if (df.from) conditions.push(gte(df.column, new Date(df.from)));
      if (df.to) conditions.push(lte(df.column, new Date(df.to)));
    }
  }

  // Combine conditions
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Sorting
  const sortFn = options.sortOrder === "asc" ? asc : desc;
  const orderBy = options.sortBy ? sortFn(options.sortBy) : sql`created_at DESC`;

  // Pagination
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 25));
  const offset = (page - 1) * limit;

  return { where, orderBy, offset, limit };
}

/**
 * Parse standard query params from Express request into SearchOptions.
 * Expects: ?q=search&page=1&limit=25&sort=createdAt&order=desc&status=active&from=2026-01-01&to=2026-12-31
 */
export function parseQueryParams(query: Record<string, any>): {
  q?: string;
  page: number;
  limit: number;
  sortOrder: "asc" | "desc";
  status?: string;
  type?: string;
  category?: string;
  from?: string;
  to?: string;
} {
  return {
    q: query.q?.toString().trim() || undefined,
    page: parseInt(query.page as string) || 1,
    limit: parseInt(query.limit as string) || 25,
    sortOrder: query.order === "asc" ? "asc" : "desc",
    status: query.status?.toString() || undefined,
    type: query.type?.toString() || undefined,
    category: query.category?.toString() || undefined,
    from: query.from?.toString() || undefined,
    to: query.to?.toString() || undefined,
  };
}
