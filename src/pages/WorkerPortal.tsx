import React, { useState, useEffect } from 'react';
import WorkerRegistration from '@/components/WorkerRegistration';
import WorkerDashboardTabs from '@/components/WorkerDashboardTabs';
import OTPLogin from '@/components/OTPLogin';
import LanguageSelector from '@/components/LanguageSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, UserCheck, Users, Activity, TrendingUp, Smartphone, ArrowLeft, Home } from 'lucide-react';

interface Worker {
  id: string;
  unique_worker_id: string;
  name: string;
  mobile_number: string;
  email: string;
  address: string;
  date_of_birth: string;
  aadhar_number: string;
  created_at: string;
}

interface PortalStats {
  totalWorkers: number;
  totalRecords: number;
  totalDocuments: number;
  healthTracking: number;
}

const WorkerPortal = () => {
  const [currentWorker, setCurrentWorker] = useState<Worker | null>(null);
  const [searchId, setSearchId] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [portalStats, setPortalStats] = useState<PortalStats>({ totalWorkers: 0, totalRecords: 0, totalDocuments: 0, healthTracking: 95 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchPortalStats();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchPortalStats = async () => {
    setIsLoadingStats(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-portal-stats');
      
      if (error) throw error;
      
      if (data.success) {
        setPortalStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching portal stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleRegistrationSuccess = (worker: Worker) => {
    setCurrentWorker(worker);
    setShowRegistration(false);
    fetchPortalStats(); // Refresh stats after registration
  };

  const searchWorker = async () => {
    if (!searchId.trim() || !aadharNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter both your SwasthyaID and Aadhar number",
        variant: "destructive"
      });
      return;
    }

    if (!/^\d{12}$/.test(aadharNumber)) {
      toast({
        title: "Error",
        description: "Aadhar number must be exactly 12 digits",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data: worker, error } = await supabase
        .from('workers')
        .select('*')
        .eq('unique_worker_id', searchId.toUpperCase())
        .eq('aadhar_number', aadharNumber)
        .single();

      if (error || !worker) {
        toast({
          title: "Login Failed",
          description: "Invalid SwasthyaID or Aadhar number. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      setCurrentWorker(worker);
      toast({
        title: "Welcome Back!",
        description: `Hello ${worker.name}, your records have been loaded.`,
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    setCurrentWorker(null);
    setSearchId('');
    setAadharNumber('');
    setShowRegistration(false);
  };

  // If worker is logged in, show dashboard
  if (currentWorker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-lg font-bold text-gray-800">{t('workerPortal')}</h1>
              <p className="text-xs text-gray-600">Manage your health records and medical information</p>
            </div>
            <div className="flex gap-2">
              <LanguageSelector />
              <Button onClick={() => window.location.href = '/'} variant="outline" size="sm" className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all">
                <Home className="h-4 w-4 mr-2" />
                {t('home')}
              </Button>
              <Button onClick={handleLogout} variant="outline" className="bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 shadow-md hover:shadow-lg transition-all">
                {t('logout')}
              </Button>
            </div>
          </div>
          
          <WorkerDashboardTabs worker={currentWorker} />
        </div>
      </div>
    );
  }

  // If showing registration form
  if (showRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">SwasthyaID Worker Portal</h1>
              <p className="text-gray-600">Register to get your unique Health ID</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => window.location.href = '/'} variant="outline" size="sm" className="shadow-md hover:shadow-lg transition-all">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button onClick={() => setShowRegistration(false)} variant="outline" className="shadow-md hover:shadow-lg transition-all">
                Back to Login
              </Button>
            </div>
          </div>
          
          <WorkerRegistration onRegistrationSuccess={handleRegistrationSuccess} />
        </div>
      </div>
    );
  }

  // Main portal view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <Button onClick={() => window.location.href = '/'} variant="outline" size="sm" className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToHome')}
            </Button>
            <LanguageSelector />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">{t('workerPortal')}</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Access your complete medical records, health history, and connect with healthcare providers
          </p>
        </div>

        {/* Stats Cards - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 hover:shadow-lg transition-shadow transform hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="flex items-center p-6">
              <div className="p-3 bg-primary/20 rounded-full mr-4 animate-pulse">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">
                  {isLoadingStats ? '...' : portalStats.totalWorkers.toLocaleString()}
                </h3>
                <p className="text-gray-600 font-medium text-sm">{t('registeredWorkers')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 hover:shadow-lg transition-shadow transform hover:scale-105 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="flex items-center p-6">
              <div className="p-3 bg-green-200 rounded-full mr-4 animate-pulse">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">
                  {isLoadingStats ? '...' : portalStats.totalRecords.toLocaleString()}
                </h3>
                <p className="text-gray-600 font-medium text-sm">{t('medicalRecords')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 hover:shadow-lg transition-shadow transform hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="flex items-center p-6">
              <div className="p-3 bg-orange-200 rounded-full mr-4 animate-pulse">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-700">
                  {isLoadingStats ? '...' : `${portalStats.healthTracking}%`}
                </h3>
                <p className="text-gray-600 font-medium text-sm">{t('healthTracking')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Login Options Card */}
          <Card className="hover:shadow-xl transition-shadow border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <UserCheck className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('accessRecords')}</CardTitle>
              <CardDescription className="text-base">
                Choose your preferred login method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="id" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-primary/10 to-secondary/10">
                  <TabsTrigger value="id" className="data-[state=active]:bg-primary data-[state=active]:text-white">{t('healthId')}</TabsTrigger>
                  <TabsTrigger value="otp" className="data-[state=active]:bg-primary data-[state=active]:text-white">{t('mobileOtp')}</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">{t('register')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="id" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="swasthyaId">{t('healthId')} (ID)</Label>
                      <Input
                        id="swasthyaId"
                        placeholder={t('enterHealthId')}
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="font-mono text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aadharLogin">Aadhar Number (Password)</Label>
                      <Input
                        id="aadharLogin"
                        type="password"
                        placeholder="Enter your 12-digit Aadhar"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value)}
                        maxLength={12}
                        className="font-mono text-base"
                      />
                    </div>
                    <Button 
                      onClick={searchWorker} 
                      disabled={isSearching} 
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {isSearching ? t('searching') : 'Login'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use your SwasthyaID and Aadhar number to securely access your records
                  </p>
                </TabsContent>
                
                <TabsContent value="otp" className="mt-4">
                  <div className="flex justify-center">
                    <OTPLogin onLoginSuccess={(worker) => setCurrentWorker(worker)} />
                  </div>
                </TabsContent>

                <TabsContent value="register" className="mt-4">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground text-sm">New to the platform?</p>
                    <Button 
                      onClick={() => setShowRegistration(true)} 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {t('registerNow')}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="hover:shadow-xl transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Activity className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-800">{t('platformBenefits')}</CardTitle>
              <CardDescription className="text-base text-green-700">
                Why choose SwasthyaID for your health management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">{t('uniqueHealthId')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">{t('centralizedRecords')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">{t('easyMobileAccess')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">{t('appointmentTracking')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Powered by SwasthyaID - Digital Health Records for Everyone
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkerPortal;