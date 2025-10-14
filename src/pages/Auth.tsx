import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft, User, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import authHeroImage from "@/assets/auth-hero.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sign In Form State with validation
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInEmailError, setSignInEmailError] = useState("");
  const [signInPasswordError, setSignInPasswordError] = useState("");
  
  // Sign Up Form State with validation
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpMobile, setSignUpMobile] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signUpEmailError, setSignUpEmailError] = useState("");
  const [signUpMobileError, setSignUpMobileError] = useState("");
  const [signUpPasswordError, setSignUpPasswordError] = useState("");
  const [signUpConfirmPasswordError, setSignUpConfirmPasswordError] = useState("");
  const [accountTypeError, setAccountTypeError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  
  // Account type detection state
  const [detectedAccountType, setDetectedAccountType] = useState<string>("");
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  // Check if user is already authenticated and redirect to appropriate dashboard
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Wait a bit for profile to be created if it's a new user
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

          if (profile?.user_type === 'buyer') {
            navigate('/buyer/dashboard');
          } else if (profile?.user_type === 'broker') {
            navigate('/broker/dashboard');
          } else {
            // Default to buyer dashboard if profile exists but no user_type
            navigate('/buyer/dashboard');
          }
        }, 100);
      }
    };
    checkUserAndRedirect();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && event === 'SIGNED_IN') {
        // Wait a bit for profile to be created for new signups
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

          if (profile?.user_type === 'buyer') {
            navigate('/buyer/dashboard');
          } else if (profile?.user_type === 'broker') {
            navigate('/broker/dashboard');
          } else {
            // Default to buyer dashboard if profile exists but no user_type
            navigate('/buyer/dashboard');
          }
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Input validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 255) return "Email is too long";
    return "";
  };

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

  // Function to check account type by email
  const checkAccountType = async (email: string) => {
    if (!email.trim() || !email.includes('@')) {
      setDetectedAccountType('');
      return;
    }

    setIsCheckingAccount(true);
    try {
      const { data, error } = await supabase.rpc('get_account_type_by_email', {
        _email: email
      });

      if (error) {
        console.error('Error checking account type:', error);
        setDetectedAccountType('Account does not exist');
      } else if (data) {
        setDetectedAccountType(data === 'broker' ? 'Broker/Developer Account' : 'Buyer Account');
      } else {
        setDetectedAccountType('Account does not exist');
      }
    } catch (error) {
      console.error('Error checking account type:', error);
      setDetectedAccountType('Account does not exist');
    } finally {
      setIsCheckingAccount(false);
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Sanitize inputs
    const cleanEmail = sanitizeInput(signInEmail);
    const cleanPassword = sanitizeInput(signInPassword);
    
    // Validate inputs
    const emailError = validateEmail(cleanEmail);
    const passwordError = validatePassword(cleanPassword);
    
    setSignInEmailError(emailError);
    setSignInPasswordError(passwordError);
    
    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.includes('Email not confirmed')) {
          setError("Please verify your email address before signing in.");
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
    const cleanEmail = sanitizeInput(signUpEmail);
    const cleanMobile = sanitizeInput(signUpMobile);
    const cleanPassword = sanitizeInput(signUpPassword);
    const cleanConfirmPassword = sanitizeInput(signUpConfirmPassword);
    const cleanFirstName = sanitizeInput(firstName);
    const cleanLastName = sanitizeInput(lastName);
    
    // Validate inputs
    const emailError = validateEmail(cleanEmail);
    const mobileError = validateMobile(cleanMobile);
    const passwordError = validatePassword(cleanPassword);
    
    let confirmPasswordError = "";
    if (cleanPassword !== cleanConfirmPassword) {
      confirmPasswordError = "Passwords do not match";
    }

    let accountTypeValidationError = "";
    if (!accountType) {
      accountTypeValidationError = "Please select an account type";
    }

    let firstNameValidationError = "";
    if (!cleanFirstName.trim()) {
      firstNameValidationError = "First name is required";
    }

    let lastNameValidationError = "";
    if (!cleanLastName.trim()) {
      lastNameValidationError = "Last name is required";
    }
    
    setSignUpEmailError(emailError);
    setSignUpMobileError(mobileError);
    setSignUpPasswordError(passwordError);
    setSignUpConfirmPasswordError(confirmPasswordError);
    setAccountTypeError(accountTypeValidationError);
    setFirstNameError(firstNameValidationError);
    setLastNameError(lastNameValidationError);
    
    if (emailError || mobileError || passwordError || confirmPasswordError || accountTypeValidationError || firstNameValidationError || lastNameValidationError) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Store user data in localStorage to retrieve after OTP verification
      localStorage.setItem('pendingUserData', JSON.stringify({
        email: cleanEmail,
        mobile: cleanMobile,
        password: cleanPassword,
        user_type: accountType,
        first_name: cleanFirstName,
        last_name: cleanLastName
      }));

      // Send OTP to email
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: {
            mobile: cleanMobile,
            user_type: accountType,
            first_name: cleanFirstName,
            last_name: cleanLastName
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError("An account with this email already exists. Please sign in instead.");
        } else if (error.message.includes('rate limit')) {
          setError("Too many attempts. Please wait a few minutes before trying again.");
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      } else {
        toast.success("OTP sent to your email! Please check your inbox.");
        navigate(`/verify-otp?email=${encodeURIComponent(cleanEmail)}`);
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
                    <TabsTrigger value="signin">
                      <User className="h-4 w-4" />
                      Log in
                    </TabsTrigger>
                    <TabsTrigger value="signup">
                      <UserPlus className="h-4 w-4" />
                      Create an Account
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="min-h-[680px] flex flex-col relative overflow-hidden">
                  <TabsContent value="signin" className="space-y-6 flex-1 absolute inset-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-4 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-left-4 duration-700 ease-in-out overflow-y-auto">
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
                        <Label htmlFor="signin-email">Email Address</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={signInEmail}
                          onChange={(e) => {
                            setSignInEmail(e.target.value);
                            if (signInEmailError) setSignInEmailError("");
                            // Check account type with debounce
                            setTimeout(() => checkAccountType(e.target.value), 500);
                          }}
                          className={signInEmailError ? "border-destructive" : ""}
                          disabled={isLoading}
                          maxLength={255}
                          required
                        />
                        {signInEmailError && (
                          <p className="text-sm text-destructive">{signInEmailError}</p>
                        )}
                        {isCheckingAccount && (
                          <p className="text-sm text-muted-foreground">Checking account...</p>
                        )}
                        {detectedAccountType && !isCheckingAccount && (
                          <p className={`text-sm font-medium ${detectedAccountType === 'Account does not exist' ? 'text-yellow-600' : 'text-primary'}`}>
                            {detectedAccountType === 'Account does not exist' ? '⚠️' : '✓'} {detectedAccountType}
                          </p>
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
                  
                  <TabsContent value="signup" className="space-y-4 flex-1 absolute inset-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-left-4 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-right-4 duration-700 ease-in-out">
                    <div className="text-center space-y-1">
                      <h1 className="text-2xl font-bold text-foreground">Create an Account</h1>
                      <p className="text-muted-foreground text-sm">
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

                    <form onSubmit={handleSignUp} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (firstNameError) setFirstNameError("");
                            }}
                            className={firstNameError ? "border-destructive" : ""}
                            disabled={isLoading}
                            required
                          />
                          {firstNameError && (
                            <p className="text-xs text-destructive">{firstNameError}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              if (lastNameError) setLastNameError("");
                            }}
                            className={lastNameError ? "border-destructive" : ""}
                            disabled={isLoading}
                            required
                          />
                          {lastNameError && (
                            <p className="text-xs text-destructive">{lastNameError}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="signup-email">Email Address</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={signUpEmail}
                          onChange={(e) => {
                            setSignUpEmail(e.target.value);
                            if (signUpEmailError) setSignUpEmailError("");
                            // Check account type with debounce
                            setTimeout(() => checkAccountType(e.target.value), 500);
                          }}
                          className={signUpEmailError ? "border-destructive" : ""}
                          disabled={isLoading}
                          maxLength={255}
                          required
                        />
                        {signUpEmailError && (
                          <p className="text-xs text-destructive">{signUpEmailError}</p>
                        )}
                        {isCheckingAccount && (
                          <p className="text-xs text-muted-foreground">Checking account...</p>
                        )}
                        {detectedAccountType && !isCheckingAccount && (
                          <p className="text-xs text-orange-600 font-medium">⚠️ Account already exists: {detectedAccountType}</p>
                        )}
                      </div>

                      <div className="space-y-1">
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
                          <p className="text-xs text-destructive">{signUpMobileError}</p>
                        )}
                      </div>

                      <div className="space-y-1">
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
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {signUpPasswordError && (
                          <p className="text-xs text-destructive">{signUpPasswordError}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-confirm-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={signUpConfirmPassword}
                            onChange={(e) => {
                              setSignUpConfirmPassword(e.target.value);
                              if (signUpConfirmPasswordError) setSignUpConfirmPasswordError("");
                            }}
                            className={signUpConfirmPasswordError ? "border-destructive pr-10" : "pr-10"}
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
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {signUpConfirmPasswordError && (
                          <p className="text-xs text-destructive">{signUpConfirmPasswordError}</p>
                        )}
                      </div>

                      <div className="space-y-1">
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
                          <p className="text-xs text-destructive">{accountTypeError}</p>
                        )}
                      </div>
                       
                        <div className="flex items-start space-x-2">
                          <Checkbox id="terms-signup" className="mt-1" />
                          <Label htmlFor="terms-signup" className="text-xs text-muted-foreground leading-relaxed">
                            I agree that my email and mobile number will be associated with the account type{" "}
                            <span className="font-medium text-foreground">
                              {accountType ? accountType.charAt(0).toUpperCase() + accountType.slice(1) : "[Selected Account Type]"}
                            </span>
                            .
                          </Label>
                        </div>
                       
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-full font-medium mt-4" 
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>
                  </TabsContent>
                </div>
              </div>
            </Tabs>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;