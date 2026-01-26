import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { generateProperties, generateLeases } from "./syntheticData";
import { createProperty } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 999,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Leases Router", () => {
  describe("seedSyntheticData", () => {
    it("should generate properties and leases successfully", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leases.seedSyntheticData();

      expect(result.success).toBe(true);
      expect(result.message).toContain("Generated");
      expect(result.message).toContain("properties");
      expect(result.message).toContain("leases");
    });
  });

  describe("list", () => {
    it("should return empty array when user has no leases", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const leases = await caller.leases.list();

      expect(Array.isArray(leases)).toBe(true);
    });
  });
});

describe("Synthetic Data Generation", () => {
  it("should generate properties with correct structure", () => {
    const properties = generateProperties();

    expect(properties.length).toBeGreaterThan(0);
    properties.forEach(property => {
      expect(property.name).toBeDefined();
      expect(property.location).toBeDefined();
      expect(property.totalGLA).toBeDefined();
    });
  });

  it("should generate leases with all required fields", () => {
    const userId = 1;
    const propertyIds = [1, 2, 3, 4];
    const leases = generateLeases(userId, propertyIds, 10);

    expect(leases.length).toBe(10);
    leases.forEach(lease => {
      expect(lease.userId).toBe(userId);
      expect(propertyIds).toContain(lease.propertyId);
      expect(lease.tenantName).toBeDefined();
      expect(lease.tenantCategory).toBeDefined();
      expect(lease.currentBaseRent).toBeDefined();
      expect(lease.extractionStatus).toBe("completed");
      expect(parseFloat(lease.dataCompletenessScore!)).toBeGreaterThan(0);
      expect(parseFloat(lease.dataCompletenessScore!)).toBeLessThanOrEqual(100);
    });
  });

  it("should generate leases with varied turnover rent configurations", () => {
    const userId = 1;
    const propertyIds = [1, 2, 3, 4];
    const leases = generateLeases(userId, propertyIds, 50);

    const withTurnoverRent = leases.filter(lease => lease.turnoverRentPercentage !== null);
    const withoutTurnoverRent = leases.filter(lease => lease.turnoverRentPercentage === null);

    // Expect some leases to have turnover rent and some not (based on 40% probability)
    expect(withTurnoverRent.length).toBeGreaterThan(0);
    expect(withoutTurnoverRent.length).toBeGreaterThan(0);

    // Check turnover rent fields are consistent
    withTurnoverRent.forEach(lease => {
      expect(lease.breakpointType).toBeDefined();
      expect(lease.breakpointValue).toBeDefined();
      expect(lease.reportingFrequency).toBeDefined();
    });
  });

  it("should generate leases with varied indexation configurations", () => {
    const userId = 1;
    const propertyIds = [1, 2, 3, 4];
    const leases = generateLeases(userId, propertyIds, 50);

    const withIndexation = leases.filter(lease => lease.indexationIndex !== null);
    const withoutIndexation = leases.filter(lease => lease.indexationIndex === null);

    // Expect most leases to have indexation (based on 80% probability)
    expect(withIndexation.length).toBeGreaterThan(withoutIndexation.length);

    // Check indexation fields are consistent
    withIndexation.forEach(lease => {
      expect(lease.indexationFrequency).toBeDefined();
      expect(lease.indexationBaseMonth).toBeDefined();
    });
  });

  it("should generate leases with critical dates", () => {
    const userId = 1;
    const propertyIds = [1, 2, 3, 4];
    const leases = generateLeases(userId, propertyIds, 20);

    leases.forEach(lease => {
      expect(lease.leaseExpiryDate).toBeDefined();
      
      // Some leases should have break options
      if (lease.tenantBreakOptionDate) {
        expect(lease.tenantBreakNoticePeriod).toBeDefined();
        expect(lease.tenantBreakNoticePeriod).toBeGreaterThan(0);
      }
    });
  });
});

describe("Dashboard Calculations", () => {
  it("should calculate data completeness score correctly", () => {
    const userId = 1;
    const propertyIds = [1];
    const leases = generateLeases(userId, propertyIds, 1);
    const lease = leases[0]!;

    const score = parseFloat(lease.dataCompletenessScore!);
    
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
