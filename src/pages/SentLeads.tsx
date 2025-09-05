import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SentLeads = () => {
  const navigate = useNavigate();

  const sentLeads = [
    {
      id: 1,
      rating: 90,
      type: "Villa",
      location: "Bopal",
      budget: "₹5.2 Cr",
      propertyName: "Luxury Villa - Thaltej",
      status: "Connected",
      days: "2 days ago",
      rejection: "18% reject",
      paid: "280"
    },
    {
      id: 2,
      rating: 86,
      type: "Plot",
      location: "Shilaj",
      budget: "₹3.5 Cr",
      propertyName: "Commercial Plot - Science City",
      status: "Sent",
      days: "1 day ago",
      rejection: "20% reject",
      paid: "220"
    },
    {
      id: 3,
      rating: 78,
      type: "Apartment",
      location: "Satellite",
      budget: "₹2.2 Cr",
      propertyName: "3BHK Apartment - Satellite",
      status: "Rejected",
      days: "5 days ago",
      rejection: "42% reject",
      paid: "120"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Connected": return "bg-status-connected text-white";
      case "Sent": return "bg-status-sent text-white";
      case "Rejected": return "bg-status-rejected text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "border-status-high text-status-high";
    if (rating >= 80) return "border-status-medium text-status-medium";
    return "border-status-low text-status-low";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/lead-management')}
            className="flex items-center text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="text-easyestate-pink font-bold text-lg">easyestate</div>
          <span className="text-text-secondary">Lead Management</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">2450 coins</span>
            <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
          </div>
          <Button variant="outline" size="sm">Profile</Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex space-x-0 border border-border rounded-lg overflow-hidden w-fit">
          <Button 
            variant="outline" 
            className="rounded-none px-6 py-2 border-0"
            onClick={() => navigate('/lead-management')}
          >
            All Qualified Leads
          </Button>
          <Button className="bg-easyestate-pink text-white rounded-none px-6 py-2">
            All Sent Leads
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Sent Leads</h1>
          <p className="text-text-secondary">Properties you've submitted to leads</p>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {sentLeads.map((lead) => (
            <Card key={lead.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                {/* Rating */}
                <div className={`flex items-center justify-center w-12 h-12 border-2 rounded-full ${getRatingColor(lead.rating)}`}>
                  <span className="font-semibold">{lead.rating}</span>
                </div>

                {/* Lead Details */}
                <div className="flex-1 mx-6">
                  <div className="grid grid-cols-4 gap-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <div>
                        <div className="font-medium text-text-primary">{lead.type}</div>
                        <div className="text-xs text-text-secondary">Property</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <div>
                        <div className="font-medium text-text-primary">{lead.location}</div>
                        <div className="text-xs text-text-secondary">Location</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <div>
                        <div className="font-medium text-text-primary">{lead.budget}</div>
                        <div className="text-xs text-text-secondary">Budget</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="font-medium text-text-primary text-sm mb-1">{lead.propertyName}</div>
                      <div className="text-xs text-text-secondary">Submitted</div>
                    </div>
                  </div>
                </div>

                {/* Status and Stats */}
                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center">
                    <Badge className={`${getStatusColor(lead.status)} px-3 py-1 text-xs rounded mb-1`}>
                      {lead.status}
                    </Badge>
                    <span className="text-xs text-text-secondary">{lead.days}</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 border-2 border-easyestate-pink rounded-full flex items-center justify-center text-easyestate-pink font-semibold">
                      {lead.rejection.split('%')[0]}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">{lead.rejection}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-yellow-500 font-semibold">{lead.paid}</div>
                    <div className="text-xs text-text-secondary">Paid</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentLeads;