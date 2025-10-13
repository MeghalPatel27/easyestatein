import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight,
  Home,
  Building2,
  Factory,
  TreePine,
  Building
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PropertiesNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    type: "",
    title: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    price: "",
    location: {
      address: "",
      city: "",
      state: "",
      pincode: ""
    },
    amenities: [] as string[],
    specifications: {},
    images: [] as string[],
    documents: [] as string[],
    completionDate: ""
  });

  const validPropertyTypes = ['apartment', 'villa', 'house', 'plot', 'commercial', 'office'];
  
  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (formData.type && !validPropertyTypes.includes(formData.type)) {
      setFormData(prev => ({ ...prev, type: "" }));
    }
  }, [formData.type]);

  const categories = [
    { value: "residential", label: "Residential", icon: Home, color: "text-blue-600" },
    { value: "commercial", label: "Commercial", icon: Building2, color: "text-green-600" },
    { value: "industrial", label: "Industrial", icon: Factory, color: "text-orange-600" },
    { value: "agricultural", label: "Agricultural", icon: TreePine, color: "text-emerald-600" }
  ];

  const residentialTypes = [
    { value: "apartment", label: "Apartment", icon: Building },
    { value: "villa", label: "Villa", icon: Home },
    { value: "house", label: "House", icon: Home }
  ];

  const commercialTypes = [
    { value: "office", label: "Office Space", icon: Building2 },
    { value: "commercial", label: "Commercial Building", icon: Building }
  ];

  const landTypes = [
    { value: "plot", label: "Plot/Land", icon: Building }
  ];

  const amenitiesList = [
    "Swimming Pool", "Gym", "Parking", "Security", "Garden", "Elevator",
    "Power Backup", "Water Supply", "Club House", "Children's Play Area",
    "Jogging Track", "CCTV Surveillance", "Intercom", "Maintenance Staff"
  ];

  const getTypeOptions = () => {
    if (formData.category === "residential") return residentialTypes;
    if (formData.category === "commercial") return commercialTypes;
    if (formData.category === "land") return landTypes;
    return [];
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("Please log in to submit property");
      return;
    }

    if (!formData.type || !validPropertyTypes.includes(formData.type)) {
      toast.error("Please select a valid property type");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const location = {
        address: formData.location.address,
        city: formData.location.city,
        state: formData.location.state,
        pincode: formData.location.pincode,
        area: formData.location.address
      };

      const { error } = await supabase
        .from('property_approvals')
        .insert([{
          broker_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          property_type: formData.type,
          price: parseFloat(formData.price) || 0,
          area: parseFloat(formData.area) || 0,
          bedrooms: parseInt(formData.bedrooms) || null,
          bathrooms: parseInt(formData.bathrooms) || null,
          location: location,
          amenities: formData.amenities,
          images: formData.images,
          documents: formData.documents,
          status: 'pending'
        }] as any);

      if (error) {
        console.error('Error submitting property:', error);
        toast.error("Failed to submit property. Please try again.");
        return;
      }

      toast.success("Property submitted for approval! You'll be notified once it's reviewed.");
      navigate("/broker/properties");
    } catch (error) {
      console.error('Error submitting property:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">What type of property are you listing?</h2>
              <p className="text-muted-foreground">Choose the category that best fits your property</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setFormData({ ...formData, category: cat.value, type: "" })}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      formData.category === cat.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`h-12 w-12 mx-auto mb-3 ${cat.color}`} />
                    <p className="font-medium text-lg">{cat.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Choose Property Type</h2>
              <p className="text-muted-foreground">Select the specific type of {formData.category} property</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getTypeOptions().map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      formData.type === type.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="h-10 w-10 mx-auto mb-2 text-primary" />
                    <p className="font-medium">{type.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Location Preferences</h2>
              <p className="text-muted-foreground">Where is your property located?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="city" className="text-base">City *</Label>
                <Input
                  id="city"
                  value={formData.location.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value }
                  })}
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="text-base">Nearby Landmark (Optional)</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value }
                  })}
                  placeholder="e.g., Phoenix Mall, Cyber City"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Budget Range</h2>
              <p className="text-muted-foreground">Set your property price</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Property Price</p>
                <p className="text-4xl font-bold text-primary">
                  ₹{formData.price ? (parseFloat(formData.price) / 10000000).toFixed(2) + 'Cr' : '0Cr'}
                </p>
              </div>
              
              <div>
                <Label htmlFor="price" className="text-base">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 25000000"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Property Specifications</h2>
              <p className="text-muted-foreground">Tell us about your property details</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-base">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Luxury 3 BHK Apartment in Mumbai Central"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-base">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your property..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              {formData.category === "residential" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedrooms" className="text-base">Bedrooms</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => 
                      setFormData({ ...formData, bedrooms: value })
                    }>
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="bathrooms" className="text-base">Bathrooms</Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => 
                      setFormData({ ...formData, bathrooms: value })
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="area" className="text-base">Area (sq ft)</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., 1200"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Timeline</h2>
              <p className="text-muted-foreground">When is the property available?</p>
            </div>
            
            <div className="space-y-3">
              {['Immediately', 'Within 3 months', '3-6 months', '6-12 months', 'Under Construction'].map((option) => (
                <button
                  key={option}
                  onClick={() => setFormData({ ...formData, completionDate: option })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.completionDate === option 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.completionDate === option ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {formData.completionDate === option && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Preferences</h2>
              <p className="text-muted-foreground">Tell us about your property amenities</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-primary rounded"></div>
                  <h3 className="text-lg font-semibold">Must-Haves</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesList.slice(0, 9).map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => {
                        const newAmenities = formData.amenities.includes(amenity)
                          ? formData.amenities.filter(a => a !== amenity)
                          : [...formData.amenities, amenity];
                        setFormData({ ...formData, amenities: newAmenities });
                      }}
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${
                        formData.amenities.includes(amenity)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Property Summary</h2>
              <p className="text-muted-foreground">Review your property before posting</p>
            </div>
            
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium capitalize">{formData.type || '-'} ({formData.category})</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{formData.location.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">₹{formData.price ? (parseFloat(formData.price) / 10000000).toFixed(2) + 'Cr' : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">{formData.completionDate || '-'}</p>
                  </div>
                </div>
                
                {formData.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Additional Requirements (Optional)</p>
                    <p className="text-sm">{formData.description}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/broker/properties" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Step {currentStep} of {totalSteps}</p>
              <p className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {renderStepContent()}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="w-32"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                className="w-32 bg-primary hover:bg-primary/90"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-auto px-6 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesNew;
