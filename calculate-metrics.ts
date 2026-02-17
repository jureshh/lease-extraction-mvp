import { generateProperties, generateLeases } from "./server/syntheticData";

// Generate the data
const properties = generateProperties();
const propertyIds = properties.map((_, i) => i + 1);
const leases = generateLeases(1, propertyIds, 150);

// Calculate metrics
const totalLeases = leases.length;
const totalGLA = leases.reduce((sum, lease) => sum + parseFloat(lease.leasableArea || "0"), 0);
const totalAnnualizedRent = leases.reduce((sum, lease) => {
  const baseRent = parseFloat(lease.currentBaseRent || "0") * 12;
  return sum + baseRent;
}, 0);

// Calculate revenue leakage (simplified estimate)
const potentialLeakage = leases.reduce((sum, lease) => {
  let leakage = 0;
  
  // Missing turnover rent tracking (higher estimate)
  if (lease.turnoverRentPercentage && !lease.reportingFrequency) {
    leakage += parseFloat(lease.currentBaseRent || "0") * 0.25; // Estimate 25% of base rent
  }
  
  // Missing indexation (cumulative effect)
  if (!lease.indexationIndex && lease.currentBaseRent) {
    leakage += parseFloat(lease.currentBaseRent) * 0.05 * 12; // 5% annual increase missed
  }
  
  // Service charge not reconciled
  if (lease.serviceChargeStatus === "Pending" && lease.serviceChargeCapValue) {
    leakage += parseFloat(lease.serviceChargeCapValue) * 0.15; // 15% variance
  }
  
  // Break clauses not monitored
  if (lease.tenantBreakOptionDate && !lease.tenantBreakNoticePeriod) {
    leakage += parseFloat(lease.currentBaseRent || "0") * 0.5; // Half month rent
  }
  
  return sum + leakage;
}, 0);

// Break options at risk (next 6 months)
const now = new Date();
const in6Months = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
const breakOptionsAtRisk = leases.filter(lease => {
  if (!lease.tenantBreakOptionDate) return false;
  const breakDate = new Date(lease.tenantBreakOptionDate);
  return breakDate >= now && breakDate <= in6Months;
}).length;

// Tenant concentration risk
const tenantRents: { [key: string]: number } = {};
leases.forEach(lease => {
  const rent = parseFloat(lease.currentBaseRent || "0") * 12;
  tenantRents[lease.tenantName] = (tenantRents[lease.tenantName] || 0) + rent;
});

const topTenantRent = Math.max(...Object.values(tenantRents));
const concentrationRisk = (topTenantRent / totalAnnualizedRent) * 100;

// Average data completeness
const avgCompleteness = leases.reduce((sum, lease) => 
  sum + parseFloat(lease.dataCompletenessScore || "0"), 0) / leases.length;

console.log("=== ALIGNED METRICS ===");
console.log(`Total Leases: ${totalLeases}`);
console.log(`Total GLA: ${totalGLA.toFixed(2)} m²`);
console.log(`Total Annualized Rent: PLN ${(totalAnnualizedRent / 1000000).toFixed(1)}M`);
console.log(`Potential Revenue Leakage: PLN ${(potentialLeakage / 1000000).toFixed(1)}M`);
console.log(`Break Options at Risk (6 months): ${breakOptionsAtRisk}`);
console.log(`Tenant Concentration Risk: ${concentrationRisk.toFixed(1)}%`);
console.log(`Average Data Completeness: ${avgCompleteness.toFixed(1)}%`);
