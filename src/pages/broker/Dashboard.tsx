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
      name: "Rajesh Kumar",
      rating: 4.8,
      category: "Residential",
      propertyType: "Apartment",
      area: "Mumbai Central",
      budget: "₹2.5-3.5 Cr",
      urgency: "High",
      rejectionRate: 15,
      leadPrice: 50,
      unlocked: true
    },
    {
      id: 2,
      name: "Priya Sharma",
      rating: 4.6,
      category: "Commercial",
      propertyType: "Office Space",
      area: "BKC",
      budget: "₹5-8 Cr",
      urgency: "Medium",
      rejectionRate: 8,
      leadPrice: 75,
      unlocked: true
    },
    {
      id: 3,
      name: "Amit Patel",
      rating: 4.4,
      category: "Residential",
      propertyType: "Villa",
      area: "Andheri West",
      budget: "₹1.2-2 Cr",
      urgency: "High",
      rejectionRate: 12,
      leadPrice: 40,
      unlocked: false
    },
    {
      id: 4,
      name: "Sunita Gupta",
      rating: 4.7,
      category: "Residential",
      propertyType: "Bungalow",
      area: "Lonavala",
      budget: "₹3-5 Cr",
      urgency: "Low",
      rejectionRate: 20,
      leadPrice: 60,
      unlocked: true
    },
    {
      id: 5,
      name: "Rohit Mehta",
      rating: 4.5,
      category: "Commercial",
      propertyType: "Warehouse",
      area: "Lower Parel",
      budget: "₹10-15 Cr",
      urgency: "High",
      rejectionRate: 5,
      leadPrice: 100,
      unlocked: false
    }
  ];

  const maskName = (name: string, unlocked: boolean) => {
    if (unlocked) return name;
    const firstTwo = name.slice(0, 2);
    const lastTwo = name.slice(-2);
    const middle = "*".repeat(Math.max(0, name.length - 4));
    return firstTwo + middle + lastTwo;
  };

  const RadialProgress = ({ value, size = 48, strokeWidth = 4, className = "" }: {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    // Determine color based on score
    const getScoreColor = (score: number) => {
      if (score >= 80) return "text-green-500";
      if (score >= 60) return "text-yellow-500";
      if (score >= 40) return "text-orange-500";
      return "text-red-500";
    };

    return (
      <div className={`relative ${className}`}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${getScoreColor(value)} transition-all duration-300`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Broker Dashboard</h1>
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
              className="p-4 md:p-6 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
            >
              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <RadialProgress 
                      value={Math.round(buyer.rating * 20)} 
                      size={48} 
                      className="text-primary"
                    />
                    <div>
                      <div className="font-semibold text-foreground">
                        {maskName(buyer.name, buyer.unlocked)}
                      </div>
                      {!buyer.unlocked && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RadialProgress 
                      value={100 - buyer.rejectionRate} 
                      size={48} 
                      className="text-emerald-500"
                    />
                    <span className="text-xs text-muted-foreground">Success</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Category</div>
                    <div className="text-sm font-medium text-foreground">{buyer.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="text-sm font-medium text-foreground">{buyer.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm font-medium text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {buyer.area}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Priority</div>
                    <Badge 
                      variant={buyer.urgency === "High" ? "destructive" : buyer.urgency === "Medium" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {buyer.urgency}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Budget</div>
                    <div className="text-sm font-semibold text-primary">{buyer.budget}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-600 font-semibold text-sm mb-2">
                      <span>{buyer.leadPrice}</span>
                      <span>coins</span>
                    </div>
                    <Link to={`/broker/leads/${buyer.id}`}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">
                        Submit Property
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center gap-6">
                {/* Overall Score */}
                <div className="flex flex-col items-center gap-1">
                  <RadialProgress 
                    value={Math.round(buyer.rating * 20)} 
                    size={56} 
                    className="text-primary"
                  />
                  <span className="text-xs text-muted-foreground">Score</span>
                </div>

                {/* Name */}
                <div className="min-w-[120px]">
                  <div className="font-semibold text-foreground">
                    {maskName(buyer.name, buyer.unlocked)}
                  </div>
                  {!buyer.unlocked && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Locked
                    </Badge>
                  )}
                </div>

                {/* Category */}
                <div className="min-w-[100px]">
                  <div className="text-sm font-medium text-foreground">{buyer.category}</div>
                  <div className="text-xs text-muted-foreground">Category</div>
                </div>

                {/* Property Type */}
                <div className="min-w-[100px]">
                  <div className="text-sm font-medium text-foreground">{buyer.propertyType}</div>
                  <div className="text-xs text-muted-foreground">Type</div>
                </div>

                {/* Area */}
                <div className="min-w-[120px] flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{buyer.area}</div>
                    <div className="text-xs text-muted-foreground">Location</div>
                  </div>
                </div>

                {/* Budget */}
                <div className="min-w-[120px]">
                  <div className="text-sm font-semibold text-primary">{buyer.budget}</div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                </div>

                {/* Urgency */}
                <div className="min-w-[80px]">
                  <Badge 
                    variant={buyer.urgency === "High" ? "destructive" : buyer.urgency === "Medium" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {buyer.urgency}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">Priority</div>
                </div>

                {/* Rejection Rate */}
                <div className="flex flex-col items-center gap-1">
                  <RadialProgress 
                    value={100 - buyer.rejectionRate} 
                    size={56} 
                    className="text-emerald-500"
                  />
                  <span className="text-xs text-muted-foreground">Success</span>
                </div>

                {/* Action & Price */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                    </div>
                    <span className="text-muted-foreground font-medium">{buyer.leadPrice}</span>
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