import { invokeLLM } from "./_core/llm";

/**
 * Google Gemini API integration for lease clause extraction
 */

interface ExtractedLeaseData {
  base_rent_and_steps: {
    current_base_rent: number | null;
    rent_currency: string | null;
    rent_steps: Array<{ effective_date: string; new_rent_amount: number }> | null;
  };
  turnover_rent: {
    turnover_rent_percentage: number | null;
    breakpoint_type: string | null;
    breakpoint_value: number | null;
    reporting_frequency: string | null;
    excluded_sales: string[] | null;
  };
  cpi_indexation: {
    indexation_index: string | null;
    indexation_frequency: string | null;
    indexation_base_month: string | null;
    indexation_cap: number | null;
    indexation_floor: number | null;
  };
  service_charge_cam: {
    pro_rata_share: number | null;
    service_charge_cap_type: string | null;
    service_charge_cap_value: number | null;
    excluded_costs: string[] | null;
  };
  critical_dates: {
    lease_expiry_date: string | null;
    tenant_break_option_date: string | null;
    tenant_break_notice_period: number | null;
    renewal_deadline: string | null;
  };
  tenant_info: {
    tenant_name: string | null;
    tenant_category: string | null;
    leasable_area: number | null;
  };
}

const SYSTEM_PROMPT = `You are an expert commercial real estate lease analyst specializing in Polish shopping center leases. Your task is to meticulously read the following lease agreement, provided in text format, and extract the key data points for the top 5 most important financial and operational clauses. You must return the data in a single, valid JSON object. Do not add any commentary or explanation outside of the JSON structure. If a specific data point is not present in the lease, use a null value.`;

const EXTRACTION_SCHEMA = {
  type: "object" as const,
  properties: {
    base_rent_and_steps: {
      type: "object" as const,
      properties: {
        current_base_rent: { type: "number" as const, description: "The current monthly or annual base rent amount as a number" },
        rent_currency: { type: "string" as const, description: "The three-letter currency code (e.g., PLN, EUR)" },
        rent_steps: {
          type: "array" as const,
          items: {
            type: "object" as const,
            properties: {
              effective_date: { type: "string" as const, description: "The date the rent step becomes effective, in YYYY-MM-DD format" },
              new_rent_amount: { type: "number" as const, description: "The new base rent amount as a number" },
            },
            required: ["effective_date", "new_rent_amount"],
            additionalProperties: false,
          },
        },
      },
      required: ["current_base_rent", "rent_currency", "rent_steps"],
      additionalProperties: false,
    },
    turnover_rent: {
      type: "object" as const,
      properties: {
        turnover_rent_percentage: { type: "number" as const, description: "The percentage of sales owed as rent" },
        breakpoint_type: { type: "string" as const, description: "Should be one of: 'Natural', 'Artificial', or 'None'" },
        breakpoint_value: { type: "number" as const, description: "The annual sales threshold that triggers turnover rent" },
        reporting_frequency: { type: "string" as const, description: "Should be one of: 'Monthly', 'Quarterly', 'Annually'" },
        excluded_sales: {
          type: "array" as const,
          items: { type: "string" as const },
          description: "List of sales categories excluded from turnover calculation",
        },
      },
      required: ["turnover_rent_percentage", "breakpoint_type", "breakpoint_value", "reporting_frequency", "excluded_sales"],
      additionalProperties: false,
    },
    cpi_indexation: {
      type: "object" as const,
      properties: {
        indexation_index: { type: "string" as const, description: "The specific name of the index used (e.g., 'HICP - Euro Area', 'Polish CPI')" },
        indexation_frequency: { type: "string" as const, description: "Should be one of: 'Annually', 'Bi-Annually'" },
        indexation_base_month: { type: "string" as const, description: "The reference month and year for the index calculation, in YYYY-MM-DD format" },
        indexation_cap: { type: "number" as const, description: "The maximum percentage increase in a single period" },
        indexation_floor: { type: "number" as const, description: "The minimum percentage increase in a single period" },
      },
      required: ["indexation_index", "indexation_frequency", "indexation_base_month", "indexation_cap", "indexation_floor"],
      additionalProperties: false,
    },
    service_charge_cam: {
      type: "object" as const,
      properties: {
        pro_rata_share: { type: "number" as const, description: "The tenant's percentage share of the total service charge" },
        service_charge_cap_type: { type: "string" as const, description: "Should be one of: 'Fixed Amount', '% of Base Rent', 'None'" },
        service_charge_cap_value: { type: "number" as const, description: "The value of the cap" },
        excluded_costs: {
          type: "array" as const,
          items: { type: "string" as const },
          description: "List of cost categories excluded from service charge calculation",
        },
      },
      required: ["pro_rata_share", "service_charge_cap_type", "service_charge_cap_value", "excluded_costs"],
      additionalProperties: false,
    },
    critical_dates: {
      type: "object" as const,
      properties: {
        lease_expiry_date: { type: "string" as const, description: "The final termination date of the lease, in YYYY-MM-DD format" },
        tenant_break_option_date: { type: "string" as const, description: "The date on which the tenant can exercise a break option, in YYYY-MM-DD format" },
        tenant_break_notice_period: { type: "integer" as const, description: "The required notice period in months before the break date" },
        renewal_deadline: { type: "string" as const, description: "The last date by which the tenant must give notice to exercise a renewal option, in YYYY-MM-DD format" },
      },
      required: ["lease_expiry_date", "tenant_break_option_date", "tenant_break_notice_period", "renewal_deadline"],
      additionalProperties: false,
    },
    tenant_info: {
      type: "object" as const,
      properties: {
        tenant_name: { type: "string" as const, description: "The name of the tenant" },
        tenant_category: { type: "string" as const, description: "The business category (e.g., Fashion, F&B, Entertainment)" },
        leasable_area: { type: "number" as const, description: "The leasable area in square meters" },
      },
      required: ["tenant_name", "tenant_category", "leasable_area"],
      additionalProperties: false,
    },
  },
  required: ["base_rent_and_steps", "turnover_rent", "cpi_indexation", "service_charge_cam", "critical_dates", "tenant_info"],
  additionalProperties: false,
};

export async function extractLeaseData(leaseText: string): Promise<ExtractedLeaseData> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Please extract the following information from the lease document and structure it as a JSON object:\n\n${leaseText}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lease_extraction",
          strict: true,
          schema: EXTRACTION_SCHEMA,
        },
      },
    });

    const message = response.choices[0]?.message;
    if (!message || !message.content) {
      throw new Error("No content returned from LLM");
    }

    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    const extracted = JSON.parse(content) as ExtractedLeaseData;
    return extracted;
  } catch (error) {
    console.error("[Gemini Service] Extraction failed:", error);
    throw error;
  }
}

/**
 * Calculate data completeness score based on extracted fields
 */
export function calculateCompletenessScore(data: ExtractedLeaseData): number {
  let completedFields = 0;
  const totalFields = 25;

  // Base rent fields (3)
  if (data.base_rent_and_steps.current_base_rent !== null) completedFields++;
  if (data.base_rent_and_steps.rent_currency !== null) completedFields++;
  if (data.base_rent_and_steps.rent_steps !== null && data.base_rent_and_steps.rent_steps.length > 0) completedFields++;

  // Turnover rent fields (5)
  if (data.turnover_rent.turnover_rent_percentage !== null) completedFields++;
  if (data.turnover_rent.breakpoint_type !== null) completedFields++;
  if (data.turnover_rent.breakpoint_value !== null) completedFields++;
  if (data.turnover_rent.reporting_frequency !== null) completedFields++;
  if (data.turnover_rent.excluded_sales !== null) completedFields++;

  // CPI indexation fields (5)
  if (data.cpi_indexation.indexation_index !== null) completedFields++;
  if (data.cpi_indexation.indexation_frequency !== null) completedFields++;
  if (data.cpi_indexation.indexation_base_month !== null) completedFields++;
  if (data.cpi_indexation.indexation_cap !== null) completedFields++;
  if (data.cpi_indexation.indexation_floor !== null) completedFields++;

  // Service charge fields (4)
  if (data.service_charge_cam.pro_rata_share !== null) completedFields++;
  if (data.service_charge_cam.service_charge_cap_type !== null) completedFields++;
  if (data.service_charge_cam.service_charge_cap_value !== null) completedFields++;
  if (data.service_charge_cam.excluded_costs !== null) completedFields++;

  // Critical dates fields (4)
  if (data.critical_dates.lease_expiry_date !== null) completedFields++;
  if (data.critical_dates.tenant_break_option_date !== null) completedFields++;
  if (data.critical_dates.tenant_break_notice_period !== null) completedFields++;
  if (data.critical_dates.renewal_deadline !== null) completedFields++;

  // Tenant info fields (3)
  if (data.tenant_info.tenant_name !== null) completedFields++;
  if (data.tenant_info.tenant_category !== null) completedFields++;
  if (data.tenant_info.leasable_area !== null) completedFields++;

  return (completedFields / totalFields) * 100;
}
