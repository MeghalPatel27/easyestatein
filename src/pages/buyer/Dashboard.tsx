import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, FileText, Eye, Calendar, TrendingUp, Users, CheckCircle, Building, Home, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const BuyerDashboard = () => {
  // Mock data for buyer requirements
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
      priority: "High"
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
      priority: "Medium"
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
      priority: "Low"
    }
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: "response",
      message: "New property response for 3 BHK Apartment in Baner",
      broker: "John Realty",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "message",
      message: "New message from Prime Properties",
      broker: "Prime Properties",
      time: "5 hours ago"
    },
    {
      id: 3,
      type: "visit",
      message: "Visit scheduled for Villa in Wakad",
      broker: "Elite Homes",
      time: "1 day ago"
    },
    {
      id: 4,
      type: "response",
      message: "New property response for Office Space",
      broker: "Commercial Hub",
      time: "2 days ago"
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "response":
        return FileText;
      case "message":
        return MessageSquare;
      case "visit":
        return Calendar;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground">Track your property requirements and connect with brokers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Requirements</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Property Responses</p>
              <p className="text-2xl font-bold">35</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">144</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visits Scheduled</p>
              <p className="text-2xl font-bold">7</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/buyer/requirements/new">
            <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
              <FileText className="h-6 w-6" />
              Post New Requirement
            </Button>
          </Link>
          <Link to="/buyer/chats">
            <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
              <MessageSquare className="h-6 w-6" />
              View Chats
            </Button>
          </Link>
          <Link to="/buyer/search">
            <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
              <Search className="h-6 w-6" />
              Search Properties
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Requirements */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Requirements</h2>
            <Link to="/buyer/requirements">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {requirements.slice(0, 3).map((req) => (
              <div key={req.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const PropertyIcon = getPropertyIcon(req.type);
                      return <PropertyIcon className="w-4 h-4 text-muted-foreground" />;
                    })()}
                    <h3 className="font-medium text-sm">{req.title}</h3>
                  </div>
                  <Badge 
                    variant={req.status === "Active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {req.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {req.location}
                  </span>
                  <span>{req.budget}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-4">
                    <span>{req.responses} responses</span>
                    <span>{req.views} views</span>
                  </div>
                  <span className="text-muted-foreground">{req.datePosted}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <Link to="/buyer/activities">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                {(() => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return <ActivityIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />;
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{activity.broker}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BuyerDashboard;