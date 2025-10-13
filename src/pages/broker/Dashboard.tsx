import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, Calendar, TrendingUp, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Coin } from "@/components/ui/coin";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch property matches for this broker (real-time data only)
  const { data: potentialBuyers = [], isLoading } = useQuery({
    queryKey: ['broker-property-matches', user?.id, sortBy],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get the matches (top 5 with score > 70)
      const { data: matches, error: matchError } = await supabase
        .from('property_matches')
        .select('*')
        .eq('broker_id', user.id)
        .eq('is_lead_purchased', false)
        .gt('match_score', 70)
        .order('match_score', { ascending: false })
        .limit(5);

      if (matchError) {
        console.error('Error fetching matches:', matchError);
        throw matchError;
      }
      
      if (!matches || matches.length === 0) return [];

      // Get requirement IDs
      const requirementIds = matches.map(m => m.requirement_id);
      const propertyIds = matches.map(m => m.property_id);
      const buyerIds = matches.map(m => m.buyer_id);

      // Fetch requirements with buyer profiles
      const { data: requirements } = await supabase
        .from('requirements')
        .select('*')
        .in('id', requirementIds);

      // Fetch properties
      const { data: properties } = await supabase
        .from('properties')
        .select('title, price, property_type, id')
        .in('id', propertyIds);

      // Fetch buyer profiles
      const { data: buyers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, mobile')
        .in('id', buyerIds);

      // Combine data
      return matches.map(match => {
        const requirement = requirements?.find(r => r.id === match.requirement_id);
        const property = properties?.find(p => p.id === match.property_id);
        const buyer = buyers?.find(b => b.id === match.buyer_id);

        return {
          id: match.id,
          name: `${buyer?.first_name || 'Anonymous'} ${buyer?.last_name || 'Buyer'}`,
          rating: Math.min(5, match.match_score / 20),
          category: requirement?.category || 'Residential',
          propertyType: requirement?.property_type || 'Unknown',
          area: (requirement?.location as any)?.city || 'Location not specified',
          budget: `₹${(requirement?.budget_min || 0).toLocaleString()} - ₹${(requirement?.budget_max || 0).toLocaleString()}`,
          urgency: requirement?.urgency || 'medium',
          rejectionRate: requirement?.rejection_rate || 0,
          leadPrice: requirement?.lead_price || 100,
          unlocked: false, // Leads need to be purchased to unlock details
          score: match.match_score,
          mobile: buyer?.mobile || 'N/A',
          propertyTitle: property?.title,
          requirementTitle: requirement?.title,
          matchId: match.id,
          requirementId: match.requirement_id,
          propertyId: match.property_id,
          buyerId: match.buyer_id
        };
      });
    },
    enabled: !!user?.id,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Function to purchase a lead
  const purchaseLead = async (matchId: string, leadPrice: number, buyerId: string, requirementId: string) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('purchase_lead', {
        p_match_id: matchId,
        p_lead_price: leadPrice,
        p_buyer_id: buyerId,
        p_requirement_id: requirementId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; chat_id?: string; new_balance?: number };
      
      if (result?.success) {
        toast.success(`Lead purchased! Balance: ${result.new_balance} coins`);
        
        // Refresh queries
        await queryClient.invalidateQueries({ queryKey: ['broker-property-matches'] });
        await queryClient.invalidateQueries({ queryKey: ['broker-stats'] });
        
        // Navigate to chat
        toast.success('Chat activated! Redirecting...');
        setTimeout(() => {
          navigate(`/chat/${result.chat_id}`);
        }, 1500);
      } else {
        toast.error(`Failed to purchase lead: ${result?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error purchasing lead:', error);
      toast.error(error.message || 'Error purchasing lead. Please try again.');
    }
  };

  // Fetch broker stats based on property matches
  const { data: stats } = useQuery({
    queryKey: ['broker-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { matchingLeads: 0, engagedLeads: 0, acceptanceRate: 0, visitsArranged: 0 };
      
      // Count available matches for this broker (score > 70)
      const { count: matchingLeads } = await supabase
        .from('property_matches')
        .select('*', { count: 'exact', head: true })
        .eq('broker_id', user.id)
        .eq('is_lead_purchased', false)
        .gt('match_score', 70);

      // Count purchased leads (engaged leads)
      const { count: engagedLeads } = await supabase
        .from('property_matches')
        .select('*', { count: 'exact', head: true })
        .eq('broker_id', user.id)
        .eq('is_lead_purchased', true);

      // Count active chats for visits arranged using security definer function
      const { data: userChats } = await supabase
        .rpc('get_user_chats', { _user_id: user.id });
      const visitsArranged = userChats?.length || 0;

      return {
        matchingLeads: matchingLeads || 0,
        engagedLeads: engagedLeads || 0,
        acceptanceRate: engagedLeads && matchingLeads ? Math.round((engagedLeads / (matchingLeads + engagedLeads)) * 100) : 0,
        visitsArranged: visitsArranged || 0
      };
    },
    enabled: !!user?.id
  });

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

    // Determine color based on score with your specified colors
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Broker Dashboard</h1>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <EnhancedSearch
              placeholder="Search by Selection"
              value={searchQuery}
              onChange={setSearchQuery}
              searchKey="broker-dashboard"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Sort by Match Score</SelectItem>
                <SelectItem value="budget">Sort by Budget</SelectItem>
                <SelectItem value="urgency">Sort by Urgency</SelectItem>
                <SelectItem value="price">Sort by Lead Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Matching Leads</p>
              <p className="text-2xl font-bold">{stats?.matchingLeads || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engaged Leads</p>
              <p className="text-2xl font-bold">{stats?.engagedLeads || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Acceptance Rate</p>
              <p className="text-2xl font-bold">{stats?.acceptanceRate || 0}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visits Arranged</p>
              <p className="text-2xl font-bold">{stats?.visitsArranged || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 10 Most Potential Buyers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Matched Buyer Requirements</h2>
          <Link to="/broker/leads">
            <Button variant="outline">View All Leads</Button>
          </Link>
        </div>
        
        <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading property matches...</p>
              </div>
            ) : potentialBuyers.length > 0 ? (
              potentialBuyers.map((buyer) => (
            <div
              key={buyer.id}
              className="p-4 md:p-6 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
            >
              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <RadialProgress 
                      value={Math.round(buyer.rating * 20)} 
                      size={48} 
                      className="text-primary"
                    />
                    <div>
                      <div className="font-semibold text-foreground">
                        {maskName(buyer.name, buyer.unlocked)}
                      </div>
                      {!buyer.unlocked && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RadialProgress 
                      value={100 - buyer.rejectionRate} 
                      size={48} 
                      className="text-emerald-500"
                    />
                    <span className="text-xs text-muted-foreground">Success</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Category</div>
                    <div className="text-sm font-medium text-foreground">{buyer.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="text-sm font-medium text-foreground">{buyer.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm font-medium text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {buyer.area}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Priority</div>
                    <Badge 
                      variant={buyer.urgency === "urgent" ? "destructive" : buyer.urgency === "medium" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {buyer.urgency.charAt(0).toUpperCase() + buyer.urgency.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Budget</div>
                    <div className="text-sm font-semibold text-primary">{buyer.budget}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-center mb-2">
                      <Coin value={buyer.leadPrice} size="sm" />
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-xs"
                      onClick={() => purchaseLead(buyer.matchId, buyer.leadPrice, buyer.buyerId, buyer.requirementId)}
                    >
                      Purchase Lead
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center gap-4 lg:gap-6 overflow-x-auto">
                {/* Overall Score */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-muted-foreground mb-1">Score</span>
                  <RadialProgress 
                    value={Math.round(buyer.rating * 20)} 
                    size={56} 
                    className="text-primary"
                  />
                </div>

                {/* Name */}
                <div className="min-w-[120px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Name</div>
                  <div className="font-semibold text-foreground">
                    {maskName(buyer.name, buyer.unlocked)}
                  </div>
                  {!buyer.unlocked && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Locked
                    </Badge>
                  )}
                </div>

                {/* Category */}
                <div className="min-w-[100px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <div className="text-sm font-medium text-foreground">{buyer.category}</div>
                </div>

                {/* Property Type */}
                <div className="min-w-[100px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Type</div>
                  <div className="text-sm font-medium text-foreground">{buyer.propertyType}</div>
                </div>

                {/* Area */}
                <div className="min-w-[120px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Location</div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <div className="text-sm font-medium text-foreground">{buyer.area}</div>
                  </div>
                </div>

                {/* Budget */}
                <div className="min-w-[120px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Budget</div>
                  <div className="text-sm font-semibold text-primary">{buyer.budget}</div>
                </div>

                {/* Urgency */}
                <div className="min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Priority</div>
                  <Badge 
                    variant={buyer.urgency === "urgent" ? "default" : "outline"}
                    className={`text-xs ${
                      buyer.urgency === "urgent" 
                        ? "bg-green-500 text-white hover:bg-green-600" 
                        : buyer.urgency === "medium" 
                        ? "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500" 
                        : "bg-red-500 text-white hover:bg-red-600 border-red-500"
                    }`}
                  >
                    {buyer.urgency.charAt(0).toUpperCase() + buyer.urgency.slice(1)}
                  </Badge>
                </div>

                {/* Acceptance Rate */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-muted-foreground mb-1">Acceptance Rate</span>
                  <RadialProgress 
                    value={100 - buyer.rejectionRate} 
                    size={56} 
                    className="text-emerald-500"
                  />
                </div>

                {/* Action & Price */}
                <div className="flex items-center gap-4 min-w-[240px] flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">Cost</span>
                    <Coin value={buyer.leadPrice} size="sm" />
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => purchaseLead(buyer.matchId, buyer.leadPrice, buyer.buyerId, buyer.requirementId)}
                  >
                    Purchase Lead
                  </Button>
                </div>
              </div>
            </div>
              ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No Property Matches Found</h3>
              <p className="text-sm text-muted-foreground">No buyer requirements match your properties yet. Add more properties to increase matches.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;