"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Brain, LayoutDashboard, MessageSquare, Settings, LogOut, TreePine, Loader2, Trophy, Shield, BarChart2, Home } from "lucide-react";
import { useAuth } from "@/context/UserContext";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const menuItems = [
    { name: t.nav.home, icon: Home, path: "/" },
    { name: t.dashboard.courses, icon: LayoutDashboard, path: "/dashboard" },
    { name: t.dashboard.aiChat, icon: MessageSquare, path: "/dashboard/chat" },
    { name: t.dashboard.statistics, icon: BarChart2, path: "/dashboard/progress" },
    { name: "Murojaatlar", icon: MessageSquare, path: "/dashboard/messages" },
    { name: t.dashboard.settings, icon: Settings, path: "/dashboard/settings" },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: "Admin Panel", icon: Shield, path: "/dashboard/admin" });
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 hidden md:flex flex-col relative z-20">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white">
              <Brain size={18} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Sanotaf
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/20 text-primary font-bold border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'hover:bg-white/5 text-foreground/70 hover:text-foreground'}`}>
                  <item.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors w-full group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t.dashboard.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6 z-10">
          <div className="font-semibold text-lg">{t.dashboard.greeting}, {user.name}!</div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-primary p-0.5 overflow-hidden">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center font-bold overflow-hidden">
                {user.avatar ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* Subtle background glow for dashboard */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
