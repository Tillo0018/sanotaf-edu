"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Brain, Leaf, Bot, GraduationCap, ChevronRight, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Animated Background Gradients & Particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/hero.png"
            alt="Biology and Technology Integration"
            fill
            sizes="100vw"
            className="object-cover opacity-20 dark:opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background"></div>
          
          {/* Floating glowing orbs */}
          <motion.div 
            animate={{ 
              y: [0, -50, 0],
              x: [0, 30, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]"
          />
          <motion.div 
            animate={{ 
              y: [0, 60, 0],
              x: [0, -40, 0],
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-secondary/20 rounded-full blur-[100px]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-start text-left"
          >
            <motion.div 
              variants={fadeIn} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 cursor-pointer"
            >
              <Sparkles className="text-primary animate-pulse" size={16} />
              <span className="text-sm font-semibold text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">{t.hero.badge}</span>
            </motion.div>

            <motion.div variants={fadeIn}>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                {t.hero.title1} <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">{t.hero.title2}</span>
              </h1>
            </motion.div>

            <motion.p variants={fadeIn} className="text-lg md:text-xl mb-10 text-foreground/80 leading-relaxed max-w-2xl">
              {t.hero.desc}
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2">
                {t.hero.startBtn}
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            className="hidden lg:flex justify-center perspective-[1000px]"
          >
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full aspect-square max-w-md"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 blur-[60px] rounded-full animate-pulse"></div>
              <Image 
                src="/hero.png" 
                alt="Hero 3D" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-[3rem] glass p-2 border-2 border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.3)] transition-transform duration-500 hover:scale-105" 
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">{t.features.title}</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">{t.features.subtitle}</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeIn} className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                <Brain size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.features.f1_title}</h3>
              <p className="text-foreground/70 leading-relaxed">
                {t.features.f1_desc}
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeIn} className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Bot size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.features.f2_title}</h3>
              <p className="text-foreground/70 leading-relaxed">
                {t.features.f2_desc}
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn} className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.features.f3_title}</h3>
              <p className="text-foreground/70 leading-relaxed">
                {t.features.f3_desc}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Gamification Tree Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/5 -skew-y-3 transform origin-top-left z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-secondary/20 blur-[120px] rounded-full"></div>
              <Image
                src="/tree_v2.png"
                alt="Knowledge Tree"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-float relative z-0"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
              {t.tree.title}
            </h2>
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
              {t.tree.desc}
            </p>

            <ul className="space-y-6">
              {[
                { icon: "🌱", title: t.tree.s1_title, desc: t.tree.s1_desc },
                { icon: "🌿", title: t.tree.s2_title, desc: t.tree.s2_desc },
                { icon: "🌳", title: t.tree.s3_title, desc: t.tree.s3_desc },
                { icon: "🍎", title: t.tree.s4_title, desc: t.tree.s4_desc }
              ].map((step, idx) => (
                <li key={idx} className="flex items-center gap-4 glass p-4 rounded-2xl">
                  <span className="text-3xl">{step.icon}</span>
                  <div>
                    <h4 className="font-bold text-lg">{step.title}</h4>
                    <p className="text-sm text-foreground/60">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-lg py-12 text-center mt-20">
        <p className="text-foreground/50">
          © {new Date().getFullYear()} Sanotaf. {t.footer.rights}
        </p>
        <p className="text-foreground/40 text-sm mt-2">
          {t.footer.desc}
        </p>
      </footer>
    </div>
  );
}
