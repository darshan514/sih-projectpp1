import React, { useState } from 'react';
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
  Loader2
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

interface HospitalWorkerSearchProps {
  doctor: Doctor;
}

const HospitalWorkerSearch: React.FC<HospitalWorkerSearchProps> = ({ doctor }) => {
  const [searchId, setSearchId] = useState('');
  const [foundWorker, setFoundWorker] = useState<Worker | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Medical record form state
  const [medicalRecord, setMedicalRecord] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    suggested_tests: '',
    test_by_worker: '',
    next_appointment_date: '',
    visit_date: new Date().toISOString().split('T')[0]
  });

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
          title: "Worker Not Found",
          description: "No worker found with this SwasthyaID",
          variant: "destructive"
        });
        setFoundWorker(null);
        return;
      }

      setFoundWorker(worker);
      toast({
        title: "Worker Found",
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

      // Insert medical record
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

      // Create appointment if next appointment date provided
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

      // Upload file if selected
      if (selectedFile && record) {
        const fileName = `${foundWorker.unique_worker_id}/${Date.now()}_${selectedFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('medical-documents')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        // Save document record
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

      // Sync data to government portal
      await supabase.functions.invoke('sync-health-data');

      toast({
        title: "Success",
        description: "Medical record added successfully and synced to government portal",
      });

      // Reset form
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

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Worker by SwasthyaID
          </CardTitle>
          <CardDescription>
            Enter the worker's unique SwasthyaID to access their medical records
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

      {/* Worker Details */}
      {foundWorker && (
        <Card className="border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Worker Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span> {foundWorker.name}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    ID: {foundWorker.unique_worker_id}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span> {foundWorker.mobile_number}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span> {foundWorker.email}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Address:</span> {foundWorker.address}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date of Birth:</span> {new Date(foundWorker.date_of_birth).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Add Medical Record Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HospitalWorkerSearch;
