import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Coins } from "lucide-react";
import { toast } from "sonner";

const LeadsListing = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ['leads-listing', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch property matches with score > 40
      const { data: matches, error: matchError } = await supabase
        .from('property_matches')
        .select('*')
        .eq('broker_id', user.id)
        .eq('is_lead_purchased', false)
        .gt('match_score', 40)
        .order('match_score', { ascending: false });

      if (matchError) {
        console.error('Error fetching matches:', matchError);
        throw matchError;
      }

      if (!matches || matches.length === 0) return [];

      // Get requirement IDs
      const requirementIds = matches.map(m => m.requirement_id);

      // Fetch requirements
      const { data: requirements } = await supabase
        .from('requirements')
        .select('*')
        .in('id', requirementIds);

      // Combine data
      return matches.map(match => {
        const requirement = requirements?.find(r => r.id === match.requirement_id);
        return {
          id: match.id,
          matchId: match.id,
          requirementId: match.requirement_id,
          title: requirement?.title || 'Untitled',
          property_type: requirement?.property_type || 'apartment',
          location: requirement?.location,
          budget_min: requirement?.budget_min,
          budget_max: requirement?.budget_max,
          lead_price: requirement?.lead_price || 50,
          match_score: match.match_score,
        };
      });
    },
    enabled: !!user?.id
  });

  // Real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('property_matches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_matches',
          filter: `broker_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const purchaseLead = async (matchId: string, leadPrice: number) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('purchase_lead', {
        _match_id: matchId,
        _broker_id: user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; lead_id?: string };
      
      if (result?.success) {
        toast.success('Lead purchased successfully!');
        refetch();
      } else {
        toast.error(`Failed to purchase lead: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error purchasing lead:', error);
      toast.error('Error purchasing lead. Please try again.');
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
           (lead.property_type || '').toLowerCase().includes(searchQuery.toLowerCase());
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
          <h1 className="text-2xl font-bold">Available Leads</h1>
          <p className="text-muted-foreground">Browse and purchase qualified leads</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by location or property type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredLeads.length === 0 && !isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No leads available at the moment</p>
          </Card>
        ) : (
          filteredLeads.map((lead: any) => (
            <Card key={lead.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{lead.title}</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 capitalize">
                      {lead.property_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {lead.location && typeof lead.location === 'object' && !Array.isArray(lead.location)
                        ? `${(lead.location as any).area ? (lead.location as any).area + ', ' : ''}${(lead.location as any).city || ''}`.trim()
                        : 'Location not specified'}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Budget: </span>
                    <span className="font-medium">
                      ₹{lead.budget_min ? (lead.budget_min / 10000000).toFixed(1) : '0'} - 
                      ₹{lead.budget_max ? (lead.budget_max / 10000000).toFixed(1) : '0'} Cr
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Lead Price</p>
                    <div className="flex items-center gap-1 text-orange-600 font-semibold">
                      <Coins className="h-4 w-4" />
                      <span>{lead.lead_price} coins</span>
                    </div>
                  </div>
                  <Button 
                    className="ml-4 bg-pink-500 hover:bg-pink-600"
                    onClick={() => purchaseLead(lead.matchId, lead.lead_price)}
                  >
                    Purchase Lead
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LeadsListing;