import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { MessageSquare, History, Building, Home, MapPin, Clock, CheckCircle } from "lucide-react";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const ChatsListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { profile } = useAuth();

  // Fetch chats with real data
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          broker_id,
          buyer_id,
          property_id,
          requirement_id,
          last_message,
          last_message_at,
          created_at,
          properties (
            title,
            property_type,
            bedrooms,
            location
          ),
          requirements (
            title,
            property_type,
            bedrooms,
            location,
            urgency
          )
        `)
        .or(`broker_id.eq.${profile.id},buyer_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Fetch participant names using the safe RPC function
      const chatsWithParticipants = await Promise.all(
        data.map(async (chat: any) => {
          const participantId = profile.user_type === 'broker' ? chat.buyer_id : chat.broker_id;
          
          const { data: participantProfile } = await supabase
            .rpc('get_profile_public', { target_user_id: participantId })
            .single();

          const participantName = participantProfile?.company_name || 
            `${participantProfile?.first_name || ''} ${participantProfile?.last_name || ''}`.trim() ||
            'Unknown User';

          return {
            id: chat.id,
            participantName,
            participantType: profile.user_type === 'broker' ? 'buyer' : 'broker',
            propertyType: chat.properties?.property_type || chat.requirements?.property_type || 'apartment',
            bedrooms: chat.properties?.bedrooms || chat.requirements?.bedrooms || 0,
            location: (chat.properties?.location || chat.requirements?.location)?.city || 'Unknown',
            lastMessage: chat.last_message || 'No messages yet',
            lastMessageTime: chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
            unreadCount: 0,
            status: 'active',
            urgency: chat.requirements?.urgency || 'medium'
          };
        })
      );

      return chatsWithParticipants;
    },
    enabled: !!profile?.id
  });

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

  const filteredChats = chats.filter((chat: any) =>
    chat.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Listen for new messages in real-time
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('chats-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `broker_id=eq.${profile.id}`
      }, () => {
        // Refetch chats when there's a change
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `buyer_id=eq.${profile.id}`
      }, () => {
        // Refetch chats when there's a change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Chats</h1>
          <p className="text-muted-foreground">Communicate with brokers about your property requirements</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <EnhancedSearch
            placeholder="Search chats..."
            value={searchTerm}
            onChange={setSearchTerm}
            searchKey="chats"
          />
        </div>

        {/* Chats List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading chats...</p>
            </Card>
          ) : filteredChats.length > 0 ? (
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
                       
                       {/* Last message */}
                       <p className="text-sm text-muted-foreground truncate">
                         {chat.lastMessage}
                       </p>
                       {chat.lastMessageTime && (
                         <p className="text-xs text-muted-foreground">
                           {chat.lastMessageTime}
                         </p>
                       )}
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