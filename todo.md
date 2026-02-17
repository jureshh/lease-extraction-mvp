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

## Interactive Landing Page
- [x] Create narrative-driven landing page based on demo script
- [x] Build Act 1: The Problem section with pain points
- [x] Build Act 2: The Discovery section with AI reveal
- [x] Build Act 3: The Transformation section with live data
- [x] Build Act 4: The Impact section with CTA
- [x] Add scroll-triggered animations and transitions
- [x] Implement interactive data visualizations
- [x] Add smooth scroll navigation between sections

## Landing Page Redesign
- [x] Reduce text to punchy statements only
- [x] Add visual imagery (shopping centers, lease documents, dashboards)
- [x] Integrate financial metrics as visual elements
- [x] Ensure text complements voiceover rather than duplicates it
- [x] Add background images and visual hierarchy

## Navigation and Theme Fixes
- [x] Fix navigation loop between landing page and app
- [x] Ensure "View Live Demo" goes to upload screen, not dashboard
- [x] Ensure "Upload Lease" goes to upload screen
- [x] Change app theme from dark to light
- [x] Update all dashboard components to use light colors
- [x] Update landing page to complement light app theme
