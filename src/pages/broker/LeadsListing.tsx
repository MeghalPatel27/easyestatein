import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MapPin, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Radial progress component for score display
const RadialProgress = ({ score }: { score: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-green-500 transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-foreground">{score}%</span>
      </div>
    </div>
  );
};

// Mask buyer name for privacy
const maskName = (name: string, isUnlocked: boolean) => {
  if (isUnlocked) return name;
  if (name.length <= 3) return name;
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

const LeadsListing = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

      // Get requirement IDs and buyer IDs
      const requirementIds = matches.map(m => m.requirement_id);
      const buyerIds = matches.map(m => m.buyer_id);

      // Fetch requirements and buyer profiles
      const [requirementsRes, buyersRes] = await Promise.all([
        supabase.from('requirements').select('*').in('id', requirementIds),
        supabase.from('profiles').select('id, first_name, last_name').in('id', buyerIds)
      ]);

      // Combine data
      return matches.map(match => {
        const requirement = requirementsRes.data?.find(r => r.id === match.requirement_id);
        const buyer = buyersRes.data?.find(b => b.id === match.buyer_id);
        const buyerName = buyer ? `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() : 'Anonymous';
        
        return {
          id: match.id,
          matchId: match.id,
          requirementId: match.requirement_id,
          buyerId: match.buyer_id,
          buyerName,
          title: requirement?.title || 'Untitled',
          property_type: requirement?.property_type || 'apartment',
          category: requirement?.category || 'residential',
          location: requirement?.location,
          budget_min: requirement?.budget_min,
          budget_max: requirement?.budget_max,
          lead_price: requirement?.lead_price || 50,
          match_score: match.match_score,
          urgency: requirement?.urgency || 'medium',
          rejection_rate: requirement?.rejection_rate || 0,
          isUnlocked: false
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

  // Purchase lead mutation
  const purchaseLeadMutation = useMutation({
    mutationFn: async ({ matchId, buyerId, requirementId, leadPrice }: { matchId: string; buyerId: string; requirementId: string; leadPrice: number }) => {
      const { data, error } = await supabase.rpc('purchase_lead', {
        p_match_id: matchId,
        p_lead_price: leadPrice,
        p_buyer_id: buyerId,
        p_requirement_id: requirementId
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; chat_id?: string; new_balance?: number };
      if (!result?.success) throw new Error(result?.error || 'Failed to purchase lead');

      return result;
    },
    onSuccess: async (result) => {
      toast.success(`Lead purchased! Balance: ${result.new_balance} coins`);
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['leads-listing'] });
      await queryClient.invalidateQueries({ queryKey: ['broker-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      
      // Navigate to chat
      toast.success('Chat activated! Redirecting...');
      setTimeout(() => {
        navigate(`/chat/${result.chat_id}`);
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to purchase lead');
    }
  });

  const purchaseLead = (matchId: string, leadPrice: number, buyerId: string, requirementId: string) => {
    // Check if broker has enough balance
    const currentBalance = profile?.coin_balance || 0;
    if (currentBalance < leadPrice) {
      toast.error('Insufficient coin balance. Please refill your wallet.');
      setTimeout(() => navigate('/broker/wallet/refill'), 1500);
      return;
    }

    purchaseLeadMutation.mutate({ matchId, buyerId, requirementId, leadPrice });
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

      <div className="space-y-4">
        {filteredLeads.length === 0 && !isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No leads available at the moment</p>
          </Card>
        ) : (
          filteredLeads.map((lead: any) => (
            <Card key={lead.id} className="overflow-x-auto hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-6 p-6 min-w-max">
                {/* Left: Score */}
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-muted-foreground mb-1">Score</p>
                    <RadialProgress score={lead.match_score} />
                  </div>
                </div>

                {/* Masked Name */}
                <div className="flex flex-col min-w-[140px]">
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-semibold text-base">{maskName(lead.buyerName, lead.isUnlocked)}</p>
                  <p className="text-xs text-muted-foreground">{lead.isUnlocked ? 'Unlocked' : 'Locked'}</p>
                </div>

                {/* Category */}
                <div className="flex flex-col min-w-[100px]">
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="text-sm capitalize">{lead.category}</p>
                </div>

                {/* Type */}
                <div className="flex flex-col min-w-[100px]">
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm capitalize">{lead.property_type}</p>
                </div>

                {/* Location */}
                <div className="flex flex-col min-w-[140px]">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm">
                      {lead.location && typeof lead.location === 'object' && !Array.isArray(lead.location)
                        ? (lead.location as any).city || 'Not specified'
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex flex-col min-w-[180px]">
                  <p className="text-xs text-muted-foreground mb-1">Budget</p>
                  <p className="text-sm font-medium text-pink-600">
                    ₹{lead.budget_min ? (lead.budget_min / 10000000).toFixed(1) : '0'} - ₹{lead.budget_max ? (lead.budget_max / 10000000).toFixed(1) : '0'} Cr
                  </p>
                </div>

                {/* Priority */}
                <div className="flex flex-col min-w-[100px]">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <Badge 
                    className={`capitalize w-fit ${
                      lead.urgency === 'urgent' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : lead.urgency === 'high'
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {lead.urgency}
                  </Badge>
                </div>

                {/* Acceptance Rate */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <p className="text-xs text-muted-foreground mb-2">Acceptance Rate</p>
                  <RadialProgress score={Math.max(0, 100 - lead.rejection_rate)} />
                </div>

                {/* Cost */}
                <div className="flex flex-col items-center min-w-[80px]">
                  <p className="text-xs text-muted-foreground mb-2">Cost</p>
                  <div className="flex items-center gap-1 bg-pink-500 text-white px-3 py-1.5 rounded-full">
                    <Home className="h-4 w-4" />
                    <span className="font-semibold">{lead.lead_price}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 ml-auto">
                  <Button 
                    className="bg-pink-500 hover:bg-pink-600 text-white font-medium"
                    onClick={() => purchaseLead(lead.matchId, lead.lead_price, lead.buyerId, lead.requirementId)}
                    disabled={purchaseLeadMutation.isPending}
                  >
                    {purchaseLeadMutation.isPending ? 'Processing...' : 'Purchase Lead'}
                  </Button>
                </div>

                {/* Navigation Arrows */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button className="p-1 hover:bg-accent rounded">
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-1 hover:bg-accent rounded">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
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