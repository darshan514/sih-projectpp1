import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Stethoscope, AlertCircle, HelpCircle, FlaskConical } from 'lucide-react';

const SymptomAnalyzerView = () => {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis with mock data
    setTimeout(() => {
      setResults({
        conditions: [
          { name: 'Acute Bronchitis', probability: 'High', description: 'Inflammation of the bronchial tubes, often following a viral infection' },
          { name: 'Influenza (Flu)', probability: 'High', description: 'Viral infection affecting the respiratory system' },
          { name: 'Community-Acquired Pneumonia', probability: 'Medium', description: 'Lung infection acquired outside of hospital settings' },
          { name: 'Allergic Rhinitis', probability: 'Medium', description: 'Allergic response affecting nasal passages' },
          { name: 'COVID-19', probability: 'Low', description: 'Coronavirus infection with respiratory symptoms' }
        ],
        questions: [
          'Is the cough productive (with phlegm) or dry?',
          'Have you experienced any chills or body aches?',
          'What is the duration of symptoms?',
          'Have you had any recent exposure to sick individuals?',
          'Is there any chest pain or difficulty breathing?',
          'Have you noticed any fever? If yes, what temperature?'
        ],
        tests: [
          { name: 'Complete Blood Count (CBC)', priority: 'High', reason: 'To assess infection and inflammation markers' },
          { name: 'Chest X-Ray', priority: 'High', reason: 'To rule out pneumonia and visualize lung condition' },
          { name: 'Sputum Culture', priority: 'Medium', reason: 'To identify bacterial pathogens if present' },
          { name: 'RT-PCR for COVID-19', priority: 'Medium', reason: 'To rule out coronavirus infection' },
          { name: 'Allergy Testing', priority: 'Low', reason: 'If allergic component is suspected' }
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive' as const;
      case 'medium': return 'default' as const;
      case 'low': return 'secondary' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Stethoscope className="h-8 w-8 text-primary" />
          AI Symptom Analyzer
        </h1>
        <p className="text-muted-foreground">
          Enter patient symptoms to receive AI-powered diagnostic suggestions and clinical decision support
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Symptoms & History</CardTitle>
          <CardDescription>
            Provide detailed information about the patient's symptoms, age, medical history, and any relevant details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Patient is a 45-year-old male complaining of persistent cough for the past 5 days, accompanied by fever (101°F), fatigue, and mild chest discomfort. Patient has a history of seasonal allergies but is otherwise healthy. No recent travel history."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={8}
            className="text-base"
          />
          <Button 
            onClick={analyzeSymptoms} 
            disabled={isAnalyzing || !symptoms.trim()}
            size="lg"
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Stethoscope className="mr-2 h-5 w-5" />
                Analyze Symptoms
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Potential Conditions - Full Width on Mobile, 2 cols on Desktop */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Potential Conditions
              </CardTitle>
              <CardDescription>AI-suggested diagnoses based on symptom analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.conditions.map((condition: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{idx + 1}. {condition.name}</h3>
                      <Badge variant={getPriorityColor(condition.probability)}>
                        {condition.probability} Probability
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{condition.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Disclaimer:</strong> These are AI-generated suggestions for clinical decision support only. 
                  Always use professional judgment and consider additional clinical factors.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Recommended Questions
              </CardTitle>
              <CardDescription>Key questions to narrow diagnosis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.questions.map((question: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold text-primary flex-shrink-0">{idx + 1}.</span>
                    <p className="text-sm text-foreground">{question}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Lab Tests - Full Width */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                Suggested Laboratory Tests
              </CardTitle>
              <CardDescription>Recommended diagnostic tests based on differential diagnosis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.tests.map((test: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-sm">{test.name}</h3>
                      <Badge variant={getPriorityColor(test.priority)} className="text-xs">
                        {test.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{test.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomAnalyzerView;
