import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, Users, Filter, Building, Home, MapPin } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const BuyerChats = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch chats using security definer function
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['chats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .rpc('get_user_chats', { _user_id: profile.id });

      if (error) throw error;

      // Fetch related property and requirement data
      const chatsWithDetails = await Promise.all(
        data.map(async (chat: any) => {
          let propertyData = null;
          let requirementData = null;

          if (chat.property_id) {
            const { data: property } = await supabase
              .from('properties')
              .select('title, property_type, bedrooms, location')
              .eq('id', chat.property_id)
              .single();
            propertyData = property;
          }

          if (chat.requirement_id) {
            const { data: requirement } = await supabase
              .from('requirements')
              .select('title, property_type, bedrooms, location')
              .eq('id', chat.requirement_id)
              .single();
            requirementData = requirement;
          }

          return { ...chat, properties: propertyData, requirements: requirementData };
        })
      );

      // Fetch participant names using the safe RPC function
      const chatsWithParticipants = await Promise.all(
        chatsWithDetails.map(async (chat: any) => {
          const participantId = profile.user_type === 'broker' ? chat.buyer_id : chat.broker_id;
          
          const { data: participantProfile } = await supabase
            .rpc('get_profile_public', { target_user_id: participantId })
            .single();

          const participantName = participantProfile?.company_name || 
            `${participantProfile?.first_name || ''} ${participantProfile?.last_name || ''}`.trim() ||
            'Unknown User';

          return {
            id: chat.id,
            broker_name: participantName,
            propertyType: chat.properties?.property_type || chat.requirements?.property_type || 'apartment',
            bedrooms: chat.properties?.bedrooms || chat.requirements?.bedrooms || 0,
            location: (chat.properties?.location || chat.requirements?.location)?.city || 'Unknown',
            last_message: chat.last_message || 'No messages yet',
            last_message_time: chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
            requirement_title: chat.requirements?.title || chat.properties?.title || 'Property',
            unread_count: 0
          };
        })
      );

      return chatsWithParticipants;
    },
    enabled: !!profile?.id
  });

  // Real-time subscription for chats
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('buyer-chats-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `buyer_id=eq.${profile.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['chats', profile.id] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['chats', profile.id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, queryClient]);

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

  const filteredConversations = conversations.filter((conversation: any) =>
    conversation.broker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        ) : filteredConversations.length === 0 ? (
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
          filteredConversations.map((conversation: any) => (
            <Card 
              key={conversation.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/chat/${conversation.id}`)}
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{conversation.broker_name?.charAt(0) || 'B'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{conversation.broker_name || 'Broker'}</h3>
                    <span className="text-xs text-muted-foreground">
                      {conversation.last_message_time}
                    </span>
                  </div>
                  
                  {/* Property details */}
                  <div className="flex items-center space-x-2 mb-1">
                    {(() => {
                      const PropertyIcon = getPropertyIcon(conversation.propertyType);
                      return <PropertyIcon className="w-4 h-4 text-muted-foreground" />;
                    })()}
                    <span className="text-sm text-muted-foreground">{conversation.bedrooms} BHK</span>
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{conversation.location}</span>
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