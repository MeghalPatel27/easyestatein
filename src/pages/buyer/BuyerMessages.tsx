import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  Phone, 
  Star,
  MapPin,
  Calendar,
  Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BuyerMessages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch sent leads as conversations
      const { data: sentLeads } = await supabase
        .from('sent_leads')
        .select(`
          *,
          leads (
            title,
            category,
            type,
            location,
            budget_min,
            budget_max
          ),
          profiles!broker_id (
            display_name,
            company_name,
            rating
          ),
          properties (
            title,
            price,
            location,
            images
          )
        `)
        .eq('leads.buyer_id', user.id);

      setConversations(sentLeads || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const mockMessages = [
    {
      id: 1,
      sender: 'broker',
      message: 'Hi! I have a perfect property matching your requirements. Would you like to schedule a visit?',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      sender: 'buyer',
      message: 'Yes, that sounds interesting. Can you share more details about the property?',
      timestamp: '10:35 AM'
    },
    {
      id: 3,
      sender: 'broker',
      message: 'Sure! This is a 3BHK apartment in Bandra with all modern amenities. The price is within your budget range.',
      timestamp: '10:37 AM'
    }
  ];

  const filteredConversations = conversations.filter(conv => 
    conv.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.properties?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/buyer-dashboard')}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Messages</h1>
              <p className="text-muted-foreground">Chat with brokers about your requirements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Conversations Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start getting property matches to begin conversations with brokers
                    </p>
                    <Button onClick={() => navigate('/buyer/post-requirement')}>
                      Post Requirement
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredConversations.map((conversation) => (
                  <Card 
                    key={conversation.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {conversation.profiles?.display_name?.charAt(0) || 'B'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {conversation.profiles?.display_name || 'Broker'}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {conversation.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {conversation.profiles?.company_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Property: {conversation.properties?.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{conversation.profiles?.rating || '4.5'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {selectedConversation.profiles?.display_name?.charAt(0) || 'B'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {selectedConversation.profiles?.display_name || 'Broker'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.profiles?.company_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Property Info Bar */}
                <div className="px-6 py-2 bg-muted/50 border-b">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{selectedConversation.properties?.title}</span>
                    <span className="text-muted-foreground">
                      ₹{selectedConversation.properties?.price?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {mockMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'buyer'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'buyer'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && console.log('Send message')}
                    />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start chatting
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerMessages;