# Project TODO

## Database & Schema
- [x] Define leases table with all 5 critical clause fields
- [x] Define properties table for portfolio management
- [x] Create database migration and push schema

## Backend Services
- [x] Build Google Gemini API integration service
- [x] Create synthetic lease data generator
- [x] Build extraction service with structured JSON output
- [x] Implement dashboard calculation service
- [x] Create tRPC routes for lease upload and extraction
- [x] Create tRPC routes for dashboard data aggregation

## Frontend - Document Upload
- [x] Build drag-and-drop upload interface
- [x] Implement file validation and preview
- [x] Create extraction progress indicator
- [ ] Build source verification modal

## Frontend - Portfolio Overview Dashboard
- [x] Display total leases KPI card
- [x] Display total leasable area KPI card
- [x] Display portfolio occupancy rate gauge chart
- [x] Display WALT (Weighted Average Lease Term) KPI card
- [x] Build lease expiry profile bar chart

## Frontend - Financial Performance Dashboard
- [x] Display total annualized rent KPI card
- [x] Display average rent per area KPI card
- [x] Display potential revenue leakage KPI card
- [x] Build upcoming rent reviews timeline
- [x] Build service charge reconciliation donut chart
- [x] Build rent component breakdown stacked bar chart

## Frontend - Operational Risk Dashboard
- [x] Build critical dates timeline visualization
- [x] Display break options at risk KPI card
- [x] Build non-standard clauses alert list
- [x] Display data completeness score gauge chart

## Frontend - Tenant Analysis Dashboard
- [x] Build tenant mix by category donut chart
- [x] Build top 10 tenants by rent horizontal bar chart
- [x] Build top 10 tenants by GLA horizontal bar chart
- [x] Display tenant concentration risk KPI card

## Testing & Deployment
- [x] Seed database with synthetic lease data
- [x] Test extraction pipeline end-to-end
- [x] Test all dashboard visualizations
- [x] Create first checkpoint
