import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart, Share, Building, Home, MapPin, Bed, Bath, Car, Maximize, Plus, Calendar, Compass, Layers, Building2, Home as HomeIcon, DoorOpen, Grid3x3 } from "lucide-react";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Property {
  id: string;
  title: string;
  property_type: string;
  category: string;
  price: number;
  location: any;
  bedrooms: number;
  bathrooms: number;
  area: number;
  super_builtup: number;
  number_of_halls: number;
  number_of_balconies: number;
  floor: string;
  directions: string[];
  completion_date: string;
  images: string[];
  amenities: string[];
  broker_id: string;
  status: string;
  match_score?: number;
}

const PropertySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [budget, setBudget] = useState("all");
  const [bhk, setBhk] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch all approved properties from the properties table
  const { data: allProperties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['approved-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .not('approval_id', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case "apartment":
        return Building;
      case "villa":
        return Home;
      case "office":
        return Building;
      default:
        return Building;
    }
  };

  const filteredProperties = allProperties.filter((property: Property) => {
    const matchesSearch = property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location?.area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = propertyType === "all" || property.property_type === propertyType;
    const matchesBhk = bhk === "all" || property.bedrooms?.toString() === bhk;
    return matchesSearch && matchesType && matchesBhk;
  });

  const isLoading = propertiesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Property Search</h1>
        <p className="text-muted-foreground">Discover properties that match your requirements</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <EnhancedSearch
            placeholder="Search by location, property name..."
            value={searchQuery}
            onChange={setSearchQuery}
            searchKey="property-search"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={bhk} onValueChange={setBhk}>
              <SelectTrigger>
                <SelectValue placeholder="BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All BHK</SelectItem>
                <SelectItem value="1">1 BHK</SelectItem>
                <SelectItem value="2">2 BHK</SelectItem>
                <SelectItem value="3">3 BHK</SelectItem>
                <SelectItem value="4">4+ BHK</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="under-50l">Under ₹50L</SelectItem>
                <SelectItem value="50l-1cr">₹50L - ₹1Cr</SelectItem>
                <SelectItem value="1cr-2cr">₹1Cr - ₹2Cr</SelectItem>
                <SelectItem value="above-2cr">Above ₹2Cr</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {isLoading ? "Loading..." : `Showing ${filteredProperties.length} matching properties`}
        </p>
        <Select defaultValue="relevance">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="area">Area</SelectItem>
            <SelectItem value="recent">Recently Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </div>
            </Card>
          ))
        ) : filteredProperties.length > 0 ? (
          filteredProperties.map((property: Property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Property Image */}
              <div className="relative h-48 bg-muted">
                <img 
                  src={property.images?.[0] || "/placeholder.svg"} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const PropertyIcon = getPropertyIcon(property.property_type);
                      return <PropertyIcon className="w-4 h-4 text-muted-foreground" />;
                    })()}
                    <h3 className="font-semibold text-foreground">{property.title}</h3>
                  </div>
                  <p className="text-lg font-bold text-primary">₹{(property.price / 10000000).toFixed(1)}Cr</p>
                </div>

                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.location?.city || property.location?.area || "Location not specified"}
                </p>

                {/* Property Specs - Comprehensive Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
                  {property.bedrooms && (
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{property.bedrooms} Bedroom{property.bedrooms > 1 ? 's' : ''}</span>
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
                    </span>
                  )}
                  {property.number_of_balconies && (
                    <span className="flex items-center gap-1.5">
                      <DoorOpen className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{property.number_of_balconies} Balcon{property.number_of_balconies > 1 ? 'ies' : 'y'}</span>
                    </span>
                  )}
                  {property.number_of_halls && (
                    <span className="flex items-center gap-1.5">
                      <Grid3x3 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{property.number_of_halls} Hall{property.number_of_halls > 1 ? 's' : ''}</span>
                    </span>
                  )}
                  {property.area && (
                    <span className="flex items-center gap-1.5">
                      <Maximize className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{property.area} sq.ft</span>
                    </span>
                  )}
                  {property.super_builtup && (
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{property.super_builtup} sq.ft Super</span>
                    </span>
                  )}
                  {property.floor && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">Floor {property.floor}</span>
                    </span>
                  )}
                  {property.directions && property.directions.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{property.directions.join(', ')}</span>
                    </span>
                  )}
                  {property.category && (
                    <span className="flex items-center gap-1.5">
                      <HomeIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate capitalize">{property.category}</span>
                    </span>
                  )}
                  {property.completion_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{property.completion_date}</span>
                    </span>
                  )}
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {property.amenities?.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities && property.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.amenities.length - 3} more
                    </Badge>
                  )}
                </div>


                {/* Actions */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Listed by broker
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Contact</Button>
                    <Button size="sm" onClick={() => navigate(`/buyer/property/${property.id}`)}>View Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-lg flex items-center justify-center">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No matching properties found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                No properties match your current requirements and filters. Try adjusting your search criteria or posting a new requirement.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setPropertyType("all");
                  setBudget("all");
                  setBhk("all");
                }}>
                  Clear Filters
                </Button>
                <Button onClick={() => navigate('/buyer/requirements/new')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Post New Requirement
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;