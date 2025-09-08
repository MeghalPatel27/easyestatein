import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Toggle } from "@/components/ui/toggle";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Building, 
  Factory, 
  TreePine, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  CreditCard, 
  Heart, 
  X, 
  Smartphone, 
  Mail, 
  CheckCircle,
  Bed,
  Bath,
  Square,
  Car,
  Shield,
  Waves,
  Zap,
  Users,
  Navigation,
  Volume2,
  Wrench,
  Clock,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Property categories and types
const PROPERTY_CATEGORIES = [
  { id: 'residential', label: 'Residential', icon: Home, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'commercial', label: 'Commercial', icon: Building, color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'industrial', label: 'Industrial', icon: Factory, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'agricultural', label: 'Agricultural', icon: TreePine, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
];

const PROPERTY_TYPES = {
  residential: [
    { id: 'apartment', label: 'Apartment', icon: Building },
    { id: 'villa', label: 'Villa', icon: Home },
    { id: 'bungalow', label: 'Bungalow', icon: Home },
    { id: 'rowhouse', label: 'Row House', icon: Home },
    { id: 'duplex', label: 'Duplex', icon: Building },
    { id: 'penthouse', label: 'Penthouse', icon: Building },
    { id: 'plot', label: 'Plot', icon: Square }
  ],
  commercial: [
    { id: 'office', label: 'Office', icon: Building },
    { id: 'shop', label: 'Shop', icon: Building },
    { id: 'showroom', label: 'Showroom', icon: Building },
    { id: 'coworking', label: 'Co-working Space', icon: Users }
  ],
  industrial: [
    { id: 'shed', label: 'Shed', icon: Factory },
    { id: 'warehouse', label: 'Warehouse', icon: Factory },
    { id: 'factory', label: 'Factory', icon: Factory },
    { id: 'industrialland', label: 'Industrial Land', icon: Square }
  ],
  agricultural: [
    { id: 'farmland', label: 'Farm Land', icon: TreePine },
    { id: 'agriplot', label: 'Agri-Plot', icon: Square },
    { id: 'greenhouse', label: 'Greenhouse', icon: TreePine }
  ]
};

const AMENITIES = [
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'security', label: 'Gated Security', icon: Shield },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'backup', label: 'Power Backup', icon: Zap },
  { id: 'garden', label: 'Garden', icon: TreePine }
];

const DISLIKES = [
  { id: 'highway', label: 'Near Highway', icon: Navigation },
  { id: 'crowded', label: 'Crowded locality', icon: Users },
  { id: 'maintenance', label: 'High Maintenance', icon: Wrench },
  { id: 'noise', label: 'Noisy Area', icon: Volume2 }
];

const TIMELINE_OPTIONS = [
  { id: 'immediate', label: 'Immediately' },
  { id: '3months', label: 'Within 3 months' },
  { id: '6months', label: '3-6 months' },
  { id: '12months', label: '6-12 months' },
  { id: 'exploring', label: 'Just exploring' }
];

const FINANCING_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'maybe', label: 'Maybe later' }
];

const PostRequirement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Core Intent
    category: '',
    
    // Step 2: Property Type
    propertyType: [] as string[],
    
    // Step 3: Location
    city: '',
    localities: [] as string[],
    landmark: '',
    
    // Step 4: Budget
    budgetRange: [50, 200] as number[],
    
    // Step 5: Size & Specifications
    bhk: [] as string[],
    bathrooms: '',
    area: '',
    areaUnit: 'sqft',
    furnishing: '',
    plotSize: '',
    builtupArea: '',
    facilities: [] as string[],
    landArea: '',
    irrigation: false,
    directions: '',
    floor: '',
    minParking: '',
    balcony: '',
    
    // Step 6: Timeline
    timeline: '',
    
    // Step 7: Financing
    financing: '',
    
    // Step 8: Must-haves & Dislikes
    amenities: [] as string[],
    dislikes: [] as string[],
    
    // Step 9: Verification
    phone: '',
    email: '',
    otp: '',
    
    // Step 10: Additional
    description: ''
  });

  const totalSteps = 10;
  const progress = (currentStep / totalSteps) * 100;

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

  const formatBudget = (value: number) => {
    if (value >= 100) {
      return `₹${(value / 100).toFixed(1)}Cr`;
    }
    return `₹${value}L`;
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const handleSubmit = async () => {
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

      // Create requirement object
      const requirement = {
        user_id: user.id,
        category: formData.category,
        property_type: formData.propertyType.join(', '),
        location: {
          city: formData.city,
          localities: formData.localities,
          landmark: formData.landmark
        },
        budget_min: formData.budgetRange[0] * 100000,
        budget_max: formData.budgetRange[1] * 100000,
        specifications: {
          bhk: formData.bhk.join(', '),
          bathrooms: formData.bathrooms,
          area: formData.area,
          area_unit: formData.areaUnit,
          furnishing: formData.furnishing,
          facilities: formData.facilities
        },
        timeline: formData.timeline,
        financing: formData.financing,
        amenities: formData.amenities,
        dislikes: formData.dislikes,
        description: formData.description,
        contact: {
          phone: formData.phone,
          email: formData.email
        },
        status: 'active'
      };

      // For now, insert into properties table (temporary workaround)
      const { error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          title: `${formData.propertyType.join('/')} in ${formData.city}`,
          description: formData.description || `Looking for ${formData.propertyType.join(' or ')} in ${formData.city}`,
          category: formData.category as any,
          type: formData.propertyType[0] as any,
          location: { city: formData.city, area: formData.localities[0] || '' },
          price: formData.budgetRange[1] * 100000,
          area: parseInt(formData.area) || 0,
          bedrooms: parseInt(formData.bhk[0]) || null,
          bathrooms: parseInt(formData.bathrooms) || null,
          status: 'available'
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">What type of property are you looking for?</h2>
              <p className="text-muted-foreground">Choose the category that best fits your needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROPERTY_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                      formData.category === category.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, category: category.id, propertyType: [] })}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-foreground">{category.label}</h3>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 2:
        const categoryTypes = PROPERTY_TYPES[formData.category as keyof typeof PROPERTY_TYPES] || [];
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose Property Type</h2>
              <p className="text-muted-foreground">Select up to 2 types of {formData.category} property</p>
              {formData.propertyType.length > 0 && (
                <p className="text-sm text-easyestate-pink mt-2">
                  {formData.propertyType.length}/2 selected
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categoryTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.propertyType.includes(type.id);
                const canSelect = formData.propertyType.length < 2 || isSelected;
                
                return (
                  <Card
                    key={type.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : canSelect 
                        ? 'border-border hover:border-primary/50'
                        : 'border-border opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (!canSelect) return;
                      
                      const newPropertyTypes = isSelected
                        ? formData.propertyType.filter(id => id !== type.id)
                        : [...formData.propertyType, type.id];
                      
                      setFormData({ ...formData, propertyType: newPropertyTypes });
                    }}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className={`font-medium text-sm ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {type.label}
                      </h3>
                      {isSelected && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Location Preferences</h2>
              <p className="text-muted-foreground">Where would you like your property to be?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  placeholder="e.g., Phoenix Mall, Cyber City"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Budget Range</h2>
              <p className="text-muted-foreground">Set your comfortable budget range</p>
            </div>
            
            <div className="space-y-6">
              {/* Budget Display Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Min Budget</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatBudget(formData.budgetRange[0])}
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Max Budget</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatBudget(formData.budgetRange[1])}
                  </div>
                </div>
              </div>
              
              <div className="px-4">
                <Slider
                  value={formData.budgetRange}
                  onValueChange={(value) => {
                    const [min, max] = value;
                    const maxGap = 200; // ₹2 Cr in lakhs
                    
                    let newMin = min;
                    let newMax = max;
                    
                    // If max exceeds min + 2Cr, adjust min to maintain 2Cr gap
                    if (max - min > maxGap) {
                      newMin = max - maxGap;
                    }
                    
                    // Ensure min doesn't go below 10
                    if (newMin < 10) {
                      newMin = 10;
                      newMax = Math.min(newMin + maxGap, 1000);
                    }
                    
                    setFormData({ ...formData, budgetRange: [newMin, newMax] });
                  }}
                  max={1000}
                  min={10}
                  step={10}
                  className="w-full mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>₹10L</span>
                  <span>₹10Cr+</span>
                </div>
                
                {/* Helper Text */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Maximum gap allowed: <span className="font-medium text-primary">₹2 Cr</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current gap: <span className="font-medium">
                      {formatBudget(formData.budgetRange[1] - formData.budgetRange[0])}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        const isResidential = formData.category === 'residential';
        const isPlot = formData.propertyType.includes('plot');
        const isCommercial = formData.category === 'commercial';
        const isIndustrial = formData.category === 'industrial';
        const isAgricultural = formData.category === 'agricultural';

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Size & Specifications</h2>
              <p className="text-muted-foreground">Tell us about your space requirements</p>
            </div>
            
            <div className="space-y-4">
              {isResidential && !isPlot && (
                <>
                  <div>
                    <Label>BHK Configuration</Label>
                    <p className="text-muted-foreground text-sm mb-2">Select up to 2 configurations</p>
                    {formData.bhk.length > 0 && (
                      <p className="text-sm text-easyestate-pink mb-2">
                        {formData.bhk.length}/2 selected
                      </p>
                    )}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                      {['1', '2', '3', '4', '5', '6+'].map((bhk) => {
                        const isSelected = formData.bhk.includes(bhk);
                        const canSelect = formData.bhk.length < 2 || isSelected;
                        
                        return (
                          <Button
                            key={bhk}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              if (!canSelect) return;
                              
                              const newBhk = isSelected
                                ? formData.bhk.filter(id => id !== bhk)
                                : [...formData.bhk, bhk];
                              
                              setFormData({ ...formData, bhk: newBhk });
                            }}
                            className={`h-12 ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {bhk}BHK
                            {isSelected && (
                              <CheckCircle className="w-3 h-3 ml-1" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Bathrooms</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {['1', '2', '3', '4+'].map((bath) => (
                        <Button
                          key={bath}
                          variant={formData.bathrooms === bath ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, bathrooms: bath })}
                          className="h-12"
                        >
                          {bath}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="area">
                  {isPlot ? 'Plot Size' : isAgricultural ? 'Land Area' : 'Carpet Area'} (sq.ft)
                </Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="e.g., 1200"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              {isCommercial && (
                <div>
                  <Label>Furnishing Preference</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    {['Bare Shell', 'Semi-Furnished', 'Fully Furnished'].map((furnish) => (
                      <Button
                        key={furnish}
                        variant={formData.furnishing === furnish ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, furnishing: furnish })}
                        className="h-12"
                      >
                        {furnish}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Additional Specifications */}
              {(isResidential || isCommercial) && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Preferred Directions</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map((direction) => (
                          <Button
                            key={direction}
                            variant={formData.directions === direction ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData({ ...formData, directions: direction })}
                            className="h-10 text-xs"
                          >
                            {direction}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="floor">Preferred Floor</Label>
                      <Input
                        id="floor"
                        type="number"
                        placeholder="e.g., 3"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minParking">Minimum Parking Required</Label>
                      <Input
                        id="minParking"
                        type="number"
                        placeholder="e.g., 1"
                        value={formData.minParking}
                        onChange={(e) => setFormData({ ...formData, minParking: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="balcony">Number of Balconies</Label>
                      <Input
                        id="balcony"
                        type="number"
                        placeholder="e.g., 2"
                        value={formData.balcony}
                        onChange={(e) => setFormData({ ...formData, balcony: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Timeline</h2>
              <p className="text-muted-foreground">When do you plan to buy?</p>
            </div>
            
            <div className="space-y-2">
              {TIMELINE_OPTIONS.map((option) => (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-all duration-200 border-2 ${
                    formData.timeline === option.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, timeline: option.id })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.timeline === option.id ? 'bg-primary border-primary' : 'border-border'
                    }`} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Financing</h2>
              <p className="text-muted-foreground">Do you need a home loan?</p>
            </div>
            
            <div className="space-y-2">
              {FINANCING_OPTIONS.map((option) => (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-all duration-200 border-2 ${
                    formData.financing === option.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, financing: option.id })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.financing === option.id ? 'bg-primary border-primary' : 'border-border'
                    }`} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Preferences</h2>
              <p className="text-muted-foreground">Tell us what you love and what you'd rather avoid</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-green-600" />
                  Must-Haves
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AMENITIES.map((amenity) => {
                    const Icon = amenity.icon;
                    return (
                      <Toggle
                        key={amenity.id}
                        pressed={formData.amenities.includes(amenity.id)}
                        onPressedChange={() => 
                          setFormData({
                            ...formData,
                            amenities: toggleArrayItem(formData.amenities, amenity.id)
                          })
                        }
                        className="h-16 flex-col space-y-1"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{amenity.label}</span>
                      </Toggle>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <X className="w-4 h-4 mr-2 text-red-600" />
                  Dislikes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {DISLIKES.map((dislike) => {
                    const Icon = dislike.icon;
                    return (
                      <Toggle
                        key={dislike.id}
                        pressed={formData.dislikes.includes(dislike.id)}
                        onPressedChange={() => 
                          setFormData({
                            ...formData,
                            dislikes: toggleArrayItem(formData.dislikes, dislike.id)
                          })
                        }
                        className="h-16 flex-col space-y-1"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{dislike.label}</span>
                      </Toggle>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Verification</h2>
              <p className="text-muted-foreground">We'll send you matching properties</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Requirement Summary</h2>
              <p className="text-muted-foreground">Review your requirement before posting</p>
            </div>
            
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground">Property Type</h4>
                  <p className="text-muted-foreground capitalize">
                    {formData.propertyType.join(', ')} ({formData.category})
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Location</h4>
                  <p className="text-muted-foreground">{formData.city}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Budget</h4>
                  <p className="text-muted-foreground">
                    {formatBudget(formData.budgetRange[0])} - {formatBudget(formData.budgetRange[1])}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Timeline</h4>
                  <p className="text-muted-foreground capitalize">
                    {TIMELINE_OPTIONS.find(t => t.id === formData.timeline)?.label}
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Additional Requirements (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Any specific requirements or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.category;
      case 2: return formData.propertyType.length > 0;
      case 3: return formData.city;
      case 4: return true;
      case 5: return true;
      case 6: return formData.timeline;
      case 7: return formData.financing;
      case 8: return true;
      case 9: return formData.phone;
      case 10: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <div className="text-easyestate-pink font-bold text-lg">easyestate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24">
        <div className="animate-fade-in">
          {renderStep()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === totalSteps ? (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Post Requirement
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostRequirement;