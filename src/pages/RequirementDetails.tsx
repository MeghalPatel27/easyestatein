import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, DollarSign, Home, Calendar, TrendingUp, Edit, Share, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const RequirementDetails = () => {
  const navigate = useNavigate();
  const { requirementId } = useParams();

  // Fetch requirement data from database
  const { data: requirementData, isLoading, error } = useQuery({
    queryKey: ['requirement', requirementId],
    queryFn: async () => {
      if (!requirementId) throw new Error('No requirement ID provided');
      
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('id', requirementId)
        .single();

      if (error) {
        console.error('Error fetching requirement:', error);
        throw error;
      }

      return data;
    },
    enabled: !!requirementId,
  });

  // Fetch leads data for this requirement
  const { data: leadsData } = useQuery({
    queryKey: ['requirement-leads', requirementId],
    queryFn: async () => {
      if (!requirementId) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('id, status')
        .eq('requirement_id', requirementId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!requirementId,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading requirement details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !requirementData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load requirement details</p>
          <Button onClick={() => navigate('/buyer-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/buyer-dashboard')}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <img src="/lovable-uploads/f5037665-4ef9-41e4-b367-ed6a7bc46f19.png" alt="easyestate" className="h-6 w-auto" />
          <span className="text-muted-foreground">Requirement Details</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{requirementData.title}</h1>
              <div className="flex items-center space-x-3">
                <Badge className={getUrgencyColor(requirementData.urgency)}>
                  {requirementData.urgency.charAt(0).toUpperCase() + requirementData.urgency.slice(1)} Priority
                </Badge>
                <Badge variant="outline">
                  {requirementData.status.charAt(0).toUpperCase() + requirementData.status.slice(1)}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {requirementData.category}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {requirementData.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Lead Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {leadsData?.length || 0}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">Properties Received</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {leadsData?.filter(l => l.status === 'approved').length || 0}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-300 font-medium">Properties Accepted</div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {leadsData?.filter(l => l.status === 'rejected').length || 0}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-300 font-medium">Properties Rejected</div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Budget & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Budget</h3>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {requirementData.budget_min ? formatCurrency(requirementData.budget_min) : 'Not specified'}
                </div>
                <div className="text-sm text-muted-foreground">
                  to {requirementData.budget_max ? formatCurrency(requirementData.budget_max) : 'Not specified'}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Location</h3>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {(requirementData.location as any)?.area || 'Not specified'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {(requirementData.location as any)?.city || 'Not specified'}
                </div>
              </Card>
            </div>

            {/* Property Specifications */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2 text-primary" />
                Property Specifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="font-medium capitalize">{requirementData.property_type}</div>
                  </div>
                </div>
                
                {requirementData.bedrooms && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">🛏️</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Bedrooms</div>
                      <div className="font-medium">{requirementData.bedrooms} BHK</div>
                    </div>
                  </div>
                )}

                {requirementData.bathrooms && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">🚿</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Bathrooms</div>
                      <div className="font-medium">{requirementData.bathrooms}</div>
                    </div>
                  </div>
                )}

                {(requirementData.area_min || requirementData.area_max) && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">📏</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Area</div>
                      <div className="font-medium">
                        {requirementData.area_min || '0'} - {requirementData.area_max || '∞'} sq ft
                      </div>
                    </div>
                  </div>
                )}

                {requirementData.floor && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">🏢</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Floor</div>
                      <div className="font-medium capitalize">{requirementData.floor}</div>
                    </div>
                  </div>
                )}

                {requirementData.balconies && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">🪟</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Balconies</div>
                      <div className="font-medium">{requirementData.balconies}</div>
                    </div>
                  </div>
                )}

                {requirementData.min_parking && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">🅿️</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Parking</div>
                      <div className="font-medium">{requirementData.min_parking}</div>
                    </div>
                  </div>
                )}

                {requirementData.furnishing && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">🪑</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Furnishing</div>
                      <div className="font-medium capitalize">{requirementData.furnishing}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            {requirementData.description && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {requirementData.description}
                </p>
              </Card>
            )}

            {/* Amenities & Features */}
            {(requirementData.amenities?.length > 0 || requirementData.facilities?.length > 0) && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Amenities & Features</h3>
                <div className="space-y-3">
                  {requirementData.amenities?.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Amenities</div>
                      <div className="flex flex-wrap gap-2">
                        {requirementData.amenities.map((amenity: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="capitalize">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {requirementData.facilities?.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Facilities</div>
                      <div className="flex flex-wrap gap-2">
                        {requirementData.facilities.map((facility: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="capitalize">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Preferences */}
            {(requirementData.directions?.length > 0 || requirementData.financing || requirementData.dislikes?.length > 0) && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Preferences</h3>
                <div className="space-y-3">
                  {requirementData.directions?.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Preferred Directions</div>
                      <div className="flex flex-wrap gap-2">
                        {requirementData.directions.map((dir: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="capitalize">
                            {dir}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {requirementData.financing && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Financing</div>
                      <Badge variant="outline" className="capitalize">{requirementData.financing}</Badge>
                    </div>
                  )}
                  {requirementData.dislikes?.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Dislikes</div>
                      <div className="flex flex-wrap gap-2">
                        {requirementData.dislikes.map((dislike: string, idx: number) => (
                          <Badge key={idx} variant="destructive" className="capitalize">
                            {dislike}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate(`/requirement/${requirementId}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Requirement
                </Button>
                <Button variant="outline" className="w-full">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="w-full">
                  Pause Requirement
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {new Date(requirementData.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Days Active</div>
                  <div className="font-medium">
                    {Math.ceil((new Date().getTime() - new Date(requirementData.created_at).getTime()) / (1000 * 3600 * 24))} days
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Lead Price</div>
                  <div className="font-medium">
                    ₹{requirementData.lead_price || 100}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementDetails;