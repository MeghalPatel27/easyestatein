import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, Send, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Coin } from "@/components/ui/coin";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LeadsListing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const { user } = useAuth();

  // Fetch all active leads
  const { data: allLeads = [], isLoading } = useQuery({
    queryKey: ['all-leads', filterType, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          buyer:profiles(display_name)
        `)
        .eq('status', 'active');

      if (filterType !== 'all') {
        query = query.eq('category', filterType);
      }

      const { data, error } = await query
        .order(sortBy === 'urgency' ? 'urgency' : 'created_at', 
               { ascending: sortBy === 'urgency' ? false : false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const maskName = (name: string) => {
    if (!name) return "Anonymous";
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
    if (!searchQuery) return true;
    const location = lead.location || {};
    const city = typeof location === 'object' && location !== null && 'city' in location ? location.city as string : '';
    const area = typeof location === 'object' && location !== null && 'area' in location ? location.area as string : '';
    return city.toLowerCase().includes(searchQuery.toLowerCase()) ||
           area.toLowerCase().includes(searchQuery.toLowerCase()) ||
           lead.title.toLowerCase().includes(searchQuery.toLowerCase());
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
        
        {isLoading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center p-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
            <p className="text-muted-foreground">
              There are no leads matching your current filters.
            </p>
          </div>
        ) : (
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
                      <div>
                        <div className="font-semibold text-foreground">
                          {maskName('Anonymous')}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {lead.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Title</div>
                      <div className="text-sm font-medium text-foreground">{lead.title}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Location</div>
                        <div className="text-sm font-medium text-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {typeof lead.location === 'object' && lead.location !== null && 'city' in lead.location
                            ? `${typeof lead.location === 'object' && 'area' in lead.location ? lead.location.area as string || '' : ''}, ${lead.location.city as string}`.trim().replace(/^,\s*/, '') 
                            : 'Location not specified'}
                        </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Priority</div>
                      <Badge 
                        variant={lead.urgency === "high" ? "default" : "outline"}
                        className={`text-xs ${
                          lead.urgency === "high" 
                            ? "bg-green-500 text-white hover:bg-green-600" 
                            : lead.urgency === "medium" 
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
                      <div className="text-sm font-semibold text-primary">
                        ₹{lead.budget_min ? (lead.budget_min / 10000000).toFixed(1) : '0'} - 
                        ₹{lead.budget_max ? (lead.budget_max / 10000000).toFixed(1) : '0'} Cr
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-center mb-2">
                        <Coin value={lead.lead_price || 50} size="sm" />
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
                  {/* Name */}
                  <div className="min-w-[120px] flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">Buyer</div>
                    <div className="font-semibold text-foreground">
                      {maskName('Anonymous')}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {lead.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <div className="min-w-[200px] flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">Requirement</div>
                    <div className="text-sm font-medium text-foreground">{lead.title}</div>
                  </div>

                  {/* Area */}
                  <div className="min-w-[120px] flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">Location</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <div className="text-sm font-medium text-foreground">
                        {typeof lead.location === 'object' && lead.location !== null && 'city' in lead.location
                          ? `${typeof lead.location === 'object' && 'area' in lead.location ? lead.location.area as string || '' : ''}, ${lead.location.city as string}`.trim().replace(/^,\s*/, '') 
                          : 'Location not specified'}
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="min-w-[120px] flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">Budget</div>
                    <div className="text-sm font-semibold text-primary">
                      ₹{lead.budget_min ? (lead.budget_min / 10000000).toFixed(1) : '0'} - 
                      ₹{lead.budget_max ? (lead.budget_max / 10000000).toFixed(1) : '0'} Cr
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="min-w-[80px] flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">Priority</div>
                    <Badge 
                      variant={lead.urgency === "high" ? "default" : "outline"}
                      className={`text-xs ${
                        lead.urgency === "high" 
                          ? "bg-green-500 text-white hover:bg-green-600" 
                          : lead.urgency === "medium" 
                          ? "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500" 
                          : "bg-red-500 text-white hover:bg-red-600 border-red-500"
                      }`}
                    >
                      {lead.urgency}
                    </Badge>
                  </div>

                  {/* Action & Price */}
                  <div className="flex items-center gap-4 min-w-[240px] flex-shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">Cost</span>
                      <Coin value={lead.lead_price || 50} size="sm" />
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
        )}

        {/* Load More */}
        <div className="text-center mt-6">
          <Button variant="outline">Load More Leads</Button>
        </div>
      </Card>
    </div>
  );
};

export default LeadsListing;