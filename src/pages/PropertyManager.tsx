import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Plus, Home, Building, Factory, Wheat, CalendarIcon, Upload, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  category: string;
  type: string;
  location: any;
  price: number;
  area: number;
  status: 'available' | 'sold' | 'rented' | 'under_offer';
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  specifications?: any;
  documents?: string[];
  completion_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const PropertyManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [category, setCategory] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [specifications, setSpecifications] = useState<any>({});
  const [pricing, setPricing] = useState<any>({});
  const [location, setLocation] = useState<any>({});
  const [media, setMedia] = useState<any>({});
  const [completionDate, setCompletionDate] = useState<Date>();

  // Mock user for testing - bypass authentication
  useEffect(() => {
    // Create a mock user object for "Meghal"
    const mockUser = {
      id: 'mock-user-meghal-123',
      email: 'meghal@example.com',
      user_metadata: {
        name: 'Meghal'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(mockUser);
    toast.success("Welcome back, Meghal!");
  }, []);

  // Fetch properties - using mock data for testing
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock properties for testing
      return [
        {
          id: 'mock-1',
          title: 'Luxury Villa in Thaltej',
          category: 'residential',
          type: 'villa',
          location: { area: 'Thaltej', city: 'Ahmedabad' },
          price: 4500000,
          area: 3500,
          status: 'available' as const,
          bedrooms: 4,
          bathrooms: 3,
          specifications: { furnishing: 'fully-furnished' },
          images: [],
          documents: [],
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          user_id: 'mock-user-meghal-123'
        },
        {
          id: 'mock-2',
          title: 'Commercial Office Space',
          category: 'commercial',
          type: 'office',
          location: { area: 'Prahlad Nagar', city: 'Ahmedabad' },
          price: 8500000,
          area: 1200,
          status: 'available' as const,
          specifications: { furnishing: 'furnished' },
          images: [],
          documents: [],
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z',
          user_id: 'mock-user-meghal-123'
        }
      ];
    },
    enabled: !!user
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      // Since we're using mock authentication, we'll simulate the database insert
      // In a real app, this would use Supabase
      const mockProperty = {
        ...propertyData,
        id: `mock-property-${Date.now()}`,
        user_id: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockProperty;
    },
    onSuccess: (newProperty) => {
      toast.success("Property added successfully!");
      // Add the new property to the existing properties array
      queryClient.setQueryData(['properties'], (oldProperties: any[] = []) => [newProperty, ...oldProperties]);
      setIsAddPropertyOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to add property: " + error.message);
    }
  });

  // Delete property mutation - mock functionality
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      return propertyId;
    },
    onSuccess: (deletedId) => {
      toast.success("Property deleted successfully!");
      // Remove the property from the existing properties array
      queryClient.setQueryData(['properties'], (oldProperties: any[] = []) => 
        oldProperties.filter(property => property.id !== deletedId)
      );
    },
    onError: (error: any) => {
      toast.error("Failed to delete property: " + error.message);
    }
  });

  const categoryTypes = {
    residential: ["apartment", "villa", "townhouse", "penthouse"],
    commercial: ["office", "retail", "warehouse", "showroom"],
    industrial: ["factory", "logistics", "manufacturing"],
    land: ["plot", "farm", "commercial_land"]
  };

  const resetForm = () => {
    setCurrentStep(1);
    setCategory("");
    setPropertyType("");
    setTitle("");
    setDescription("");
    setSpecifications({});
    setPricing({});
    setLocation({});
    setMedia({});
    setCompletionDate(undefined);
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      toast.error("Please sign in to add properties");
      return;
    }

    const propertyData = {
      title: title || `${propertyType} in ${location.area || 'Location'}`,
      category: category,
      type: propertyType,
      location: location,
      price: parseFloat(pricing.price) || 0,
      area: parseFloat(specifications.area || specifications.plotArea || specifications.carpetArea) || 0,
      status: 'available' as const,
      specifications: specifications,
      bedrooms: specifications.bedrooms,
      bathrooms: specifications.bathrooms,
      images: media.images || [],
      documents: media.documents || [],
      completion_date: completionDate ? format(completionDate, 'yyyy-MM-dd') : null,
      description: description
    };

    createPropertyMutation.mutate(propertyData);
  };

  const handleDelete = (propertyId: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "residential": return <Home className="w-6 h-6" />;
      case "commercial": return <Building className="w-6 h-6" />;
      case "industrial": return <Factory className="w-6 h-6" />;
      case "land": return <Wheat className="w-6 h-6" />;
      default: return <Home className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "sold": return "bg-blue-100 text-blue-700 border-blue-200";
      case "rented": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "under_offer": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Details
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Property Title</Label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter property title"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Description</Label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter property description"
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Category of Property</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {Object.keys(categoryTypes).map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    className={cn(
                      "h-20 flex-col gap-2",
                      category === cat && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      setCategory(cat);
                      setPropertyType(""); // Reset property type when category changes
                    }}
                  >
                    {getCategoryIcon(cat)}
                    <span className="text-sm capitalize">{cat}</span>
                  </Button>
                ))}
              </div>
            </div>

            {category && (
              <div>
                <Label className="text-base font-semibold">Type of Property</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="mt-3">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes[category as keyof typeof categoryTypes].map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 2: // Property Specifications
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Property Specifications</h3>
            
            {/* Residential specifications */}
            {category === "Residential" && propertyType !== "Plot" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bedrooms</Label>
                    <Select 
                      value={specifications.bedrooms?.toString()} 
                      onValueChange={(value) => setSpecifications({...specifications, bedrooms: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 10}, (_, i) => (
                          <SelectItem key={i+1} value={(i+1).toString()}>
                            {i+1} {i === 0 ? 'Bedroom' : 'Bedrooms'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Select 
                      value={specifications.bathrooms?.toString()} 
                      onValueChange={(value) => setSpecifications({...specifications, bathrooms: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 10}, (_, i) => (
                          <SelectItem key={i+1} value={(i+1).toString()}>
                            {i+1} {i === 0 ? 'Bathroom' : 'Bathrooms'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {propertyType === "Apartment" && (
                  <div>
                    <Label>Floor</Label>
                    <Select 
                      value={specifications.floor?.toString()} 
                      onValueChange={(value) => setSpecifications({...specifications, floor: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 50}, (_, i) => (
                          <SelectItem key={i+1} value={(i+1).toString()}>
                            {i+1} Floor
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Furnishing Status</Label>
                  <Tabs 
                    value={specifications.furnishing} 
                    onValueChange={(value) => setSpecifications({...specifications, furnishing: value})}
                    className="mt-3"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="unfurnished">Unfurnished</TabsTrigger>
                      <TabsTrigger value="semi-furnished">Semi-furnished</TabsTrigger>
                      <TabsTrigger value="fully-furnished">Fully furnished</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label>Super Built-up Area</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="number" 
                      placeholder="Enter area"
                      value={specifications.area || ""}
                      onChange={(e) => setSpecifications({...specifications, area: e.target.value})}
                    />
                    <Select 
                      value={specifications.areaUnit} 
                      onValueChange={(value) => setSpecifications({...specifications, areaUnit: value})}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sq-ft">Sq Ft</SelectItem>
                        <SelectItem value="sq-m">Sq M</SelectItem>
                        <SelectItem value="sq-yard">Sq Yard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Plot specifications */}
            {category === "Residential" && propertyType === "Plot" && (
              <div>
                <Label>Plot Area</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    type="number" 
                    placeholder="Enter area"
                    value={specifications.area || ""}
                    onChange={(e) => setSpecifications({...specifications, area: e.target.value})}
                  />
                  <Select 
                    value={specifications.areaUnit} 
                    onValueChange={(value) => setSpecifications({...specifications, areaUnit: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sq-ft">Sq Ft</SelectItem>
                      <SelectItem value="sq-m">Sq M</SelectItem>
                      <SelectItem value="sq-yard">Sq Yard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Commercial specifications */}
            {category === "Commercial" && (
              <>
                <div>
                  <Label>Carpet Area</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="number" 
                      placeholder="Enter area"
                      value={specifications.carpetArea || ""}
                      onChange={(e) => setSpecifications({...specifications, carpetArea: e.target.value})}
                    />
                    <Select 
                      value={specifications.areaUnit} 
                      onValueChange={(value) => setSpecifications({...specifications, areaUnit: value})}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sq-ft">Sq Ft</SelectItem>
                        <SelectItem value="sq-m">Sq M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Floor</Label>
                  <Select 
                    value={specifications.floor?.toString()} 
                    onValueChange={(value) => setSpecifications({...specifications, floor: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 50}, (_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()}>
                          {i+1} Floor
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Washrooms</Label>
                  <Select 
                    value={specifications.washrooms?.toString()} 
                    onValueChange={(value) => setSpecifications({...specifications, washrooms: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select washrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 10}, (_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()}>
                          {i+1} Washroom{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Furnishing Status</Label>
                  <Tabs 
                    value={specifications.furnishing} 
                    onValueChange={(value) => setSpecifications({...specifications, furnishing: value})}
                    className="mt-3"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="bare-shell">Bare Shell</TabsTrigger>
                      <TabsTrigger value="furnished">Furnished</TabsTrigger>
                      <TabsTrigger value="semi-furnished">Semi-furnished</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </>
            )}

            {/* Industrial specifications */}
            {category === "Industrial" && (propertyType === "Shed" || propertyType === "Warehouse" || propertyType === "Factory") && (
              <>
                <div>
                  <Label>Plot Area</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="number" 
                      placeholder="Enter area"
                      value={specifications.plotArea || ""}
                      onChange={(e) => setSpecifications({...specifications, plotArea: e.target.value})}
                    />
                    <Select 
                      value={specifications.areaUnit} 
                      onValueChange={(value) => setSpecifications({...specifications, areaUnit: value})}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sq-ft">Sq Ft</SelectItem>
                        <SelectItem value="sq-m">Sq M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Built-up Area</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="number" 
                      placeholder="Enter area"
                      value={specifications.builtupArea || ""}
                      onChange={(e) => setSpecifications({...specifications, builtupArea: e.target.value})}
                    />
                    <Select 
                      value={specifications.builtupAreaUnit} 
                      onValueChange={(value) => setSpecifications({...specifications, builtupAreaUnit: value})}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sq-ft">Sq Ft</SelectItem>
                        <SelectItem value="sq-m">Sq M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Ceiling Height (Optional)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="number" 
                      placeholder="Enter height"
                      value={specifications.ceilingHeight || ""}
                      onChange={(e) => setSpecifications({...specifications, ceilingHeight: e.target.value})}
                    />
                    <Select 
                      value={specifications.heightUnit} 
                      onValueChange={(value) => setSpecifications({...specifications, heightUnit: value})}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ft">Ft</SelectItem>
                        <SelectItem value="m">M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="crane-facility"
                    checked={specifications.craneFacility || false}
                    onCheckedChange={(checked) => setSpecifications({...specifications, craneFacility: checked})}
                  />
                  <Label htmlFor="crane-facility">Crane Facility Available</Label>
                </div>
              </>
            )}

            {/* Agricultural specifications */}
            {category === "Agricultural" && (
              <>
                <div>
                  <Label>Land Area</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="number" 
                      placeholder="Enter area"
                      value={specifications.landArea || ""}
                      onChange={(e) => setSpecifications({...specifications, landArea: e.target.value})}
                    />
                    <Select 
                      value={specifications.areaUnit} 
                      onValueChange={(value) => setSpecifications({...specifications, areaUnit: value})}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acre">Acre</SelectItem>
                        <SelectItem value="bigha">Bigha</SelectItem>
                        <SelectItem value="sq-ft">Sq Ft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="irrigation-facility"
                      checked={specifications.irrigationFacility || false}
                      onCheckedChange={(checked) => setSpecifications({...specifications, irrigationFacility: checked})}
                    />
                    <Label htmlFor="irrigation-facility">Irrigation Facility Available</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="road-access"
                      checked={specifications.roadAccess || false}
                      onCheckedChange={(checked) => setSpecifications({...specifications, roadAccess: checked})}
                    />
                    <Label htmlFor="road-access">Road Access Available</Label>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 3: // Pricing & Availability
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Pricing & Availability</h3>
            
            <div>
              <Label>Rate / Price</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  type="number" 
                  placeholder="Enter price"
                  value={pricing.amount || ""}
                  onChange={(e) => setPricing({...pricing, amount: e.target.value})}
                />
                <Select 
                  value={pricing.unit} 
                  onValueChange={(value) => setPricing({...pricing, unit: value})}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lakhs">Lakhs</SelectItem>
                    <SelectItem value="crores">Crores</SelectItem>
                    <SelectItem value="per-sq-ft">Per Sq. Ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Property Status</Label>
              <Tabs 
                value={pricing.status} 
                onValueChange={(value) => setPricing({...pricing, status: value})}
                className="mt-3"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ready">Ready Possession</TabsTrigger>
                  <TabsTrigger value="under-construction">Under Construction</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {pricing.status === "under-construction" && (
              <div>
                <Label>Expected Completion Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-2 justify-start text-left font-normal",
                        !completionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {completionDate ? format(completionDate, "PPP") : <span>Pick a completion date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={completionDate}
                      onSelect={setCompletionDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        );

      case 4: // Location
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Location Details</h3>
            
            <div>
              <Label>City</Label>
              <Select 
                value={location.city} 
                onValueChange={(value) => setLocation({...location, city: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                  <SelectItem value="surat">Surat</SelectItem>
                  <SelectItem value="vadodara">Vadodara</SelectItem>
                  <SelectItem value="rajkot">Rajkot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Locality / Area</Label>
              <Select 
                value={location.locality} 
                onValueChange={(value) => setLocation({...location, locality: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select locality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thaltej">Thaltej</SelectItem>
                  <SelectItem value="bopal">Bopal</SelectItem>
                  <SelectItem value="prahlad-nagar">Prahlad Nagar</SelectItem>
                  <SelectItem value="science-city">Science City</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Landmark (Optional)</Label>
              <Input 
                placeholder="Enter nearby landmark"
                value={location.landmark || ""}
                onChange={(e) => setLocation({...location, landmark: e.target.value})}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Pin Code</Label>
              <Input 
                type="number" 
                placeholder="Enter pin code"
                value={location.pincode || ""}
                onChange={(e) => setLocation({...location, pincode: e.target.value})}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 5: // Media & Documents
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Media & Documents</h3>
            
            <div>
              <Label>Property Images (Min 3, Max 15)</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Drag and drop images here, or click to browse</p>
                <Button variant="outline">Choose Images</Button>
              </div>
            </div>

            <div>
              <Label>Documents (Ownership papers, RERA certificate, etc.)</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Drag and drop documents here, or click to browse</p>
                <Button variant="outline">Choose Documents</Button>
              </div>
            </div>
          </div>
        );

      case 6: // Preview & Submit
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Final Preview</h3>
            
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold">{propertyType} in {location.locality}</h4>
                    <p className="text-muted-foreground">{category} • {location.city}</p>
                  </div>
                  <Badge variant="outline">Pending Approval</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Price</span>
                    <p className="font-semibold">₹{pricing.amount} {pricing.unit}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area</span>
                    <p className="font-semibold">{specifications.area || specifications.carpetArea || specifications.plotArea || specifications.landArea} {specifications.areaUnit}</p>
                  </div>
                  {specifications.bedrooms && (
                    <div>
                      <span className="text-muted-foreground">Bedrooms</span>
                      <p className="font-semibold">{specifications.bedrooms}</p>
                    </div>
                  )}
                  {specifications.bathrooms && (
                    <div>
                      <span className="text-muted-foreground">Bathrooms</span>
                      <p className="font-semibold">{specifications.bathrooms}</p>
                    </div>
                  )}
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  <span className="font-semibold">{pricing.status === "ready" ? "Ready Possession" : "Under Construction"}</span>
                  {completionDate && (
                    <span className="text-muted-foreground"> • Expected: {format(completionDate, "MMM yyyy")}</span>
                  )}
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Your property will be submitted for verification. 
                You'll receive a notification once it's approved or if any changes are required.
              </p>
            </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/broker-dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Property Manager</h1>
            </div>
            <Button
              onClick={() => setIsAddPropertyOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Property
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading properties...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load properties. Please try again.</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found. Add your first property!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Home className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
                    <Badge variant="outline" className={getStatusColor(property.status)}>
                      <span className="capitalize">{property.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="capitalize">{property.category}</span> • <span className="capitalize">{property.type.replace('_', ' ')}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {property.location && typeof property.location === 'object' && !Array.isArray(property.location)
                      ? `${(property.location as any).area || ''} ${(property.location as any).city || ''}`.trim() || 'Location not specified'
                      : 'Location not specified'
                    }
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-bold text-lg text-foreground">₹{property.price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{property.area} sq ft</p>
                    </div>
                    {property.bedrooms && (
                      <div className="text-right text-sm">
                        <p>{property.bedrooms} BHK</p>
                        <p className="text-muted-foreground">{property.bathrooms} Bath</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(property.id)}
                      disabled={deletePropertyMutation.isPending}
                    >
                      {deletePropertyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property - Step {currentStep} of 6</DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddPropertyOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              
              {currentStep === 6 ? (
                <Button 
                  onClick={handleSubmit} 
                  className="bg-primary hover:bg-primary/90"
                  disabled={createPropertyMutation.isPending}
                >
                  {createPropertyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Property'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && (!category || !propertyType)) ||
                    (currentStep === 3 && (!pricing.price)) ||
                    (currentStep === 4 && (!location.city || !location.area))
                  }
                  className="bg-primary hover:bg-primary/90"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManager;