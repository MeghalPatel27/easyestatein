import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import authHeroImage from "@/assets/auth-hero.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sign In Form State with validation
  const [signInMobile, setSignInMobile] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInMobileError, setSignInMobileError] = useState("");
  const [signInPasswordError, setSignInPasswordError] = useState("");
  
  // Sign Up Form State with validation
  const [signUpMobile, setSignUpMobile] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("");
  const [signUpMobileError, setSignUpMobileError] = useState("");
  const [signUpPasswordError, setSignUpPasswordError] = useState("");
  const [signUpConfirmPasswordError, setSignUpConfirmPasswordError] = useState("");
  const [accountTypeError, setAccountTypeError] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/property-manager');
      }
    };
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && event === 'SIGNED_IN') {
        navigate('/property-manager');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Input validation functions
  const validateMobile = (mobile: string): string => {
    if (!mobile.trim()) return "Mobile number is required";
    const mobileRegex = /^[+]?[1-9][\d\s\-\(\)]{7,15}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ''))) return "Please enter a valid mobile number";
    if (mobile.length > 20) return "Mobile number is too long";
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password.length > 128) return "Password is too long";
    // Check for at least one letter and one number for stronger security
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) return "Password must contain at least one letter and one number";
    return "";
  };

  const sanitizeInput = (input: string): string => {
    // Basic XSS prevention - remove potentially dangerous characters
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                .trim();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Sanitize inputs
    const cleanMobile = sanitizeInput(signInMobile);
    const cleanPassword = sanitizeInput(signInPassword);
    
    // Validate inputs
    const mobileError = validateMobile(cleanMobile);
    const passwordError = validatePassword(cleanPassword);
    
    setSignInMobileError(mobileError);
    setSignInPasswordError(passwordError);
    
    if (mobileError || passwordError) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Note: For now using mobile as email for Supabase auth
      // In production, you'd implement phone auth or convert mobile to email format
      const { error } = await supabase.auth.signInWithPassword({
        email: `${cleanMobile}@mobile.app`,
        password: cleanPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError("Invalid mobile number or password. Please check your credentials and try again.");
        } else if (error.message.includes('Email not confirmed')) {
          setError("Please verify your mobile number before signing in.");
        } else if (error.message.includes('Too many requests')) {
          setError("Too many login attempts. Please wait a few minutes before trying again.");
        } else {
          setError("Sign in failed. Please try again.");
        }
      } else {
        toast.success("Signed in successfully!");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Sanitize inputs
    const cleanMobile = sanitizeInput(signUpMobile);
    const cleanPassword = sanitizeInput(signUpPassword);
    const cleanConfirmPassword = sanitizeInput(signUpConfirmPassword);
    
    // Validate inputs
    const mobileError = validateMobile(cleanMobile);
    const passwordError = validatePassword(cleanPassword);
    
    let confirmPasswordError = "";
    if (!cleanConfirmPassword) {
      confirmPasswordError = "Please confirm your password";
    } else if (cleanPassword !== cleanConfirmPassword) {
      confirmPasswordError = "Passwords do not match";
    }

    let accountTypeValidationError = "";
    if (!accountType) {
      accountTypeValidationError = "Please select an account type";
    }
    
    setSignUpMobileError(mobileError);
    setSignUpPasswordError(passwordError);
    setSignUpConfirmPasswordError(confirmPasswordError);
    setAccountTypeError(accountTypeValidationError);
    
    if (mobileError || passwordError || confirmPasswordError || accountTypeValidationError) {
      return;
    }

    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Note: For now using mobile as email for Supabase auth
      // In production, you'd implement phone auth or convert mobile to email format
      const { error } = await supabase.auth.signUp({
        email: `${cleanMobile}@mobile.app`,
        password: cleanPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            mobile_number: cleanMobile,
            account_type: accountType
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError("An account with this mobile number already exists. Please sign in instead.");
        } else if (error.message.includes('Password should be')) {
          setError("Password does not meet security requirements. Please choose a stronger password.");
        } else if (error.message.includes('Signup is disabled')) {
          setError("New account registration is currently disabled. Please contact support.");
        } else {
          setError("Sign up failed. Please try again.");
        }
      } else {
        toast.success("Account created! Please verify your mobile number.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
            onClick={() => navigate('/')}
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
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>

            {error && (
              <Alert className="border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="signin" className="w-full">
              <div className="space-y-6">
                <div className="text-center">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="signin">Log in</TabsTrigger>
                    <TabsTrigger value="signup">Create an Account</TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="h-[520px] flex flex-col relative overflow-hidden">
                  <TabsContent value="signin" className="space-y-6 flex-1 absolute inset-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-4 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-left-4 duration-700 ease-in-out">
                    <div className="text-center space-y-2">
                      <h1 className="text-3xl font-bold text-foreground">Log in</h1>
                      <p className="text-muted-foreground">
                        Don't have an account? 
                        <button 
                          type="button"
                          className="text-primary hover:underline ml-1 font-medium"
                          onClick={() => {
                            const signupTab = document.querySelector('[value="signup"]') as HTMLElement;
                            signupTab?.click();
                          }}
                        >
                          Create an Account
                        </button>
                      </p>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-mobile">Mobile Number</Label>
                        <Input
                          id="signin-mobile"
                          type="tel"
                          placeholder="Enter your mobile number"
                          value={signInMobile}
                          onChange={(e) => {
                            setSignInMobile(e.target.value);
                            if (signInMobileError) setSignInMobileError("");
                          }}
                          className={signInMobileError ? "border-destructive" : ""}
                          disabled={isLoading}
                          maxLength={20}
                          required
                        />
                        {signInMobileError && (
                          <p className="text-sm text-destructive">{signInMobileError}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={signInPassword}
                            onChange={(e) => {
                              setSignInPassword(e.target.value);
                              if (signInPasswordError) setSignInPasswordError("");
                            }}
                            className={signInPasswordError ? "border-destructive pr-10" : "pr-10"}
                            disabled={isLoading}
                            maxLength={128}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {signInPasswordError && (
                          <p className="text-sm text-destructive">{signInPasswordError}</p>
                        )}
                        <div className="text-right">
                          <button 
                            type="button"
                            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full font-medium" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing In..." : "Log in"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-6 flex-1 absolute inset-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-left-4 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-right-4 duration-700 ease-in-out">
                    <div className="text-center space-y-2">
                      <h1 className="text-3xl font-bold text-foreground">Create an Account</h1>
                      <p className="text-muted-foreground">
                        Already have an account? 
                        <button 
                          type="button"
                          className="text-primary hover:underline ml-1 font-medium"
                          onClick={() => {
                            const signinTab = document.querySelector('[value="signin"]') as HTMLElement;
                            signinTab?.click();
                          }}
                        >
                          Log in
                        </button>
                      </p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="John"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Last Name"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-mobile">Mobile Number</Label>
                        <Input
                          id="signup-mobile"
                          type="tel"
                          placeholder="Enter your mobile number"
                          value={signUpMobile}
                          onChange={(e) => {
                            setSignUpMobile(e.target.value);
                            if (signUpMobileError) setSignUpMobileError("");
                          }}
                          className={signUpMobileError ? "border-destructive" : ""}
                          disabled={isLoading}
                          maxLength={20}
                          required
                        />
                        {signUpMobileError && (
                          <p className="text-sm text-destructive">{signUpMobileError}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="account-type">Type of Account</Label>
                        <Select value={accountType} onValueChange={(value) => {
                          setAccountType(value);
                          if (accountTypeError) setAccountTypeError("");
                        }}>
                          <SelectTrigger className={accountTypeError ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="broker">Broker</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                          </SelectContent>
                        </Select>
                        {accountTypeError && (
                          <p className="text-sm text-destructive">{accountTypeError}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={signUpPassword}
                            onChange={(e) => {
                              setSignUpPassword(e.target.value);
                              if (signUpPasswordError) setSignUpPasswordError("");
                            }}
                            className={signUpPasswordError ? "border-destructive pr-10" : "pr-10"}
                            disabled={isLoading}
                            maxLength={128}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {signUpPasswordError && (
                          <p className="text-sm text-destructive">{signUpPasswordError}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
                        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                        <Input
                          id="signup-confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signUpConfirmPassword}
                          onChange={(e) => {
                            setSignUpConfirmPassword(e.target.value);
                            if (signUpConfirmPasswordError) setSignUpConfirmPasswordError("");
                          }}
                          className={signUpConfirmPasswordError ? "border-destructive" : ""}
                          disabled={isLoading}
                          maxLength={128}
                          required
                        />
                        {signUpConfirmPasswordError && (
                          <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-bottom-2 duration-300">{signUpConfirmPasswordError}</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full font-medium" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="terms-signup" className="mt-1" />
                        <Label htmlFor="terms-signup" className="text-sm text-muted-foreground leading-relaxed">
                          I agree that my mobile number will be forever associated with the account type{" "}
                          <span className="font-medium text-foreground">
                            {accountType ? accountType.charAt(0).toUpperCase() + accountType.slice(1) : "[Selected Account Type]"}
                          </span>
                          . It will not be changed until the company approves.
                        </Label>
                      </div>
                    </form>
                  </TabsContent>
                </div>
              </div>
            </Tabs>

            {/* Social Login */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 rounded-full" disabled>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                <Button variant="outline" className="h-12 rounded-full" disabled>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;