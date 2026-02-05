import { Home, Search, Stethoscope, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface Doctor {
  id: string;
  name: string;
  hospital_name: string;
  unique_doctor_id: string;
  doctor_type: string;
}

interface ClinicalSidebarProps {
  doctor: Doctor;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ClinicalSidebar = ({ doctor, activeView, onViewChange, onLogout, open, onOpenChange }: ClinicalSidebarProps) => {
  const isMobile = useIsMobile();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patient-lookup', label: 'Patient Lookup', icon: Search },
    { id: 'symptom-analyzer', label: 'Symptom Analyzer', icon: Stethoscope },
  ];

  const sidebarContent = (
    <div className="h-full bg-card flex flex-col">
      {/* Logo and Title */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Clinical Co-pilot</h1>
            <p className="text-xs text-muted-foreground">{doctor.hospital_name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Doctor Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Dr. {doctor.name}</p>
            <p className="text-xs text-muted-foreground">
              {doctor.doctor_type === 'government' ? 'Government' : 'Private'} Doctor
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-64 h-screen border-r border-border">
      {sidebarContent}
    </div>
  );
};

export default ClinicalSidebar;
