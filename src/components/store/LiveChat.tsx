import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

const playNotificationSound = () => {
  try {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
};

const getSessionId = () => {
  let id = localStorage.getItem("chat_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chat_session_id", id);
  }
  return id;
};

interface ChatMessage {
  id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
}

const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = getSessionId();

  // Check for existing room on mount
  useEffect(() => {
    const checkExisting = async () => {
      const { data } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("session_id", sessionId)
        .eq("status", "active")
        .maybeSingle();
      if (data) {
        setRoomId(data.id);
        setName(data.visitor_name);
        setStarted(true);
      }
    };
    checkExisting();
  }, [sessionId]);

  // Fetch messages when room exists
  useEffect(() => {
    if (!roomId) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at");
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMsg]);
        if (newMsg.sender_type === "admin") {
          playNotificationSound();
          if (!open) setUnread(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const startChat = async () => {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from("chat_rooms")
      .insert({
        visitor_name: name.trim(),
        visitor_email: email.trim() || null,
        session_id: sessionId,
      })
      .select()
      .single();
    if (data) {
      setRoomId(data.id);
      setStarted(true);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !roomId || sending) return;
    setSending(true);
    await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_type: "visitor",
      sender_name: name,
      message: message.trim(),
    });
    await supabase.from("chat_rooms").update({
      last_message: message.trim(),
      last_message_at: new Date().toISOString(),
      unread_admin: messages.filter(m => m.sender_type === "visitor").length + 1,
    }).eq("id", roomId);
    setMessage("");
    setSending(false);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setOpen(true)}
              className="relative h-14 w-14 rounded-full bg-accent hover:bg-accent/90 shadow-xl shadow-accent/30"
            >
              <MessageCircle className="h-6 w-6" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[500px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-accent text-accent-foreground p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Live Chat</h3>
                <p className="text-xs opacity-80">We typically reply in a few minutes</p>
              </div>
              <Button variant="ghost" size="icon" className="text-accent-foreground hover:bg-accent-foreground/10" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {!started ? (
              /* Start form */
              <div className="flex-1 p-4 flex flex-col justify-center gap-4">
                <div className="text-center mb-2">
                  <MessageCircle className="h-10 w-10 text-accent mx-auto mb-2" />
                  <h4 className="font-bold">Start a conversation</h4>
                  <p className="text-xs text-muted-foreground">Enter your details to begin chatting</p>
                </div>
                <Input
                  placeholder="Your name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={startChat} disabled={!name.trim()} className="rounded-full bg-accent hover:bg-accent/90">
                  Start Chat
                </Button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground mt-8">
                      Say hello! We're here to help 👋
                    </p>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === "visitor" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        msg.sender_type === "visitor"
                          ? "bg-accent text-accent-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}>
                        {msg.sender_type === "admin" && (
                          <p className="text-[10px] font-medium opacity-70 mb-0.5">{msg.sender_name}</p>
                        )}
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <p className="text-[9px] opacity-50 mt-0.5 text-right">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    className="rounded-full"
                  />
                  <Button size="icon" onClick={sendMessage} disabled={sending || !message.trim()} className="rounded-full bg-accent hover:bg-accent/90 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;
