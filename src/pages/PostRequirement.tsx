import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const PostRequirement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "",
    location: { area: "", city: "", state: "" },
    budget_min: "",
    budget_max: "",
    area_min: "",
    area_max: "",
    bedrooms: "",
    bathrooms: "",
    urgency: "medium"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please login to post a requirement",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from('requirements')
        .insert({
          buyer_id: user.id,
          title: formData.title,
          description: formData.description,
          property_type: formData.property_type,
          location: formData.location,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          area_min: formData.area_min ? parseFloat(formData.area_min) : null,
          area_max: formData.area_max ? parseFloat(formData.area_max) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          urgency: formData.urgency
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your requirement has been posted successfully!"
      });

      navigate("/buyer-dashboard");
    } catch (error) {
      console.error('Error posting requirement:', error);
      toast({
        title: "Error",
        description: "Failed to post requirement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <div className="text-primary font-bold text-lg">easyestate</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Post Your Requirement</h1>
          <p className="text-muted-foreground">Tell us what kind of property you're looking for</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
              
              <div>
                <Label htmlFor="title">Requirement Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., 3 BHK Apartment in Baner"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <Select 
                  value={formData.property_type} 
                  onValueChange={(value) => setFormData({...formData, property_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your requirements in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    placeholder="e.g., Baner"
                    value={formData.location.area}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {...formData.location, area: e.target.value}
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Pune"
                    value={formData.location.city}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {...formData.location, city: e.target.value}
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="e.g., Maharashtra"
                    value={formData.location.state}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {...formData.location, state: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Budget
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Minimum Budget (₹)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    placeholder="e.g., 5000000"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({...formData, budget_min: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Maximum Budget (₹)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    placeholder="e.g., 8000000"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Property Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="area_min">Min Area (sq ft)</Label>
                  <Input
                    id="area_min"
                    type="number"
                    placeholder="e.g., 1000"
                    value={formData.area_min}
                    onChange={(e) => setFormData({...formData, area_min: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="area_max">Max Area (sq ft)</Label>
                  <Input
                    id="area_max"
                    type="number"
                    placeholder="e.g., 1500"
                    value={formData.area_max}
                    onChange={(e) => setFormData({...formData, area_max: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select 
                    value={formData.bedrooms} 
                    onValueChange={(value) => setFormData({...formData, bedrooms: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 BHK</SelectItem>
                      <SelectItem value="2">2 BHK</SelectItem>
                      <SelectItem value="3">3 BHK</SelectItem>
                      <SelectItem value="4">4 BHK</SelectItem>
                      <SelectItem value="5">5+ BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select 
                    value={formData.bathrooms} 
                    onValueChange={(value) => setFormData({...formData, bathrooms: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Urgency</h2>
              <Select 
                value={formData.urgency} 
                onValueChange={(value) => setFormData({...formData, urgency: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Within 6 months</SelectItem>
                  <SelectItem value="medium">Medium - Within 3 months</SelectItem>
                  <SelectItem value="high">High - Within 1 month</SelectItem>
                  <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Posting..." : "Post Requirement"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PostRequirement;