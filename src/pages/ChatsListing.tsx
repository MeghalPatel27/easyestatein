import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MessageSquare, Phone } from "lucide-react";

const ChatsListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock chat data - replace with actual API calls
  const mockChats = [
    {
      id: "1",
      participantName: "John Realty",
      participantType: "broker",
      propertyTitle: "3 BHK Apartment in Baner",
      lastMessage: "What's the price range? And when can we schedule a visit?",
      timestamp: "2 min ago",
      unreadCount: 2,
      status: "active"
    },
    {
      id: "2",
      participantName: "Prime Properties", 
      participantType: "broker",
      propertyTitle: "2 BHK Villa in Wakad",
      lastMessage: "The property is available for immediate possession",
      timestamp: "1 hour ago",
      unreadCount: 0,
      status: "active"
    },
    {
      id: "3",
      participantName: "Elite Homes",
      participantType: "broker", 
      propertyTitle: "4 BHK Penthouse in Koregaon Park",
      lastMessage: "Let me know if you need any additional information",
      timestamp: "1 day ago",
      unreadCount: 1,
      status: "active"
    }
  ];

  const filteredChats = mockChats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
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
          <span className="text-muted-foreground">Chats</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Chats</h1>
          <p className="text-muted-foreground">Communicate with brokers about your property requirements</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Chats List */}
        <div className="space-y-4">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <Card 
                key={chat.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {chat.participantName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {chat.participantName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {chat.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {chat.propertyTitle}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {chat.unreadCount > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-lg flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No chats yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start by posting a requirement or responding to broker inquiries to begin conversations.
              </p>
              <Button onClick={() => navigate('/post-requirement')}>
                Post a Requirement
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatsListing;