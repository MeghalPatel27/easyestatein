import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

const LeadManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Mock data for qualified leads
  const qualifiedLeads = [
    {
      id: 1,
      rating: 4.8,
      type: "Residential",
      area: "Mumbai Central",
      budget: "₹2.5-3.5 Cr",
      urgency: "High",
      rejectionRate: 15,
      leadPrice: 50,
      verified: true,
      trending: "up",
      submittedAt: null,
      status: "available"
    },
    {
      id: 2,
      rating: 4.6,
      type: "Commercial",
      area: "BKC",
      budget: "₹5-8 Cr",
      urgency: "Medium",
      rejectionRate: 8,
      leadPrice: 75,
      verified: true,
      trending: "up",
      submittedAt: null,
      status: "available"
    },
    {
      id: 3,
      rating: 4.4,
      type: "Residential",
      area: "Andheri West",
      budget: "₹1.2-2 Cr",
      urgency: "High",
      rejectionRate: 12,
      leadPrice: 40,
      verified: false,
      trending: "stable",
      submittedAt: null,
      status: "available"
    }
  ];

  // Mock data for sent leads
  const sentLeads = [
    {
      id: 4,
      rating: 4.7,
      type: "Villa",
      area: "Lonavala",
      budget: "₹3-5 Cr",
      urgency: "Low",
      rejectionRate: 20,
      leadPrice: 60,
      verified: true,
      trending: "down",
      submittedAt: "2024-01-20",
      propertyTitle: "3 BHK Villa with Garden",
      status: "pending",
      response: null
    },
    {
      id: 5,
      rating: 4.5,
      type: "Commercial",
      area: "Lower Parel",
      budget: "₹10-15 Cr",
      urgency: "High",
      rejectionRate: 5,
      leadPrice: 100,
      verified: true,
      trending: "up",
      submittedAt: "2024-01-18",
      propertyTitle: "Premium Office Space",
      status: "accepted",
      response: "Interested in site visit"
    },
    {
      id: 6,
      rating: 4.3,
      type: "Residential",
      area: "Bandra West",
      budget: "₹4-6 Cr",
      urgency: "Medium",
      rejectionRate: 18,
      leadPrice: 65,
      verified: true,
      trending: "stable",
      submittedAt: "2024-01-15",
      propertyTitle: "4 BHK Sea View Apartment",
      status: "rejected",
      response: "Looking for higher floor"
    }
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "border-emerald-500 bg-emerald-50";
    if (rating >= 4.0) return "border-blue-500 bg-blue-50";
    return "border-orange-500 bg-orange-50";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "rejected": return <Target className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTrendingIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const handleSelectLead = (leadId: number) => {
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
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search qualified leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
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
                    <SelectItem value="villa">Villa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Sort by Rating</SelectItem>
                    <SelectItem value="budget">Sort by Budget</SelectItem>
                    <SelectItem value="urgency">Sort by Urgency</SelectItem>
                    <SelectItem value="price">Sort by Lead Price</SelectItem>
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

            <div className="space-y-4">
              {qualifiedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getRatingColor(lead.rating)}`}
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
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{lead.rating}</span>
                            {getTrendingIcon(lead.trending)}
                            {lead.verified && (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">{lead.type}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{lead.area}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-semibold text-primary">{lead.budget}</p>
                            <Badge className={getUrgencyColor(lead.urgency)}>
                              {lead.urgency} Priority
                            </Badge>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Rejection: {lead.rejectionRate}%</p>
                            <div className="flex items-center gap-1 text-orange-600 font-semibold">
                              <span>{lead.leadPrice}</span>
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
          </Card>
        </TabsContent>

        {/* Sent Leads Tab */}
        <TabsContent value="sent" className="mt-6 space-y-6">
          {/* Sent Leads List */}
          <Card className="p-6">
            <div className="space-y-4">
              {sentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getRatingColor(lead.rating)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{lead.rating}</span>
                        {getTrendingIcon(lead.trending)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{lead.type}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{lead.area}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Property Sent</p>
                        <p className="font-medium">{lead.propertyTitle}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{lead.submittedAt}</span>
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
                          <span>{lead.leadPrice}</span>
                          <span>coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {lead.response && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm"><strong>Response:</strong> {lead.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadManager;