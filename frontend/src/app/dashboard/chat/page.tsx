"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchApi } from "@/lib/api";

type Message = {
  role: "assistant" | "user";
  content: string;
};

export default function ChatDashboard() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Assalomu alaykum! Men sizning shaxsiy sanogen tafakkur bo'yicha sun'iy intellekt yordamchingizman. Sizga qanday yordam bera olaman?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI immediately
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send to backend (pass only previous messages as history to save tokens/context if needed, or pass all)
      const data = await fetchApi("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content })) // Skip the first greeting
        })
      });

      if (data.status === "success") {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: "Xatolik yuz berdi: " + (err.message || "Ulanishda muammo bo'ldi.") }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50 glass rounded-3xl border border-white/5 overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-primary/5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            Sanotaf AI <Sparkles size={16} className="text-primary" />
          </h2>
          <p className="text-xs text-foreground/60">Gemini ulanishi kutilyapti</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
            }`}>
              {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`p-4 rounded-2xl whitespace-pre-wrap ${
              msg.role === 'assistant' ? 'bg-white/5 rounded-tl-sm border border-white/5 text-foreground/90' : 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-sm shadow-lg'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 max-w-[80%]"
          >
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 rounded-tl-sm border border-white/5 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-sm text-foreground/70">O'ylanmoqda...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-white/10 bg-background/50">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Xabar yozing..." 
            className="w-full bg-background border border-white/10 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            className={`absolute right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isLoading ? 'bg-primary text-white hover:scale-105' : 'bg-white/5 text-foreground/40'
            }`}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} className={input.trim() && !isLoading ? 'ml-1' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
}
