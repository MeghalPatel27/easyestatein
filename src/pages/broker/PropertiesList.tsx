import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PropertyApprovalNotifications from "@/components/PropertyApprovalNotifications";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Copy, 
  Eye, 
  MoreHorizontal,
  Building,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  List
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PropertiesList = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch properties for the current broker
  const { data: properties = [], isLoading, refetch, error } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_approvals (
            id,
            status,
            approved_at,
            approved_by
          )
        `)
        .eq('broker_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Properties query error:', error);
        throw error;
      }
      
      console.log('Properties data:', data);
      console.log('User ID:', user.id);
      console.log('Total properties found:', data?.length || 0);
      
      return data || [];
    },
    enabled: !!user?.id,
    retry: 3,
  });

  const updatePropertyStatus = async (propertyId: string, newStatus: 'active' | 'sold' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ user_status: newStatus })
        .eq('id', propertyId)
        .eq('broker_id', user?.id);

      if (error) throw error;
      
      // Refetch properties to update the UI
      refetch();
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-200";
      case "sold": return "bg-blue-100 text-blue-700 border-blue-200";
      case "inactive": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4" />;
      case "sold": return <Archive className="h-4 w-4" />;
      case "inactive": return <Clock className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getStatusCounts = () => {
    return {
      all: properties.length,
      active: properties.filter(p => p.user_status === "active").length,
      sold: properties.filter(p => p.user_status === "sold").length,
      inactive: properties.filter(p => p.user_status === "inactive").length,
    };
  };

  const counts = getStatusCounts();

  const filteredProperties = properties.filter(property => {
    if (statusFilter !== "all" && property.user_status !== statusFilter) return false;
    if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      const location = property.location;
      if (location && typeof location === 'object') {
        const city = ('city' in location) ? location.city as string : '';
        const area = ('area' in location) ? location.area as string : '';
        if (!city.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !area.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Property Management</h1>
          <Link to="/broker/properties/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Property
            </Button>
          </Link>
        </div>
        
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Property Management</h1>
        <Link to="/broker/properties/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>

      {/* Property Approval Notifications */}
      <PropertyApprovalNotifications />

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <EnhancedSearch
              placeholder="Search properties..."
              value={searchQuery}
              onChange={setSearchQuery}
              searchKey="properties-list"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="gap-2">
            <List className="h-3 w-3" />
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <CheckCircle className="h-3 w-3" />
            Active ({counts.active})
          </TabsTrigger>
          <TabsTrigger value="sold" className="gap-2">
            <Archive className="h-3 w-3" />
            Sold ({counts.sold})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="gap-2">
            <Clock className="h-3 w-3" />
            Inactive ({counts.inactive})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {error && (
            <Card className="p-8 text-center border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold mb-2 text-red-700">Error Loading Properties</h3>
              <p className="text-red-600 mb-4">
                {error.message || 'Unable to load properties. Please try again.'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </Card>
          )}
          
          {!error && filteredProperties.length === 0 && !isLoading ? (
            <Card className="p-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {properties.length === 0 ? 'No Properties Found' : `No ${statusFilter === 'all' ? '' : statusFilter} Properties`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {properties.length === 0 
                  ? "You haven't added any properties yet." 
                  : `No properties found with status "${statusFilter}". Total properties: ${properties.length}`
                }
              </p>
              {properties.length === 0 && (
                <Link to="/broker/properties/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Property
                  </Button>
                </Link>
              )}
              {properties.length > 0 && (
                <Button onClick={() => setStatusFilter("all")} variant="outline">
                  View All Properties
                </Button>
              )}
            </Card>
          ) : !error && (
            /* Properties Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {/* Property Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className={getStatusColor(property.user_status)} variant="outline">
                        {getStatusIcon(property.user_status)}
                        <span className="ml-1 capitalize">{property.user_status}</span>
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="bg-white/80 hover:bg-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Property
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updatePropertyStatus(property.id, 'active')}
                            className={property.user_status === 'active' ? 'bg-green-50' : ''}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Active
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updatePropertyStatus(property.id, 'sold')}
                            className={property.user_status === 'sold' ? 'bg-blue-50' : ''}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Mark as Sold
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updatePropertyStatus(property.id, 'inactive')}
                            className={property.user_status === 'inactive' ? 'bg-gray-50' : ''}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Mark as Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {property.images?.length || 0} photos
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{property.category}</span>
                        <span>•</span>
                        <span>{property.property_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {property.location && typeof property.location === 'object' && 
                         'area' in property.location && 'city' in property.location
                          ? `${(property.location as any).area}, ${(property.location as any).city}`
                          : 'Location not specified'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-primary text-lg">
                          ₹{property.price ? (property.price / 10000000).toFixed(2) : '0'} Cr
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {property.area} sq ft
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {new Date(property.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 pb-4">
                    <div className="flex gap-2">
                      <Link to={`/broker/properties/${property.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </Link>
                      <Button variant="outline" className="gap-2">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertiesList;