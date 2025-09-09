import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, Building, Home, MapPin, Eye, MessageSquare, Calendar, MoreHorizontal, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Requirements = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Mock data for requirements
  const requirements = [
    {
      id: 1,
      title: "3 BHK Apartment in Baner",
      type: "apartment",
      bedrooms: "3 BHK",
      location: "Baner, Pune",
      budget: "₹80L - ₹1.2Cr",
      status: "Active",
      responses: 12,
      views: 45,
      datePosted: "2024-01-15",
      priority: "High",
      description: "Looking for a spacious 3 BHK apartment with good amenities"
    },
    {
      id: 2,
      title: "2 BHK Villa in Wakad",
      type: "villa",
      bedrooms: "2 BHK",
      location: "Wakad, Pune",
      budget: "₹1.5Cr - ₹2Cr",
      status: "Active",
      responses: 8,
      views: 32,
      datePosted: "2024-01-12",
      priority: "Medium",
      description: "Independent villa with parking and garden space"
    },
    {
      id: 3,
      title: "Office Space in Koregaon Park",
      type: "office",
      bedrooms: "N/A",
      location: "Koregaon Park, Pune",
      budget: "₹2Cr - ₹3Cr",
      status: "Closed",
      responses: 15,
      views: 67,
      datePosted: "2024-01-08",
      priority: "Low",
      description: "Commercial office space for startup company"
    },
    {
      id: 4,
      title: "1 BHK Apartment in Hinjewadi",
      type: "apartment",
      bedrooms: "1 BHK",
      location: "Hinjewadi, Pune",
      budget: "₹40L - ₹60L",
      status: "Active",
      responses: 6,
      views: 28,
      datePosted: "2024-01-10",
      priority: "Medium",
      description: "Compact apartment for working professional"
    }
  ];

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
        {filteredRequirements.length > 0 ? (
          filteredRequirements.map((req) => (
            <Card key={req.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  {(() => {
                    const PropertyIcon = getPropertyIcon(req.type);
                    return <PropertyIcon className="w-5 h-5 text-muted-foreground mt-1" />;
                  })()}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-semibold text-foreground">{req.title}</h2>
                      <Badge 
                        variant={req.status === "Active" ? "default" : req.status === "Closed" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {req.status}
                      </Badge>
                      <Badge 
                        variant={req.priority === "High" ? "destructive" : req.priority === "Medium" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {req.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{req.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {req.location}
                      </span>
                      {req.bedrooms !== "N/A" && <span>{req.bedrooms}</span>}
                      <span className="font-medium text-primary">{req.budget}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {req.responses} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {req.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {req.datePosted}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
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
                      <DropdownMenuItem className="text-destructive">
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