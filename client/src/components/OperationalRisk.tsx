import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertTriangle, FileWarning, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OperationalRisk() {
  const { data, isLoading, error } = trpc.dashboard.operationalRisk.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-red-600">Failed to load risk data</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break Options at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.breakOptionsAtRisk}</div>
            <p className="text-xs text-orange-600">Exercisable in next 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Standard Clauses</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.nonStandardClauses}</div>
            <p className="text-xs text-muted-foreground">Require manual review</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.avgCompletenessScore.toFixed(1)}%</div>
            <p className="text-xs text-green-600">Average across portfolio</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Dates Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Dates Timeline</CardTitle>
          <CardDescription>Upcoming lease events (next 18 months)</CardDescription>
        </CardHeader>
        <CardContent>
          {data.criticalDates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No critical dates in the next 18 months</p>
          ) : (
            <div className="space-y-4">
              {data.criticalDates.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.tenantName || 'Unknown Tenant'}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.expiryDate && (
                        <Badge variant="outline" className="text-xs">
                          Expiry: {formatDate(item.expiryDate.toString())}
                        </Badge>
                      )}
                      {item.breakOptionDate && (
                        <Badge variant="destructive" className="text-xs">
                          Break Option: {formatDate(item.breakOptionDate.toString())}
                        </Badge>
                      )}
                      {item.renewalDeadline && (
                        <Badge variant="secondary" className="text-xs">
                          Renewal Deadline: {formatDate(item.renewalDeadline.toString())}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Non-Standard Clauses List */}
      <Card>
        <CardHeader>
          <CardTitle>Leases with Non-Standard Clauses</CardTitle>
          <CardDescription>Require detailed manual review</CardDescription>
        </CardHeader>
        <CardContent>
          {data.nonStandardLeases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No non-standard clauses detected</p>
          ) : (
            <div className="space-y-3">
              {data.nonStandardLeases.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.tenantName || 'Unknown Tenant'}</p>
                    <p className="text-xs text-muted-foreground">{item.category || 'Unknown Category'}</p>
                  </div>
                  <Badge variant="outline">Review Required</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
