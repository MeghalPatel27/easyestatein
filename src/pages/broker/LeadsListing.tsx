import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, Send, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

const LeadsListing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Mock data for all leads
  const allLeads = [
    {
      id: 1,
      rating: 4.8,
      type: "Residential",
      area: "Mumbai Central",
      budget: "₹2.5-3.5 Cr",
      urgency: "High",
      rejectionRate: 15,
      leadPrice: 50,
      verified: true,
      trending: "up"
    },
    {
      id: 2,
      rating: 4.6,
      type: "Commercial",
      area: "BKC",
      budget: "₹5-8 Cr",
      urgency: "Medium",
      rejectionRate: 8,
      leadPrice: 75,
      verified: true,
      trending: "up"
    },
    {
      id: 3,
      rating: 4.4,
      type: "Residential",
      area: "Andheri West",
      budget: "₹1.2-2 Cr",
      urgency: "High",
      rejectionRate: 12,
      leadPrice: 40,
      verified: false,
      trending: "stable"
    },
    {
      id: 4,
      rating: 4.7,
      type: "Villa",
      area: "Lonavala",
      budget: "₹3-5 Cr",
      urgency: "Low",
      rejectionRate: 20,
      leadPrice: 60,
      verified: true,
      trending: "down"
    },
    {
      id: 5,
      rating: 4.5,
      type: "Commercial",
      area: "Lower Parel",
      budget: "₹10-15 Cr",
      urgency: "High",
      rejectionRate: 5,
      leadPrice: 100,
      verified: true,
      trending: "up"
    },
    {
      id: 6,
      rating: 4.3,
      type: "Residential",
      area: "Bandra West",
      budget: "₹4-6 Cr",
      urgency: "Medium",
      rejectionRate: 18,
      leadPrice: 65,
      verified: true,
      trending: "stable"
    },
    {
      id: 7,
      rating: 4.2,
      type: "Office",
      area: "Worli",
      budget: "₹8-12 Cr",
      urgency: "High",
      rejectionRate: 10,
      leadPrice: 85,
      verified: false,
      trending: "up"
    },
    {
      id: 8,
      rating: 4.1,
      type: "Retail",
      area: "Linking Road",
      budget: "₹1.5-2.5 Cr",
      urgency: "Low",
      rejectionRate: 25,
      leadPrice: 35,
      verified: true,
      trending: "down"
    }
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "border-emerald-500 bg-emerald-50";
    if (rating >= 4.0) return "border-blue-500 bg-blue-50";
    return "border-orange-500 bg-orange-50";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRejectionRateColor = (rate: number) => {
    if (rate <= 10) return "text-green-600";
    if (rate <= 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendingIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const filteredLeads = allLeads.filter(lead => {
    if (filterType !== "all" && lead.type.toLowerCase() !== filterType) return false;
    if (searchQuery && !lead.area.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">All Qualified Leads</h1>
        <div className="flex gap-2">
          <Link to="/broker/leads-bank">
            <Button variant="outline">Leads Bank</Button>
          </Link>
          <Link to="/broker/sent-leads">
            <Button variant="outline">Sent Leads</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by area, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="budget">Sort by Budget</SelectItem>
                <SelectItem value="urgency">Sort by Urgency</SelectItem>
                <SelectItem value="rejection">Sort by Rejection Rate</SelectItem>
                <SelectItem value="price">Sort by Lead Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Leads Table Header */}
      <Card className="p-6">
        <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-muted-foreground border-b pb-3 mb-4">
          <div className="col-span-1">Rating</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Area</div>
          <div className="col-span-2">Budget</div>
          <div className="col-span-1">Urgency</div>
          <div className="col-span-1">Rejection Rate</div>
          <div className="col-span-2">Lead Price (Coins)</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* Leads List */}
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border-2 transition-all hover:shadow-md hover:bg-accent/50 cursor-pointer ${getRatingColor(lead.rating)}`}
            >
              {/* Rating */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{lead.rating}</span>
                  {getTrendingIcon(lead.trending)}
                </div>
              </div>

              {/* Type */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{lead.type}</span>
                  {lead.verified && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Area */}
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{lead.area}</span>
                </div>
              </div>

              {/* Budget */}
              <div className="col-span-2">
                <span className="font-semibold text-primary">{lead.budget}</span>
              </div>

              {/* Urgency */}
              <div className="col-span-1">
                <Badge className={getUrgencyColor(lead.urgency)} variant="outline">
                  {lead.urgency}
                </Badge>
              </div>

              {/* Rejection Rate */}
              <div className="col-span-1">
                <span className={`font-semibold ${getRejectionRateColor(lead.rejectionRate)}`}>
                  {lead.rejectionRate}%
                </span>
              </div>

              {/* Lead Price */}
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-orange-600">{lead.leadPrice}</span>
                  <span className="text-sm text-muted-foreground">coins</span>
                </div>
              </div>

              {/* Action */}
              <div className="col-span-1">
                <Link to={`/broker/leads/${lead.id}`}>
                  <Button size="sm" className="gap-1">
                    <Send className="h-3 w-3" />
                    Submit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <Button variant="outline">Load More Leads</Button>
        </div>
      </Card>
    </div>
  );
};

export default LeadsListing;