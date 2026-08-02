"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Loader2, Trophy, Medal, Star, MapPin, Briefcase, Lock, Key } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/UserContext";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface LeaderboardUser {
  id: number;
  name: string;
  region: string;
  position: string;
  total_score: number;
}

export default function PublicLeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, totalScore: myTotalScore, rank: myRank } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await fetchApi("/leaderboard");
        if (data.status === "success") {
          setUsers(data.leaderboard);
        }
      } catch (err) {
        console.error("Leaderboard yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="text-yellow-400 drop-shadow-md" size={32} />;
    if (index === 1) return <Medal className="text-gray-300 drop-shadow-md" size={28} />;
    if (index === 2) return <Medal className="text-amber-600 drop-shadow-md" size={28} />;
    return <span className="font-bold text-lg text-foreground/50 w-8 text-center">{index + 1}</span>;
  };

  const getCardStyle = (index: number, isCurrentUser: boolean) => {
    let base = "glass p-4 sm:p-6 rounded-3xl flex items-center gap-4 transition-all ";
    if (isCurrentUser) {
      base += "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.2)] scale-[1.02] ";
    } else {
      base += "border-white/5 hover:bg-white/5 ";
    }

    if (index === 0) base += "bg-gradient-to-r from-yellow-400/10 to-transparent border-yellow-400/20";
    if (index === 1) base += "bg-gradient-to-r from-gray-300/10 to-transparent border-gray-300/20";
    if (index === 2) base += "bg-gradient-to-r from-amber-600/10 to-transparent border-amber-600/20";
    
    return base;
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col relative">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Header />

      <main className="flex-1 pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary text-white mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <Trophy size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              O'qituvchilar Reytingi
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Sanotaf platformasida eng faol va eng ko'p bilim daraxtini o'stirgan peshqadamlar ro'yxati.
            </p>
          </motion.div>

          {!currentUser && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 p-[1px] rounded-3xl mb-12"
            >
              <div className="bg-background rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                    <Key className="text-primary" /> Reytingdan joy oling!
                  </h3>
                  <p className="text-foreground/70">
                    Siz ham ushbu peshqadamlar qatoriga qo'shilishni va o'z bilim daraxtingizni o'stirishni xohlaysizmi? Platformadan ro'yxatdan o'ting va kurslarni boshlang.
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <Link href="/register" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg">
                    {t.nav.register}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex py-20 items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-10 text-foreground/50 glass rounded-3xl border border-white/5 p-10">
                  <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                  Hozircha reytingda hech kim yo'q. Birinchilardan bo'ling!
                </div>
              ) : (
                <>
                {currentUser && !users.some(u => u.id === currentUser.id) && myRank > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-4 sm:p-6 rounded-3xl flex items-center gap-4 transition-all border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.2)] scale-[1.02] mb-8"
                  >
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      <span className="font-bold text-lg text-primary w-8 text-center">{myRank}</span>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-white/10 text-foreground">
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-foreground truncate">
                          {currentUser.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
                          Sizning o'rningiz
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/60 mt-1">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {currentUser.region}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {currentUser.position}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 justify-end text-secondary font-extrabold text-xl">
                        {myTotalScore} <Star size={18} className="fill-secondary text-secondary" />
                      </div>
                      <div className="text-xs text-foreground/50 uppercase font-semibold">Ball</div>
                    </div>
                  </motion.div>
                )}
                {users.map((user, index) => {
                  const isCurrentUser = currentUser?.id === user.id;
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={user.id}
                      className={getCardStyle(index, isCurrentUser)}
                    >
                      <div className="flex-shrink-0 w-12 flex justify-center">
                        {getRankIcon(index)}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-yellow-400/20 text-yellow-500' : index === 1 ? 'bg-gray-300/20 text-gray-300' : index === 2 ? 'bg-amber-600/20 text-amber-500' : 'bg-white/10 text-foreground'}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-foreground truncate">
                            {user.name}
                          </h3>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
                              Siz
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/60 mt-1">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {user.region}</span>
                          <span className="flex items-center gap-1"><Briefcase size={12} /> {user.position}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-1 justify-end text-secondary font-extrabold text-xl">
                          {user.total_score} <Star size={18} className="fill-secondary text-secondary" />
                        </div>
                        <div className="text-xs text-foreground/50 uppercase font-semibold">Ball</div>
                      </div>
                    </motion.div>
                  );
                })}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
