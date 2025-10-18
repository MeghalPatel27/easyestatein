import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Home, MapPin } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const LeadsStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: leads = [], refetch } = useQuery({
    queryKey: ['broker-leads-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch leads first
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, broker_id, buyer_id, property_id, requirement_id, status, notes, created_at')
        .eq('broker_id', user.id)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      if (!leadsData || leadsData.length === 0) return [];

      // Collect IDs
      const propertyIds = Array.from(new Set(leadsData.map(l => l.property_id).filter(Boolean))) as string[];
      const requirementIds = Array.from(new Set(leadsData.map(l => l.requirement_id).filter(Boolean))) as string[];
      const buyerIds = Array.from(new Set(leadsData.map(l => l.buyer_id).filter(Boolean))) as string[];

      // Batch fetch related data
      const [propsRes, reqsRes, buyersRes] = await Promise.all([
        propertyIds.length
          ? supabase.from('properties')
              .select('id, title, price, property_type, location')
              .in('id', propertyIds)
          : Promise.resolve({ data: [], error: null } as any),
        requirementIds.length
          ? supabase.from('requirements')
              .select('id, title, location, budget_min, budget_max')
              .in('id', requirementIds)
          : Promise.resolve({ data: [], error: null } as any),
        buyerIds.length
          ? supabase.from('profiles')
              .select('id, first_name, last_name')
              .in('id', buyerIds)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      if ((propsRes as any).error) throw (propsRes as any).error;
      if ((reqsRes as any).error) throw (reqsRes as any).error;
      if ((buyersRes as any).error) throw (buyersRes as any).error;

      // Create maps
      const propsMap = new Map(((propsRes as any).data || []).map((p: any) => [p.id, p]));
      const reqsMap = new Map(((reqsRes as any).data || []).map((r: any) => [r.id, r]));
      const buyersMap = new Map(((buyersRes as any).data || []).map((b: any) => [b.id, b]));

      // Map data
      return (leadsData || []).map((l: any) => ({
        ...l,
        properties: l.property_id ? propsMap.get(l.property_id) : null,
        requirements: l.requirement_id ? reqsMap.get(l.requirement_id) : null,
        profiles: l.buyer_id ? buyersMap.get(l.buyer_id) : null,
      }));
    },
    enabled: !!user?.id
  });

  // Real-time updates for lead status changes and new leads
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `broker_id=eq.${user.id}`
        },
        () => {
          refetch();
          toast.info('Lead purchased successfully! Waiting for buyer approval.');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `broker_id=eq.${user.id}`
        },
        (payload) => {
          refetch();
          
          // Show notification based on status
          if (payload.new.status === 'approved') {
            toast.success('Lead approved by buyer! You can now chat.');
          } else if (payload.new.status === 'rejected') {
            toast.error('Lead rejected by buyer.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pending = leads.filter(l => l.status === 'pending');
  const approved = leads.filter(l => l.status === 'approved');
  const rejected = leads.filter(l => l.status === 'rejected');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lead Status</h2>

      {/* Pending Leads */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pending Approval ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((lead: any) => (
              <Card key={lead.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {lead.profiles?.first_name} {lead.profiles?.last_name}
                      </p>
                      {getStatusBadge(lead.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requirement: {lead.requirements?.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>Presented: {lead.properties?.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved Leads */}
      {approved.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Approved ({approved.length})
          </h3>
          <div className="space-y-3">
            {approved.map((lead: any) => (
              <Card key={lead.id} className="p-4 border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {lead.profiles?.first_name} {lead.profiles?.last_name}
                      </p>
                      {getStatusBadge(lead.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requirement: {lead.requirements?.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>Property: {lead.properties?.title}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Leads */}
      {rejected.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Rejected ({rejected.length})
          </h3>
          <div className="space-y-3">
            {rejected.map((lead: any) => (
              <Card key={lead.id} className="p-4 border-red-200 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {lead.profiles?.first_name} {lead.profiles?.last_name}
                      </p>
                      {getStatusBadge(lead.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requirement: {lead.requirements?.title}
                    </p>
                    {lead.notes && (
                      <p className="text-sm italic">Reason: {lead.notes}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {leads.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No purchased leads yet</p>
        </Card>
      )}
    </div>
  );
};

export default LeadsStatus;