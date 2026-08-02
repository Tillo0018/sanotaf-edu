"use client";

import Link from "next/link";
import { Leaf, Sun, Moon, Globe, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Language } from "@/locales";
import { useAuth } from "@/context/UserContext";

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-white/10 rounded-none bg-background/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <Leaf size={24} />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Sanotaf
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/80">
          <Link href="/" className="hover:text-primary transition-colors">{t.nav.home}</Link>
          <Link href="/courses" className="hover:text-primary transition-colors">{t.nav.courses}</Link>
          <Link href="/leaderboard" className="hover:text-primary transition-colors">{t.nav.leaderboard}</Link>
          <Link href="/statistics" className="hover:text-primary transition-colors">{t.nav.statistics}</Link>
          <Link href="/about" className="hover:text-primary transition-colors">{t.nav.about}</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">{t.nav.contact}</Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Language Toggle */}
          <div className="relative group">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2">
              <Globe size={20} />
              <span className="text-sm font-semibold uppercase">{lang}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-32 bg-background border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden flex flex-col z-50">
              {(['uz', 'ru', 'en'] as Language[]).map((l) => (
                <button 
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-4 py-2 text-left hover:bg-primary/20 transition-colors ${lang === l ? 'text-primary font-bold bg-primary/10' : ''}`}
                >
                  {l === 'uz' ? "O'zbek" : l === 'ru' ? 'Русский' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-4 ml-2">
              <Link href="/dashboard" className="hidden lg:block font-medium hover:text-primary transition-colors">
                {user.name}
              </Link>
              <button 
                onClick={logout}
                className="hidden sm:block px-4 py-2 md:px-6 md:py-2.5 bg-background border border-foreground/10 text-foreground rounded-full font-medium hover:bg-foreground/5 transition-all text-sm md:text-base"
              >
                {t.dashboard.logout}
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden lg:block px-4 py-2 font-medium hover:text-primary transition-colors">
                {t.nav.login}
              </Link>
              <Link href="/register" className="hidden sm:block px-4 py-2 md:px-6 md:py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)] text-sm md:text-base">
                {t.nav.register}
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors ml-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-b border-white/10 p-6 flex flex-col gap-4 shadow-xl z-50">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">{t.nav.home}</Link>
          <Link href="/courses" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">{t.nav.courses}</Link>
          <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">{t.nav.leaderboard}</Link>
          <Link href="/statistics" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">{t.nav.statistics}</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">{t.nav.about}</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">{t.nav.contact}</Link>
          
          <div className="h-px bg-foreground/10 my-2 w-full"></div>
          
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">
                {user.name} (Shaxsiy xona)
              </Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left font-medium hover:text-red-500 transition-colors">
                {t.dashboard.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">
                {t.nav.login}
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-primary transition-colors">
                {t.nav.register}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
