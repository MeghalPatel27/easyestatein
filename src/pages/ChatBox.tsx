import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Phone, MoreVertical, Building, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ChatBox = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [message, setMessage] = useState("");
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat details using security definer function
  const { data: chatData } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) return null;

      const { data: chatArray, error: chatError } = await supabase
        .rpc('get_chat_by_id', { _chat_id: chatId });

      if (chatError) throw chatError;
      if (!chatArray || chatArray.length === 0) return null;

      const data = chatArray[0];

      // Fetch related property and requirement data
      let propertyData = null;
      let requirementData = null;

      if (data.property_id) {
        const { data: property } = await supabase
          .from('properties')
          .select('title, property_type, bedrooms, location')
          .eq('id', data.property_id)
          .single();
        propertyData = property;
      }

      if (data.requirement_id) {
        const { data: requirement } = await supabase
          .from('requirements')
          .select('title, property_type, bedrooms, location')
          .eq('id', data.requirement_id)
          .single();
        requirementData = requirement;
      }

      // Fetch other participant's info using the safe RPC function
      const participantId = profile?.user_type === 'broker' ? data.buyer_id : data.broker_id;
      const { data: participantProfile } = await supabase
        .rpc('get_profile_public', { target_user_id: participantId })
        .single();

      return {
        ...data,
        properties: propertyData,
        requirements: requirementData,
        participantName: participantProfile?.company_name || 
          `${participantProfile?.first_name || ''} ${participantProfile?.last_name || ''}`.trim() ||
          'Unknown User',
        propertyType: propertyData?.property_type || requirementData?.property_type || 'apartment',
        bedrooms: propertyData?.bedrooms || requirementData?.bedrooms || 0,
        location: ((propertyData?.location || requirementData?.location) as any)?.city || 'Unknown'
      };
    },
    enabled: !!chatId && !!profile?.id
  });

  // Fetch messages using security definer function
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      
      const { data, error } = await supabase
        .rpc('get_chat_messages', { _chat_id: chatId });

      if (error) throw error;
      return data;
    },
    enabled: !!chatId && !!profile?.id
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: profile?.id,
          content,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    }
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  if (!chatData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

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
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Building className="w-3 h-3" />
                <span>{chatData.bedrooms} BHK</span>
                <MapPin className="w-3 h-3 ml-1" />
                <span>{chatData.location}</span>
              </div>
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
        {messages.map((msg: any) => {
          const isCurrentUser = msg.sender_id === profile?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm lg:max-w-md xl:max-w-lg ${
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                } rounded-lg px-4 py-2`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  isCurrentUser 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground/70"
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button type="submit" size="sm" disabled={sendMessageMutation.isPending}>
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