import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, FileText, Eye, Calendar, TrendingUp, Users, CheckCircle, Building, Home, MapPin, Bell, Maximize2, Wallet, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import BuyerLeadNotifications from "@/components/BuyerLeadNotifications";

const BuyerDashboard = () => {
  const { user } = useAuth();

  // Fetch user's requirements from database
  const { data: requirements = [], isLoading: requirementsLoading } = useQuery({
    queryKey: ['buyer-requirements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      // Fetch leads for each requirement
      const requirementsWithLeads = await Promise.all(
        (data || []).map(async (req) => {
          const { data: leadsData } = await supabase
            .from('leads')
            .select('id, status')
            .eq('requirement_id', req.id);
          
          const totalResponses = leadsData?.length || 0;
          const accepted = leadsData?.filter(l => l.status === 'approved').length || 0;
          const rejected = leadsData?.filter(l => l.status === 'rejected').length || 0;
          const pending = leadsData?.filter(l => l.status === 'pending').length || 0;
          
          return {
            id: req.id,
            title: req.title,
            type: req.property_type,
            bedrooms: req.bedrooms,
            area_min: req.area_min,
            area_max: req.area_max,
            budget_min: req.budget_min,
            budget_max: req.budget_max,
            status: req.status,
            totalResponses,
            accepted,
            rejected,
            pending,
            datePosted: new Date(req.created_at).toLocaleDateString()
          };
        })
      );
      
      return requirementsWithLeads;
    },
    enabled: !!user?.id
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['buyer-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { activeRequirements: 0, totalResponses: 0, totalViews: 0, scheduledVisits: 0 };
      
      // Count active requirements
      const { count: activeRequirements } = await supabase
        .from('requirements')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .eq('status', 'active');

      // Count total responses (sent leads for user's requirements)
      const { count: totalResponses } = await supabase
        .from('sent_leads')
        .select('*, leads!inner(*)', { count: 'exact', head: true })
        .eq('leads.buyer_id', user.id);

      return {
        activeRequirements: activeRequirements || 0,
        totalResponses: totalResponses || 0,
        totalViews: 0, // Placeholder for now
        scheduledVisits: 0 // Placeholder for now
      };
    },
    enabled: !!user?.id
  });

  // Recent activities - simplified for now
  const recentActivities = [
    {
      id: 1,
      type: "response",
      message: "Check your requirements for new property responses",
      broker: "System",
      time: "Recently"
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

      {/* Buyer Lead Notifications */}
      <BuyerLeadNotifications />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Requirements</p>
              <p className="text-2xl font-bold">{stats?.activeRequirements || 0}</p>
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
              <p className="text-2xl font-bold">{stats?.totalResponses || 0}</p>
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
              <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
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
              <p className="text-2xl font-bold">{stats?.scheduledVisits || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/post-requirement">
            <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
              <FileText className="h-6 w-6" />
              Post New Requirement
            </Button>
          </Link>
          <Link to="/buyer/pending-leads">
            <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
              <Bell className="h-6 w-6" />
              Pending Leads
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
            {requirementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading requirements...</p>
              </div>
            ) : requirements.length > 0 ? (
              requirements.map((req) => (
                <Link key={req.id} to={`/requirement/${req.id}`}>
                  <div className="p-5 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-card">
                    {/* Header with Title and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-foreground text-base flex-1">{req.title}</h3>
                      <Badge 
                        variant={req.status === "active" ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {req.status === 'active' ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                    
                    {/* Property Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Property Type */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50">
                          {(() => {
                            const PropertyIcon = getPropertyIcon(req.type);
                            return <PropertyIcon className="w-4 h-4 text-foreground" strokeWidth={1.5} />;
                          })()}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Type</div>
                          <div className="text-sm font-medium capitalize">{req.type}</div>
                        </div>
                      </div>
                      
                      {/* Area */}
                      {(req.area_min || req.area_max) && (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50">
                            <Maximize2 className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Area</div>
                            <div className="text-sm font-medium">
                              {req.area_min && req.area_max
                                ? `${req.area_min}-${req.area_max} sq ft`
                                : req.area_min
                                  ? `${req.area_min}+ sq ft`
                                  : `${req.area_max} sq ft`}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Budget */}
                      <div className="flex items-center space-x-2 col-span-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50">
                          <Wallet className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Budget</div>
                          <div className="text-sm font-medium">
                            {req.budget_min && req.budget_max 
                              ? `₹${(req.budget_min / 10000000).toFixed(1)}Cr - ₹${(req.budget_max / 10000000).toFixed(1)}Cr`
                              : req.budget_min 
                                ? `₹${(req.budget_min / 10000000).toFixed(1)}Cr+`
                                : req.budget_max
                                  ? `Up to ₹${(req.budget_max / 10000000).toFixed(1)}Cr`
                                  : 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Response Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                      <div className="flex flex-col items-center py-2 px-1 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                          <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{req.pending || 0}</span>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">Pending</span>
                      </div>
                      
                      <div className="flex flex-col items-center py-2 px-1 rounded-lg bg-green-50/50 dark:bg-green-950/20">
                        <div className="flex items-center space-x-1 mb-1">
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={2} />
                          <span className="text-lg font-bold text-green-700 dark:text-green-400">{req.accepted || 0}</span>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-300 font-medium">Accepted</span>
                      </div>
                      
                      <div className="flex flex-col items-center py-2 px-1 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                        <div className="flex items-center space-x-1 mb-1">
                          <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" strokeWidth={2} />
                          <span className="text-lg font-bold text-red-700 dark:text-red-400">{req.rejected || 0}</span>
                        </div>
                        <span className="text-xs text-red-600 dark:text-red-300 font-medium">Rejected</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No Requirements Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start by posting your first property requirement</p>
                <Link to="/post-requirement">
                  <Button size="sm">Post Requirement</Button>
                </Link>
              </div>
            )}
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