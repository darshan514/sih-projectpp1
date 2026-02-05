import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  FileText, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  Activity,
  Heart,
  Droplet,
  TrendingUp
} from 'lucide-react';

interface Worker {
  id: string;
  unique_worker_id: string;
  name: string;
  mobile_number: string;
  email: string;
  address: string;
  date_of_birth: string;
  created_at: string;
}

interface Doctor {
  id: string;
  name: string;
  hospital_name: string;
  unique_doctor_id: string;
  doctor_type: string;
}

interface PatientLookupViewProps {
  doctor: Doctor;
}

const PatientLookupView = ({ doctor }: PatientLookupViewProps) => {
  const [searchId, setSearchId] = useState('');
  const [foundWorker, setFoundWorker] = useState<Worker | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [medicalRecord, setMedicalRecord] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    suggested_tests: '',
    test_by_worker: '',
    next_appointment_date: '',
    visit_date: new Date().toISOString().split('T')[0]
  });

  // Mock patient data for demonstration
  const mockPatientData = {
    age: 42,
    gender: 'Male',
    aiSummary: `The patient has a documented history of hypertension, managed with medication since 2018. Recent blood pressure readings have shown improvement with current treatment regimen. The patient has been compliant with medications and lifestyle modifications including diet and exercise. No significant complications noted in the past year.

Previous consultations indicate well-controlled blood sugar levels and normal lipid profile. The patient reports occasional stress-related headaches but no other significant symptoms. Regular follow-ups have shown consistent improvement in overall cardiovascular health markers.

Recommended continuation of current treatment plan with periodic monitoring of blood pressure and metabolic parameters. Patient education regarding stress management techniques has been provided.`,
    vitals: {
      bloodPressure: '128/82 mmHg',
      heartRate: '72 bpm',
      spo2: '98%',
      temperature: '98.4°F'
    },
    bpTrend: [
      { month: 'Jun', systolic: 145, diastolic: 92 },
      { month: 'Jul', systolic: 142, diastolic: 88 },
      { month: 'Aug', systolic: 138, diastolic: 86 },
      { month: 'Sep', systolic: 135, diastolic: 84 },
      { month: 'Oct', systolic: 132, diastolic: 82 },
      { month: 'Nov', systolic: 128, diastolic: 82 }
    ],
    documents: [
      { name: 'Blood Test Report - Nov 2025.pdf', date: 'Nov 15, 2025' },
      { name: 'ECG Report - Oct 2025.pdf', date: 'Oct 20, 2025' },
      { name: 'Prescription - Sep 2025.pdf', date: 'Sep 10, 2025' }
    ]
  };

  const searchWorker = async () => {
    if (!searchId.trim()) {
      toast({
        title: "Error",
        description: "Please enter SwasthyaID",
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
        .single();

      if (error || !worker) {
        toast({
          title: "Patient Not Found",
          description: "No patient found with this SwasthyaID",
          variant: "destructive"
        });
        setFoundWorker(null);
        return;
      }

      setFoundWorker(worker);
      toast({
        title: "Patient Found",
        description: `Found ${worker.name} (${worker.unique_worker_id})`,
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addMedicalRecord = async () => {
    if (!foundWorker) return;

    setIsAddingRecord(true);
    try {
      const statusDisplay = doctor.unique_doctor_id.includes('/') ? 'Government' : 'Private';

      const { data: record, error: recordError } = await supabase
        .from('medical_records')
        .insert({
          worker_id: foundWorker.id,
          doctor_name: doctor.name,
          hospital_name: doctor.hospital_name,
          doctor_type: statusDisplay,
          diagnosis: medicalRecord.diagnosis,
          prescription: medicalRecord.prescription,
          notes: medicalRecord.notes,
          suggested_tests: medicalRecord.suggested_tests,
          test_by_worker: medicalRecord.test_by_worker,
          next_appointment_date: medicalRecord.next_appointment_date || null,
          visit_date: medicalRecord.visit_date
        })
        .select()
        .single();

      if (recordError) throw recordError;

      if (medicalRecord.next_appointment_date) {
        const { error: apptError } = await supabase
          .from('appointments')
          .insert({
            worker_id: foundWorker.id,
            doctor_name: doctor.name,
            appointment_date: medicalRecord.next_appointment_date,
            status: 'scheduled',
            purpose: medicalRecord.diagnosis,
            notes: medicalRecord.notes || null
          });
        if (apptError) throw apptError;
      }

      if (selectedFile && record) {
        const fileName = `${foundWorker.unique_worker_id}/${Date.now()}_${selectedFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('medical-documents')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { error: docError } = await supabase
          .from('medical_documents')
          .insert({
            worker_id: foundWorker.id,
            medical_record_id: record.id,
            file_name: selectedFile.name,
            file_path: fileName,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
            uploaded_by: doctor.name
          });

        if (docError) throw docError;
      }

      await supabase.functions.invoke('sync-health-data');

      toast({
        title: "Success",
        description: "Medical record added successfully",
      });

      setMedicalRecord({
        diagnosis: '',
        prescription: '',
        notes: '',
        suggested_tests: '',
        test_by_worker: '',
        next_appointment_date: '',
        visit_date: new Date().toISOString().split('T')[0]
      });
      setSelectedFile(null);

    } catch (error: any) {
      console.error('Error adding record:', error);
      toast({
        title: "Failed to Add Record",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsAddingRecord(false);
    }
  };

  const age = foundWorker ? Math.floor((new Date().getTime() - new Date(foundWorker.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : mockPatientData.age;

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Patient by SwasthyaID
          </CardTitle>
          <CardDescription>
            Enter the patient's unique SwasthyaID to access their medical records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="searchId">SwasthyaID</Label>
              <Input
                id="searchId"
                placeholder="Enter 6-digit SwasthyaID (e.g., A1B2C3)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono text-lg"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchWorker} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Dashboard */}
      {foundWorker && (
        <div className="space-y-6">
          {/* Patient Header */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{foundWorker.name}</h2>
                  <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                    <span>{age} years • {mockPatientData.gender}</span>
                    <Badge variant="secondary" className="font-mono">{foundWorker.unique_worker_id}</Badge>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      Add Medical Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Medical Record - {foundWorker.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="visit_date">Visit Date *</Label>
                          <Input
                            id="visit_date"
                            type="date"
                            value={medicalRecord.visit_date}
                            onChange={(e) => setMedicalRecord(prev => ({ ...prev, visit_date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="next_appointment_date">Next Appointment Date</Label>
                          <Input
                            id="next_appointment_date"
                            type="date"
                            value={medicalRecord.next_appointment_date}
                            onChange={(e) => setMedicalRecord(prev => ({ ...prev, next_appointment_date: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="diagnosis">Diagnosis *</Label>
                        <Input
                          id="diagnosis"
                          value={medicalRecord.diagnosis}
                          onChange={(e) => setMedicalRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                          placeholder="Primary diagnosis"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="prescription">Prescription</Label>
                        <Textarea
                          id="prescription"
                          value={medicalRecord.prescription}
                          onChange={(e) => setMedicalRecord(prev => ({ ...prev, prescription: e.target.value }))}
                          placeholder="Medications and dosage instructions..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="suggested_tests">Tests Suggested by Doctor</Label>
                        <Textarea
                          id="suggested_tests"
                          value={medicalRecord.suggested_tests}
                          onChange={(e) => setMedicalRecord(prev => ({ ...prev, suggested_tests: e.target.value }))}
                          placeholder="List of tests recommended..."
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="test_by_worker">Tests Done by Worker</Label>
                        <Textarea
                          id="test_by_worker"
                          value={medicalRecord.test_by_worker}
                          onChange={(e) => setMedicalRecord(prev => ({ ...prev, test_by_worker: e.target.value }))}
                          placeholder="List of tests completed by worker..."
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={medicalRecord.notes}
                          onChange={(e) => setMedicalRecord(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional medical notes or observations..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="file">Upload Medical Document (Optional)</Label>
                        <Input
                          id="file"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Accepted formats: PDF, Images, Word documents
                        </p>
                      </div>

                      <Button 
                        onClick={addMedicalRecord} 
                        disabled={isAddingRecord || !medicalRecord.diagnosis}
                        className="w-full"
                      >
                        {isAddingRecord ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Record...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Add Medical Record
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{foundWorker.mobile_number}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{foundWorker.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>DOB: {new Date(foundWorker.date_of_birth).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    AI-Generated Medical Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-foreground leading-relaxed">
                    {mockPatientData.aiSummary.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Blood Pressure Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Blood Pressure Trend (Last 6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {mockPatientData.bpTrend.map((data, idx) => {
                      const maxSystolic = 160;
                      const systolicHeight = (data.systolic / maxSystolic) * 100;
                      const diastolicHeight = (data.diastolic / maxSystolic) * 100;
                      
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex items-end gap-1 h-48">
                            <div 
                              className="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
                              style={{ height: `${systolicHeight}%` }}
                              title={`Systolic: ${data.systolic}`}
                            />
                            <div 
                              className="flex-1 bg-secondary rounded-t transition-all hover:opacity-80"
                              style={{ height: `${diastolicHeight}%` }}
                              title={`Diastolic: ${data.diastolic}`}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded" />
                      <span className="text-xs text-muted-foreground">Systolic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-secondary rounded" />
                      <span className="text-xs text-muted-foreground">Diastolic</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockPatientData.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.date}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Key Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Key Vitals
                  </CardTitle>
                  <CardDescription>Current measurements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Blood Pressure</span>
                      </div>
                      <span className="text-sm font-semibold">{mockPatientData.vitals.bloodPressure}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Heart Rate</span>
                      </div>
                      <span className="text-sm font-semibold">{mockPatientData.vitals.heartRate}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">SpO2</span>
                      </div>
                      <span className="text-sm font-semibold">{mockPatientData.vitals.spo2}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-sm font-medium">Temperature</span>
                      </div>
                      <span className="text-sm font-semibold">{mockPatientData.vitals.temperature}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{foundWorker.address}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientLookupView;
