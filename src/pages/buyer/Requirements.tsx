import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, Building, Home, MapPin, Eye, MessageSquare, Calendar, MoreHorizontal, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Requirements = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's requirements from database
  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements', user?.id, statusFilter, sortBy],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('requirements')
        .select('*')
        .eq('buyer_id', user.id);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'priority':
          query = query.order('urgency', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(req => ({
        id: req.id,
        title: req.title,
        type: req.property_type,
        bedrooms: req.bedrooms ? `${req.bedrooms} BHK` : 'N/A',
        location: typeof req.location === 'object' && req.location && 'city' in req.location ? req.location.city as string : 'Unknown',
        budget: req.budget_min && req.budget_max ? 
          `₹${req.budget_min}L - ₹${req.budget_max}L` : 'Budget not specified',
        status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
        responses: 0, // Will be calculated from sent_leads later
        views: 0, // Placeholder for now
        datePosted: new Date(req.created_at).toLocaleDateString(),
        priority: req.urgency ? req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1) : 'Medium',
        description: req.description || 'No description provided'
      }));
    },
    enabled: !!user?.id
  });

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case "apartment":
        return Building;
      case "villa":
        return Home;
      case "office":
        return Building;
      default:
        return Building;
    }
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteRequirement = async (requirementId: string) => {
    try {
      const { error } = await supabase
        .from('requirements')
        .delete()
        .eq('id', requirementId);

      if (error) throw error;

      toast.success("Requirement deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    } catch (error) {
      console.error("Error deleting requirement:", error);
      toast.error("Failed to delete requirement");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Requirements</h1>
          <p className="text-muted-foreground">Manage and track your property requirements</p>
        </div>
        <Link to="/post-requirement">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Post New Requirement
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="responses">Most Responses</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Requirements List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading your requirements...</p>
          </div>
        ) : filteredRequirements.length > 0 ? (
          filteredRequirements.map((req) => (
            <Card key={req.id} className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
              <div className="flex flex-col gap-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {(() => {
                      const PropertyIcon = getPropertyIcon(req.type);
                      return <PropertyIcon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />;
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">{req.title}</h2>
                        <Badge 
                          variant={req.status === "Active" ? "default" : req.status === "Closed" ? "secondary" : "outline"}
                          className="text-xs flex-shrink-0"
                        >
                          {req.status}
                        </Badge>
                        <Badge 
                          variant={req.priority === "High" ? "destructive" : req.priority === "Medium" ? "secondary" : "outline"}
                          className="text-xs flex-shrink-0"
                        >
                          {req.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Desktop */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <Link to={`/requirement/${req.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Requirement</DropdownMenuItem>
                        <DropdownMenuItem>View Responses</DropdownMenuItem>
                        <DropdownMenuItem>Pause Requirement</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteRequirement(req.id)}
                        >
                          Delete Requirement
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground pl-8 sm:pl-0">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{req.location}</span>
                  </span>
                  {req.bedrooms !== "N/A" && (
                    <span className="flex-shrink-0">{req.bedrooms}</span>
                  )}
                  <span className="font-semibold text-primary flex-shrink-0">{req.budget}</span>
                </div>
                
                {/* Stats Section */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground pl-8 sm:pl-0">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">responses</span>
                    <span className="font-medium">{req.responses}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">views</span>
                    <span className="font-medium">{req.views}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Posted</span>
                    <span className="font-medium">{req.datePosted}</span>
                  </span>
                </div>

                {/* Action Buttons - Mobile */}
                <div className="flex sm:hidden items-center gap-2 pt-2 border-t">
                  <Link to={`/requirement/${req.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Requirement</DropdownMenuItem>
                      <DropdownMenuItem>View Responses</DropdownMenuItem>
                      <DropdownMenuItem>Pause Requirement</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteRequirement(req.id)}
                      >
                        Delete Requirement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-lg flex items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No requirements found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters to find requirements."
                : "Start by posting your first property requirement to connect with brokers."
              }
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link to="/post-requirement">
                <Button>Post Your First Requirement</Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Requirements;