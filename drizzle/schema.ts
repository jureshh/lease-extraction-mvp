import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Properties/Shopping Centers table
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  totalGLA: decimal("totalGLA", { precision: 12, scale: 2 }), // Total Gross Leasable Area
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Leases table - stores all extracted lease data
 */
export const leases = mysqlTable("leases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId"),
  
  // Document metadata
  documentUrl: text("documentUrl"), // S3 URL to original PDF
  documentKey: text("documentKey"), // S3 key for file retrieval
  tenantName: varchar("tenantName", { length: 255 }),
  tenantCategory: varchar("tenantCategory", { length: 100 }), // Fashion, F&B, Entertainment, etc.
  
  // Basic lease info
  leasableArea: decimal("leasableArea", { precision: 10, scale: 2 }), // in sqm or sqft
  
  // Clause 1: Base Rent & Rent Steps
  currentBaseRent: decimal("currentBaseRent", { precision: 12, scale: 2 }),
  rentCurrency: varchar("rentCurrency", { length: 3 }).default("PLN"),
  rentSteps: json("rentSteps").$type<Array<{ effectiveDate: string; newRentAmount: number }>>(), // Array of future rent increases
  
  // Clause 2: Turnover / Percentage Rent
  turnoverRentPercentage: decimal("turnoverRentPercentage", { precision: 5, scale: 2 }),
  breakpointType: varchar("breakpointType", { length: 50 }), // Natural, Artificial, None
  breakpointValue: decimal("breakpointValue", { precision: 12, scale: 2 }),
  reportingFrequency: varchar("reportingFrequency", { length: 50 }), // Monthly, Quarterly, Annually
  excludedSales: json("excludedSales").$type<string[]>(), // Array of excluded sales categories
  
  // Clause 3: CPI / Indexation
  indexationIndex: varchar("indexationIndex", { length: 100 }), // e.g., "HICP - Euro Area"
  indexationFrequency: varchar("indexationFrequency", { length: 50 }), // Annually, Bi-Annually
  indexationBaseMonth: date("indexationBaseMonth"),
  indexationCap: decimal("indexationCap", { precision: 5, scale: 2 }), // Max % increase
  indexationFloor: decimal("indexationFloor", { precision: 5, scale: 2 }), // Min % increase
  
  // Clause 4: Service Charge / CAM
  proRataShare: decimal("proRataShare", { precision: 5, scale: 4 }), // Tenant's % share
  serviceChargeCapType: varchar("serviceChargeCapType", { length: 50 }), // Fixed Amount, % of Base Rent, None
  serviceChargeCapValue: decimal("serviceChargeCapValue", { precision: 12, scale: 2 }),
  excludedCosts: json("excludedCosts").$type<string[]>(), // Array of excluded cost categories
  serviceChargeStatus: varchar("serviceChargeStatus", { length: 50 }).default("Pending"), // Reconciled, Pending, Disputed
  
  // Clause 5: Critical Dates
  leaseExpiryDate: date("leaseExpiryDate"),
  tenantBreakOptionDate: date("tenantBreakOptionDate"),
  tenantBreakNoticePeriod: int("tenantBreakNoticePeriod"), // in months
  renewalDeadline: date("renewalDeadline"),
  
  // Additional metadata
  hasNonStandardClause: int("hasNonStandardClause").default(0), // 0 or 1 (boolean)
  extractionStatus: varchar("extractionStatus", { length: 20 }).default("pending"), // pending, processing, completed, failed
  dataCompletenessScore: decimal("dataCompletenessScore", { precision: 5, scale: 2 }), // 0-100
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lease = typeof leases.$inferSelect;
export type InsertLease = typeof leases.$inferInsert;
