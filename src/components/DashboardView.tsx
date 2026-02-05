import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Clock, User, Activity } from 'lucide-react';

interface Doctor {
  name: string;
}

interface DashboardViewProps {
  doctor: Doctor;
  onSearchClick: () => void;
}

const DashboardView = ({ doctor, onSearchClick }: DashboardViewProps) => {
  // Mocked data
  const upcomingAppointments = [
    { id: 1, patientName: 'Rajesh Kumar', time: '10:00 AM', reason: 'Follow-up Consultation', date: 'Today' },
    { id: 2, patientName: 'Priya Sharma', time: '11:30 AM', reason: 'Annual Check-up', date: 'Today' },
    { id: 3, patientName: 'Amit Patel', time: '02:00 PM', reason: 'Lab Results Review', date: 'Today' },
    { id: 4, patientName: 'Meena Verma', time: '09:00 AM', reason: 'Post-Surgery Follow-up', date: 'Tomorrow' },
  ];

  const recentPatients = [
    { id: 1, name: 'Suresh Reddy', lastVisit: '2 days ago', swasthyaId: 'A1B2C3' },
    { id: 2, name: 'Kavita Singh', lastVisit: '5 days ago', swasthyaId: 'D4E5F6' },
    { id: 3, name: 'Ravi Malhotra', lastVisit: '1 week ago', swasthyaId: 'G7H8I9' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, Dr. {doctor.name}!
        </h1>
        <p className="text-muted-foreground">
          You have {upcomingAppointments.filter(a => a.date === 'Today').length} appointments scheduled for today
        </p>
      </div>

      {/* Quick Patient Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Quick Patient Search
          </CardTitle>
          <CardDescription>Search for a patient by their SwasthyaID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter SwasthyaID (e.g., A1B2C3)"
              className="font-mono"
              maxLength={6}
            />
            <Button onClick={onSearchClick}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your schedule for the next 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary mb-1" />
                  <span className="text-xs font-medium text-primary">{apt.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{apt.patientName}</p>
                    <Badge variant="secondary" className="text-xs">
                      {apt.date}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{apt.reason}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recently Viewed Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recently Viewed Patients
            </CardTitle>
            <CardDescription>Quick access to recent patient records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{patient.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs font-mono">
                      {patient.swasthyaId}
                    </Badge>
                    <span className="text-xs text-muted-foreground">• {patient.lastVisit}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
