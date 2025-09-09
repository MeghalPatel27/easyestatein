import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, Send, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Coin } from "@/components/ui/coin";
import { EnhancedSearch } from "@/components/ui/enhanced-search";

const LeadsListing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Mock data for all leads (updated with varied ratings for color testing)
  const allLeads = [
    {
      id: 1,
      name: "Rajesh Kumar",
      rating: 4.8,
      category: "Residential",
      propertyType: "Apartment",
      area: "Mumbai Central",
      budget: "₹2.5-3.5 Cr",
      urgency: "High",
      rejectionRate: 5,
      leadPrice: 50,
      unlocked: true
    },
    {
      id: 2,
      name: "Priya Sharma",
      rating: 4.0,
      category: "Commercial",
      propertyType: "Office Space",
      area: "BKC",
      budget: "₹5-8 Cr",
      urgency: "Medium",
      rejectionRate: 20,
      leadPrice: 75,
      unlocked: true
    },
    {
      id: 3,
      name: "Amit Patel",
      rating: 3.0,
      category: "Residential",
      propertyType: "Villa",
      area: "Andheri West",
      budget: "₹1.2-2 Cr",
      urgency: "High",
      rejectionRate: 60,
      leadPrice: 40,
      unlocked: false
    },
    {
      id: 4,
      name: "Sunita Gupta",
      rating: 2.25,
      category: "Residential",
      propertyType: "Bungalow",
      area: "Lonavala",
      budget: "₹3-5 Cr",
      urgency: "Low",
      rejectionRate: 80,
      leadPrice: 60,
      unlocked: true
    },
    {
      id: 5,
      name: "Rohit Mehta",
      rating: 4.3,
      category: "Commercial",
      propertyType: "Warehouse",
      area: "Lower Parel",
      budget: "₹10-15 Cr",
      urgency: "High",
      rejectionRate: 15,
      leadPrice: 100,
      unlocked: false
    },
    {
      id: 6,
      name: "Anita Shah",
      rating: 3.5,
      category: "Residential",
      propertyType: "Penthouse",
      area: "Bandra West",
      budget: "₹4-6 Cr",
      urgency: "Medium",
      rejectionRate: 35,
      leadPrice: 65,
      unlocked: true
    },
    {
      id: 7,
      name: "Vikas Agarwal",
      rating: 4.2,
      category: "Commercial",
      propertyType: "Office",
      area: "Worli",
      budget: "₹8-12 Cr",
      urgency: "High",
      rejectionRate: 25,
      leadPrice: 85,
      unlocked: false
    },
    {
      id: 8,
      name: "Kavya Reddy",
      rating: 2.8,
      category: "Commercial",
      propertyType: "Retail",
      area: "Linking Road",
      budget: "₹1.5-2.5 Cr",
      urgency: "Low",
      rejectionRate: 70,
      leadPrice: 35,
      unlocked: true
    }
  ];

  const maskName = (name: string, unlocked: boolean) => {
    if (unlocked) return name;
    const firstTwo = name.slice(0, 2);
    const lastTwo = name.slice(-2);
    const middle = "*".repeat(Math.max(0, name.length - 4));
    return firstTwo + middle + lastTwo;
  };

  const RadialProgress = ({ value, size = 48, strokeWidth = 6, className = "" }: {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    // Determine color based on score with specified colors
    const getScoreColor = (score: number) => {
      if (score >= 85) return "#60d394"; // Green
      if (score >= 70) return "#ffd97d"; // Yellow
      if (score >= 50) return "#ff9b85"; // Orange
      return "#ee6055"; // Red
    };

    const color = getScoreColor(value);

    return (
      <div className={`relative ${className}`}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
        </div>
      </div>
    );
  };

  const filteredLeads = allLeads.filter(lead => {
    if (filterType !== "all" && lead.category.toLowerCase() !== filterType) return false;
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
          <div className="flex-1">
            <EnhancedSearch
              placeholder="Search by area, type..."
              value={searchQuery}
              onChange={setSearchQuery}
              searchKey="leads-listing"
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

      {/* Leads Listing */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">All Qualified Leads ({filteredLeads.length})</h2>
        </div>
        
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 md:p-6 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
            >
              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <RadialProgress 
                      value={Math.round(lead.rating * 20)} 
                      size={48} 
                      className="text-primary"
                    />
                    <div>
                      <div className="font-semibold text-foreground">
                        {maskName(lead.name, lead.unlocked)}
                      </div>
                      {!lead.unlocked && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RadialProgress 
                      value={100 - lead.rejectionRate} 
                      size={48} 
                      className="text-emerald-500"
                    />
                    <span className="text-xs text-muted-foreground">Acceptance</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Category</div>
                    <div className="text-sm font-medium text-foreground">{lead.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="text-sm font-medium text-foreground">{lead.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm font-medium text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lead.area}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Priority</div>
                    <Badge 
                      variant={lead.urgency === "High" ? "destructive" : lead.urgency === "Medium" ? "secondary" : "outline"}
                      className={`text-xs ${
                        lead.urgency === "High" 
                          ? "bg-green-500 text-white hover:bg-green-600" 
                          : lead.urgency === "Medium" 
                          ? "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500" 
                          : "bg-red-500 text-white hover:bg-red-600 border-red-500"
                      }`}
                    >
                      {lead.urgency}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Budget</div>
                    <div className="text-sm font-semibold text-primary">{lead.budget}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-center mb-2">
                      <Coin value={lead.leadPrice} size="sm" />
                    </div>
                    <Link to={`/broker/leads/${lead.id}`}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs gap-1">
                        <Send className="h-3 w-3" />
                        Submit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center gap-4 lg:gap-6 overflow-x-auto">
                {/* Overall Score */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-muted-foreground mb-1">Score</span>
                  <RadialProgress 
                    value={Math.round(lead.rating * 20)} 
                    size={56} 
                    className="text-primary"
                  />
                </div>

                {/* Name */}
                <div className="min-w-[120px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Name</div>
                  <div className="font-semibold text-foreground">
                    {maskName(lead.name, lead.unlocked)}
                  </div>
                  {!lead.unlocked && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Locked
                    </Badge>
                  )}
                </div>

                {/* Category */}
                <div className="min-w-[100px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <div className="text-sm font-medium text-foreground">{lead.category}</div>
                </div>

                {/* Property Type */}
                <div className="min-w-[100px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Type</div>
                  <div className="text-sm font-medium text-foreground">{lead.propertyType}</div>
                </div>

                {/* Area */}
                <div className="min-w-[120px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Location</div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <div className="text-sm font-medium text-foreground">{lead.area}</div>
                  </div>
                </div>

                {/* Budget */}
                <div className="min-w-[120px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Budget</div>
                  <div className="text-sm font-semibold text-primary">{lead.budget}</div>
                </div>

                {/* Urgency */}
                <div className="min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Priority</div>
                  <Badge 
                    variant={lead.urgency === "High" ? "default" : "outline"}
                    className={`text-xs ${
                      lead.urgency === "High" 
                        ? "bg-green-500 text-white hover:bg-green-600" 
                        : lead.urgency === "Medium" 
                        ? "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500" 
                        : "bg-red-500 text-white hover:bg-red-600 border-red-500"
                    }`}
                  >
                    {lead.urgency}
                  </Badge>
                </div>

                {/* Acceptance Rate */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-muted-foreground mb-1">Acceptance Rate</span>
                  <RadialProgress 
                    value={100 - lead.rejectionRate} 
                    size={56} 
                    className="text-emerald-500"
                  />
                </div>

                {/* Action & Price */}
                <div className="flex items-center gap-4 min-w-[240px] flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">Cost</span>
                    <Coin value={lead.leadPrice} size="sm" />
                  </div>
                  <Link to={`/broker/leads/${lead.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1">
                      <Send className="h-3 w-3" />
                      Submit Property
                    </Button>
                  </Link>
                </div>
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