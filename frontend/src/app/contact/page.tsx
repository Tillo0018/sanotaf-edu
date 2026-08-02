"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import { Mail, MapPin, Phone, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { fetchApi } from "@/lib/api";

export default function Contact() {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchApi('/contact-messages', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.status === 'success') {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert(res.message || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6">
              {t.contact.title}
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              {t.contact.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="glass p-6 rounded-3xl flex items-center gap-6 group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Manzil</h3>
                  <p className="text-foreground/70">{t.contact.address}</p>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl flex items-center gap-6 group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <p className="text-foreground/70">ii.studio0018@gmail.com</p>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl flex items-center gap-6 group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Telefon</h3>
                  <p className="text-foreground/70">+998 99 900 00 18</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass p-8 md:p-10 rounded-3xl relative overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={20} />
                    <span>Xabaringiz muvaffaqiyatli yuborildi!</span>
                  </motion.div>
                )}

                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">
                    {t.contact.name}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-md"
                    placeholder="Ismingizni kiriting"
                    required
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">
                    {t.contact.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-md"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">
                    {t.contact.message}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-md resize-none"
                    placeholder="Xabaringizni yozing..."
                    required
                  ></textarea>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>{t.contact.sendBtn} <Send size={18} /></>}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
