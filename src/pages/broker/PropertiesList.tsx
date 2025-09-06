import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Copy, 
  Eye, 
  MoreHorizontal,
  Building,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Archive
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PropertiesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Mock properties data
  const properties = [
    {
      id: 1,
      title: "Luxury 3 BHK Apartment in Mumbai Central",
      type: "Residential",
      category: "Apartment",
      location: "Mumbai Central, Mumbai",
      price: "₹2.5 Cr",
      area: "1200 sq ft",
      status: "verified",
      createdAt: "2024-01-15",
      lastUpdated: "2024-01-20",
      images: 8,
      leadsReceived: 12
    },
    {
      id: 2,
      title: "Commercial Office Space in BKC",
      type: "Commercial",
      category: "Office",
      location: "BKC, Mumbai",
      price: "₹8 Cr",
      area: "2500 sq ft",
      status: "pending",
      createdAt: "2024-01-18",
      lastUpdated: "2024-01-18",
      images: 6,
      leadsReceived: 0
    },
    {
      id: 3,
      title: "2 BHK Villa in Lonavala",
      type: "Residential",
      category: "Villa",
      location: "Lonavala, Pune",
      price: "₹1.8 Cr",
      area: "1800 sq ft",
      status: "draft",
      createdAt: "2024-01-20",
      lastUpdated: "2024-01-20",
      images: 3,
      leadsReceived: 0
    },
    {
      id: 4,
      title: "Retail Shop in Linking Road",
      type: "Commercial",
      category: "Retail",
      location: "Linking Road, Mumbai",
      price: "₹3.2 Cr",
      area: "800 sq ft",
      status: "rejected",
      createdAt: "2024-01-10",
      lastUpdated: "2024-01-15",
      images: 5,
      leadsReceived: 0
    },
    {
      id: 5,
      title: "4 BHK Penthouse in Worli",
      type: "Residential",
      category: "Penthouse",
      location: "Worli, Mumbai",
      price: "₹12 Cr",
      area: "3500 sq ft",
      status: "archived",
      createdAt: "2024-01-05",
      lastUpdated: "2024-01-10",
      images: 15,
      leadsReceived: 8
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "draft": return "bg-gray-100 text-gray-700 border-gray-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      case "archived": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "draft": return <Edit className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "archived": return <Archive className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusCounts = () => {
    return {
      all: properties.length,
      draft: properties.filter(p => p.status === "draft").length,
      pending: properties.filter(p => p.status === "pending").length,
      verified: properties.filter(p => p.status === "verified").length,
      rejected: properties.filter(p => p.status === "rejected").length,
      archived: properties.filter(p => p.status === "archived").length
    };
  };

  const counts = getStatusCounts();

  const filteredProperties = properties.filter(property => {
    if (statusFilter !== "all" && property.status !== statusFilter) return false;
    if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !property.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Property Management</h1>
        <Link to="/broker/properties/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="gap-2">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="draft" className="gap-2">
            <Edit className="h-3 w-3" />
            Draft ({counts.draft})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-3 w-3" />
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="verified" className="gap-2">
            <CheckCircle className="h-3 w-3" />
            Verified ({counts.verified})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-3 w-3" />
            Rejected ({counts.rejected})
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2">
            <Archive className="h-3 w-3" />
            Archived ({counts.archived})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {/* Property Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className={getStatusColor(property.status)} variant="outline">
                      {getStatusIcon(property.status)}
                      <span className="ml-1 capitalize">{property.status}</span>
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="bg-white/80 hover:bg-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {property.images} photos
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{property.type}</span>
                      <span>•</span>
                      <span>{property.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary text-lg">{property.price}</p>
                      <p className="text-sm text-muted-foreground">{property.area}</p>
                    </div>
                    {property.leadsReceived > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {property.leadsReceived} leads
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {property.createdAt}</span>
                    </div>
                    <span>Updated: {property.lastUpdated}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    <Link to={`/broker/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" className="gap-2">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <Card className="p-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all" 
                  ? "You haven't added any properties yet." 
                  : `No properties found with status "${statusFilter}".`
                }
              </p>
              <Link to="/broker/properties/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Property
                </Button>
              </Link>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertiesList;