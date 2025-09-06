import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";

const ChatBox = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [message, setMessage] = useState("");

  // Mock chat data - replace with actual API calls
  const chatData = {
    id: chatId,
    participantName: "John Realty",
    participantType: "broker",
    propertyTitle: "3 BHK Apartment in Baner",
    status: "active"
  };

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
            <div>
              <h2 className="font-semibold text-foreground">{chatData.participantName}</h2>
              <p className="text-sm text-muted-foreground">{chatData.propertyTitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Phone className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Video className="w-4 h-4" />
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
            onClick={() => setMessage("Can we schedule a property visit?")}
          >
            Schedule Visit
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("What are the nearby amenities?")}
          >
            Ask About Amenities
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("Is the price negotiable?")}
          >
            Price Negotiation
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setMessage("Thank you for your time.")}
          >
            Thank You
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;