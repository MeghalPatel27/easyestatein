import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const KycVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    display_name: "",
    phone: "",
    company_name: "",
    business_license: "",
    user_type: "buyer",
    operating_areas: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setProfile(profile);
        setFormData({
          display_name: profile.display_name || "",
          phone: profile.phone || "",
          company_name: profile.company_name || "",
          business_license: profile.business_license || "",
          user_type: profile.user_type || "buyer",
          operating_areas: Array.isArray(profile.operating_areas) ? profile.operating_areas : []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert([{
          user_id: user.id,
          display_name: formData.display_name,
          phone: formData.phone,
          company_name: formData.company_name,
          business_license: formData.business_license,
          user_type: formData.user_type,
          operating_areas: JSON.stringify(formData.operating_areas),
          kyc_status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "KYC information submitted!",
        description: "Your verification request has been submitted for review."
      });

      // Navigate back based on user type
      if (formData.user_type === 'broker') {
        navigate('/broker/dashboard');
      } else {
        navigate('/buyer-dashboard');
      }
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: "Error",
        description: "Failed to submit KYC information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">KYC Verification</h1>
                <p className="text-muted-foreground">Verify your identity and business details</p>
              </div>
            </div>
            {profile && (
              <Badge className={getStatusColor(profile.kyc_status)}>
                {getStatusIcon(profile.kyc_status)}
                <span className="ml-1 capitalize">{profile.kyc_status}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="display_name">Full Name *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="user_type">Account Type *</Label>
                <Select value={formData.user_type} onValueChange={(value) => setFormData({...formData, user_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="broker">Broker/Agent</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Business Information (for brokers/developers) */}
          {(formData.user_type === 'broker' || formData.user_type === 'developer') && (
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="Your company name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="business_license">Business License/RERA Number</Label>
                  <Input
                    id="business_license"
                    value={formData.business_license}
                    onChange={(e) => setFormData({...formData, business_license: e.target.value})}
                    placeholder="License or RERA registration number"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your ID proof, address proof, and business documents (if applicable)
                </p>
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Required Documents:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Government issued ID (Aadhaar, PAN, Passport)</li>
                  <li>Address proof (Utility bill, Bank statement)</li>
                  {(formData.user_type === 'broker' || formData.user_type === 'developer') && (
                    <>
                      <li>Business registration certificate</li>
                      <li>RERA registration (if applicable)</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KycVerification;