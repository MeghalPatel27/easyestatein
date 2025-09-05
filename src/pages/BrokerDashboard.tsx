import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";

const BrokerDashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState("");

  const verifiedProperties = [
    "Luxury Villa - Thaltej",
    "Commercial Plot - Science City", 
    "Office Space - Prahlad Nagar"
  ];

  const handleSubmitProperty = (property: any) => {
    setSelectedLead(property);
    setIsModalOpen(true);
  };

  const handlePayment = () => {
    if (selectedProperty) {
      // Handle payment logic here
      console.log("Processing payment for", selectedProperty);
      setIsModalOpen(false);
      setSelectedProperty("");
    }
  };

  const properties = [
    {
      id: 1,
      rating: 95,
      type: "Bungalow",
      location: "Thaltej",
      budget: "₹4.5 Cr",
      status: "High",
      urgency: "Low",
      rejection: "15% reject",
      submitProperty: "230"
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
    },
    {
      id: 4,
      rating: 78,
      type: "5BHK Bungalow",
      location: "Thaltej",
      budget: "₹6.2 Cr",
      status: "Medium",
      urgency: "Low",
      rejection: "28% reject",
      submitProperty: "320"
    },
    {
      id: 5,
      rating: 75,
      type: "Plot",
      location: "Shilaj",
      budget: "₹3.1 Cr",
      status: "Low",
      urgency: "Low",
      rejection: "45% reject",
      submitProperty: "150"
    },
    {
      id: 6,
      rating: 72,
      type: "Apartment",
      location: "Bopal",
      budget: "₹1.8 Cr",
      status: "High",
      urgency: "Low",
      rejection: "38% reject",
      submitProperty: "120"
    },
    {
      id: 7,
      rating: 68,
      type: "Office Space",
      location: "Prahlad Nagar",
      budget: "₹4.5 Cr",
      status: "Medium",
      urgency: "Low",
      rejection: "42% reject",
      submitProperty: "250"
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
      <div className="bg-white border-b border-border px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="text-easyestate-pink font-bold text-lg">easyestate</div>
          <span className="text-text-secondary hidden sm:inline">Broker Dashboard</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/lead-management')}
            className="bg-easyestate-pink hover:bg-easyestate-pink-dark text-white w-full sm:w-auto"
          >
            Lead Manager
          </Button>
          <Button
            onClick={() => navigate('/property-manager')}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Property Manager
          </Button>
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">2450 coins</span>
              <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-4 sm:ml-0 p-1"
              onClick={() => navigate('/broker-profile')}
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                R
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-text-secondary text-sm sm:text-base">383K apartments in Bopal under 1.5 cr</div>
          <Button className="bg-easyestate-pink hover:bg-easyestate-pink-dark text-white w-full sm:w-auto">
            Search by Selection
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
              Most Potential Buyers as per your inventory
            </h1>
            <p className="text-text-secondary text-sm">Sorted by highest rating to lowest rating</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Rating (High → Low)</span>
            <select className="border border-border rounded px-3 py-1 text-sm">
              <option>↓</option>
            </select>
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id} className="border border-border rounded-lg p-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Rating */}
                <div className={`flex items-center justify-center w-12 h-12 border-2 rounded-full flex-shrink-0 ${getRatingColor(property.rating)}`}>
                  <span className="font-semibold">{property.rating}</span>
                </div>

                {/* Property Details */}
                <div className="flex-1 w-full lg:mx-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-text-primary">{property.type}</div>
                        <div className="text-xs text-text-secondary">Property</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-text-primary">{property.location}</div>
                        <div className="text-xs text-text-secondary">Location</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-text-primary">{property.budget}</div>
                        <div className="text-xs text-text-secondary">Budget</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(property.status)} px-2 py-1 text-xs rounded`}>
                        {property.status}
                      </Badge>
                      <span className="text-xs text-text-secondary">{property.urgency}</span>
                    </div>
                  </div>
                </div>

                {/* Stats and Action */}
                <div className="flex flex-row lg:flex-row items-center justify-between lg:justify-end space-x-4 lg:space-x-6 w-full lg:w-auto">
                  <div className="text-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-easyestate-pink rounded-full flex items-center justify-center text-easyestate-pink font-semibold text-sm">
                      {property.rejection.split('%')[0]}
                    </div>
                    <div className="text-xs text-text-secondary mt-1 hidden sm:block">{property.rejection}</div>
                  </div>
                  
                  <Button 
                    className="bg-easyestate-pink hover:bg-easyestate-pink-dark text-white px-4 lg:px-6 text-sm"
                    onClick={() => handleSubmitProperty(property)}
                  >
                    Submit Property
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-yellow-500 font-semibold text-sm lg:text-base">{property.submitProperty}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit Property Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-lg">
          <DialogHeader className="flex flex-row items-center justify-between pb-4">
            <DialogTitle className="text-lg font-semibold text-text-primary">
              Submit Property to Lead
            </DialogTitle>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              {/* Lead Details */}
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Lead Details:</h3>
                <p className="text-text-secondary">
                  {selectedLead.type} in {selectedLead.location} • {selectedLead.budget}
                </p>
                <p className="text-yellow-500 font-semibold mt-1">
                  Cost: {selectedLead.submitProperty} coins
                </p>
              </div>

              {/* Property Selection */}
              <div className="space-y-2">
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="w-full h-12 border-2 border-easyestate-pink rounded-lg">
                    <SelectValue placeholder="Select your verified property" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {verifiedProperties.map((property) => (
                      <SelectItem key={property} value={property} className="hover:bg-gray-50">
                        {property}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handlePayment}
                disabled={!selectedProperty}
                className="w-full h-12 bg-easyestate-pink hover:bg-easyestate-pink-dark text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit & Pay {selectedLead.submitProperty} Coins
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokerDashboard;