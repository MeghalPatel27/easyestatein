import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MessageSquare, History, Building, Home, MapPin, Clock, CheckCircle, Calendar, Send } from "lucide-react";

const ChatsListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock chat data - replace with actual API calls
  const mockChats = [
    {
      id: "1",
      participantName: "John Realty",
      participantType: "broker",
      propertyType: "apartment",
      bedrooms: "3 BHK",
      location: "Baner",
      clientStage: "Visit Scheduled",
      unreadCount: 2,
      status: "active",
      history: [
        { date: "2024-01-15", event: "Lead Accepted", icon: CheckCircle },
        { date: "2024-01-16", event: "Details Sent", icon: Send },
        { date: "2024-01-17", event: "Visit Scheduled", icon: Calendar },
      ]
    },
    {
      id: "2",
      participantName: "Prime Properties", 
      participantType: "broker",
      propertyType: "villa",
      bedrooms: "2 BHK",
      location: "Wakad",
      clientStage: "Details Sent",
      unreadCount: 0,
      status: "active",
      history: [
        { date: "2024-01-14", event: "Lead Accepted", icon: CheckCircle },
        { date: "2024-01-15", event: "Details Sent", icon: Send },
      ]
    },
    {
      id: "3",
      participantName: "Elite Homes",
      participantType: "broker", 
      propertyType: "apartment",
      bedrooms: "4 BHK",
      location: "Koregaon Park",
      clientStage: "Inquiry Received",
      unreadCount: 1,
      status: "active",
      history: [
        { date: "2024-01-12", event: "Lead Accepted", icon: CheckCircle },
      ]
    }
  ];

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case "apartment":
        return Building;
      case "villa":
        return Home;
      default:
        return Building;
    }
  };

  const filteredChats = mockChats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.location.toLowerCase().includes(searchTerm.toLowerCase())
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
                       <div className="flex items-center mb-1">
                         <h3 className="font-semibold text-foreground truncate">
                           {chat.participantName}
                         </h3>
                       </div>
                       
                       {/* Property details with symbols */}
                       <div className="flex items-center space-x-2 mb-1">
                         {(() => {
                           const PropertyIcon = getPropertyIcon(chat.propertyType);
                           return <PropertyIcon className="w-4 h-4 text-muted-foreground" />;
                         })()}
                         <span className="text-sm text-muted-foreground">{chat.bedrooms}</span>
                         <MapPin className="w-3 h-3 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">{chat.location}</span>
                       </div>
                       
                       {/* Client stage instead of last message */}
                       <p className="text-sm font-medium text-foreground">
                         {chat.clientStage}
                       </p>
                     </div>
                  </div>
                   <div className="flex items-center space-x-2">
                     {chat.unreadCount > 0 && (
                       <div className="bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center">
                         {chat.unreadCount}
                       </div>
                     )}
                     
                     {/* History popup */}
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <History className="w-4 h-4" />
                         </Button>
                       </DialogTrigger>
                       <DialogContent>
                         <DialogHeader>
                           <DialogTitle>Client History - {chat.participantName}</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4">
                           {chat.history.map((event, index) => (
                             <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                               <event.icon className="w-5 h-5 text-primary" />
                               <div className="flex-1">
                                 <p className="font-medium text-foreground">{event.event}</p>
                                 <p className="text-sm text-muted-foreground">{event.date}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       </DialogContent>
                     </Dialog>
                     
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