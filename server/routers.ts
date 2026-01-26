import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createLease,
  getUserLeases,
  getLeaseById,
  getAllProperties,
  createProperty,
  getPortfolioStats,
  getFinancialStats,
  getOperationalRiskStats,
  getTenantStats,
} from "./db";
import { generateProperties, generateLeases } from "./syntheticData";
import { extractLeaseData, calculateCompletenessScore } from "./geminiService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Lease management routes
  leases: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserLeases(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getLeaseById(input.id);
      }),

    extract: protectedProcedure
      .input(z.object({ leaseText: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const extracted = await extractLeaseData(input.leaseText);
          const completenessScore = calculateCompletenessScore(extracted);

          // Create lease record in database
          const leaseData = {
            userId: ctx.user.id,
            propertyId: null,
            documentUrl: null,
            documentKey: null,
            tenantName: extracted.tenant_info.tenant_name,
            tenantCategory: extracted.tenant_info.tenant_category,
            leasableArea: extracted.tenant_info.leasable_area?.toString() || null,
            currentBaseRent: extracted.base_rent_and_steps.current_base_rent?.toString() || null,
            rentCurrency: extracted.base_rent_and_steps.rent_currency || "PLN",
            rentSteps: extracted.base_rent_and_steps.rent_steps ? extracted.base_rent_and_steps.rent_steps.map(step => ({
              effectiveDate: step.effective_date,
              newRentAmount: step.new_rent_amount
            })) : null,
            turnoverRentPercentage: extracted.turnover_rent.turnover_rent_percentage?.toString() || null,
            breakpointType: extracted.turnover_rent.breakpoint_type,
            breakpointValue: extracted.turnover_rent.breakpoint_value?.toString() || null,
            reportingFrequency: extracted.turnover_rent.reporting_frequency,
            excludedSales: extracted.turnover_rent.excluded_sales,
            indexationIndex: extracted.cpi_indexation.indexation_index,
            indexationFrequency: extracted.cpi_indexation.indexation_frequency,
            indexationBaseMonth: extracted.cpi_indexation.indexation_base_month ? new Date(extracted.cpi_indexation.indexation_base_month) : null,
            indexationCap: extracted.cpi_indexation.indexation_cap?.toString() || null,
            indexationFloor: extracted.cpi_indexation.indexation_floor?.toString() || null,
            proRataShare: extracted.service_charge_cam.pro_rata_share?.toString() || null,
            serviceChargeCapType: extracted.service_charge_cam.service_charge_cap_type,
            serviceChargeCapValue: extracted.service_charge_cam.service_charge_cap_value?.toString() || null,
            excludedCosts: extracted.service_charge_cam.excluded_costs,
            serviceChargeStatus: "Pending",
            leaseExpiryDate: extracted.critical_dates.lease_expiry_date ? new Date(extracted.critical_dates.lease_expiry_date) : null,
            tenantBreakOptionDate: extracted.critical_dates.tenant_break_option_date ? new Date(extracted.critical_dates.tenant_break_option_date) : null,
            tenantBreakNoticePeriod: extracted.critical_dates.tenant_break_notice_period,
            renewalDeadline: extracted.critical_dates.renewal_deadline ? new Date(extracted.critical_dates.renewal_deadline) : null,
            hasNonStandardClause: 0,
            extractionStatus: "completed",
            dataCompletenessScore: completenessScore.toFixed(2),
          };

          await createLease(leaseData);

          return {
            success: true,
            data: extracted,
            completenessScore,
          };
        } catch (error) {
          console.error("[Lease Extraction] Failed:", error);
          throw new Error("Failed to extract lease data");
        }
      }),

    seedSyntheticData: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        // Generate properties
        const propertiesData = generateProperties();
        const propertyIds: number[] = [];

        for (let i = 0; i < propertiesData.length; i++) {
          await createProperty(propertiesData[i]!);
          // Use sequential IDs starting from 1
          propertyIds.push(i + 1);
        }

        // Generate leases
        const leasesData = generateLeases(ctx.user.id, propertyIds, 50);

        for (const lease of leasesData) {
          await createLease(lease);
        }

        return {
          success: true,
          message: `Generated ${propertiesData.length} properties and ${leasesData.length} leases`,
        };
      } catch (error) {
        console.error("[Seed Data] Failed:", error);
        throw new Error("Failed to seed synthetic data");
      }
    }),
  }),

  // Dashboard data routes
  dashboard: router({
    portfolioOverview: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getPortfolioStats(ctx.user.id);
      const leases = await getUserLeases(ctx.user.id);

      // Calculate lease expiry profile (next 10 years)
      const now = new Date();
      const expiryProfile: { year: number; gla: number }[] = [];

      for (let i = 0; i < 10; i++) {
        const yearStart = new Date(now.getFullYear() + i, 0, 1);
        const yearEnd = new Date(now.getFullYear() + i, 11, 31);

        const gla = leases
          .filter(lease => {
            if (!lease.leaseExpiryDate) return false;
            const expiryDate = new Date(lease.leaseExpiryDate);
            return expiryDate >= yearStart && expiryDate <= yearEnd;
          })
          .reduce((sum, lease) => sum + parseFloat(lease.leasableArea || "0"), 0);

        expiryProfile.push({
          year: now.getFullYear() + i,
          gla,
        });
      }

      return {
        ...stats,
        expiryProfile,
      };
    }),

    financialPerformance: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getFinancialStats(ctx.user.id);
      const leases = await getUserLeases(ctx.user.id);

      // Service charge reconciliation breakdown
      const serviceChargeBreakdown = {
        Reconciled: 0,
        Pending: 0,
        Disputed: 0,
      };

      leases.forEach(lease => {
        const status = lease.serviceChargeStatus as keyof typeof serviceChargeBreakdown;
        if (status && status in serviceChargeBreakdown) {
          serviceChargeBreakdown[status]++;
        }
      });

      // Rent component breakdown
      let totalBaseRent = 0;
      let totalTurnoverRent = 0;
      let totalServiceCharge = 0;

      leases.forEach(lease => {
        if (lease.currentBaseRent) {
          totalBaseRent += parseFloat(lease.currentBaseRent) * 12;
        }
        if (lease.turnoverRentPercentage && lease.breakpointValue) {
          // Estimate turnover rent (simplified)
          totalTurnoverRent += parseFloat(lease.breakpointValue) * (parseFloat(lease.turnoverRentPercentage) / 100);
        }
        if (lease.serviceChargeCapValue) {
          totalServiceCharge += parseFloat(lease.serviceChargeCapValue);
        }
      });

      return {
        ...stats,
        serviceChargeBreakdown,
        rentComponents: {
          baseRent: totalBaseRent,
          turnoverRent: totalTurnoverRent,
          serviceCharge: totalServiceCharge,
        },
      };
    }),

    operationalRisk: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getOperationalRiskStats(ctx.user.id);
      const leases = await getUserLeases(ctx.user.id);

      // Critical dates timeline (next 18 months)
      const now = new Date();
      const in18Months = new Date(now.getTime() + 18 * 30 * 24 * 60 * 60 * 1000);

      const criticalDates = leases
        .filter(lease => {
          const expiry = lease.leaseExpiryDate ? new Date(lease.leaseExpiryDate) : null;
          const breakOption = lease.tenantBreakOptionDate ? new Date(lease.tenantBreakOptionDate) : null;
          const renewal = lease.renewalDeadline ? new Date(lease.renewalDeadline) : null;

          return (
            (expiry && expiry >= now && expiry <= in18Months) ||
            (breakOption && breakOption >= now && breakOption <= in18Months) ||
            (renewal && renewal >= now && renewal <= in18Months)
          );
        })
        .map(lease => ({
          tenantName: lease.tenantName,
          expiryDate: lease.leaseExpiryDate,
          breakOptionDate: lease.tenantBreakOptionDate,
          renewalDeadline: lease.renewalDeadline,
        }));

      // Non-standard clauses list
      const nonStandardLeases = leases
        .filter(lease => lease.hasNonStandardClause === 1)
        .map(lease => ({
          tenantName: lease.tenantName,
          category: lease.tenantCategory,
        }));

      return {
        ...stats,
        criticalDates,
        nonStandardLeases,
      };
    }),

    tenantAnalysis: protectedProcedure.query(async ({ ctx }) => {
      return await getTenantStats(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
