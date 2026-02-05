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
  Bot,
  CalendarDays,
  Clock,
  CheckCircle2,
  Upload
} from 'lucide-react';

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

interface MedicalRecord {
  id: string;
  doctor_name: string;
  hospital_name: string;
  doctor_type: string;
  diagnosis: string;
  prescription: string;
  visit_date: string;
  next_appointment_date: string;
  notes: string;
  suggested_tests: string;
  test_by_worker: string;
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

interface Appointment {
  id: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  status: string;
  notes: string;
  created_at: string;
}

interface WorkerDashboardProps {
  worker: Worker;
}

const EnhancedWorkerDashboard: React.FC<WorkerDashboardProps> = ({ worker }) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [documentSummaries, setDocumentSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [worker.id]);

  const fetchAllData = async () => {
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

      // Fetch appointments
      const { data: appointmentData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('worker_id', worker.id)
        .order('appointment_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
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

  const generateDocumentSummary = async (document: MedicalDocument) => {
    setLoadingSummaries(prev => ({ ...prev, [document.id]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('process-document-ocr', {
        body: { filePath: document.file_path }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setDocumentSummaries(prev => ({
        ...prev,
        [document.id]: data.summary
      }));

      toast({
        title: "Summary Generated",
        description: "AI has analyzed the document using OCR",
      });

    } catch (error) {
      console.error('Summary generation error:', error);
      toast({
        title: "Summary Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [document.id]: false }));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Worker Information Card */}
      <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                {worker.name}
              </CardTitle>
              <CardDescription className="text-xl mt-2">
                Health ID: <Badge variant="secondary" className="text-xl font-mono px-4 py-2">{worker.unique_worker_id}</Badge>
              </CardDescription>
            </div>
            <Button onClick={fetchAllData} variant="outline" size={isMobile ? "icon" : "lg"} disabled={isLoading} className="shadow-md">
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''} ${!isMobile && 'mr-2'}`} />
              {!isMobile && <span>Refresh Data</span>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-lg">
              <Phone className="h-6 w-6 text-primary" />
              <span className="text-lg">{worker.mobile_number}</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-lg">
              <Mail className="h-6 w-6 text-primary" />
              <span className="text-lg">{worker.email}</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-lg">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-lg">{worker.address}</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-lg">{new Date(worker.date_of_birth).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-primary" />
            My Appointments
          </CardTitle>
          <CardDescription className="text-lg">
            Upcoming and past appointments with healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Appointments Found</h3>
              <p>Appointments scheduled by doctors will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-blue-900">{appointment.doctor_name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                          {appointment.appointment_time && (
                            <>
                              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                              <span>{appointment.appointment_time}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {appointment.purpose && (
                      <div className="mb-3">
                        <strong className="text-gray-700">Purpose:</strong> {appointment.purpose}
                      </div>
                    )}
                    
                    {appointment.notes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <strong className="text-blue-900">Notes:</strong>
                        <p className="text-blue-800 mt-1">{appointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Medical Records */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-primary" />
            Medical Records
          </CardTitle>
          <CardDescription className="text-lg">
            Your medical history and doctor visits with AI-powered translations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medicalRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Medical Records Found</h3>
              <p>Medical records will appear here when doctors add them to your profile.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {medicalRecords.map((record) => (
                <Card key={record.id} className="border-l-4 border-l-primary shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-primary">Dr. {record.doctor_name}</h4>
                        {record.hospital_name && (
                          <p className="text-base text-muted-foreground font-medium">{record.hospital_name}</p>
                        )}
                        {record.doctor_type && (
                          <Badge variant={record.doctor_type === 'Government' ? 'default' : 'secondary'} className="mt-1">
                            {record.doctor_type}
                          </Badge>
                        )}
                        <p className="text-lg text-muted-foreground mt-2">
                          Visit: {new Date(record.visit_date).toLocaleDateString()}
                        </p>
                        {record.next_appointment_date && (
                          <p className="text-base text-blue-600 font-medium mt-1">
                            Next Appointment: {new Date(record.next_appointment_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => translateMedicalText(
                          `Diagnosis: ${record.diagnosis}\nPrescription: ${record.prescription || 'None'}\nNotes: ${record.notes || 'None'}\nSuggested Tests: ${record.suggested_tests || 'None'}\nTest by Worker: ${record.test_by_worker || 'None'}`,
                          record.id
                        )}
                        variant="outline"
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700"
                      >
                        <Bot className="h-5 w-5 mr-2" />
                        AI Translate
                      </Button>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                        <strong className="text-red-900 text-lg">Diagnosis:</strong>
                        <p className="text-red-800 mt-1">{record.diagnosis}</p>
                      </div>
                      
                      {record.prescription && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                          <strong className="text-green-900 text-lg">Prescription:</strong>
                          <p className="text-green-800 mt-1">{record.prescription}</p>
                        </div>
                      )}
                      
                      {record.suggested_tests && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                          <strong className="text-blue-900 text-lg">Suggested Tests:</strong>
                          <p className="text-blue-800 mt-1">{record.suggested_tests}</p>
                        </div>
                      )}
                      
                      {record.test_by_worker && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                          <strong className="text-purple-900 text-lg">Test by Worker:</strong>
                          <p className="text-purple-800 mt-1">{record.test_by_worker}</p>
                        </div>
                      )}

                      {record.notes && (
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                          <strong className="text-gray-900 text-lg">Notes:</strong>
                          <p className="text-gray-800 mt-1">{record.notes}</p>
                        </div>
                      )}
                    </div>

                    {translatedTexts[record.id] && (
                      <>
                        <Separator className="my-6" />
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-lg shadow-inner">
                          <h5 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Simple Translation:
                          </h5>
                          <div 
                            className="text-blue-800 prose prose-blue max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: translatedTexts[record.id].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }}
                          />
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

      {/* Enhanced Medical Documents */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            Medical Documents
          </CardTitle>
          <CardDescription className="text-lg">
            Reports, X-rays, and other medical documents with AI translation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medicalDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Medical Documents Found</h3>
              <p>Medical documents will appear here when uploaded by healthcare providers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalDocuments.map((document) => (
                <Card key={document.id} className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/30 to-transparent">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{document.file_name}</p>
                          <p className="text-muted-foreground">
                            Uploaded by {document.uploaded_by} on {new Date(document.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(document.file_size / 1024).toFixed(1)} KB • {document.file_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => generateDocumentSummary(document)}
                          variant="outline"
                          size="sm"
                          disabled={loadingSummaries[document.id]}
                          className="hidden md:flex bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                        >
                          <Bot className={`h-4 w-4 mr-2 ${loadingSummaries[document.id] ? 'animate-spin' : ''}`} />
                          {loadingSummaries[document.id] ? 'Analyzing...' : 'AI Summary'}
                        </Button>
                        <Button
                          onClick={() => downloadFile(document)}
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-none hover:from-blue-600 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
                        >
                          <Download className="h-4 w-4 mr-2 md:mr-2" />
                          <span className="hidden md:inline">Download</span>
                        </Button>
                      </div>
                    </div>

                    {/* Mobile AI Summary Button */}
                    <div className="md:hidden mb-4">
                      <Button
                        onClick={() => generateDocumentSummary(document)}
                        variant="outline"
                        size="sm"
                        disabled={loadingSummaries[document.id]}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                      >
                        <Bot className={`h-4 w-4 mr-2 ${loadingSummaries[document.id] ? 'animate-spin' : ''}`} />
                        {loadingSummaries[document.id] ? 'Analyzing Complete Document...' : 'Generate AI Summary'}
                      </Button>
                    </div>

                    {documentSummaries[document.id] && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-100 p-4 rounded-lg mt-4 shadow-inner">
                        <h6 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          AI Document Summary:
                        </h6>
                        <div 
                          className="text-purple-800 prose prose-purple max-w-none text-sm"
                          dangerouslySetInnerHTML={{
                            __html: documentSummaries[document.id].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedWorkerDashboard;