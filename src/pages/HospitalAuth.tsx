import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Stethoscope, ArrowLeft } from "lucide-react";

const HospitalAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Login state
  const [loginId, setLoginId] = useState("");
  const [govName, setGovName] = useState("");
  const [govHospital, setGovHospital] = useState("");

  // Registration state
  const [regName, setRegName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regHospital, setRegHospital] = useState("");
  const [regAadhar, setRegAadhar] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check ID format
      const isNMR = /^[A-Z]{2}\/\d+\/\d{4}$/.test(loginId);
      const isPrivate = /^PVTHPTL-\d{4}$/.test(loginId);

      if (!isNMR && !isPrivate) {
        toast({
          title: "Access Denied",
          description: "Invalid ID format. Please use NMR ID (e.g., KL/12345/2021) or Private ID (e.g., PVTHPTL-0341)",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Fetch doctor from database
      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('unique_doctor_id', loginId)
        .single();

      if (error || !doctor) {
        toast({
          title: "Access Denied",
          description: "Doctor not found. Please check your ID or register first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Store doctor info in session
      sessionStorage.setItem('doctor', JSON.stringify(doctor));
      
      toast({
        title: "Login Successful",
        description: `Welcome, Dr. ${doctor.name}`,
      });

      navigate("/hospital");
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate Aadhar (12 digits)
      if (!/^\d{12}$/.test(regAadhar)) {
        toast({
          title: "Invalid Aadhar",
          description: "Aadhar number must be 12 digits",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Generate private doctor ID
      const last4Digits = regAadhar.slice(-4);
      const uniqueDoctorId = `PVTHPTL-${last4Digits}`;

      // Check if doctor already exists
      const { data: existing } = await supabase
        .from('doctors')
        .select('unique_doctor_id')
        .eq('unique_doctor_id', uniqueDoctorId)
        .single();

      if (existing) {
        toast({
          title: "Already Registered",
          description: `You are already registered with ID: ${uniqueDoctorId}. Please use login.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Insert new doctor and auto-login
      const { data: newDoctor, error } = await supabase
        .from('doctors')
        .insert({
          name: regName,
          mobile_number: regMobile,
          hospital_name: regHospital,
          aadhar_number: regAadhar,
          unique_doctor_id: uniqueDoctorId,
          doctor_type: 'private'
        })
        .select()
        .single();

      if (error) throw error;

      // Persist session and redirect
      sessionStorage.setItem('doctor', JSON.stringify(newDoctor));
      toast({
        title: "Registration Successful",
        description: `Welcome, Dr. ${newDoctor.name}. Your Medical Officer ID is: ${uniqueDoctorId}`,
      });
      navigate("/hospital");

      // Clear form and switch to login (prefill in case of logout later)
      setRegName("");
      setRegMobile("");
      setRegHospital("");
      setRegAadhar("");
      setLoginId(uniqueDoctorId);
      setIsLogin(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGovernmentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For government doctors, we need additional info
      const nmrId = loginId;
      
      // Check if government doctor already exists
      const { data: existing } = await supabase
        .from('doctors')
        .select('*')
        .eq('unique_doctor_id', nmrId)
        .single();

      if (existing) {
        // Doctor exists, proceed to login
        sessionStorage.setItem('doctor', JSON.stringify(existing));
        toast({
          title: "Login Successful",
          description: `Welcome back, Dr. ${existing.name}`,
        });
        navigate("/hospital");
        setIsLoading(false);
        return;
      }

      // If not exists, require details from the form fields
      if (!govName.trim() || !govHospital.trim()) {
        toast({
          title: "Registration Incomplete",
          description: "Name and hospital are required for first-time login.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create government doctor record
      const { data: newDoctor, error } = await supabase
        .from('doctors')
        .insert({
          name: govName.trim(),
          hospital_name: govHospital.trim(),
          nmr_id: nmrId,
          unique_doctor_id: nmrId,
          doctor_type: 'government'
        })
        .select()
        .single();

      if (error) throw error;

      sessionStorage.setItem('doctor', JSON.stringify(newDoctor));
      toast({
        title: "Login Successful",
        description: `Welcome, Dr. ${name}`,
      });
      navigate("/hospital");
    } catch (error: any) {
      console.error('Government login error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Hospital Portal</CardTitle>
            <CardDescription className="text-center">
              {isLogin ? "Login to access worker health records" : "Register as a private doctor"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Note:</p>
              <p className="text-blue-800 dark:text-blue-200">
                Government doctors can directly login using their NMR ID (e.g., KL/12345/2021). 
                Private doctors must register first to get their Medical Officer ID.
              </p>
            </div>

            {isLogin ? (
              <form onSubmit={loginId.includes('/') ? handleGovernmentLogin : handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginId">NMR ID / Medical Officer ID</Label>
                  <Input
                    id="loginId"
                    placeholder="e.g., KL/12345/2021 or PVTHPTL-0341"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Government: KL/12345/2021 | Private: PVTHPTL-0341
                  </p>
                </div>

                {/* Extra details for government doctor (first-time login) */}
                {/^[A-Z]{2}\/\d+\/\d{4}$/.test(loginId) && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="govName">Full Name (Govt. Doctor)</Label>
                      <Input
                        id="govName"
                        placeholder="Dr. Jane Doe"
                        value={govName}
                        onChange={(e) => setGovName(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Only required on first-time login</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="govHospital">Hospital Name (Govt. Doctor)</Label>
                      <Input
                        id="govHospital"
                        placeholder="General Hospital, City"
                        value={govHospital}
                        onChange={(e) => setGovHospital(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsLogin(false)}
                    className="text-sm"
                  >
                    Private Doctor? Register here
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regName">Full Name</Label>
                  <Input
                    id="regName"
                    placeholder="Dr. John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regMobile">Mobile Number</Label>
                  <Input
                    id="regMobile"
                    placeholder="9876543210"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regHospital">Hospital Name</Label>
                  <Input
                    id="regHospital"
                    placeholder="City Medical Center"
                    value={regHospital}
                    onChange={(e) => setRegHospital(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regAadhar">Aadhar Number</Label>
                  <Input
                    id="regAadhar"
                    placeholder="123456789012"
                    maxLength={12}
                    value={regAadhar}
                    onChange={(e) => setRegAadhar(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Medical Officer ID will be: PVTHPTL-{regAadhar.slice(-4) || "XXXX"}
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsLogin(true)}
                    className="text-sm"
                  >
                    Already registered? Login here
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalAuth;
