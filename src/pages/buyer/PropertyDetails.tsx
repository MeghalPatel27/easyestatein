import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Building, Heart, Share, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Property not found</h2>
        <Button onClick={() => navigate('/buyer/property-search')}>Back to Search</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Property Images */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="h-96 bg-muted">
            <img 
              src={property.images?.[0] || "/placeholder.svg"} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {property.images?.slice(1, 5).map((img: string, idx: number) => (
              <div key={idx} className="h-[11.5rem] bg-muted">
                <img src={img} alt={`${property.title} ${idx + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Price */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="outline">{property.property_type}</Badge>
                    <Badge variant="outline">{property.category}</Badge>
                  </div>
                  <CardTitle className="text-3xl mb-2">{property.title}</CardTitle>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {(property.location as any)?.city}, {(property.location as any)?.area}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">₹{(property.price / 10000000).toFixed(2)}Cr</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Property Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Property Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="font-semibold">{property.bedrooms} BHK</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.area && (
                  <div className="flex items-center gap-2">
                    <Maximize className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="font-semibold">{property.area} sq ft</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {property.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Broker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full gap-2">
                <Phone className="h-4 w-4" />
                Contact Now
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Visit
              </Button>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">City:</span> {(property.location as any)?.city || "N/A"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Area:</span> {(property.location as any)?.area || "N/A"}
                </p>
                {(property.location as any)?.pincode && (
                  <p className="text-sm">
                    <span className="font-semibold">Pincode:</span> {(property.location as any).pincode}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
