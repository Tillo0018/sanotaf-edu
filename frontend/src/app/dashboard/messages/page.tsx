"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Loader2, MessageSquare, Reply } from "lucide-react";
import { format } from "date-fns";

export default function UserMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetchApi('/user/contact-messages');
      if (res.status === 'success') {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Murojaatlarim
        </h1>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center text-foreground/50 border border-white/5">
            Hali hech qanday murojaat yubormagansiz.
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg mb-1">Murojaat matni</h3>
                  <p className="text-foreground/80">{msg.message}</p>
                </div>
                <div className="text-xs text-foreground/50 shrink-0">
                  {format(new Date(msg.created_at), "dd.MM.yyyy HH:mm")}
                </div>
              </div>

              {msg.admin_reply ? (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-4 ml-8 relative">
                  <div className="absolute -left-3 top-4 text-primary bg-background rounded-full p-1 border border-primary/20">
                    <Reply size={14} />
                  </div>
                  <h4 className="font-bold text-sm text-primary mb-1">Admin javobi:</h4>
                  <p className="text-foreground/90">{msg.admin_reply}</p>
                  <div className="text-xs text-primary/50 text-right mt-2">
                    {format(new Date(msg.updated_at), "dd.MM.yyyy HH:mm")}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-foreground/40 italic ml-8 mt-2">
                  Admin tomonidan hali javob berilmagan.
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
