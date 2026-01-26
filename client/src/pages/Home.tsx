import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Database, BarChart3 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [extracting, setExtracting] = useState(false);

  const seedMutation = trpc.leases.seedSyntheticData.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => setLocation("/dashboard"), 1500);
    },
    onError: (error) => {
      toast.error("Failed to seed data: " + error.message);
    },
  });

  const extractMutation = trpc.leases.extract.useMutation({
    onSuccess: (data) => {
      toast.success(`Lease extracted successfully! Completeness: ${data.completenessScore.toFixed(1)}%`);
      setExtracting(false);
      setTimeout(() => setLocation("/dashboard"), 1500);
    },
    onError: (error) => {
      toast.error("Failed to extract lease: " + error.message);
      setExtracting(false);
    },
  });

  const handleSeedData = () => {
    seedMutation.mutate();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setExtracting(true);
    toast.info("Extracting lease data... This may take a moment.");

    // For MVP, we'll use sample text. In production, this would use PDF parsing
    const sampleLeaseText = `
      COMMERCIAL LEASE AGREEMENT
      
      Tenant: Zara Fashion Store
      Category: Fashion & Apparel
      Leasable Area: 250 square meters
      
      1. BASE RENT
      The monthly base rent shall be PLN 15,000 commencing on January 1, 2024.
      Rent steps: Year 2 - PLN 15,450, Year 3 - PLN 15,914, Year 4 - PLN 16,391
      
      2. TURNOVER RENT
      The Tenant shall pay turnover rent at 5% of gross sales exceeding the natural breakpoint of PLN 1,200,000 annually.
      Reporting: Monthly sales reports due by the 10th of each month.
      Excluded sales: VAT, gift cards, lottery tickets
      
      3. INDEXATION
      Base rent shall be indexed annually based on the Polish CPI, with a cap of 3% and a floor of 0.5%.
      Base month: January 2024
      
      4. SERVICE CHARGE
      Tenant's pro-rata share: 2.5% of total building costs
      Cap: 15% of base rent annually
      Excluded costs: Capital improvements, property taxes
      
      5. CRITICAL DATES
      Lease expiry: December 31, 2033
      Tenant break option: December 31, 2028 (6 months notice required)
      Renewal deadline: June 30, 2033
    `;

    extractMutation.mutate({ leaseText: sampleLeaseText });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Lease Extraction Platform</CardTitle>
            <CardDescription className="text-base">
              AI-powered commercial real estate analytics for shopping centers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Extract critical lease clauses automatically</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Visualize portfolio performance</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>Identify revenue leakage opportunities</span>
              </div>
            </div>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full" size="lg">
              Sign In to Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Lease Extraction Platform</h1>
              <p className="text-sm text-slate-600">Commercial Real Estate Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Welcome, {user?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")}>
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">Upload Your Lease Documents</h2>
            <p className="text-lg text-slate-600">
              Extract critical financial and operational data from commercial lease agreements using AI
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Lease PDF
                </CardTitle>
                <CardDescription>
                  Extract data from your lease documents automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={extracting}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {extracting ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-sm text-slate-600">Extracting lease data...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-12 w-12 text-slate-400" />
                        <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500">PDF files only</p>
                      </div>
                    )}
                  </label>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-semibold">Extracted clauses:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Base Rent & Rent Steps</li>
                    <li>Turnover / Percentage Rent</li>
                    <li>CPI / Indexation</li>
                    <li>Service Charge / CAM</li>
                    <li>Critical Dates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Seed Data Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Load Sample Data
                </CardTitle>
                <CardDescription>
                  Generate synthetic lease data for testing and exploration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Properties</span>
                    <span className="font-semibold">4 shopping centers</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Leases</span>
                    <span className="font-semibold">50 tenant agreements</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Data Quality</span>
                    <span className="font-semibold">Realistic scenarios</span>
                  </div>
                </div>
                <Button
                  onClick={handleSeedData}
                  disabled={seedMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  {seedMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Generate Sample Data
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-500">
                  Sample data includes leases from Arkadia, Złote Tarasy, Galeria Mokotów, and Promenada
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>Comprehensive lease analysis and portfolio management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Portfolio Overview</h4>
                  <p className="text-sm text-slate-600">
                    Track total leases, GLA, occupancy rates, and WALT across your portfolio
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Financial Performance</h4>
                  <p className="text-sm text-slate-600">
                    Monitor rental income, identify revenue leakage, and analyze rent components
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Operational Risk</h4>
                  <p className="text-sm text-slate-600">
                    Track critical dates, break options, and data completeness scores
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Tenant Analysis</h4>
                  <p className="text-sm text-slate-600">
                    Analyze tenant mix, concentration risk, and top performers by rent and GLA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
