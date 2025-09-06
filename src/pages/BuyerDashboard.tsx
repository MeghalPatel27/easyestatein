import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, MessageSquare, Users } from "lucide-react";

const BuyerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <div className="text-easyestate-pink font-bold text-lg">easyestate</div>
          <span className="text-text-secondary">Buyer Dashboard</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate('/post-requirement')}
          >
            + Post New Requirement
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">2450 coins</span>
            <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
          </div>
          <Button variant="outline" size="sm">Profile</Button>
        </div>
      </div>

      {/* Subheader */}
      <div className="bg-white border-b border-border px-4 py-4">
        <h1 className="text-xl font-semibold text-text-primary">Buyer Dashboard</h1>
        <p className="text-text-secondary">Manage your property requirements and broker chats</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-border rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-easyestate-pink-light rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-easyestate-pink" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">0</div>
                <div className="text-text-secondary">Total Requirements</div>
              </div>
            </div>
          </Card>

          <Card className="border border-border rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">0</div>
                <div className="text-text-secondary">Active Chats</div>
              </div>
            </div>
          </Card>

          <Card className="border border-border rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">0</div>
                <div className="text-text-secondary">Brokers Interested</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="flex space-x-0 mb-8 border border-border rounded-lg overflow-hidden">
          <Button 
            className="flex-1 bg-primary text-primary-foreground rounded-none py-3"
            onClick={() => navigate('/buyer-property-manager')}
          >
            Requirements (0)
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 rounded-none py-3 border-0"
            onClick={() => navigate('/chats')}
          >
            Chats (0)
          </Button>
        </div>

        {/* Empty State */}
        <Card className="border border-border rounded-lg p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">No requirements posted yet</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Post your first property requirement to start receiving broker responses.
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate('/post-requirement')}
          >
            + Post First Requirement
          </Button>
        </Card>
      </div>

      {/* Success Message */}
      <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
        Login successful
        <br />
        Welcome to EasyEstate!
      </div>
    </div>
  );
};

export default BuyerDashboard;