import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Phone, MoreVertical, Clock, Building, MapPin } from "lucide-react";

const ChatBox = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [message, setMessage] = useState("");

  // Mock chat data - replace with actual API calls
  const chatData = {
    id: chatId,
    participantName: "John Realty",
    participantType: "broker",
    propertyType: "apartment",
    bedrooms: "3BHK",
    location: "Baner",
    clientStage: "Visit Scheduled",
    status: "active"
  };

  // Mock client history timeline
  const clientHistory = [
    { date: "2024-01-15", event: "Lead Accepted", description: "Client showed interest in the property" },
    { date: "2024-01-16", event: "Details Sent", description: "Complete property information package shared" },
    { date: "2024-01-17", event: "Visit Scheduled", description: "Property viewing arranged for tomorrow" },
  ];

  const mockMessages = [
    {
      id: "1",
      senderId: "broker1",
      senderName: "John Realty",
      message: "Hello! I have a perfect 3 BHK apartment that matches your requirements.",
      timestamp: "10:30 AM",
      isCurrentUser: false
    },
    {
      id: "2", 
      senderId: "buyer1",
      senderName: "You",
      message: "That sounds interesting. Can you share more details about the location and amenities?",
      timestamp: "10:32 AM", 
      isCurrentUser: true
    },
    {
      id: "3",
      senderId: "broker1", 
      senderName: "John Realty",
      message: "It's located in Baner with 1200 sq ft area. The building has a gym, swimming pool, and 24/7 security.",
      timestamp: "10:35 AM",
      isCurrentUser: false
    },
    {
      id: "4",
      senderId: "buyer1",
      senderName: "You", 
      message: "What's the price range? And when can we schedule a visit?",
      timestamp: "10:37 AM",
      isCurrentUser: true
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add message sending logic here
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
              {chatData.participantName.charAt(0)}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="p-1 h-auto">
                  <Clock className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Client History</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {clientHistory.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b border-border last:border-b-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{item.event}</h4>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <h2 className="font-semibold text-foreground">{chatData.participantName}</h2>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Building className="w-3 h-3" />
                <span>{chatData.bedrooms}</span>
                <MapPin className="w-3 h-3 ml-1" />
                <span>{chatData.location}</span>
              </div>
              <p className="text-xs text-primary font-medium">{chatData.clientStage}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Phone className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-sm lg:max-w-md xl:max-w-lg ${
                msg.isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              } rounded-lg px-4 py-2`}
            >
              <p className="text-sm">{msg.message}</p>
              <p className={`text-xs mt-1 ${
                msg.isCurrentUser 
                  ? "text-primary-foreground/70" 
                  : "text-muted-foreground/70"
              }`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Predefined Templates */}
      <div className="border-t border-border p-4 bg-muted/30">
        <p className="text-sm font-medium text-foreground mb-2">Quick Responses:</p>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("I'm sending you the complete property details including floor plans, amenities, and pricing.")}
          >
            Send Property Details
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("Here's the property information package with all specifications and photos.")}
          >
            Property Info Package
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("The property is available for immediate viewing. Let me know your preferred time slots.")}
          >
            Schedule Viewing
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("I can arrange a virtual tour or site visit at your convenience.")}
          >
            Arrange Tour
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("Here are my contact details for direct communication: [Phone/Email]")}
          >
            Share Contact
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("Thank you for your interest. I'm here to assist with any queries.")}
          >
            Thank You
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;