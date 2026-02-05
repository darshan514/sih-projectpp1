import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  MapPin, 
  Calendar,
  FileText,
  Activity,
  Download,
  Filter
} from "lucide-react";

interface DistrictData {
  district: string;
  workerCount: number;
}

const GovernmentPortal = () => {
  const [districtData, setDistrictData] = useState<DistrictData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalWorkers, setTotalWorkers] = useState<number | null>(null);

  useEffect(() => {
    fetchDistrictData();
  }, []);

  const fetchDistrictData = async () => {
    setIsLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('workers')
        .select('district', { count: 'exact', head: false })
        .not('district', 'is', null);

      if (error) throw error;

      setTotalWorkers(count ?? null);

      // Aggregate data by district
      const districtCounts: Record<string, number> = {};
      data?.forEach((worker: any) => {
        const district = worker.district;
        districtCounts[district] = (districtCounts[district] || 0) + 1;
      });

      const aggregatedData = Object.entries(districtCounts).map(([district, count]) => ({
        district,
        workerCount: count
      })).sort((a, b) => b.workerCount - a.workerCount);

      setDistrictData(aggregatedData);
    } catch (error) {
      console.error('Error fetching district data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHeatColor = (count: number, maxCount: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'bg-red-500';
    if (intensity > 0.4) return 'bg-orange-400';
    if (intensity > 0.2) return 'bg-yellow-300';
    return 'bg-green-200';
  };

  const maxWorkerCount = Math.max(...districtData.map(d => d.workerCount), 1);
  const healthAlerts = [
    {
      id: 1,
      location: "Kochi Industrial Area",
      type: "Respiratory Issues",
      affected: 12,
      severity: "medium",
      date: "2024-01-15"
    },
    {
      id: 2,
      location: "Thiruvananthapuram Port",
      type: "Skin Allergies",
      affected: 8,
      severity: "low",
      date: "2024-01-14"
    },
    {
      id: 3,
      location: "Kozhikode Construction Sites",
      type: "Heat Exhaustion",
      affected: 15,
      severity: "high",
      date: "2024-01-13"
    }
  ];

  const vaccinationData = [
    { district: "Thiruvananthapuram", total: 2456, vaccinated: 2203, percentage: 90 },
    { district: "Kochi", total: 3124, vaccinated: 2811, percentage: 90 },
    { district: "Kozhikode", total: 1876, vaccinated: 1595, percentage: 85 },
    { district: "Thrissur", total: 1234, vaccinated: 1048, percentage: 85 },
    { district: "Kollam", total: 987, vaccinated: 790, percentage: 80 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return <Badge className="bg-destructive text-destructive-foreground">High Risk</Badge>;
      case "medium": return <Badge className="bg-warning text-warning-foreground">Medium Risk</Badge>;
      case "low": return <Badge className="bg-success text-success-foreground">Low Risk</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Government Health Dashboard</h1>
              <p className="text-muted-foreground">Migrant Worker Health Surveillance - Kerala State</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Badge variant="outline" className="text-sm truncate max-w-full sm:max-w-xs">
                Department of Health & Family Welfare
              </Badge>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Key Metrics Dashboard - dynamic, no demo numbers */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Total Workers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalWorkers ?? '—'}</div>
              <p className="text-sm text-muted-foreground">Count of registered workers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">—</div>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-success" />
                Vaccination Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">—</div>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-secondary" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">—</div>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Health Alerts
            </TabsTrigger>
            <TabsTrigger value="vaccination" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Vaccination
            </TabsTrigger>
            <TabsTrigger value="surveillance" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Surveillance
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <div className="text-center text-muted-foreground py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No alerts available yet</p>
            </div>
          </TabsContent>

          <TabsContent value="vaccination" className="space-y-6">
            <div className="text-center text-muted-foreground py-8">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Vaccination analytics coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="surveillance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Health Surveillance Map</h2>
              <Button variant="outline" size="sm" onClick={fetchDistrictData} disabled={isLoading}>
                <MapPin className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading...' : 'Refresh Map'}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>District-wise Worker Heat Map</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {districtData.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No District Data Available</h3>
                    <p>Worker registration data with district information will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-sm font-medium">Intensity Scale:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-green-200 rounded"></div>
                          <span className="text-xs">Low</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-yellow-300 rounded"></div>
                          <span className="text-xs">Medium</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-orange-400 rounded"></div>
                          <span className="text-xs">High</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-red-500 rounded"></div>
                          <span className="text-xs">Very High</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {districtData.map((data) => (
                        <Card 
                          key={data.district} 
                          className={`${getHeatColor(data.workerCount, maxWorkerCount)} border-2 transition-transform hover:scale-105 cursor-pointer`}
                        >
                          <CardContent className="p-4 text-center">
                            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                            <h3 className="font-bold text-lg text-gray-900">{data.district}</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{data.workerCount}</p>
                            <p className="text-xs text-gray-700">Workers</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Health Concerns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { concern: "Respiratory Issues", count: 45, trend: "up" },
                      { concern: "Skin Conditions", count: 32, trend: "down" },
                      { concern: "Heat Related", count: 28, trend: "up" },
                      { concern: "Digestive Issues", count: 21, trend: "stable" }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{item.concern}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{item.count} cases</span>
                          <TrendingUp className={`w-4 h-4 ${
                            item.trend === 'up' ? 'text-destructive' : 
                            item.trend === 'down' ? 'text-success' : 'text-muted-foreground'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Hotspots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { location: "Industrial Zone, Kochi", risk: "High", workers: 1200 },
                      { location: "Port Area, Thiruvananthapuram", risk: "Medium", workers: 850 },
                      { location: "Construction Sites, Kozhikode", risk: "Medium", workers: 650 },
                      { location: "Agricultural Areas, Thrissur", risk: "Low", workers: 400 }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.location}</span>
                          <p className="text-sm text-muted-foreground">{item.workers} workers</p>
                        </div>
                        <Badge variant={item.risk === 'High' ? 'destructive' : item.risk === 'Medium' ? 'secondary' : 'outline'}>
                          {item.risk} Risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Health Reports & Analytics</h2>
              <Button className="bg-primary hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Health Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>New Registrations</span>
                      <span className="font-semibold">298</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Health Checkups</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vaccinations</span>
                      <span className="font-semibold">867</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Treatment Cases</span>
                      <span className="font-semibold">124</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Health Registration</span>
                        <span className="font-semibold">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Vaccination Coverage</span>
                        <span className="font-semibold">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Annual Checkups</span>
                        <span className="font-semibold">76%</span>
                      </div>
                      <Progress value={76} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GovernmentPortal;