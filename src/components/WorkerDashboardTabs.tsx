import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
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
  CreditCard
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
  diagnosis: string;
  prescription: string;
  visit_date: string;
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

interface WorkerDashboardTabsProps {
  worker: Worker;
}

const WorkerDashboardTabs: React.FC<WorkerDashboardTabsProps> = ({ worker }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [documentSummaries, setDocumentSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});

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
      const { data: records, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('worker_id', worker.id)
        .order('visit_date', { ascending: false });

      if (recordsError) throw recordsError;
      setMedicalRecords(records || []);

      const { data: documents, error: documentsError } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('worker_id', worker.id)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setMedicalDocuments(documents || []);

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
      if (data.error) throw new Error(data.error);

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
      const { data, error } = await supabase.functions.invoke('summarize-document', {
        body: { filePath: document.file_path }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setDocumentSummaries(prev => ({
        ...prev,
        [document.id]: data.summary
      }));

      toast({
        title: "Summary Generated",
        description: "AI has analyzed the complete document",
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
    <div className="space-y-6">
      <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                {worker.name}
              </CardTitle>
              <p className="text-sm mt-2">
                {t('healthId')}: <Badge variant="secondary" className="text-sm font-mono px-3 py-1">{worker.unique_worker_id}</Badge>
              </p>
            </div>
            <Button 
              onClick={fetchAllData} 
              variant="outline" 
              size={isMobile ? "icon" : "sm"} 
              disabled={isLoading} 
              className="shadow-md bg-gradient-to-r from-primary to-primary/80 text-white border-none hover:from-primary/90 hover:to-primary/70"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} ${!isMobile && 'mr-2'}`} />
              {!isMobile && <span>{t('refreshData')}</span>}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-primary/10 to-secondary/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center justify-center gap-1">
            <User className="h-4 w-4" />
            {!isMobile && <span className="text-sm">{t('profile')}</span>}
          </TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center justify-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {!isMobile && <span className="text-sm">{t('appointments')}</span>}
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center justify-center gap-1">
            <Stethoscope className="h-4 w-4" />
            {!isMobile && <span className="text-sm">{t('medicalRecords')}</span>}
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center justify-center gap-1">
            <FileText className="h-4 w-4" />
            {!isMobile && <span className="text-sm">{t('documents')}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Worker Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-medium">{t('mobileNumber')}</p>
                    <p className="text-sm">{worker.mobile_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-medium">{t('email')}</p>
                    <p className="text-sm">{worker.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-medium">{t('address')}</p>
                    <p className="text-sm">{worker.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-medium">{t('dateOfBirth')}</p>
                    <p className="text-sm">{new Date(worker.date_of_birth).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg md:col-span-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-medium">{t('aadharNumber')}</p>
                    <p className="text-sm font-mono">****-****-{worker.aadhar_number.slice(-4)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                {t('appointments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="text-base font-semibold mb-2">{t('noAppointmentsFound')}</h3>
                  <p className="text-sm">Appointments scheduled by doctors will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-base font-semibold text-blue-900">{appointment.doctor_name}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                              {appointment.appointment_time && (
                                <>
                                  <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                                  <span>{appointment.appointment_time}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                            {t(appointment.status)}
                          </Badge>
                        </div>
                        
                        {appointment.purpose && (
                          <div className="mb-2 text-sm">
                            <strong className="text-gray-700">{t('purpose')}:</strong> {appointment.purpose}
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div className="bg-blue-50 p-2 rounded-lg text-sm">
                            <strong className="text-blue-900">{t('notes')}:</strong>
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
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                {t('medicalRecords')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicalRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="text-base font-semibold mb-2">{t('noRecordsFound')}</h3>
                  <p className="text-sm">Medical records will appear here when doctors add them to your profile.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <Card key={record.id} className="border-l-4 border-l-primary shadow-md">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-base font-semibold text-primary">{record.doctor_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.visit_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => translateMedicalText(
                              `Diagnosis: ${record.diagnosis}\nPrescription: ${record.prescription || 'None'}\nNotes: ${record.notes || 'None'}\nSuggested Tests: ${record.suggested_tests || 'None'}\nTest by Worker: ${record.test_by_worker || 'None'}`,
                              record.id
                            )}
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700"
                          >
                            <Bot className="h-4 w-4 mr-1" />
                            {t('aiTranslate')}
                          </Button>
                        </div>
                        
                        <div className="grid gap-3 text-sm">
                          <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                            <strong className="text-red-900">{t('diagnosis')}:</strong>
                            <p className="text-red-800 mt-1">{record.diagnosis}</p>
                          </div>
                          
                          {record.prescription && (
                            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                              <strong className="text-green-900">{t('prescription')}:</strong>
                              <p className="text-green-800 mt-1">{record.prescription}</p>
                            </div>
                          )}
                          
                          {record.suggested_tests && (
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                              <strong className="text-blue-900">{t('suggestedTests')}:</strong>
                              <p className="text-blue-800 mt-1">{record.suggested_tests}</p>
                            </div>
                          )}
                          
                          {record.test_by_worker && (
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                              <strong className="text-purple-900">{t('testByWorker')}:</strong>
                              <p className="text-purple-800 mt-1">{record.test_by_worker}</p>
                            </div>
                          )}

                          {record.notes && (
                            <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                              <strong className="text-gray-900">{t('notes')}:</strong>
                              <p className="text-gray-800 mt-1">{record.notes}</p>
                            </div>
                          )}
                        </div>

                        {translatedTexts[record.id] && (
                          <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-100 p-4 rounded-lg shadow-inner">
                            <h5 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Simple Translation:
                            </h5>
                            <div 
                              className="text-blue-800 text-sm prose prose-blue max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: translatedTexts[record.id].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
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
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t('documents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicalDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="text-base font-semibold mb-2">{t('noDocumentsFound')}</h3>
                  <p className="text-sm">Medical documents will appear here when uploaded by healthcare providers.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medicalDocuments.map((document) => (
                    <Card key={document.id} className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/30 to-transparent">
                      <CardContent className="pt-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{document.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {document.uploaded_by} • {new Date(document.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
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
                              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                            >
                              <Bot className={`h-4 w-4 mr-2 ${loadingSummaries[document.id] ? 'animate-spin' : ''}`} />
                              <span className="text-xs">{loadingSummaries[document.id] ? 'Analyzing...' : 'AI Summary'}</span>
                            </Button>
                            <Button
                              onClick={() => downloadFile(document)}
                              variant="outline"
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-none hover:from-blue-600 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {documentSummaries[document.id] && (
                          <>
                            <Separator className="my-3" />
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-100 p-3 rounded-lg shadow-inner">
                              <h6 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                AI Summary:
                              </h6>
                              <div 
                                className="text-xs text-purple-800 prose prose-purple max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: documentSummaries[document.id].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkerDashboardTabs;
