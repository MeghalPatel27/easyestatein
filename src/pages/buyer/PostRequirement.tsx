import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, DollarSign, Home, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PostRequirement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    type: "",
    location: {
      city: "",
      area: "",
      state: ""
    },
    budget_min: "",
    budget_max: "",
    area_min: "",
    area_max: "",
    bedrooms: "",
    bathrooms: "",
    urgency: "medium",
    description: "",
    specifications: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to post a requirement",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('leads')
        .insert([{
          buyer_id: user.id,
          title: formData.title,
          category: formData.category,
          type: formData.type,
          location: formData.location,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          area_min: formData.area_min ? parseFloat(formData.area_min) : null,
          area_max: formData.area_max ? parseFloat(formData.area_max) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          urgency: formData.urgency,
          description: formData.description,
          specifications: formData.specifications
        }]);

      if (error) throw error;

      toast({
        title: "Requirement posted successfully!",
        description: "Brokers will now be able to see your requirement."
      });

      navigate('/buyer-dashboard');
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
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/buyer-dashboard')}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Post New Requirement</h1>
                <p className="text-muted-foreground">Tell us what you're looking for</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Requirement Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Looking for 3BHK apartment in Mumbai"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type">Property Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    placeholder="e.g., Apartment, Villa, Office"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Within 6 months</SelectItem>
                      <SelectItem value="medium">Medium - Within 3 months</SelectItem>
                      <SelectItem value="high">High - Within 1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area/Locality</Label>
                  <Input
                    id="area"
                    value={formData.location.area}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, area: e.target.value}})}
                    placeholder="Bandra"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, state: e.target.value}})}
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget & Area Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Budget Range (₹)</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      value={formData.budget_min}
                      onChange={(e) => setFormData({...formData, budget_min: e.target.value})}
                      placeholder="Min budget"
                      type="number"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      value={formData.budget_max}
                      onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                      placeholder="Max budget"
                      type="number"
                    />
                  </div>
                </div>
                <div>
                  <Label>Area Range (sq ft)</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      value={formData.area_min}
                      onChange={(e) => setFormData({...formData, area_min: e.target.value})}
                      placeholder="Min area"
                      type="number"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      value={formData.area_max}
                      onChange={(e) => setFormData({...formData, area_max: e.target.value})}
                      placeholder="Max area"
                      type="number"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select value={formData.bedrooms} onValueChange={(value) => setFormData({...formData, bedrooms: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bedrooms" />
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
                  <Select value={formData.bathrooms} onValueChange={(value) => setFormData({...formData, bathrooms: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bathrooms" />
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
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your specific requirements, preferences, or any other details..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/buyer-dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Requirement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostRequirement;