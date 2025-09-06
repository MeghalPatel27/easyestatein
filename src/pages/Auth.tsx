import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpEmailError, setSignUpEmailError] = useState("");
  const [signUpPasswordError, setSignUpPasswordError] = useState("");
  const [signUpConfirmPasswordError, setSignUpConfirmPasswordError] = useState("");

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
  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 254) return "Email is too long";
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
          setError("Please check your email and click the confirmation link before signing in.");
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
    const cleanPassword = sanitizeInput(signUpPassword);
    const cleanConfirmPassword = sanitizeInput(signUpConfirmPassword);
    
    // Validate inputs
    const emailError = validateEmail(cleanEmail);
    const passwordError = validatePassword(cleanPassword);
    
    let confirmPasswordError = "";
    if (!cleanConfirmPassword) {
      confirmPasswordError = "Please confirm your password";
    } else if (cleanPassword !== cleanConfirmPassword) {
      confirmPasswordError = "Passwords do not match";
    }
    
    setSignUpEmailError(emailError);
    setSignUpPasswordError(passwordError);
    setSignUpConfirmPasswordError(confirmPasswordError);
    
    if (emailError || passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError("An account with this email already exists. Please sign in instead.");
        } else if (error.message.includes('Password should be')) {
          setError("Password does not meet security requirements. Please choose a stronger password.");
        } else if (error.message.includes('Signup is disabled')) {
          setError("New account registration is currently disabled. Please contact support.");
        } else {
          setError("Sign up failed. Please try again.");
        }
      } else {
        toast.success("Account created! Please check your email to verify your account.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
            <div className="text-easyestate-pink font-bold text-xl">easyestate</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-text-primary">Welcome</CardTitle>
            <CardDescription className="text-text-secondary">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 min-h-[380px] flex flex-col">
                <TabsContent value="signin" className="space-y-4 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-2 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-left-2 duration-500">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInEmail}
                      onChange={(e) => {
                        setSignInEmail(e.target.value);
                        if (signInEmailError) setSignInEmailError("");
                      }}
                      className={signInEmailError ? "border-destructive" : ""}
                      disabled={isLoading}
                      maxLength={254}
                      required
                    />
                    {signInEmailError && (
                      <p className="text-sm text-destructive">{signInEmailError}</p>
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
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-easyestate-pink hover:bg-easyestate-pink-dark" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-left-2 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-right-2 duration-500">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => {
                        setSignUpEmail(e.target.value);
                        if (signUpEmailError) setSignUpEmailError("");
                      }}
                      className={signUpEmailError ? "border-destructive" : ""}
                      disabled={isLoading}
                      maxLength={254}
                      required
                    />
                    {signUpEmailError && (
                      <p className="text-sm text-destructive">{signUpEmailError}</p>
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
                    className="w-full bg-easyestate-pink hover:bg-easyestate-pink-dark" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
          
          <CardFooter className="text-center">
            <p className="text-sm text-text-secondary">
              By signing up, you agree to our terms of service and privacy policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;