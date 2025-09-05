import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LeadManagement = () => {
  const navigate = useNavigate();

  const qualifiedLeads = [
    {
      id: 1,
      rating: 95,
      type: "Bungalow",
      location: "Thaltej",
      budget: "₹4.5 Cr",
      status: "High",
      urgency: "Low",
      rejection: "10% reject",
      submitProperty: "250"
    },
    {
      id: 2,
      rating: 89,
      type: "Plot",
      location: "Vaishno devi Circle",
      budget: "₹4.2 Cr",
      status: "High",
      urgency: "Low",
      rejection: "22% reject",
      submitProperty: "200"
    },
    {
      id: 3,
      rating: 82,
      type: "Office",
      location: "Science City",
      budget: "₹2.8 Cr",
      status: "Medium",
      urgency: "Low",
      rejection: "35% reject",
      submitProperty: "180"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "High": return "bg-status-high text-white";
      case "Medium": return "bg-status-medium text-white";
      case "Low": return "bg-status-low text-white";
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
            onClick={() => navigate('/broker-dashboard')}
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
          <Button className="bg-easyestate-pink text-white rounded-none px-6 py-2">
            All Qualified Leads
          </Button>
          <Button 
            variant="outline" 
            className="rounded-none px-6 py-2 border-0"
            onClick={() => navigate('/sent-leads')}
          >
            All Sent Leads
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Qualified Leads</h1>
          <p className="text-text-secondary">Leads matching your property inventory</p>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {qualifiedLeads.map((lead) => (
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
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(lead.status)} px-2 py-1 text-xs rounded`}>
                        {lead.status}
                      </Badge>
                      <span className="text-xs text-text-secondary">{lead.urgency}</span>
                    </div>
                  </div>
                </div>

                {/* Stats and Action */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="w-12 h-12 border-2 border-easyestate-pink rounded-full flex items-center justify-center text-easyestate-pink font-semibold">
                      {lead.rejection.split('%')[0]}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">{lead.rejection}</div>
                  </div>
                  
                  <Button className="bg-easyestate-pink hover:bg-easyestate-pink-dark text-white px-6">
                    Submit Property
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-yellow-500 font-semibold">{lead.submitProperty}</div>
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

export default LeadManagement;