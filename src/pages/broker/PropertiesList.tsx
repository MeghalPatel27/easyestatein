import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PropertiesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();
  
  // Fetch user's properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', user?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('user_id', user?.id!);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-700 border-green-200";
      case "sold": return "bg-blue-100 text-blue-700 border-blue-200";
      case "rented": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="h-4 w-4" />;
      case "sold": return <Archive className="h-4 w-4" />;
      case "rented": return <Clock className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getStatusCounts = () => {
    return {
      all: properties.length,
      available: properties.filter(p => p.status === "available").length,
      sold: properties.filter(p => p.status === "sold").length,
      rented: properties.filter(p => p.status === "rented").length,
    };
  };

  const counts = getStatusCounts();

  const filteredProperties = properties.filter(property => {
    if (statusFilter !== "all" && property.status !== statusFilter) return false;
    if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      const location = property.location || {};
      const city = typeof location === 'object' && location.city ? location.city : '';
      const area = typeof location === 'object' && location.area ? location.area : '';
      if (!city.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !area.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

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
          <TabsTrigger value="available" className="gap-2">
            <CheckCircle className="h-3 w-3" />
            Available ({counts.available})
          </TabsTrigger>
          <TabsTrigger value="sold" className="gap-2">
            <Archive className="h-3 w-3" />
            Sold ({counts.sold})
          </TabsTrigger>
          <TabsTrigger value="rented" className="gap-2">
            <Clock className="h-3 w-3" />
            Rented ({counts.rented})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {isLoading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <Card className="p-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all" 
                  ? "You haven't added any properties yet." 
                  : `No properties found with status "${statusFilter}".`
                }
              </p>
              <Link to="/broker/properties/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Property
                </Button>
              </Link>
            </Card>
          ) : (
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
                      <Badge className={getStatusColor(property.status)} variant="outline">
                        {getStatusIcon(property.status)}
                        <span className="ml-1 capitalize">{property.status}</span>
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
                        <span>{property.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {typeof property.location === 'object' && property.location.city 
                          ? `${property.location.area || ''}, ${property.location.city}`.trim().replace(/^,\s*/, '') 
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