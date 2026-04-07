import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, User, Clock } from "lucide-react";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

const playNotificationSound = () => {
  try {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
};

interface ChatRoom {
  id: string;
  visitor_name: string;
  visitor_email: string | null;
  status: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_admin: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
}

const AdminLiveChat = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    const { data } = await supabase
      .from("chat_rooms")
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (data) setRooms(data as ChatRoom[]);
  };

  useEffect(() => {
    fetchRooms();
    // Subscribe to room changes
    const channel = supabase
      .channel("admin-chat-rooms")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_rooms",
      }, () => fetchRooms())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Subscribe to new messages globally for notification
  useEffect(() => {
    const channel = supabase
      .channel("admin-chat-notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        if (msg.sender_type === "visitor") {
          playNotificationSound();
        }
        // If this message is for the selected room, add it
        if (selectedRoom && msg.room_id === selectedRoom.id) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedRoom]);

  // Fetch messages when room selected
  useEffect(() => {
    if (!selectedRoom) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", selectedRoom.id)
        .order("created_at");
      if (data) setMessages(data as ChatMessage[]);
      // Reset unread
      await supabase.from("chat_rooms").update({ unread_admin: 0 }).eq("id", selectedRoom.id);
    };
    fetch();
  }, [selectedRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !selectedRoom || sending) return;
    setSending(true);
    await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      sender_type: "admin",
      sender_name: "Admin",
      message: reply.trim(),
    });
    await supabase.from("chat_rooms").update({
      last_message: reply.trim(),
      last_message_at: new Date().toISOString(),
      unread_visitor: 1,
    }).eq("id", selectedRoom.id);
    setReply("");
    setSending(false);
    fetchRooms();
  };

  const totalUnread = rooms.reduce((sum, r) => sum + (r.unread_admin || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Live Chat</h1>
        {totalUnread > 0 && (
          <Badge className="bg-destructive text-destructive-foreground">{totalUnread} unread</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
        {/* Room list */}
        <Card className="overflow-y-auto lg:col-span-1">
          <div className="p-3 border-b">
            <p className="text-sm font-medium text-muted-foreground">{rooms.length} conversations</p>
          </div>
          <div className="divide-y">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full text-left p-3 hover:bg-secondary/50 transition-colors ${
                  selectedRoom?.id === room.id ? "bg-accent/10 border-l-2 border-accent" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{room.visitor_name}</p>
                      {room.visitor_email && <p className="text-[10px] text-muted-foreground truncate">{room.visitor_email}</p>}
                    </div>
                  </div>
                  {(room.unread_admin || 0) > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground text-[10px] h-5 shrink-0">
                      {room.unread_admin}
                    </Badge>
                  )}
                </div>
                {room.last_message && (
                  <p className="text-xs text-muted-foreground mt-1 truncate pl-10">{room.last_message}</p>
                )}
                {room.last_message_at && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 pl-10 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(room.last_message_at).toLocaleString()}
                  </p>
                )}
              </button>
            ))}
            {rooms.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No chats yet</p>
              </div>
            )}
          </div>
        </Card>

        {/* Chat area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedRoom ? (
            <>
              <div className="p-3 border-b flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedRoom.visitor_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedRoom.visitor_email || "No email"}</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs capitalize">{selectedRoom.status}</Badge>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                      msg.sender_type === "admin"
                        ? "bg-accent text-accent-foreground rounded-br-md"
                        : "bg-secondary rounded-bl-md"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-[9px] opacity-50 mt-0.5 text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t flex gap-2">
                <Input
                  placeholder="Type a reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                />
                <Button onClick={sendReply} disabled={sending || !reply.trim()} className="gap-1">
                  <Send className="h-4 w-4" />Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a conversation to reply</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminLiveChat;
