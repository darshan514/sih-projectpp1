import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Shield, ArrowRight, Clock } from 'lucide-react';

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

interface OTPLoginProps {
  onLoginSuccess: (worker: Worker) => void;
}

const OTPLogin = ({ onLoginSuccess }: OTPLoginProps) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const sendOTP = async () => {
    if (!mobileNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { mobileNumber: mobileNumber.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "OTP Sent",
        description: `OTP sent to ${mobileNumber}. Check your SMS.`,
      });

      // In development, show OTP in toast (remove in production)
      if (data.otp) {
        toast({
          title: "Development Mode",
          description: `Your OTP is: ${data.otp}`,
          variant: "default"
        });
      }

      setStep('otp');
      setCountdown(60);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { 
          mobileNumber: mobileNumber.trim(),
          otp: otp
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.worker.name}!`,
      });

      onLoginSuccess(data.worker);

    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMobile = () => {
    setStep('mobile');
    setOtp('');
    setCountdown(0);
  };

  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {mobileNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <div className="flex justify-center">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button 
            onClick={verifyOTP} 
            disabled={isLoading || otp.length !== 6}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <div className="flex justify-between items-center text-sm">
            <Button 
              variant="ghost" 
              onClick={handleBackToMobile}
              className="text-muted-foreground"
            >
              Change Number
            </Button>
            
            <div className="flex items-center text-muted-foreground">
              {countdown > 0 ? (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  Resend in {countdown}s
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={sendOTP}
                  disabled={isLoading}
                  className="text-primary"
                >
                  Resend OTP
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            OTP expires in 10 minutes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Smartphone className="h-16 w-16 text-primary" />
        </div>
        <CardTitle className="text-2xl">Login with OTP</CardTitle>
        <CardDescription>
          Enter your registered mobile number to receive OTP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="text-lg"
          />
        </div>

        <Button 
          onClick={sendOTP} 
          disabled={isLoading || !mobileNumber.trim()}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Sending...' : 'Send OTP'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <div className="space-y-2 text-sm text-muted-foreground">
          <h4 className="font-semibold">How it works:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Enter your registered mobile number</li>
            <li>Receive a 6-digit OTP via SMS</li>
            <li>Enter OTP to access your health records</li>
            <li>OTP expires in 10 minutes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPLogin;