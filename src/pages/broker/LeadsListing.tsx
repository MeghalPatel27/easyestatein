import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MapPin, Coins, Lock, Unlock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Radial progress component for score display
const RadialProgress = ({ score }: { score: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-foreground">{score}</span>
      </div>
    </div>
  );
};

const maskText = (text: string, isUnlocked: boolean) => {
  if (isUnlocked) return text;
  if (!text || text.length <= 2) return '***';
  return text[0] + '*'.repeat(Math.min(text.length - 1, 8));
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
      
      // Fetch property matches for broker's properties
      const { data: matches, error: matchError } = await supabase
        .from('property_matches')
        .select('*')
        .eq('broker_id', user.id)
        .gt('match_score', 40)
        .order('match_score', { ascending: false });

      if (matchError) throw matchError;
      if (!matches || matches.length === 0) return [];

      // Get unique IDs
      const requirementIds = [...new Set(matches.map(m => m.requirement_id))];
      const buyerIds = [...new Set(matches.map(m => m.buyer_id))];
      const propertyIds = [...new Set(matches.map(m => m.property_id))];

      // Fetch all related data
      const [requirementsRes, buyersRes, propertiesRes, leadsRes] = await Promise.all([
        supabase.from('requirements').select('*').in('id', requirementIds),
        supabase.from('profiles').select('id, first_name, last_name, mobile').in('id', buyerIds),
        supabase.from('properties').select('id, title').in('id', propertyIds),
        supabase.from('leads').select('*').eq('broker_id', user.id).in('requirement_id', requirementIds)
      ]);

      // Map leads to get status
      const leadsMap = new Map(
        leadsRes.data?.map(lead => [
          `${lead.requirement_id}-${lead.property_id}`,
          { status: lead.status, id: lead.id }
        ]) || []
      );

      // Combine data
      return matches.map(match => {
        const requirement = requirementsRes.data?.find(r => r.id === match.requirement_id);
        const buyer = buyersRes.data?.find(b => b.id === match.buyer_id);
        const property = propertiesRes.data?.find(p => p.id === match.property_id);
        const leadKey = `${match.requirement_id}-${match.property_id}`;
        const leadInfo = leadsMap.get(leadKey);
        
        const isPurchased = match.is_lead_purchased;
        const isApproved = leadInfo?.status === 'approved';
        const isUnlocked = isPurchased && isApproved;
        
        return {
          id: match.id,
          matchId: match.id,
          requirementId: match.requirement_id,
          buyerId: match.buyer_id,
          propertyId: match.property_id,
          propertyTitle: property?.title || 'Property',
          buyerName: buyer ? `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() : 'Buyer',
          buyerMobile: buyer?.mobile || '',
          title: requirement?.title || 'Requirement',
          property_type: requirement?.property_type || 'apartment',
          category: requirement?.category || 'residential',
          location: requirement?.location,
          bedrooms: requirement?.bedrooms,
          budget_min: requirement?.budget_min,
          budget_max: requirement?.budget_max,
          lead_price: requirement?.lead_price || 50,
          match_score: match.match_score,
          isPurchased,
          isApproved,
          isUnlocked,
          leadId: leadInfo?.id
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
        () => refetch()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `broker_id=eq.${user.id}`
        },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  // Purchase lead mutation
  const purchaseLeadMutation = useMutation({
    mutationFn: async ({ matchId, buyerId, requirementId, leadPrice, propertyId }: { 
      matchId: string; 
      buyerId: string; 
      requirementId: string; 
      leadPrice: number;
      propertyId: string;
    }) => {
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
      toast.success(`Lead purchased! Waiting for buyer approval.`);
      await queryClient.invalidateQueries({ queryKey: ['leads-listing'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to purchase lead');
    }
  });

  const handlePurchase = (lead: any) => {
    const currentBalance = profile?.coin_balance || 0;
    if (currentBalance < lead.lead_price) {
      toast.error('Insufficient balance. Please refill your wallet.');
      setTimeout(() => navigate('/broker/wallet/refill'), 1500);
      return;
    }

    purchaseLeadMutation.mutate({ 
      matchId: lead.matchId, 
      buyerId: lead.buyerId, 
      requirementId: lead.requirementId, 
      leadPrice: lead.lead_price,
      propertyId: lead.propertyId
    });
  };

  const handleChat = async (lead: any) => {
    // Find or create chat
    const { data: existingChats } = await supabase
      .from('chats')
      .select('id')
      .eq('broker_id', user?.id)
      .eq('buyer_id', lead.buyerId)
      .eq('requirement_id', lead.requirementId)
      .limit(1);

    if (existingChats && existingChats.length > 0) {
      navigate(`/chat/${existingChats[0].id}`);
    } else {
      toast.error('Chat not available yet');
    }
  };

  const filteredLeads = leads.filter((lead: any) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const location = lead.location || {};
    const city = (location.city || '').toLowerCase();
    const area = (location.area || '').toLowerCase();
    return city.includes(searchLower) ||
           area.includes(searchLower) ||
           lead.title.toLowerCase().includes(searchLower) ||
           lead.property_type.toLowerCase().includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Matching Leads</h1>
        <p className="text-sm text-muted-foreground">Buyer requirements matching your properties</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by location, type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredLeads.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No matching leads found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead: any) => (
            <Card key={lead.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                {/* Score */}
                <div className="flex-shrink-0">
                  <RadialProgress score={lead.match_score} />
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {lead.isUnlocked ? (
                      <Unlock className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <p className="font-semibold">{maskText(lead.buyerName, lead.isUnlocked)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {maskText(lead.buyerMobile, lead.isUnlocked)}
                  </p>
                </div>

                {/* Requirement Details */}
                <div className="flex-1 space-y-1">
                  <p className="font-medium capitalize">{lead.title}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="capitalize">{lead.property_type}</span>
                    {lead.bedrooms && <span>{lead.bedrooms} BHK</span>}
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{lead.location?.city || 'N/A'}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    ₹{(lead.budget_min / 10000000).toFixed(1)} - ₹{(lead.budget_max / 10000000).toFixed(1)} Cr
                  </p>
                </div>

                {/* Property Match */}
                <div className="flex-shrink-0 text-right space-y-1">
                  <p className="text-xs text-muted-foreground">Matches</p>
                  <p className="text-sm font-medium">{lead.propertyTitle}</p>
                  <p className="text-xs text-muted-foreground">ID: {lead.propertyId.slice(0, 8)}</p>
                </div>

                {/* Cost */}
                <div className="flex-shrink-0 text-center">
                  <div className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
                    <Coins className="h-4 w-4" />
                    <span className="font-semibold">{lead.lead_price}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2">
                  {!lead.isPurchased ? (
                    <Button 
                      onClick={() => handlePurchase(lead)}
                      disabled={purchaseLeadMutation.isPending}
                      size="sm"
                    >
                      Buy Lead
                    </Button>
                  ) : lead.isApproved ? (
                    <Button 
                      onClick={() => handleChat(lead)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Button>
                  ) : (
                    <Badge variant="secondary">Pending Approval</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsListing;