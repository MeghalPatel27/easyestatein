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
import { ArrowLeft, Plus, Home, Building, Factory, Wheat, CalendarIcon, Upload, Eye, Edit, Trash2, Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state with validation
  const [category, setCategory] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [specifications, setSpecifications] = useState<any>({});
  const [pricing, setPricing] = useState<any>({});
  const [location, setLocation] = useState<any>({});
  const [media, setMedia] = useState<any>({});
  const [completionDate, setCompletionDate] = useState<Date>();

  // Form validation errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth error:', error);
          navigate('/auth');
          return;
        }
        
        if (!session?.user) {
          navigate('/auth');
          return;
        }
        
        setUser(session.user);
        toast.success(`Welcome back, ${session.user.email}!`);
      } catch (error) {
        console.error('Authentication check failed:', error);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Input validation functions
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'title':
        if (!value?.trim()) return "Title is required";
        if (value.length > 200) return "Title is too long";
        return "";
      case 'price':
        if (!value || isNaN(value) || value <= 0) return "Valid price is required";
        if (value > 999999999) return "Price is too high";
        return "";
      case 'area':
        if (!value || isNaN(value) || value <= 0) return "Valid area is required";
        if (value > 999999) return "Area is too large";
        return "";
      case 'bedrooms':
        if (value && (isNaN(value) || value < 0 || value > 50)) return "Invalid number of bedrooms";
        return "";
      case 'bathrooms':
        if (value && (isNaN(value) || value < 0 || value > 50)) return "Invalid number of bathrooms";
        return "";
      case 'description':
        if (value && value.length > 2000) return "Description is too long";
        return "";
      default:
        return "";
    }
  };

  const sanitizeInput = (input: string): string => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                .trim();
  };

  // Fetch properties from Supabase
  const { data: properties = [], isLoading: propertiesLoading, error } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      const titleError = validateField('title', propertyData.title);
      const priceError = validateField('price', propertyData.price);
      const areaError = validateField('area', propertyData.area);

      if (titleError || priceError || areaError) {
        throw new Error('Please fix validation errors before submitting');
      }

      // Sanitize string inputs
      const sanitizedData = {
        ...propertyData,
        title: sanitizeInput(propertyData.title || ''),
        description: propertyData.description ? sanitizeInput(propertyData.description) : null,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('properties')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (newProperty) => {
      toast.success("Property added successfully!");
      queryClient.invalidateQueries({ queryKey: ['properties', user?.id] });
      setIsAddPropertyOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Property creation failed:', error);
      toast.error("Failed to add property: " + (error.message || 'Unknown error'));
    }
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user.id); // Ensure user can only delete their own properties

      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }

      return propertyId;
    },
    onSuccess: () => {
      toast.success("Property deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['properties', user?.id] });
    },
    onError: (error: any) => {
      console.error('Property deletion failed:', error);
      toast.error("Failed to delete property: " + (error.message || 'Unknown error'));
    }
  });

  // Sign out function
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error("Failed to sign out");
      } else {
        toast.success("Signed out successfully");
        navigate('/');
      }
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error("Failed to sign out");
    }
  };

  // Category to types mapping
  const categoryTypes = {
    residential: ['apartment', 'villa', 'house', 'penthouse', 'studio'],
    commercial: ['office', 'retail', 'warehouse', 'showroom', 'restaurant'],
    industrial: ['factory', 'manufacturing', 'storage', 'processing'],
    agricultural: ['farmland', 'orchard', 'greenhouse', 'plantation']
  };

  // Reset form function
  const resetForm = () => {
    setCategory("");
    setPropertyType("");
    setTitle("");
    setDescription("");
    setSpecifications({});
    setPricing({});
    setLocation({});
    setMedia({});
    setCompletionDate(undefined);
    setCurrentStep(1);
    setFormErrors({});
  };

  // Step navigation
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

  // Form submission
  const handleSubmit = () => {
    const propertyData = {
      category,
      type: propertyType,
      title: sanitizeInput(title),
      description: description ? sanitizeInput(description) : null,
      specifications: specifications || {},
      location: location || {},
      price: parseFloat(pricing.price) || 0,
      area: parseFloat(pricing.area) || 0,
      bedrooms: pricing.bedrooms ? parseInt(pricing.bedrooms) : null,
      bathrooms: pricing.bathrooms ? parseInt(pricing.bathrooms) : null,
      images: media.images || [],
      documents: media.documents || [],
      completion_date: completionDate ? format(completionDate, 'yyyy-MM-dd') : null,
      status: 'available'
    };

    // Validate all fields
    const errors: {[key: string]: string} = {};
    errors.title = validateField('title', propertyData.title);
    errors.price = validateField('price', propertyData.price);
    errors.area = validateField('area', propertyData.area);
    errors.bedrooms = validateField('bedrooms', propertyData.bedrooms);
    errors.bathrooms = validateField('bathrooms', propertyData.bathrooms);
    errors.description = validateField('description', propertyData.description);

    const hasErrors = Object.values(errors).some(error => error !== "");
    setFormErrors(errors);

    if (hasErrors) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    createPropertyMutation.mutate(propertyData);
  };

  // Delete handler
  const handleDelete = (propertyId: string) => {
    if (confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'residential': return <Home className="w-4 h-4" />;
      case 'commercial': return <Building className="w-4 h-4" />;
      case 'industrial': return <Factory className="w-4 h-4" />;
      case 'agricultural': return <Wheat className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-status-connected text-white';
      case 'sold': return 'bg-status-high text-white';
      case 'rented': return 'bg-status-medium text-white';
      case 'under_offer': return 'bg-status-sent text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-easyestate-pink" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null;
  }

  // Render step content for add property form
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Property Category & Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(value) => {
                    setCategory(value);
                    setPropertyType("");
                  }}>
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
                <div>
                  <Label htmlFor="type">Property Type *</Label>
                  <Select value={propertyType} onValueChange={setPropertyType} disabled={!category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {category && categoryTypes[category as keyof typeof categoryTypes]?.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  const error = validateField('title', newTitle);
                  setFormErrors(prev => ({...prev, title: error}));
                }}
                placeholder="Enter property title"
                maxLength={200}
                className={formErrors.title ? "border-destructive" : ""}
              />
              {formErrors.title && <p className="text-sm text-destructive mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  const newDesc = e.target.value;
                  setDescription(newDesc);
                  const error = validateField('description', newDesc);
                  setFormErrors(prev => ({...prev, description: error}));
                }}
                placeholder="Enter property description"
                rows={4}
                maxLength={2000}
                className={formErrors.description ? "border-destructive" : ""}
              />
              {formErrors.description && <p className="text-sm text-destructive mt-1">{formErrors.description}</p>}
              <p className="text-sm text-text-secondary mt-1">{description.length}/2000 characters</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Property Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category === 'residential' && (
                <>
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      max="50"
                      value={specifications.bedrooms || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSpecifications({...specifications, bedrooms: value});
                        const error = validateField('bedrooms', parseInt(value));
                        setFormErrors(prev => ({...prev, bedrooms: error}));
                      }}
                      placeholder="Number of bedrooms"
                      className={formErrors.bedrooms ? "border-destructive" : ""}
                    />
                    {formErrors.bedrooms && <p className="text-sm text-destructive mt-1">{formErrors.bedrooms}</p>}
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      max="50"
                      value={specifications.bathrooms || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSpecifications({...specifications, bathrooms: value});
                        const error = validateField('bathrooms', parseInt(value));
                        setFormErrors(prev => ({...prev, bathrooms: error}));
                      }}
                      placeholder="Number of bathrooms"
                      className={formErrors.bathrooms ? "border-destructive" : ""}
                    />
                    {formErrors.bathrooms && <p className="text-sm text-destructive mt-1">{formErrors.bathrooms}</p>}
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="furnishing">Furnishing Status</Label>
                <Select value={specifications.furnishing || ""} onValueChange={(value) => 
                  setSpecifications({...specifications, furnishing: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                    <SelectItem value="fully-furnished">Fully Furnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Pricing & Area</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  max="999999999"
                  value={pricing.price || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPricing({...pricing, price: value});
                    const error = validateField('price', parseFloat(value));
                    setFormErrors(prev => ({...prev, price: error}));
                  }}
                  placeholder="Enter price"
                  className={formErrors.price ? "border-destructive" : ""}
                />
                {formErrors.price && <p className="text-sm text-destructive mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <Label htmlFor="area">Area (sq ft) *</Label>
                <Input
                  id="area"
                  type="number"
                  min="0"
                  max="999999"
                  value={pricing.area || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPricing({...pricing, area: value});
                    const error = validateField('area', parseFloat(value));
                    setFormErrors(prev => ({...prev, area: error}));
                  }}
                  placeholder="Enter area in sq ft"
                  className={formErrors.area ? "border-destructive" : ""}
                />
                {formErrors.area && <p className="text-sm text-destructive mt-1">{formErrors.area}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area-location">Area/Locality</Label>
                <Input
                  id="area-location"
                  value={location.area || ""}
                  onChange={(e) => setLocation({...location, area: sanitizeInput(e.target.value)})}
                  placeholder="Enter area or locality"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={location.city || ""}
                  onChange={(e) => setLocation({...location, city: sanitizeInput(e.target.value)})}
                  placeholder="Enter city"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={location.state || ""}
                  onChange={(e) => setLocation({...location, state: sanitizeInput(e.target.value)})}
                  placeholder="Enter state"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={location.pincode || ""}
                  onChange={(e) => setLocation({...location, pincode: sanitizeInput(e.target.value)})}
                  placeholder="Enter pincode"
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Media & Documents</h3>
            <div className="space-y-4">
              <div>
                <Label>Property Images</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-text-secondary mb-4" />
                  <p className="text-text-secondary">Image upload functionality would be implemented with Supabase Storage</p>
                  <p className="text-sm text-text-light mt-2">Drag and drop images or click to select</p>
                </div>
              </div>
              <div>
                <Label>Documents</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-text-secondary mb-4" />
                  <p className="text-text-secondary">Document upload functionality would be implemented with Supabase Storage</p>
                  <p className="text-sm text-text-light mt-2">Upload property documents, certificates, etc.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Additional Details</h3>
            <div>
              <Label htmlFor="completion-date">Completion Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !completionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {completionDate ? format(completionDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={completionDate}
                    onSelect={setCompletionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Property Summary */}
            <div className="bg-bg-section p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Property Summary</h4>
              <div className="space-y-2 text-sm text-text-secondary">
                <p><span className="font-medium">Category:</span> {category || 'Not selected'}</p>
                <p><span className="font-medium">Type:</span> {propertyType || 'Not selected'}</p>
                <p><span className="font-medium">Title:</span> {title || 'Not entered'}</p>
                <p><span className="font-medium">Price:</span> ₹{pricing.price ? parseFloat(pricing.price).toLocaleString() : 'Not entered'}</p>
                <p><span className="font-medium">Area:</span> {pricing.area || 'Not entered'} sq ft</p>
                {location.area && <p><span className="font-medium">Location:</span> {location.area}, {location.city}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-light">
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
              <span>Back</span>
            </Button>
            <img src="/lovable-uploads/f5037665-4ef9-41e4-b367-ed6a7bc46f19.png" alt="easyestate" className="h-7 w-auto" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-text-secondary">Welcome, {user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Property Manager</h1>
            <p className="text-text-secondary mt-1">Manage your property listings</p>
          </div>
          <Button 
            onClick={() => setIsAddPropertyOpen(true)}
            className="bg-easyestate-pink hover:bg-easyestate-pink-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Property
          </Button>
        </div>

        {/* Properties Grid */}
        {propertiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-easyestate-pink" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load properties. Please try again.</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No properties yet</h3>
            <p className="text-text-secondary mb-4">Create your first property listing to get started</p>
            <Button 
              onClick={() => setIsAddPropertyOpen(true)}
              className="bg-easyestate-pink hover:bg-easyestate-pink-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(property.category)}
                      <Badge variant="secondary" className="capitalize">
                        {property.category}
                      </Badge>
                    </div>
                    <Badge className={getStatusColor(property.status)} variant="secondary">
                      {property.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                    {property.title}
                  </h3>

                  {property.description && (
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Price:</span>
                      <span className="font-semibold text-text-primary">₹{property.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Area:</span>
                      <span className="font-semibold text-text-primary">{property.area} sq ft</span>
                    </div>
                    {property.bedrooms && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Bedrooms:</span>
                        <span className="font-semibold text-text-primary">{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Bathrooms:</span>
                        <span className="font-semibold text-text-primary">{property.bathrooms}</span>
                      </div>
                    )}
                    {property.location && typeof property.location === 'object' && (property.location as any)?.area && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Location:</span>
                        <span className="font-semibold text-text-primary">{(property.location as any).area}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(property.id)}
                      className="text-destructive hover:text-destructive"
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

        {/* Add Property Dialog */}
        <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Property - Step {currentStep} of 6</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              {/* Progress indicator */}
              <div className="flex justify-between mb-8">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                      currentStep >= step
                        ? "bg-easyestate-pink text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {/* Step content */}
              {renderStepContent()}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                <div className="flex space-x-2">
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
                      disabled={!category || !propertyType || !title || createPropertyMutation.isPending}
                      className="bg-easyestate-pink hover:bg-easyestate-pink-dark"
                    >
                      {createPropertyMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Property"
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextStep}
                      disabled={currentStep === 1 && (!category || !propertyType || !title)}
                      className="bg-easyestate-pink hover:bg-easyestate-pink-dark"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PropertyManager;