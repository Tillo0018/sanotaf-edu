"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/UserContext";

export default function Login() {
  const { t } = useLanguage();
  const router = useRouter();
  const { setUser, checkAuth } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.status === "success") {
        localStorage.setItem("sanotaf_token", data.access_token);
        setUser(data.user);
        await checkAuth(); // Fetch scores and rank for the new user
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Tizimga kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center relative pt-20">
        {/* Animated Background Gradients & Particles */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
          <motion.div 
            animate={{ y: [0, -40, 0], x: [0, 20, 0], scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[20%] w-72 h-72 bg-primary/20 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ y: [0, 50, 0], x: [0, -30, 0], scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px]"
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="glass relative z-10 w-full max-w-md p-8 md:p-12 mx-4 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t.auth.backHome}
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-3">
              {t.auth.loginTitle}
            </h1>
            <p className="text-foreground/70">
              {t.auth.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">
                {t.auth.email}
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all backdrop-blur-md" 
                placeholder="email@example.com" 
                required 
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">
                {t.auth.password}
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all backdrop-blur-md" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <motion.button 
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : t.auth.loginBtn}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-foreground/70">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              {t.auth.registerBtn}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
