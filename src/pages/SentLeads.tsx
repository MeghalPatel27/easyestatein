import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, Mail, User, Clock, X } from "lucide-react";
import { useState } from "react";

const SentLeads = () => {
  const navigate = useNavigate();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");

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
      paid: "280",
      chatAccepted: true,
      buyerDetails: {
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        email: "rajesh.kumar@email.com",
        stage: "Ready to Buy",
        requirement: "Looking for a luxury villa in prime location with modern amenities",
        notes: "Prefers properties with garden space and parking for 2 cars"
      }
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
      paid: "220",
      chatAccepted: false,
      buyerDetails: {
        name: "Priya Sharma",
        phone: "+91 87654 32109",
        email: "priya.sharma@email.com",
        stage: "Exploring Options",
        requirement: "Commercial plot for business development",
        notes: "Looking for plots near IT hubs"
      }
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
      paid: "120",
      chatAccepted: true,
      buyerDetails: {
        name: "Amit Patel",
        phone: "+91 76543 21098",
        email: "amit.patel@email.com",
        stage: "Budget Finalization",
        requirement: "3BHK apartment with good connectivity",
        notes: "Family of 4, needs good schools nearby"
      }
    }
  ];

  const messageTemplates = [
    "Hello! I have shared a property that matches your requirements. Would you like to schedule a visit?",
    "Thank you for your interest. I can arrange a property viewing at your convenience.",
    "I have more similar properties available. Would you like to see additional options?",
    "The property documentation is ready for review. When would be a good time to discuss?",
    "I can provide more details about the amenities and neighborhood. Please let me know.",
    "Would you like to discuss the financing options available for this property?"
  ];

  const handleChatOpen = (lead: any) => {
    if (lead.chatAccepted) {
      setSelectedLead(lead);
      setIsChatModalOpen(true);
    }
  };

  const handleSendTemplate = (template: string) => {
    // Handle sending template message
    console.log("Sending template:", template);
    setSelectedTemplate("");
  };

  const handleHistoryView = () => {
    console.log("View buyer history");
  };

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

                  {/* Chat Button */}
                  <Button
                    onClick={() => handleChatOpen(lead)}
                    disabled={!lead.chatAccepted}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm ${
                      lead.chatAccepted
                        ? "bg-easyestate-pink hover:bg-easyestate-pink-dark text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Modal */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0 bg-white">
          {selectedLead && (
            <div className="flex h-full">
              {/* Left Section - Buyer Details */}
              <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200">
                <DialogHeader className="mb-6">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold text-text-primary">
                      Buyer Details
                    </DialogTitle>
                    <button
                      onClick={() => setIsChatModalOpen(false)}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Profile Info */}
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <User className="w-8 h-8 text-easyestate-pink" />
                    <div>
                      <h3 className="font-semibold text-text-primary">{selectedLead.buyerDetails.name}</h3>
                      <p className="text-sm text-text-secondary">Buyer</p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-text-primary">{selectedLead.buyerDetails.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-text-primary">{selectedLead.buyerDetails.email}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Stage */}
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Stage</h4>
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      {selectedLead.buyerDetails.stage}
                    </Badge>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Requirements</h4>
                    <p className="text-sm text-text-secondary bg-white p-3 rounded-lg">
                      {selectedLead.buyerDetails.requirement}
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Notes</h4>
                    <p className="text-sm text-text-secondary bg-white p-3 rounded-lg">
                      {selectedLead.buyerDetails.notes}
                    </p>
                  </div>

                  {/* History Button */}
                  <Button
                    onClick={handleHistoryView}
                    variant="outline"
                    className="w-full flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>View History</span>
                  </Button>
                </div>
              </div>

              {/* Right Section - Chat */}
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="font-semibold text-text-primary">
                    Chat with {selectedLead.buyerDetails.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {selectedLead.propertyName} • {selectedLead.location}
                  </p>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Sample Messages */}
                    <div className="flex justify-end">
                      <div className="bg-easyestate-pink text-white p-3 rounded-lg max-w-xs">
                        <p className="text-sm">Hello! I have shared a property that matches your requirements.</p>
                        <span className="text-xs opacity-75">2:30 PM</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-lg max-w-xs border">
                        <p className="text-sm">Thank you for sharing. Can we schedule a visit?</p>
                        <span className="text-xs text-gray-500">2:32 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Messages Section */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <h4 className="font-medium text-text-primary mb-3">Quick Templates</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {messageTemplates.map((template, index) => (
                      <Button
                        key={index}
                        onClick={() => handleSendTemplate(template)}
                        variant="outline"
                        className="text-left text-xs p-2 h-auto whitespace-normal hover:bg-easyestate-pink hover:text-white"
                      >
                        {template}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SentLeads;