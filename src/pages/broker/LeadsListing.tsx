import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, MessageCircle, Star, TrendingUp } from "lucide-react";
import { Coin } from "@/components/ui/coin";
import { Link, useNavigate } from "react-router-dom";

const LeadsListing = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch property matches for this broker with detailed information
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['broker-leads-with-matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get matches for this broker
      const { data: matches, error: matchError } = await supabase
        .from('property_matches')
        .select('*')
        .eq('broker_id', user.id)
        .gte('match_score', 30)
        .order('match_score', { ascending: false });

      if (matchError) {
        console.error('Error fetching matches:', matchError);
        throw matchError;
      }
      
      if (!matches || matches.length === 0) return [];

      // Get requirement IDs, property IDs, and buyer IDs
      const requirementIds = matches.map(m => m.requirement_id);
      const propertyIds = matches.map(m => m.property_id);
      const buyerIds = matches.map(m => m.buyer_id);

      // Fetch requirements
      const { data: requirements } = await supabase
        .from('requirements')
        .select('*')
        .in('id', requirementIds);

      // Fetch properties (broker's properties that match)
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      // Fetch buyer profiles
      const { data: buyers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, mobile')
        .in('id', buyerIds);

      // Combine data with match information
      return matches.map(match => {
        const requirement = requirements?.find(r => r.id === match.requirement_id);
        const property = properties?.find(p => p.id === match.property_id);
        const buyer = buyers?.find(b => b.id === match.buyer_id);

        return {
          ...requirement,
          matchScore: match.match_score,
          matchedProperty: property,
          buyer: buyer,
          matchId: match.id,
          isLeadPurchased: match.is_lead_purchased,
          purchasedAt: match.purchased_at
        };
      });
    },
    enabled: !!user?.id
  });

  const navigate = useNavigate();

  // Purchase lead function
  const purchaseLead = async (matchId: string, leadPrice: number) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('purchase_lead', {
        _match_id: matchId,
        _broker_id: user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; lead_id?: string; cost?: number; remaining_balance?: number };
      
      if (result?.success) {
        alert(`Lead purchased successfully! Remaining balance: ${result.remaining_balance} coins`);
        // Refresh the data
        window.location.reload();
      } else {
        alert(`Failed to purchase lead: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error purchasing lead:', error);
      alert('Error purchasing lead. Please try again.');
    }
  };

  // Start chat function
  const startChat = async (buyerId: string, propertyId: string, requirementId: string) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('get_or_create_chat', {
        _buyer_id: buyerId,
        _broker_id: user.id,
        _property_id: propertyId,
        _requirement_id: requirementId
      });

      if (error) throw error;
      
      if (data) {
        navigate(`/broker/chat-manager?chat=${data}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Error starting chat. Please try again.');
    }
  };

  const filteredLeads = leads.filter((lead: any) => {
    if (!searchQuery) return true;
    const location = lead.location || {};
    const city = typeof location === 'object' && location !== null && 'city' in location ? location.city as string : '';
    const area = typeof location === 'object' && location !== null && 'area' in location ? location.area as string : '';
    return city.toLowerCase().includes(searchQuery.toLowerCase()) ||
           area.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (lead.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (lead.matchedProperty?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Matches & Leads</h1>
          <p className="text-muted-foreground">Your properties matched with buyer requirements - sorted by match score</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by location, property type, or matched property..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead: any) => (
            <Card key={lead.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Match Score Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">Match Score: {lead.matchScore}%</span>
                    </div>
                    <Badge 
                      variant={lead.matchScore >= 80 ? "default" : lead.matchScore >= 60 ? "secondary" : "outline"}
                      className={
                        lead.matchScore >= 80 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : lead.matchScore >= 60 
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {lead.matchScore >= 80 ? "Excellent Match" : lead.matchScore >= 60 ? "Good Match" : "Fair Match"}
                    </Badge>
                  </div>
                  {lead.isLeadPurchased && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Purchased
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Matched Property Info */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Your Matched Property
                  </h4>
                  <p className="text-blue-800 font-medium">{lead.matchedProperty?.title || 'Property details not available'}</p>
                  <p className="text-blue-600 text-sm">
                    ₹{lead.matchedProperty?.price ? (lead.matchedProperty.price / 10000000).toFixed(2) : '0'} Cr • 
                    {lead.matchedProperty?.area || 'N/A'} sq ft • 
                    {lead.matchedProperty?.bedrooms || 0} BHK
                  </p>
                </div>

                {/* Buyer Requirement */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-semibold text-lg">{lead.title || 'Buyer Requirement'}</h3>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                        {lead.property_type || 'apartment'}
                      </Badge>
                      <Badge 
                        variant={lead.urgency === "urgent" ? "destructive" : "outline"}
                        className={
                          lead.urgency === "urgent" 
                            ? "bg-red-100 text-red-800" 
                            : lead.urgency === "medium" 
                            ? "bg-orange-100 text-orange-800 border-orange-200" 
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {(lead.urgency || 'medium').charAt(0).toUpperCase() + (lead.urgency || 'medium').slice(1)} Priority
                      </Badge>
                    </div>
                    
                    {/* Buyer Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span className="font-medium">Buyer:</span>
                      <span>{lead.buyer ? `${lead.buyer.first_name || 'Anonymous'} ${lead.buyer.last_name || 'Buyer'}` : 'Anonymous Buyer'}</span>
                      {!lead.isLeadPurchased && (
                        <Badge variant="outline" className="text-xs">
                          Details locked
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {lead.location && typeof lead.location === 'object' && !Array.isArray(lead.location)
                          ? `${(lead.location as any).area || ''}, ${(lead.location as any).city || ''}`.trim().replace(/^,\s*/, '') 
                          : 'Location not specified'}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Budget: </span>
                        <span className="font-medium text-green-700">
                          ₹{lead.budget_min ? (lead.budget_min / 10000000).toFixed(1) : '0'} - 
                          ₹{lead.budget_max ? (lead.budget_max / 10000000).toFixed(1) : '0'} Cr
                        </span>
                      </div>
                      {lead.bedrooms && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Bedrooms: </span>
                          <span className="font-medium">{lead.bedrooms} BHK</span>
                        </div>
                      )}
                      {lead.area_min && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Area: </span>
                          <span className="font-medium">{lead.area_min}+ sq ft</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex items-center gap-4 ml-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Lead Price</p>
                      <Coin value={lead.lead_price || 100} size="sm" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {!lead.isLeadPurchased ? (
                        <Button 
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => purchaseLead(lead.matchId, lead.lead_price || 100)}
                        >
                          Purchase Lead
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => startChat(lead.buyer_id, lead.matchedProperty?.id, lead.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Start Chat
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No Property Matches Found</h3>
            <p className="text-sm text-muted-foreground">No buyer requirements match your properties yet. Add more properties to increase matches.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsListing;