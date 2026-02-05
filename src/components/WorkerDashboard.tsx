import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Download,
  Stethoscope,
  MessageSquare,
  RefreshCw,
  Bot
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

interface MedicalRecord {
  id: string;
  doctor_name: string;
  diagnosis: string;
  prescription: string;
  visit_date: string;
  notes: string;
  created_at: string;
}

interface MedicalDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

interface WorkerDashboardProps {
  worker: Worker;
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ worker }) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchMedicalData();
  }, [worker.id]);

  const fetchMedicalData = async () => {
    setIsLoading(true);
    try {
      // Fetch medical records
      const { data: records, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('worker_id', worker.id)
        .order('visit_date', { ascending: false });

      if (recordsError) throw recordsError;
      setMedicalRecords(records || []);

      // Fetch medical documents
      const { data: documents, error: documentsError } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('worker_id', worker.id)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setMedicalDocuments(documents || []);

    } catch (error) {
      console.error('Error fetching medical data:', error);
      toast({
        title: "Error",
        description: "Failed to load medical data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const translateMedicalText = async (text: string, recordId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('translate-medical-report', {
        body: { medicalText: text }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setTranslatedTexts(prev => ({
        ...prev,
        [recordId]: data.translatedText
      }));

      toast({
        title: "Translation Complete",
        description: "Medical text has been translated to simple language",
      });

    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const downloadFile = async (document: MedicalDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('medical-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Worker Information Card */}
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                {worker.name}
              </CardTitle>
              <CardDescription className="text-lg">
                SwasthyaID: <Badge variant="secondary" className="text-lg font-mono">{worker.unique_worker_id}</Badge>
              </CardDescription>
            </div>
            <Button onClick={fetchMedicalData} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{worker.mobile_number}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{worker.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{worker.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{new Date(worker.date_of_birth).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Medical Records
          </CardTitle>
          <CardDescription>
            Your medical history and doctor visits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medicalRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medical records found. Records will appear here when doctors add them.
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <Card key={record.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{record.doctor_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.visit_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => translateMedicalText(
                          `Diagnosis: ${record.diagnosis}\nPrescription: ${record.prescription}\nNotes: ${record.notes}`,
                          record.id
                        )}
                        variant="outline"
                        size="sm"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        AI Translate
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <strong>Diagnosis:</strong> {record.diagnosis}
                      </div>
                      {record.prescription && (
                        <div>
                          <strong>Prescription:</strong> {record.prescription}
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <strong>Notes:</strong> {record.notes}
                        </div>
                      )}
                    </div>

                    {translatedTexts[record.id] && (
                      <>
                        <Separator className="my-3" />
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Simple Translation:
                          </h5>
                          <p className="text-blue-800">{translatedTexts[record.id]}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Medical Documents
          </CardTitle>
          <CardDescription>
            Reports, X-rays, and other medical documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medicalDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medical documents found. Documents will appear here when uploaded by healthcare providers.
            </div>
          ) : (
            <div className="space-y-3">
              {medicalDocuments.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{document.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded by {document.uploaded_by} on {new Date(document.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => downloadFile(document)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerDashboard;