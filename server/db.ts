import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, leases, properties, type InsertLease, type InsertProperty } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Property queries
export async function createProperty(property: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(properties).values(property);
  return result;
}

export async function getAllProperties() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(properties);
}

// Lease queries
export async function createLease(lease: Omit<InsertLease, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leases).values(lease);
  return result;
}

export async function getUserLeases(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(leases).where(eq(leases.userId, userId)).orderBy(desc(leases.createdAt));
}

export async function getLeaseById(leaseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(leases).where(eq(leases.id, leaseId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Dashboard aggregation queries
export async function getPortfolioStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userLeases = await db.select().from(leases).where(eq(leases.userId, userId));
  
  const totalLeases = userLeases.length;
  const totalGLA = userLeases.reduce((sum, lease) => sum + (parseFloat(lease.leasableArea || "0")), 0);
  const occupiedGLA = totalGLA; // Assuming all leases are occupied for now
  const occupancyRate = totalGLA > 0 ? (occupiedGLA / totalGLA) * 100 : 0;
  
  // Calculate WALT (Weighted Average Lease Term)
  const now = new Date();
  let totalWeightedTerm = 0;
  let totalRent = 0;
  
  userLeases.forEach(lease => {
    if (lease.leaseExpiryDate && lease.currentBaseRent) {
      const expiryDate = new Date(lease.leaseExpiryDate);
      const remainingMonths = Math.max(0, (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const remainingYears = remainingMonths / 12;
      const rent = parseFloat(lease.currentBaseRent);
      
      totalWeightedTerm += remainingYears * rent;
      totalRent += rent;
    }
  });
  
  const walt = totalRent > 0 ? totalWeightedTerm / totalRent : 0;
  
  return {
    totalLeases,
    totalGLA,
    occupancyRate,
    walt,
  };
}

export async function getFinancialStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userLeases = await db.select().from(leases).where(eq(leases.userId, userId));
  
  let totalAnnualizedRent = 0;
  let potentialLeakage = 0;
  
  userLeases.forEach(lease => {
    if (lease.currentBaseRent) {
      const baseRent = parseFloat(lease.currentBaseRent);
      totalAnnualizedRent += baseRent * 12; // Assuming monthly rent
      
      // Estimate potential leakage (3-7% of rent)
      if (lease.indexationIndex && !lease.indexationCap) {
        potentialLeakage += baseRent * 12 * 0.05; // 5% potential leakage
      }
    }
  });
  
  const totalOccupiedGLA = userLeases.reduce((sum, lease) => sum + (parseFloat(lease.leasableArea || "0")), 0);
  const avgRentPerArea = totalOccupiedGLA > 0 ? totalAnnualizedRent / totalOccupiedGLA : 0;
  
  // Count upcoming rent reviews (next 90 days)
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  
  const upcomingReviews = userLeases.filter(lease => {
    if (lease.indexationBaseMonth) {
      const reviewDate = new Date(lease.indexationBaseMonth);
      return reviewDate >= now && reviewDate <= in90Days;
    }
    return false;
  }).length;
  
  return {
    totalAnnualizedRent,
    avgRentPerArea,
    potentialLeakage,
    upcomingReviews,
  };
}

export async function getOperationalRiskStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userLeases = await db.select().from(leases).where(eq(leases.userId, userId));
  
  const now = new Date();
  const in6Months = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  
  const breakOptionsAtRisk = userLeases.filter(lease => {
    if (lease.tenantBreakOptionDate) {
      const breakDate = new Date(lease.tenantBreakOptionDate);
      return breakDate >= now && breakDate <= in6Months;
    }
    return false;
  }).length;
  
  const nonStandardClauses = userLeases.filter(lease => lease.hasNonStandardClause === 1).length;
  
  const avgCompletenessScore = userLeases.reduce((sum, lease) => {
    return sum + (parseFloat(lease.dataCompletenessScore || "0"));
  }, 0) / (userLeases.length || 1);
  
  return {
    breakOptionsAtRisk,
    nonStandardClauses,
    avgCompletenessScore,
  };
}

export async function getTenantStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userLeases = await db.select().from(leases).where(eq(leases.userId, userId));
  
  // Group by category
  const categoryMap = new Map<string, { rent: number; gla: number }>();
  
  userLeases.forEach(lease => {
    const category = lease.tenantCategory || "Unknown";
    const rent = parseFloat(lease.currentBaseRent || "0") * 12;
    const gla = parseFloat(lease.leasableArea || "0");
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { rent: 0, gla: 0 });
    }
    
    const current = categoryMap.get(category)!;
    current.rent += rent;
    current.gla += gla;
  });
  
  const tenantMix = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    rent: data.rent,
    gla: data.gla,
  }));
  
  // Top 10 tenants by rent
  const topTenantsByRent = userLeases
    .map(lease => ({
      name: lease.tenantName || "Unknown",
      rent: parseFloat(lease.currentBaseRent || "0") * 12,
    }))
    .sort((a, b) => b.rent - a.rent)
    .slice(0, 10);
  
  // Top 10 tenants by GLA
  const topTenantsByGLA = userLeases
    .map(lease => ({
      name: lease.tenantName || "Unknown",
      gla: parseFloat(lease.leasableArea || "0"),
    }))
    .sort((a, b) => b.gla - a.gla)
    .slice(0, 10);
  
  // Calculate concentration risk (top 5 tenants)
  const totalRent = userLeases.reduce((sum, lease) => sum + (parseFloat(lease.currentBaseRent || "0") * 12), 0);
  const top5Rent = topTenantsByRent.slice(0, 5).reduce((sum, tenant) => sum + tenant.rent, 0);
  const concentrationRisk = totalRent > 0 ? (top5Rent / totalRent) * 100 : 0;
  
  return {
    tenantMix,
    topTenantsByRent,
    topTenantsByGLA,
    concentrationRisk,
  };
}
