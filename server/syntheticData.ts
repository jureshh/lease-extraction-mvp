import type { InsertLease, InsertProperty } from "../drizzle/schema";

/**
 * Generates realistic synthetic lease data for testing
 */

const TENANT_CATEGORIES = [
  "Fashion & Apparel",
  "Food & Beverage",
  "Entertainment",
  "Electronics",
  "Home & Garden",
  "Health & Beauty",
  "Sports & Fitness",
  "Bookstore",
  "Supermarket",
  "Department Store",
];

const TENANT_NAMES = [
  "Zara", "H&M", "Mango", "Reserved", "CCC",
  "McDonald's", "KFC", "Starbucks", "Costa Coffee", "Pizza Hut",
  "Cinema City", "Multikino", "Fitness Club", "Gym",
  "Media Markt", "RTV Euro AGD", "Empik",
  "IKEA", "Leroy Merlin", "Castorama",
  "Rossmann", "Hebe", "Douglas",
  "Decathlon", "Go Sport",
  "Carrefour", "Auchan", "Biedronka",
];

const SHOPPING_CENTERS = [
  { name: "Westfield Arkadia", location: "Warsaw, Poland" },
  { name: "Złote Tarasy", location: "Warsaw, Poland" },
  { name: "Galeria Mokotów", location: "Warsaw, Poland" },
  { name: "Atrium Promenada", location: "Warsaw, Poland" },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): string {
  const value = Math.random() * (max - min) + min;
  return value.toFixed(decimals);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

export function generateProperties(): InsertProperty[] {
  return SHOPPING_CENTERS.map((center) => ({
    name: center.name,
    location: center.location,
    totalGLA: randomFloat(50000, 150000, 2),
  }));
}

export function generateLeases(userId: number, propertyIds: number[], count: number = 50): Omit<InsertLease, 'id' | 'createdAt' | 'updatedAt'>[] {
  const leases: Omit<InsertLease, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  
  for (let i = 0; i < count; i++) {
    const tenantName = randomChoice(TENANT_NAMES);
    const tenantCategory = randomChoice(TENANT_CATEGORIES);
    const propertyId = randomChoice(propertyIds);
    
    // Generate lease dates
    const leaseStartDate = randomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
    const leaseExpiryDate = addMonths(leaseStartDate, randomInt(36, 120)); // 3-10 years
    const tenantBreakOptionDate = Math.random() > 0.6 ? addMonths(leaseStartDate, randomInt(24, 60)) : null;
    const renewalDeadline = Math.random() > 0.5 ? addMonths(leaseExpiryDate, -6) : null;
    
    // Generate base rent with steps
    const currentBaseRent = parseFloat(randomFloat(5000, 50000, 2));
    const rentSteps = Math.random() > 0.5 ? [
      { effectiveDate: addMonths(leaseStartDate, 12).toISOString().split('T')[0]!, newRentAmount: currentBaseRent * 1.03 },
      { effectiveDate: addMonths(leaseStartDate, 24).toISOString().split('T')[0]!, newRentAmount: currentBaseRent * 1.06 },
      { effectiveDate: addMonths(leaseStartDate, 36).toISOString().split('T')[0]!, newRentAmount: currentBaseRent * 1.09 },
    ] : null;
    
    // Generate turnover rent (40% of leases have this)
    const hasTurnoverRent = Math.random() > 0.6;
    const turnoverRentPercentage = hasTurnoverRent ? randomFloat(3, 10, 2) : null;
    const breakpointType = hasTurnoverRent ? randomChoice(["Natural", "Artificial"]) : null;
    const breakpointValue = hasTurnoverRent ? randomFloat(500000, 2000000, 2) : null;
    const reportingFrequency = hasTurnoverRent ? randomChoice(["Monthly", "Quarterly", "Annually"]) : null;
    const excludedSales = hasTurnoverRent ? ["VAT", "Lottery Tickets", "Gift Cards"] : null;
    
    // Generate CPI indexation (80% of leases have this)
    const hasIndexation = Math.random() > 0.2;
    const indexationIndex = hasIndexation ? randomChoice(["HICP - Euro Area", "Polish CPI", "Eurozone HICP"]) : null;
    const indexationFrequency = hasIndexation ? "Annually" : null;
    const indexationBaseMonth = hasIndexation ? leaseStartDate : null;
    const indexationCap = hasIndexation && Math.random() > 0.5 ? randomFloat(2, 5, 2) : null;
    const indexationFloor = hasIndexation && Math.random() > 0.7 ? randomFloat(0, 1, 2) : null;
    
    // Generate service charge
    const proRataShare = randomFloat(0.5, 5, 4);
    const serviceChargeCapType = randomChoice(["Fixed Amount", "% of Base Rent", "None"]);
    const serviceChargeCapValue = serviceChargeCapType !== "None" ? randomFloat(5000, 20000, 2) : null;
    const excludedCosts = Math.random() > 0.5 ? ["Capital Improvements", "Property Taxes"] : null;
    const serviceChargeStatus = randomChoice(["Reconciled", "Pending", "Disputed"]);
    
    // Generate leasable area
    const leasableArea = randomFloat(50, 500, 2);
    
    // Calculate data completeness
    let completedFields = 0;
    const totalFields = 25;
    if (currentBaseRent) completedFields++;
    if (rentSteps) completedFields++;
    if (turnoverRentPercentage) completedFields += 5;
    if (indexationIndex) completedFields += 5;
    if (proRataShare) completedFields += 4;
    if (leaseExpiryDate) completedFields += 4;
    if (tenantName) completedFields++;
    if (tenantCategory) completedFields++;
    if (leasableArea) completedFields++;
    
    const dataCompletenessScore = ((completedFields / totalFields) * 100).toFixed(2);
    
    leases.push({
      userId,
      propertyId,
      documentUrl: null,
      documentKey: null,
      tenantName,
      tenantCategory,
      leasableArea,
      currentBaseRent: currentBaseRent.toString(),
      rentCurrency: "PLN",
      rentSteps,
      turnoverRentPercentage,
      breakpointType,
      breakpointValue,
      reportingFrequency,
      excludedSales,
      indexationIndex,
      indexationFrequency,
      indexationBaseMonth,
      indexationCap,
      indexationFloor,
      proRataShare,
      serviceChargeCapType,
      serviceChargeCapValue,
      excludedCosts,
      serviceChargeStatus,
      leaseExpiryDate,
      tenantBreakOptionDate,
      tenantBreakNoticePeriod: tenantBreakOptionDate ? randomInt(3, 6) : null,
      renewalDeadline,
      hasNonStandardClause: Math.random() > 0.85 ? 1 : 0,
      extractionStatus: "completed",
      dataCompletenessScore,
    });
  }
  
  return leases;
}
