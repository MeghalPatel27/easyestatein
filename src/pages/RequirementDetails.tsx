import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, DollarSign, Home, Calendar, TrendingUp, Edit, Share } from "lucide-react";

const RequirementDetails = () => {
  const navigate = useNavigate();
  const { requirementId } = useParams();

  // Mock requirement data - replace with actual API calls
  const requirementData = {
    id: requirementId,
    title: "3 BHK Apartment in Baner",
    description: "Looking for a spacious 3 BHK apartment in Baner area with modern amenities and good connectivity.",
    property_type: "apartment",
    location: { area: "Baner", city: "Pune", state: "Maharashtra" },
    budget_min: 5000000,
    budget_max: 8000000,
    area_min: 1000,
    area_max: 1500,
    bedrooms: 3,
    bathrooms: 2,
    urgency: "medium",
    status: "active",
    created_at: "2024-01-10",
    responses: 12,
    views: 45
  };

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
          <div className="text-primary font-bold text-lg">easyestate</div>
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
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{requirementData.title}</h1>
              <div className="flex items-center space-x-4">
                <Badge className={getUrgencyColor(requirementData.urgency)}>
                  {requirementData.urgency.charAt(0).toUpperCase() + requirementData.urgency.slice(1)} Priority
                </Badge>
                <Badge variant="outline">
                  {requirementData.status.charAt(0).toUpperCase() + requirementData.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{requirementData.views}</div>
                  <div className="text-muted-foreground text-sm">Views</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{requirementData.responses}</div>
                  <div className="text-muted-foreground text-sm">Responses</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {new Date(requirementData.created_at).toLocaleDateString('en-GB', { day: 'numeric' })}
                  </div>
                  <div className="text-muted-foreground text-sm">Days Active</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {requirementData.description}
              </p>
            </Card>

            {/* Property Requirements */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Property Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Property Type</div>
                  <div className="text-foreground capitalize">{requirementData.property_type}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Bedrooms</div>
                  <div className="text-foreground">{requirementData.bedrooms} BHK</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Bathrooms</div>
                  <div className="text-foreground">{requirementData.bathrooms}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Area Range</div>
                  <div className="text-foreground">
                    {requirementData.area_min} - {requirementData.area_max} sq ft
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Budget */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Budget Range
              </h3>
              <div className="text-2xl font-bold text-foreground mb-2">
                {formatCurrency(requirementData.budget_min)} - {formatCurrency(requirementData.budget_max)}
              </div>
              <div className="text-sm text-muted-foreground">
                ₹{Math.round((requirementData.budget_min + requirementData.budget_max) / 2 / 100000)} Lakhs average
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h3>
              <div className="space-y-2">
                <div className="text-foreground font-medium">{requirementData.location.area}</div>
                <div className="text-muted-foreground">{requirementData.location.city}, {requirementData.location.state}</div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate(`/requirement/${requirementId}/analytics`)}>
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/requirement/${requirementId}/edit`)}>
                  Edit Requirement
                </Button>
                <Button variant="outline" className="w-full">
                  Pause Requirement
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementDetails;