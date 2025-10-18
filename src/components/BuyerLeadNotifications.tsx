import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bell, Building, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BuyerLeadNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const { data: pendingLeads = [], refetch } = useQuery({
    queryKey: ['buyer-pending-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, broker_id, buyer_id, property_id, requirement_id, status, created_at')
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
              .select('id, title, price, property_type, location, images')
              .in('id', propertyIds)
          : Promise.resolve({ data: [], error: null } as any),
        requirementIds.length
          ? supabase.from('requirements')
              .select('id, title')
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
    enabled: !!user?.id,
  });

  // Real-time updates for new pending leads
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('buyer_lead_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `buyer_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.status === 'pending') {
            refetch();
            toast.info('New broker contact request!', {
              description: 'A broker wants to show you a property',
              action: {
                label: 'View',
                  onClick: () => navigate('/buyer/pending-leads')
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch, navigate]);

  const dismissNotification = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const visibleLeads = pendingLeads.filter((lead: any) => 
    !dismissedIds.includes(lead.id)
  );

  if (visibleLeads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">New Contact Requests</h3>
      </div>
      
      {visibleLeads.map((lead: any) => (
        <Card key={lead.id} className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">
                  {lead.profiles?.company_name || `${lead.profiles?.first_name} ${lead.profiles?.last_name}`}
                </h4>
                <span className="text-sm text-muted-foreground">wants to contact you</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">For your requirement:</span> {lead.requirements?.title}
                </p>
                
                {lead.properties && (
                  <div className="bg-background/80 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium">Presenting property:</p>
                    <p className="font-semibold">{lead.properties.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="capitalize">{lead.properties.property_type}</span>
                      <span>₹{(lead.properties.price / 10000000).toFixed(2)} Cr</span>
                      {lead.properties.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {(lead.properties.location as any).city}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => navigate('/buyer/pending-leads')}
                  className="bg-primary"
                >
                  View & Respond
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dismissNotification(lead.id)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BuyerLeadNotifications;
