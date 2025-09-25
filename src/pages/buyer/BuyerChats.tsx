import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, Users, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const BuyerChats = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  
  // Placeholder for future implementation
  // This will eventually fetch chat conversations related to the buyer's requirements
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['buyer-chats', user?.id],
    queryFn: async () => {
      // Future implementation: fetch conversations from database
      return [];
    },
    enabled: !!user
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Chats</h1>
          <p className="text-muted-foreground">Communicate with brokers and agents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Chat List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-lg flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No conversations yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              When brokers respond to your requirements, conversations will appear here.
            </p>
          </Card>
        ) : (
          conversations.map((conversation: any) => (
            <Card key={conversation.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{conversation.broker_name?.charAt(0) || 'B'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{conversation.broker_name || 'Broker'}</h3>
                    <span className="text-xs text-muted-foreground">
                      {conversation.last_message_time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {conversation.last_message || 'No messages yet'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {conversation.requirement_title}
                    </Badge>
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BuyerChats;