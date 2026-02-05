import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, CheckCircle } from 'lucide-react';

interface WorkerRegistrationData {
  name: string;
  mobile_number: string;
  email: string;
  address: string;
  date_of_birth: string;
  aadhar_number: string;
  district: string;
}

interface WorkerRegistrationProps {
  onRegistrationSuccess: (worker: any) => void;
}

const WorkerRegistration: React.FC<WorkerRegistrationProps> = ({ onRegistrationSuccess }) => {
  const [formData, setFormData] = useState<WorkerRegistrationData>({
    name: '',
    mobile_number: '',
    email: '',
    address: '',
    date_of_birth: '',
    aadhar_number: '',
    district: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.name || !formData.mobile_number || !formData.email || !formData.address || !formData.date_of_birth || !formData.aadhar_number || !formData.district) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Validate Aadhar number
      if (!/^\d{12}$/.test(formData.aadhar_number)) {
        toast({
          title: "Error",
          description: "Aadhar number must be exactly 12 digits",
          variant: "destructive"
        });
        return;
      }

      // Generate unique health ID locally
      const firstName = formData.name.trim().toUpperCase();
      const firstTwoLetters = firstName.replace(/[^A-Z]/g, '').substring(0, 2);
      const lastFourDigits = formData.aadhar_number.slice(-4);
      let uniqueId = firstTwoLetters + lastFourDigits; // e.g., RA1234

      // Fallback if name has fewer than 2 letters
      if (firstTwoLetters.length < 2) {
        uniqueId = 'WK' + lastFourDigits;
      }

      console.log('Generated ID locally:', uniqueId);

      // 1. Check if Aadhar already exists
      const { data: existingAadhar, error: aadharCheckError } = await supabase
        .from('workers')
        .select('id')
        .eq('aadhar_number', formData.aadhar_number)
        .maybeSingle();

      if (aadharCheckError) throw aadharCheckError;

      if (existingAadhar) {
        throw new Error('Worker with this Aadhar number is already registered');
      }

      // 2. Check if generated ID exists (rare collision check)
      const { data: existingId, error: idCheckError } = await supabase
        .from('workers')
        .select('id')
        .eq('unique_worker_id', uniqueId)
        .maybeSingle();

      if (idCheckError) throw idCheckError;

      if (existingId) {
        // Simple collision handling: append a random digit or character if needed
        // For now, let's just error out or retry (user can just try again usually)
        throw new Error('System busy (ID collision). Please try again.');
      }

      // 3. Insert new worker
      const { data: worker, error: insertError } = await supabase
        .from('workers')
        .insert({
          unique_worker_id: uniqueId,
          name: formData.name,
          mobile_number: formData.mobile_number,
          email: formData.email,
          address: formData.address,
          date_of_birth: formData.date_of_birth,
          aadhar_number: formData.aadhar_number,
          district: formData.district
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error detail:', insertError);
        throw new Error(insertError.message || 'Failed to register worker');
      }

      toast({
        title: "Registration Successful!",
        description: `Welcome ${formData.name}! Your unique Health ID is ${uniqueId}`,
      });

      // Reset form
      setFormData({
        name: '',
        mobile_number: '',
        email: '',
        address: '',
        date_of_birth: '',
        aadhar_number: '',
        district: ''
      });

      // Call the parent callback with worker data
      onRegistrationSuccess(worker);

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <UserPlus className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Worker Registration</CardTitle>
        <CardDescription>
          Register yourself to get a unique Health ID and access your medical records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_number">Mobile Number *</Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                type="tel"
                value={formData.mobile_number}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your complete address"
              disabled={isLoading}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth *</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aadhar_number">Aadhar Card Number *</Label>
              <Input
                id="aadhar_number"
                name="aadhar_number"
                type="text"
                value={formData.aadhar_number}
                onChange={handleInputChange}
                placeholder="Enter your 12-digit Aadhar number"
                disabled={isLoading}
                maxLength={12}
                pattern="[0-9]{12}"
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be exactly 12 digits. Your Health ID will be generated using your name and Aadhar number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                name="district"
                type="text"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Enter your district"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your district helps us create health maps and provide local services.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Register Now
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkerRegistration;