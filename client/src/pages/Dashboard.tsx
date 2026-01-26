import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, DollarSign, AlertTriangle, Users } from "lucide-react";
import { useLocation } from "wouter";
import PortfolioOverview from "@/components/PortfolioOverview";
import FinancialPerformance from "@/components/FinancialPerformance";
import OperationalRisk from "@/components/OperationalRisk";
import TenantAnalysis from "@/components/TenantAnalysis";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Lease Extraction Platform</h1>
              <p className="text-sm text-slate-600">Commercial Real Estate Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Welcome, {user?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
                Upload Lease
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio Overview</span>
              <span className="sm:hidden">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financial Performance</span>
              <span className="sm:hidden">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Operational Risk</span>
              <span className="sm:hidden">Risk</span>
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tenant Analysis</span>
              <span className="sm:hidden">Tenants</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <PortfolioOverview />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialPerformance />
          </TabsContent>

          <TabsContent value="risk">
            <OperationalRisk />
          </TabsContent>

          <TabsContent value="tenants">
            <TenantAnalysis />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
