import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Eye, MapPin, Coins, Calendar, Search, Star } from "lucide-react";
import { Link } from "react-router-dom";

const LeadManager = () => {
  const { user } = useAuth();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Simplified queries with basic data
  const { data: qualifiedLeads = [], isLoading } = useQuery({
    queryKey: ['qualified-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch sent leads with simplified structure
  const { data: sentLeads = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ['sent-leads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('broker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleBuyLeads = async () => {
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead");
      return;
    }

    try {
      // Create lead entries for selected requirements
      const leadInserts = selectedLeads.map(requirementId => ({
        broker_id: user?.id,
        buyer_id: 'temp', // Will need to get actual buyer_id from requirement
        requirement_id: requirementId,
        status: 'sent'
      }));

      const { error } = await supabase
        .from('leads')
        .insert(leadInserts);

      if (error) throw error;

      toast.success(`Successfully purchased ${selectedLeads.length} leads!`);
      setSelectedLeads([]);
    } catch (error) {
      console.error('Error buying leads:', error);
      toast.error("Failed to purchase leads");
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Manager</h1>
          <p className="text-muted-foreground">
            Manage your qualified leads and track submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>Available Coins: 250</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Qualified Leads Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Qualified Leads</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {qualifiedLeads.length} Available
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by location or property type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Summary */}
            {selectedLeads.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                <span className="text-sm font-medium">
                  {selectedLeads.length} leads selected • {selectedLeads.length * 50} coins
                </span>
                <Button onClick={handleBuyLeads} size="sm">
                  Buy Selected Leads
                </Button>
              </div>
            )}

            {/* Leads List */}
            <ScrollArea className="h-[400px] space-y-3">
              <div className="space-y-3">
                {qualifiedLeads
                  .filter(lead => {
                    if (!searchQuery) return true;
                    const location = lead.location as any || {};
                    const city = location.city || '';
                    const area = location.area || '';
                    return city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           area.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (lead.title || '').toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-lg border-2 transition-all hover:shadow-md bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => handleSelectLead(lead.id)}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">{lead.title || 'Untitled'}</span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  {lead.property_type || 'apartment'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {lead.location && typeof lead.location === 'object' && !Array.isArray(lead.location) 
                                    ? `${(lead.location as any).area || ''}, ${(lead.location as any).city || ''}`.trim().replace(/^,\s*/, '') 
                                    : 'Location not specified'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="font-semibold text-primary">
                                  ₹{lead.budget_min ? (lead.budget_min / 10000000).toFixed(1) : '0'} - 
                                  ₹{lead.budget_max ? (lead.budget_max / 10000000).toFixed(1) : '0'} Cr
                                </p>
                                <Badge className={getUrgencyColor('medium')}>
                                  Medium Priority
                                </Badge>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-muted-foreground">Lead Price</p>
                                <div className="flex items-center gap-1 text-orange-600 font-semibold">
                                  <span>50</span>
                                  <span>coins</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link to={`/broker/requirements/${lead.id}`}>
                                  <Button size="sm" variant="outline" className="gap-1">
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </Card>

        {/* Sent Leads Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sent Leads</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {sentLeads.length} Sent
            </Badge>
          </div>

          <ScrollArea className="h-[500px]">
            {isLoadingSent ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : sentLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">No leads sent yet</div>
                <div className="text-sm">Purchase some leads to get started</div>
              </div>
            ) : (
              <div className="space-y-3">
                {sentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">Lead #{lead.id.slice(0, 8)}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Requirement</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>Location not specified</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Lead Title</p>
                          <p className="font-medium">Lead</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{new Date(lead.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge className={getStatusColor(lead.status)} variant="outline">
                            {getStatusIcon(lead.status)}
                            <span className="ml-1 capitalize">{lead.status}</span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Cost</p>
                          <div className="flex items-center gap-1 text-orange-600 font-semibold">
                            <span>50</span>
                            <span>coins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {lead.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm"><strong>Notes:</strong> {lead.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default LeadManager;