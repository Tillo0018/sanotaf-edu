"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { User, Mail, Globe, Moon, Sun, Monitor, Shield, Save, Upload, MapPin, Briefcase, Settings } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = 'https://sanotaf-edu.up.railway.app/api';

export default function SettingsPage() {
  const { user, checkAuth } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    region: "",
    position: ""
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        region: user.region || "",
        position: user.position || ""
      });
      if (user.avatar) {
        setAvatarPreview(`${API_URL.replace('/api', '')}/storage/${user.avatar}`);
      }
    }
  }, [user]);

  if (!mounted || !user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("sanotaf_token");
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("region", formData.region);
      submitData.append("position", formData.position);
      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      const res = await fetch(`${API_URL}/user/profile`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: submitData
      });

      if (res.ok) {
        await checkAuth(); // Refresh user data
        alert("Profil muvaffaqiyatli saqlandi!");
      } else {
        const data = await res.json();
        alert("Xatolik yuz berdi: " + JSON.stringify(data.errors || data.message));
      }
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block">
          {t.dashboard.settings}
        </h1>
        <p className="text-foreground/60 mt-2">
          Shaxsiy ma'lumotlaringizni va tizim sozlamalarini boshqaring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <h2 className="text-xl font-semibold">Profil ma'lumotlari</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 bg-background/50 flex items-center justify-center relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-foreground/40" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Upload size={24} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="text-xs text-foreground/50 mt-2">Rasmni o'zgartirish</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">F.I.SH</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">Elektron pochta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70">Viloyat</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70">Lavozim</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">Rol (Maqom)</label>
              <div className="relative opacity-70">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                <input
                  type="text"
                  disabled
                  defaultValue={user.role === 'admin' ? 'Administrator' : 'Talaba'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </form>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl border border-white/10 h-fit"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <Settings size={20} />
            </div>
            <h2 className="text-xl font-semibold">Tizim sozlamalari</h2>
          </div>

          <div className="space-y-6">
            {/* Language */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <Globe size={16} /> Tilni tanlash
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['uz', 'ru', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`py-2 px-4 rounded-xl border transition-all ${
                      lang === l 
                        ? 'bg-primary/20 border-primary text-primary font-medium shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                        : 'border-white/10 hover:bg-white/5 text-foreground/80 hover:text-foreground'
                    }`}
                  >
                    {l === 'uz' ? 'O\'zbek' : l === 'ru' ? 'Русский' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <Sun size={16} /> Mavzuni (Theme) tanlash
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Yorug\'', icon: Sun },
                  { value: 'dark', label: 'Qorong\'u', icon: Moon },
                  { value: 'system', label: 'Tizim', icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`py-2 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      theme === t.value 
                        ? 'bg-secondary/20 border-secondary text-secondary font-medium shadow-[0_0_15px_rgba(236,72,153,0.2)]' 
                        : 'border-white/10 hover:bg-white/5 text-foreground/80 hover:text-foreground'
                    }`}
                  >
                    <t.icon size={18} />
                    <span className="text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
