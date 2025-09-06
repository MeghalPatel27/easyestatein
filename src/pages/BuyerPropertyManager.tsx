import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, MessageSquare, CheckCircle } from "lucide-react";

const BuyerPropertyManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("qualified");

  // Mock data - replace with actual API calls
  const mockLeads = {
    qualified: [
      {
        id: "1",
        propertyTitle: "3 BHK Apartment in Baner",
        brokerName: "John Realty",
        area: "1200 sq ft", 
        price: "₹75 Lakhs",
        location: "Baner, Pune",
        status: "qualified",
        submittedAt: "2 hours ago"
      },
      {
        id: "2", 
        propertyTitle: "2 BHK Villa in Wakad",
        brokerName: "Prime Properties",
        area: "1500 sq ft",
        price: "₹90 Lakhs", 
        location: "Wakad, Pune",
        status: "qualified",
        submittedAt: "5 hours ago"
      }
    ],
    sent: [
      {
        id: "3",
        propertyTitle: "4 BHK Penthouse in Koregaon Park", 
        brokerName: "Elite Homes",
        area: "2000 sq ft",
        price: "₹1.2 Crores",
        location: "Koregaon Park, Pune", 
        status: "sent",
        submittedAt: "1 day ago"
      }
    ],
    approved: [
      {
        id: "4",
        propertyTitle: "3 BHK Apartment in Hinjewadi",
        brokerName: "Tech Realty", 
        area: "1100 sq ft",
        price: "₹68 Lakhs",
        location: "Hinjewadi, Pune",
        status: "approved", 
        submittedAt: "3 days ago"
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "qualified": return "bg-blue-100 text-blue-800";
      case "sent": return "bg-yellow-100 text-yellow-800"; 
      case "approved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "qualified": return <Eye className="w-4 h-4" />;
      case "sent": return <MessageSquare className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/buyer-dashboard')}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="text-primary font-bold text-lg">easyestate</div>
          <span className="text-muted-foreground">Property Manager</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Property Manager</h1>
          <p className="text-muted-foreground">Manage all property leads and responses</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qualified" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Qualified Leads ({mockLeads.qualified.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Sent Leads ({mockLeads.sent.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved Leads ({mockLeads.approved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qualified" className="mt-6">
            <div className="space-y-4">
              {mockLeads.qualified.map((lead) => (
                <Card key={lead.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{lead.propertyTitle}</h3>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusIcon(lead.status)}
                          <span className="ml-1 capitalize">{lead.status}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">by {lead.brokerName}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Area:</span> {lead.area}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> {lead.price}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {lead.location}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">Submitted {lead.submittedAt}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        Contact Broker
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <div className="space-y-4">
              {mockLeads.sent.map((lead) => (
                <Card key={lead.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{lead.propertyTitle}</h3>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusIcon(lead.status)}
                          <span className="ml-1 capitalize">{lead.status}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">by {lead.brokerName}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Area:</span> {lead.area}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> {lead.price}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {lead.location}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">Submitted {lead.submittedAt}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        Open Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="space-y-4">
              {mockLeads.approved.map((lead) => (
                <Card key={lead.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{lead.propertyTitle}</h3>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusIcon(lead.status)}
                          <span className="ml-1 capitalize">{lead.status}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">by {lead.brokerName}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Area:</span> {lead.area}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> {lead.price}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {lead.location}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">Submitted {lead.submittedAt}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        Continue Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BuyerPropertyManager;