import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, Calendar, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  // Mock data for potential buyers
  const potentialBuyers = [
    {
      id: 1,
      rating: 4.8,
      type: "Residential",
      area: "Mumbai Central",
      budget: "₹2.5-3.5 Cr",
      urgency: "High",
      rejectionRate: "15%",
      leadPrice: 50,
      verified: true
    },
    {
      id: 2,
      rating: 4.6,
      type: "Commercial",
      area: "BKC",
      budget: "₹5-8 Cr",
      urgency: "Medium",
      rejectionRate: "8%",
      leadPrice: 75,
      verified: true
    },
    {
      id: 3,
      rating: 4.4,
      type: "Residential",
      area: "Andheri West",
      budget: "₹1.2-2 Cr",
      urgency: "High",
      rejectionRate: "12%",
      leadPrice: 40,
      verified: false
    },
    {
      id: 4,
      rating: 4.7,
      type: "Villa",
      area: "Lonavala",
      budget: "₹3-5 Cr",
      urgency: "Low",
      rejectionRate: "20%",
      leadPrice: 60,
      verified: true
    },
    {
      id: 5,
      rating: 4.5,
      type: "Commercial",
      area: "Lower Parel",
      budget: "₹10-15 Cr",
      urgency: "High",
      rejectionRate: "5%",
      leadPrice: 100,
      verified: true
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

  return (
    <div className="space-y-6">
      {/* Header with Lead Manager Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Broker Dashboard</h1>
        <Link to="/broker/lead-manager">
          <Button className="bg-primary hover:bg-primary/90">
            Lead Manager
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Selection"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Leads</p>
              <p className="text-2xl font-bold">247</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">18.5%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">4.6</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 10 Most Potential Buyers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">10 Most Potential Buyers</h2>
          <Link to="/broker/leads">
            <Button variant="outline">View All Leads</Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {potentialBuyers.map((buyer) => (
            <div
              key={buyer.id}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${getRatingColor(buyer.rating)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{buyer.rating}</span>
                    {buyer.verified && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{buyer.type}</span>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{buyer.area}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-primary">{buyer.budget}</p>
                    <Badge className={getUrgencyColor(buyer.urgency)}>
                      {buyer.urgency} Priority
                    </Badge>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Rejection: {buyer.rejectionRate}</p>
                    <div className="flex items-center gap-1 text-orange-600 font-semibold">
                      <span>{buyer.leadPrice}</span>
                      <span>coins</span>
                    </div>
                  </div>
                  <Link to={`/broker/leads/${buyer.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Submit Property
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;