import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  MapPin, 
  Calendar,
  Send,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  CheckCircle,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LeadManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const { user } = useAuth();

  // Fetch available leads
  const { data: qualifiedLeads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leads', filterType, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('status', 'active');

      if (filterType !== 'all') {
        query = query.eq('category', filterType);
      }

      const { data, error } = await query
        .order(sortBy === 'urgency' ? 'urgency' : 'created_at', 
               { ascending: sortBy === 'urgency' ? false : false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch sent leads
  const { data: sentLeads = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ['sent-leads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sent_leads')
        .select(`
          *,
          lead:leads(*),
          property:properties(title)
        `)
        .eq('broker_id', user?.id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-green-100 text-green-700 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-700 border-green-200";
      case "sent": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "sent": return <Clock className="h-4 w-4" />;
      case "rejected": return <Target className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = (leads: any[]) => {
    const allIds = leads.map(lead => lead.id);
    setSelectedLeads(prev => 
      prev.length === leads.length ? [] : allIds
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on leads:`, selectedLeads);
    setSelectedLeads([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Lead Manager</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Leads</p>
              <p className="text-2xl font-bold">{qualifiedLeads.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sent Leads</p>
              <p className="text-2xl font-bold">{sentLeads.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-2xl font-bold">{sentLeads.filter(l => l.status === "accepted").length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{sentLeads.filter(l => l.status === "pending").length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="qualified" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qualified" className="gap-2">
            <Target className="h-4 w-4" />
            All Qualified Leads ({qualifiedLeads.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            All Sent Leads ({sentLeads.length})
          </TabsTrigger>
        </TabsList>

        {/* Qualified Leads Tab */}
        <TabsContent value="qualified" className="mt-6 space-y-6">
          {/* Search and Filters */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <EnhancedSearch
                  placeholder="Search qualified leads..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  searchKey="lead-manager"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgency">Sort by Priority</SelectItem>
                    <SelectItem value="created_at">Sort by Date</SelectItem>
                    <SelectItem value="budget_max">Sort by Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedLeads.length} lead(s) selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleBulkAction("export")}>
                    Export Selected
                  </Button>
                  <Button size="sm" onClick={() => handleBulkAction("analyze")}>
                    Bulk Analyze
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Qualified Leads List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedLeads.length === qualifiedLeads.length}
                  onCheckedChange={() => handleSelectAll(qualifiedLeads)}
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
            </div>

            {isLoadingLeads ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading leads...</p>
              </div>
            ) : qualifiedLeads.length === 0 ? (
              <div className="text-center p-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Leads Available</h3>
                <p className="text-muted-foreground">
                  There are no qualified leads matching your criteria at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {qualifiedLeads
                  .filter(lead => {
                    if (!searchQuery) return true;
                    const location = lead.location || {};
                    const city = typeof location === 'object' && location !== null && 'city' in location ? location.city as string : '';
                    const area = typeof location === 'object' && location !== null && 'area' in location ? location.area as string : '';
                    return city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           area.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.title.toLowerCase().includes(searchQuery.toLowerCase());
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
                                <span className="font-semibold text-lg">{lead.title}</span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  {lead.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                        <span>
                          {lead.location && typeof lead.location === 'object' && !Array.isArray(lead.location) && 'city' in lead.location
                            ? `${lead.location.area || ''}, ${lead.location.city}`.trim().replace(/^,\s*/, '') 
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
                                <Badge className={getUrgencyColor(lead.urgency)}>
                                  {lead.urgency} Priority
                                </Badge>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-muted-foreground">Lead Price</p>
                                <div className="flex items-center gap-1 text-orange-600 font-semibold">
                                  <span>{lead.lead_price || 50}</span>
                                  <span>coins</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link to={`/broker/leads/${lead.id}`}>
                                  <Button size="sm" variant="outline" className="gap-1">
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                </Link>
                                <Link to={`/broker/leads/${lead.id}`}>
                                  <Button size="sm" className="gap-1">
                                    <Send className="h-3 w-3" />
                                    Submit
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
            )}
          </Card>
        </TabsContent>

        {/* Sent Leads Tab */}
        <TabsContent value="sent" className="mt-6 space-y-6">
          {/* Sent Leads List */}
          <Card className="p-6">
            {isLoadingSent ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading sent leads...</p>
              </div>
            ) : sentLeads.length === 0 ? (
              <div className="text-center p-8">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sent Leads</h3>
                <p className="text-muted-foreground">
                  You haven't sent any property proposals yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-lg border-2 transition-all hover:shadow-md bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{lead.property?.title || 'Property'}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{lead.lead?.category || 'Category'}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>
                              {lead.lead?.location && typeof lead.lead.location === 'object' && !Array.isArray(lead.lead.location) && 'city' in lead.lead.location
                                ? `${(lead.lead.location as any).area || ''}, ${(lead.lead.location as any).city}`.trim().replace(/^,\s*/, '') 
                                : 'Location not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Lead Title</p>
                          <p className="font-medium">{lead.lead?.title || 'Lead'}</p>
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
                            <span>{lead.coins_spent}</span>
                            <span>coins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {lead.buyer_feedback && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm"><strong>Feedback:</strong> {lead.buyer_feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadManager;