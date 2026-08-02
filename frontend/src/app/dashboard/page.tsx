"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { PlayCircle, FileText, CheckCircle2, Lock, Loader2, Leaf, Sprout, TreePine, TreeDeciduous, Trophy, Star, BookOpen } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/context/UserContext";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

export default function DashboardHome() {
  const { t } = useLanguage();
  const { totalScore, rank, completedModules } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<any[]>([]);

  const maxScore = 100;
  const percentage = Math.min(100, (totalScore / maxScore) * 100);
  
  let treeLevelName = "Urug'";
  let treeImage = "/tree_1.png";

  if (totalScore >= 10 && totalScore < 30) {
    treeLevelName = "Nihol";
    treeImage = "/tree_2.png";
  } else if (totalScore >= 30 && totalScore < 60) {
    treeLevelName = "Kichik ko'chat";
    treeImage = "/tree_3.png";
  } else if (totalScore >= 60) {
    treeLevelName = "Katta daraxt";
    treeImage = "/tree_4.png";
  }

  useEffect(() => {
    const getCourses = async () => {
      try {
        const [courseData, surveyRes] = await Promise.all([
          fetchApi("/courses"),
          fetchApi("/stds-survey/my-results").catch(() => null)
        ]);

        if (courseData.status === "success") {
          setCourses(courseData.courses);
        }

        if (surveyRes && surveyRes.status === 'success' && surveyRes.data) {
          const pre = surveyRes.data.pre;
          const post = surveyRes.data.post;

          const chartData = [
            { subject: 'Refleksivlik', Pre: pre?.score_reflexive || 0, Post: post?.score_reflexive || 0 },
            { subject: 'Kognitiv', Pre: pre?.score_cognitive || 0, Post: post?.score_cognitive || 0 },
            { subject: 'Konstruktiv', Pre: pre?.score_constructive || 0, Post: post?.score_constructive || 0 },
            { subject: 'Motivatsion', Pre: pre?.score_motivational || 0, Post: post?.score_motivational || 0 },
            { subject: 'Emotsional', Pre: pre?.score_emotional || 0, Post: post?.score_emotional || 0 },
          ];
          // Only show chart if at least Pre test is completed
          if (pre) {
            setSurveyData(chartData);
          }
        }
      } catch (err) {
        console.error("Kurslarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, []);

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-background to-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
            <Trophy size={28} />
          </div>
          <div>
            <div className="text-sm text-foreground/60 font-semibold uppercase tracking-wider">Umumiy Reyting</div>
            <div className="text-3xl font-extrabold text-foreground">{rank > 0 ? `#${rank}` : '-'}</div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-background to-secondary/5 border border-secondary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="w-14 h-14 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center shadow-inner">
            <Star size={28} />
          </div>
          <div>
            <div className="text-sm text-foreground/60 font-semibold uppercase tracking-wider">To'plangan Ballar</div>
            <div className="text-3xl font-extrabold text-foreground">{totalScore}</div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-background to-white/5 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-foreground flex items-center justify-center shadow-inner">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div className="text-sm text-foreground/60 font-semibold uppercase tracking-wider">O'zlashtirilgan Darslar</div>
            <div className="text-3xl font-extrabold text-foreground">{completedModules}</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
      {/* Left Column: Courses list */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-8 rounded-3xl min-h-[500px]">
          <h2 className="text-2xl font-bold mb-6">{t.dashboard.courses}</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center text-foreground/50 py-10">Hozircha kurslar yo'q</div>
          ) : (
            <div className="space-y-4">
              {courses.map((course, index) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-2xl border transition-all glass border-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-primary/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 shrink-0 rounded-xl flex items-center justify-center bg-primary/20 text-primary overflow-hidden relative">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <PlayCircle size={32} />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-foreground mb-1">
                        {course.title}
                      </div>
                      <div className="text-sm text-foreground/70">
                        {course.description}
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/50 hover:-translate-y-0.5">
                      Kursni ochish
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Gamification Tree */}
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent pointer-events-none"></div>
          
          <h2 className="text-xl font-bold mb-2 relative z-10">{t.dashboard.progress}</h2>
          <p className="text-sm text-foreground/60 mb-8 relative z-10">Joriy holat: <strong>{treeLevelName}</strong> ({totalScore} ball)</p>

          <div className="relative w-48 h-48 mb-6 animate-float z-10 flex items-center justify-center bg-black/40 rounded-full border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden group">
            <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full group-hover:bg-primary/30 transition-colors"></div>
            <Image 
              src={treeImage}
              alt={treeLevelName}
              fill
              className="object-cover relative z-10"
            />
          </div>

          <div className="w-full bg-background/50 rounded-full h-3 mb-2 relative z-10 overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            ></motion.div>
          </div>
          <div className="text-xs text-foreground/50 font-semibold relative z-10">Hozircha {Math.round(percentage)}% yakunlandi</div>
        </motion.div>

        {/* Survey Results Radar Chart */}
        {surveyData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 rounded-3xl relative overflow-hidden"
          >
            <h3 className="text-lg font-bold mb-4 text-center">STDS-Bio Natijalarim</h3>
            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={surveyData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Radar name="Pre-test" dataKey="Pre" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Radar name="Post-test" dataKey="Post" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Subscales Detailed View */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground/70 mb-2 border-b border-white/10 pb-2">Subshkala ko'rsatkichlari:</h4>
              {surveyData.map((item, index) => (
                <div key={item.subject} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground/90">
                    <span>{item.subject}</span>
                  </div>
                  
                  {/* Pre-test bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-[10px] text-blue-400 text-right">Pre: {item.Pre > 0 ? item.Pre.toFixed(1) : 0}</div>
                    <div className="flex-1 bg-background/50 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.Pre / 5) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                  </div>
                  
                  {/* Post-test bar */}
                  {item.Post > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-12 text-[10px] text-emerald-400 text-right">Post: {item.Post.toFixed(1)}</div>
                      <div className="flex-1 bg-background/50 rounded-full h-1.5 overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.Post / 5) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                          className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </div>
  );
}
