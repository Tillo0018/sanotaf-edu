"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/UserContext";

export default function Register() {
  const { t } = useLanguage();
  const router = useRouter();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    position: "",
    email: "",
    password: "",
    gender: "",
    school_location: "",
    pedagogical_experience: "",
    group: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetchApi("/groups/open", { method: "GET" });
        setGroups(res);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi("/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.status === "success") {
        localStorage.setItem("sanotaf_token", data.access_token);
        setUser(data.user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.errors && err.errors.email) {
        setError("Bu email allaqachon ro'yxatdan o'tgan.");
      } else {
        setError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center relative pt-24 pb-12">
        {/* Animated Background Gradients & Particles */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5"></div>
          <motion.div 
            animate={{ y: [0, -30, 0], x: [0, 40, 0], scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[20%] w-80 h-80 bg-secondary/20 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ y: [0, 60, 0], x: [0, -20, 0], scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="glass relative z-10 w-full max-w-lg p-8 md:p-10 mx-4 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-secondary transition-colors mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t.auth.backHome}
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary mb-3">
              {t.auth.registerTitle}
            </h1>
            <p className="text-foreground/70">
              {t.auth.registerSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                {t.auth.name}
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md" 
                placeholder="Abdulla Oripov" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                  {t.auth.region}
                </label>
                <select 
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md appearance-none"
                >
                  <option value="" disabled>Viloyatni tanlang</option>
                  <option value="toshkent">Toshkent</option>
                  <option value="samarqand">Samarqand</option>
                  <option value="fargona">Farg'ona</option>
                  <option value="andijon">Andijon</option>
                  <option value="namangan">Namangan</option>
                  <option value="buxoro">Buxoro</option>
                  <option value="navoiy">Navoiy</option>
                  <option value="qashqadaryo">Qashqadaryo</option>
                  <option value="surxondaryo">Surxondaryo</option>
                  <option value="jizzax">Jizzax</option>
                  <option value="sirdaryo">Sirdaryo</option>
                  <option value="xorazm">Xorazm</option>
                  <option value="qoraqalpogiston">Qoraqalpog'iston</option>
                </select>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                  {t.auth.position}
                </label>
                <input 
                  type="text" 
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md" 
                  placeholder="Biologiya o'qituvchisi" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                  Jinsi
                </label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md appearance-none"
                >
                  <option value="" disabled>Jinsingizni tanlang</option>
                  <option value="erkak">Erkak</option>
                  <option value="ayol">Ayol</option>
                </select>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                  Maktab joylashuvi
                </label>
                <select 
                  name="school_location"
                  value={formData.school_location}
                  onChange={handleChange}
                  required
                  className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md appearance-none"
                >
                  <option value="" disabled>Joylashuvni tanlang</option>
                  <option value="shahar">Shahar</option>
                  <option value="qishloq">Qishloq</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                  Pedagogik staj (yillarda)
                </label>
                <input 
                  type="number" 
                  name="pedagogical_experience"
                  value={formData.pedagogical_experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md" 
                  placeholder="Masalan: 5" 
                  required 
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                  Guruh
                </label>
                <select 
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  required
                  className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md appearance-none"
                >
                  <option value="" disabled>Guruhni tanlang</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                {t.auth.email}
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md" 
                placeholder="email@example.com" 
                required 
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-secondary transition-colors">
                {t.auth.password}
              </label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <motion.button 
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit" 
              className="w-full py-4 mt-2 bg-gradient-to-r from-secondary to-primary text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex justify-center items-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : t.auth.registerBtn}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-foreground/70">
            {t.auth.haveAccount}{" "}
            <Link href="/login" className="text-secondary font-bold hover:underline">
              {t.auth.loginBtn}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
