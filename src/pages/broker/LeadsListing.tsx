import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Coins } from "lucide-react";

const LeadsListing = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads-listing'],
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

  const filteredLeads = leads.filter((lead: any) => {
    if (!searchQuery) return true;
    const location = lead.location || {};
    const city = typeof location === 'object' && location !== null && 'city' in location ? location.city as string : '';
    const area = typeof location === 'object' && location !== null && 'area' in location ? location.area as string : '';
    return city.toLowerCase().includes(searchQuery.toLowerCase()) ||
           area.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (lead.title || '').toLowerCase().includes(searchQuery.toLowerCase());
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
        {filteredLeads.map((lead: any) => (
          <Card key={lead.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-semibold text-lg">{lead.title || 'Untitled'}</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {lead.property_type || 'apartment'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {lead.location && typeof lead.location === 'object' && !Array.isArray(lead.location)
                      ? `${(lead.location as any).area || ''}, ${(lead.location as any).city || ''}`.trim().replace(/^,\s*/, '') 
                      : 'Location not specified'}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Budget: </span>
                    <span className="font-medium">
                      ₹{lead.budget_min ? (lead.budget_min / 10000000).toFixed(1) : '0'} - 
                      ₹{lead.budget_max ? (lead.budget_max / 10000000).toFixed(1) : '0'} Cr
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Lead Price</p>
                  <div className="flex items-center gap-1 text-orange-600 font-semibold">
                    <Coins className="h-4 w-4" />
                    <span>50 coins</span>
                  </div>
                </div>
                <Button className="ml-4">Purchase Lead</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeadsListing;