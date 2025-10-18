import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, CheckCircle, XCircle, Building } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const PendingLeads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const { data: pendingLeads = [] } = useQuery({
    queryKey: ['buyer-pending-leads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch leads (no joins to avoid dependency on FKs)
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, broker_id, buyer_id, property_id, requirement_id, status, notes, created_at')
        .eq('buyer_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      if (!leads || leads.length === 0) return [];

      const propertyIds = Array.from(new Set(leads.map(l => l.property_id).filter(Boolean))) as string[];
      const requirementIds = Array.from(new Set(leads.map(l => l.requirement_id).filter(Boolean))) as string[];
      const brokerIds = Array.from(new Set(leads.map(l => l.broker_id).filter(Boolean))) as string[];

      const [propsRes, reqsRes, profsRes] = await Promise.all([
        propertyIds.length
          ? supabase.from('properties')
              .select('id, title, price, property_type, location, area, bedrooms, bathrooms, amenities, images')
              .in('id', propertyIds)
          : Promise.resolve({ data: [], error: null } as any),
        requirementIds.length
          ? supabase.from('requirements')
              .select('id, title, location')
              .in('id', requirementIds)
          : Promise.resolve({ data: [], error: null } as any),
        brokerIds.length
          ? supabase.from('profiles')
              .select('id, first_name, last_name, company_name')
              .in('id', brokerIds)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      if ((propsRes as any).error) throw (propsRes as any).error;
      if ((reqsRes as any).error) throw (reqsRes as any).error;
      if ((profsRes as any).error) throw (profsRes as any).error;

      const propsMap = new Map(((propsRes as any).data || []).map((p: any) => [p.id, p]));
      const reqsMap = new Map(((reqsRes as any).data || []).map((r: any) => [r.id, r]));
      const profsMap = new Map(((profsRes as any).data || []).map((p: any) => [p.id, p]));

      return (leads || []).map((l: any) => ({
        ...l,
        properties: l.property_id ? propsMap.get(l.property_id) : null,
        requirements: l.requirement_id ? reqsMap.get(l.requirement_id) : null,
        profiles: l.broker_id ? profsMap.get(l.broker_id) : null,
      }));
    },
    enabled: !!user?.id
  });

  const approveMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase.rpc('approve_lead', {
        p_lead_id: leadId
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; chat_id?: string };
      if (!result?.success) throw new Error(result?.error || 'Failed to approve lead');

      return result;
    },
    onSuccess: async (result) => {
      toast.success('Lead approved! Chat activated.');
      await queryClient.invalidateQueries({ queryKey: ['buyer-pending-leads'] });
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      
      // Navigate to chat
      setTimeout(() => {
        navigate(`/chat/${result.chat_id}`);
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve lead');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ leadId, reason }: { leadId: string; reason: string }) => {
      const { data, error } = await supabase.rpc('reject_lead', {
        p_lead_id: leadId,
        p_rejection_reason: reason
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result?.success) throw new Error(result?.error || 'Failed to reject lead');

      return result;
    },
    onSuccess: async () => {
      toast.success('Lead rejected successfully');
      await queryClient.invalidateQueries({ queryKey: ['buyer-pending-leads'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject lead');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pending Lead Requests</h2>
        <p className="text-muted-foreground">Brokers want to connect with you for your requirements</p>
      </div>

      {pendingLeads.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No pending lead requests</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingLeads.map((lead: any) => (
            <Card key={lead.id} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">
                        {lead.profiles?.company_name || `${lead.profiles?.first_name} ${lead.profiles?.last_name}`}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      wants to connect for: <span className="font-medium text-foreground">{lead.requirements?.title}</span>
                    </p>
                  </div>
                  <Badge className="bg-yellow-500">Pending</Badge>
                </div>

                {/* Property Details */}
                <div className="border rounded-lg p-4 bg-accent/50">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Broker's Recommended Property
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-base">{lead.properties?.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="capitalize">{lead.properties?.property_type}</span>
                        <span>•</span>
                        <span className="text-primary font-semibold">
                          ₹{(lead.properties?.price / 10000000).toFixed(2)} Cr
                        </span>
                      </div>
                    </div>

                    {/* Property Features */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {lead.properties?.area && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Area: </span>
                          <span className="font-medium">{lead.properties.area} sq.ft</span>
                        </div>
                      )}
                      {lead.properties?.bedrooms && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Bedrooms: </span>
                          <span className="font-medium">{lead.properties.bedrooms}</span>
                        </div>
                      )}
                      {lead.properties?.bathrooms && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Bathrooms: </span>
                          <span className="font-medium">{lead.properties.bathrooms}</span>
                        </div>
                      )}
                      {lead.properties?.location && (
                        <div className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {(lead.properties.location as any).city}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Property Image */}
                    {lead.properties?.images && lead.properties.images.length > 0 && (
                      <img 
                        src={lead.properties.images[0]} 
                        alt={lead.properties.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Rejection Reason Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason (optional)</label>
                  <Textarea 
                    placeholder="If you reject, you can optionally provide a reason..."
                    value={rejectionReasons[lead.id] || ''}
                    onChange={(e) => setRejectionReasons(prev => ({ ...prev, [lead.id]: e.target.value }))}
                    className="min-h-20"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => approveMutation.mutate(lead.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {approveMutation.isPending ? 'Approving...' : 'Approve & Chat'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectMutation.mutate({ leadId: lead.id, reason: rejectionReasons[lead.id] || '' })}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Submitted: {new Date(lead.created_at).toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingLeads;