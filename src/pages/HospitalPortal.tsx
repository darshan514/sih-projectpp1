import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ClinicalSidebar from "@/components/ClinicalSidebar";
import DashboardView from "@/components/DashboardView";
import PatientLookupView from "@/components/PatientLookupView";
import SymptomAnalyzerView from "@/components/SymptomAnalyzerView";

interface Doctor {
  id: string;
  name: string;
  hospital_name: string;
  unique_doctor_id: string;
  doctor_type: string;
}

const HospitalPortal = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const doctorData = sessionStorage.getItem('doctor');
    if (!doctorData) {
      navigate('/hospital-auth');
      return;
    }
    setDoctor(JSON.parse(doctorData));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('doctor');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate('/hospital-auth');
  };

  if (!doctor) return null;

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center px-4 z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="ml-3 text-lg font-semibold text-foreground">Clinical Co-pilot</h1>
        </header>
      )}

      {/* Sidebar */}
      <ClinicalSidebar
        doctor={doctor}
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setSidebarOpen(false);
        }}
        onLogout={handleLogout}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {activeView === 'dashboard' && (
            <DashboardView 
              doctor={doctor} 
              onSearchClick={() => setActiveView('patient-lookup')} 
            />
          )}
          {activeView === 'patient-lookup' && (
            <PatientLookupView doctor={doctor} />
          )}
          {activeView === 'symptom-analyzer' && (
            <SymptomAnalyzerView />
          )}
        </div>
      </main>
    </div>
  );
};

export default HospitalPortal;
