import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart, Share, Building, Home, MapPin, Bed, Bath, Car, Maximize } from "lucide-react";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const PropertySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [budget, setBudget] = useState("all");
  const [bhk, setBhk] = useState("all");

  // Fetch available properties from database
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['public-properties', propertyType, bhk],
    queryFn: async () => {
      let query = supabase
        .from('public_properties')
        .select('*')
        .eq('status', 'available');

      // Apply filters
      if (propertyType !== 'all') {
        query = query.eq('type', propertyType as any);
      }
      
      if (bhk !== 'all') {
        query = query.eq('bedrooms', parseInt(bhk));
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return data.map(property => ({
        id: property.id,
        title: property.title || 'Untitled Property',
        type: property.type,
        price: `₹${property.price}`,
        location: typeof property.location === 'object' && property.location && 'city' in property.location ? property.location.city as string : 'Location not specified',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        parking: 1, // Default value
        area: `${property.area} sq ft`,
        image: property.images?.[0] || "/placeholder.svg",
        broker: "Property Agent", // Will be fetched from profiles later
        featured: false,
        amenities: [] // Will be parsed from specifications
      }));
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

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = propertyType === "all" || property.type === propertyType;
    const matchesBhk = bhk === "all" || property.bedrooms.toString() === bhk;
    return matchesSearch && matchesType && matchesBhk;
  });

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
          Showing {filteredProperties.length} of {properties.length} properties
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
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading properties...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Property Image */}
              <div className="relative h-48 bg-muted">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {property.featured && (
                  <Badge className="absolute top-3 left-3 bg-primary">Featured</Badge>
                )}
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
                      const PropertyIcon = getPropertyIcon(property.type);
                      return <PropertyIcon className="w-4 h-4 text-muted-foreground" />;
                    })()}
                    <h3 className="font-semibold text-foreground">{property.title}</h3>
                  </div>
                  <p className="text-lg font-bold text-primary">{property.price}</p>
                </div>

                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.location}
                </p>

                {/* Property Specs */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  {property.bedrooms > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {property.bedrooms} BHK
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {property.parking}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize className="w-3 h-3" />
                    {property.area}
                  </span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {property.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.amenities.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Broker Info */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Listed by {property.broker}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Contact</Button>
                    <Button size="sm">View Details</Button>
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
              <h2 className="text-xl font-semibold text-foreground mb-2">No properties found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or filters to find properties that match your requirements.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setPropertyType("all");
                setBudget("all");
                setBhk("all");
              }}>
                Clear Filters
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;