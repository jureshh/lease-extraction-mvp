import { describe, expect, it } from "vitest";
import { extractLeaseData } from "./geminiService";

describe("Gemini API Integration", () => {
  it("should successfully connect to Gemini API and extract data from sample text", async () => {
    const sampleLeaseText = `
      COMMERCIAL LEASE AGREEMENT
      
      This lease agreement is made between Landlord and Tenant for the premises located at 123 Main Street.
      
      RENT: The monthly base rent shall be $5,000 per month, payable on the first day of each month.
      
      LEASE TERM: The lease shall commence on January 1, 2024 and expire on December 31, 2026.
      
      INDEXATION: The rent shall be adjusted annually based on the Consumer Price Index (CPI) with a minimum increase of 2% and maximum increase of 5%.
    `;

    const result = await extractLeaseData(sampleLeaseText);

    // Validate that the API returned a response
    expect(result).toBeDefined();
    expect(typeof result).toBe("object");

    // Check that at least some data was extracted
    // The exact structure depends on the Gemini response, but we expect non-empty result
    const hasData =
      result.baseRent ||
      result.turnoverRent ||
      result.indexation ||
      result.serviceCharge ||
      result.criticalDates;

    expect(hasData).toBeTruthy();
  }, 30000); // 30 second timeout for API call
});
