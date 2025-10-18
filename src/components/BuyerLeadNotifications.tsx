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
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          properties (id, title, price, property_type, location, images),
          requirements (title),
          profiles!leads_broker_id_fkey (first_name, last_name, company_name)
        `)
        .eq('buyer_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
