import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, FileText, Shield, Heart, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/5 py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4">
          {/* Logo in top left */}
          <div className="absolute top-8 left-4 md:left-8">
            <img 
              src={logo} 
              alt="SwasthyaID Logo" 
              className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
            />
          </div>
          
          <div className="text-center pt-24 md:pt-32">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Supporting SDG Health Goals
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Digital Health Records for
              <span className="text-primary block">Migrant Workers</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comprehensive health management system ensuring fair healthcare access, 
              disease prevention, and public health surveillance for migrant workers in Kerala.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/worker">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Users className="w-5 h-5 mr-2" />
                  Worker Portal
                </Button>
              </Link>
              <Link to="/hospital-auth">
                <Button size="lg" variant="outline" className="border-2 border-primary/30 hover:bg-primary/10 shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Building2 className="w-5 h-5 mr-2" />
                  Hospital Portal
                </Button>
              </Link>
              <Link to="/government">
                <Button size="lg" className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg transform hover:scale-105 transition-all duration-200">
                  <FileText className="w-5 h-5 mr-2" />
                  Government Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Empowering Health Through Technology
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform bridges the healthcare gap for migrant workers, ensuring no one is left behind
              in Kerala's healthcare ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Worker Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Simple QR-based access to medical history, prescriptions, and vaccination records
                  in multiple regional languages.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• QR code health ID system</li>
                  <li>• Multilingual interface (Malayalam, Bengali)</li>
                  <li>• Digital prescription access</li>
                  <li>• Vaccination tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Hospital Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comprehensive patient management system for healthcare providers
                  to update and track worker health records.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Patient registration & search</li>
                  <li>• Medical record management</li>
                  <li>• Digital prescription system</li>
                  <li>• Health analytics dashboard</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-accent/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Government Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced surveillance and monitoring system for public health officials
                  to track disease outbreaks and health trends.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Real-time health surveillance</li>
                  <li>• Outbreak detection & alerts</li>
                  <li>• Vaccination coverage tracking</li>
                  <li>• Policy decision support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Supporting Sustainable Development Goals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SDG 3: Good Health</h3>
              <p className="text-muted-foreground">
                Ensuring healthy lives and promoting well-being for all migrant workers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SDG 10: Reduced Inequalities</h3>
              <p className="text-muted-foreground">
                Providing equal healthcare access regardless of migrant status.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Disease Prevention</h3>
              <p className="text-muted-foreground">
                Preventing disease transmission and enhancing public health surveillance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Choose your portal to access the digital health record system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/worker">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Access Worker Portal
              </Button>
            </Link>
            <Link to="/hospital-auth">
              <Button size="lg" variant="outline">
                Hospital Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
