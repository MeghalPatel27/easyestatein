import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import authHeroImage from "@/assets/auth-hero.jpg";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Check if user data exists in localStorage
    const pendingData = localStorage.getItem('pendingUserData');
    if (!pendingData || !email) {
      toast.error("No pending registration found");
      navigate('/auth');
    }
  }, [email, navigate]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      // Verify the OTP
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (verifyError) {
        if (verifyError.message.includes('expired')) {
          setError("OTP has expired. Please request a new one.");
        } else if (verifyError.message.includes('invalid')) {
          setError("Invalid OTP. Please check and try again.");
        } else {
          setError("Verification failed. Please try again.");
        }
        return;
      }

      if (!verifyData.user) {
        setError("Verification failed. Please try again.");
        return;
      }

      // Get pending user data from localStorage
      const pendingDataString = localStorage.getItem('pendingUserData');
      if (!pendingDataString) {
        setError("Registration data not found. Please try signing up again.");
        navigate('/auth');
        return;
      }

      const pendingData = JSON.parse(pendingDataString);

      // Update the user's password if provided
      if (pendingData.password) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: pendingData.password
        });

        if (updateError) {
          console.error('Error setting password:', updateError);
          setError("Account created but failed to set password. Please reset your password.");
        }
      }

      // Clear pending data
      localStorage.removeItem('pendingUserData');

      toast.success("Account verified successfully! Welcome to easyestate!");

      // Get user profile to determine redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', verifyData.user.id)
        .single();

      // Redirect based on user type
      if (profile?.user_type === 'buyer') {
        navigate('/buyer/dashboard');
      } else if (profile?.user_type === 'broker') {
        navigate('/broker/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) {
        setError("Failed to resend OTP. Please try again.");
      } else {
        toast.success("OTP resent successfully! Check your email.");
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={authHeroImage} 
          alt="EasyEstate Abstract Art" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-8 left-8 z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="text-white font-bold text-xl">E</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Header */}
        <div className="p-6 border-b border-border lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Back Button for Desktop */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Verify Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a 6-digit OTP to <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            {error && (
              <Alert className="border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="otp" className="text-center block">
                  Enter OTP Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      if (error) setError(null);
                    }}
                    disabled={isLoading}
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
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-full font-medium"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
