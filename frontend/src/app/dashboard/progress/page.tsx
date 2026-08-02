"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/UserContext";
import { fetchApi, API_URL } from "@/lib/api";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, BookOpen, Brain, ChevronDown, ChevronUp, MessageSquare, Download } from "lucide-react";

interface Course {
  id: number;
  title: string;
}

interface Module {
  id: number;
  title: string;
  course: Course;
}

interface Question {
  id: number;
  question_text: string;
  type: string;
  module: Module;
}

interface UserProgress {
  id: number;
  score: number;
  completed_at: string;
  module: Module;
}

interface UserAnswer {
  id: number;
  answer_text: string;
  ai_feedback: string | null;
  is_correct: boolean;
  created_at: string;
  question: Question;
}

export default function DetailedProgressPage() {
  const { user, totalScore, loading: authLoading } = useAuth();
  const [modules, setModules] = useState<UserProgress[]>([]);
  const [history, setHistory] = useState<UserAnswer[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchDetails = async () => {
      try {
        const data = await fetchApi("/user/progress-details");
        if (data.status === "success") {
          setModules(data.modules || []);
          setHistory(data.history || []);
          setCompletedCourses(data.completed_courses || []);
        }
      } catch (error) {
        console.error("Xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate some stats
  const totalAnswers = history.length;
  const correctAnswers = history.filter(h => h.is_correct).length;
  const correctPercentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  
  const averageModuleScore = modules.length > 0 
    ? Math.round(modules.reduce((acc, m) => acc + m.score, 0) / modules.length) 
    : 0;

  // Group modules by course for better display
  const modulesByCourse = modules.reduce((acc, progress) => {
    const courseTitle = progress.module?.course?.title || "Noma'lum kurs";
    if (!acc[courseTitle]) {
      acc[courseTitle] = [];
    }
    acc[courseTitle].push(progress);
    return acc;
  }, {} as Record<string, UserProgress[]>);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('uz-UZ', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block mb-2">
          Batafsil Statistika
        </h1>
        <p className="text-foreground/60">O'quv jarayonidagi barcha natijalaringiz va xatoliklaringiz tahlili.</p>
      </div>

      {/* Certificate Section */}
      {completedCourses.length > 0 && completedCourses.map(course => (
        <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex-1 space-y-2 relative z-10">
            <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
              🎉 Tabriklaymiz! Siz "{course.title}" kursini muvaffaqiyatli tugatdingiz.
            </h2>
            <p className="text-foreground/70">
              Quyidagi tugma orqali shaxsiy sertifikatingizni yuklab olishingiz mumkin.
            </p>
          </div>
          <div className="relative z-10">
            <button 
              onClick={() => {
                const token = localStorage.getItem("sanotaf_token");
                fetch(API_URL + "/certificate/download?course_id=" + course.id, {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(async res => {
                  if (!res.ok) {
                    throw new Error("Server xatosi");
                  }
                  return res.blob();
                })
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Sanotaf_Sertifikat.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                })
                .catch(err => {
                  alert("Sertifikatni yuklab olishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
                  console.error(err);
                });
              }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Download size={20} /> Sertifikatni yuklab olish
            </button>
          </div>
        </motion.div>
      ))}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-3xl flex items-center gap-4 bg-primary/5 border border-primary/20">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div className="text-sm text-foreground/60 font-semibold uppercase tracking-wider">To'g'ri javoblar</div>
            <div className="text-3xl font-extrabold text-foreground flex items-baseline gap-2">
              {correctPercentage}%
              <span className="text-sm font-normal text-foreground/50">({correctAnswers}/{totalAnswers})</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-3xl flex items-center gap-4 bg-secondary/5 border border-secondary/20">
          <div className="w-14 h-14 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div>
            <div className="text-sm text-foreground/60 font-semibold uppercase tracking-wider">O'rtacha modul balli</div>
            <div className="text-3xl font-extrabold text-foreground">{averageModuleScore}</div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-3xl flex items-center gap-4 bg-white/5 border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-foreground flex items-center justify-center">
            <Brain size={28} />
          </div>
          <div>
            <div className="text-sm text-foreground/60 font-semibold uppercase tracking-wider">Tugatilgan Modullar</div>
            <div className="text-3xl font-extrabold text-foreground">{modules.length}</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Module Progress List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-primary" size={20} /> Kurslar bo'yicha modullar
          </h2>
          
          {Object.keys(modulesByCourse).length === 0 ? (
            <div className="glass p-6 rounded-2xl text-center text-foreground/50">Hali hech qaysi modul tugatilmagan.</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(modulesByCourse).map(([courseName, courseModules]) => (
                <div key={courseName} className="glass p-5 rounded-2xl border border-white/10">
                  <h3 className="font-semibold text-lg text-secondary mb-4 border-b border-white/10 pb-2">{courseName}</h3>
                  <div className="space-y-3">
                    {courseModules.map((m) => (
                      <div key={m.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors">
                        <div>
                          <p className="font-medium">{m.module?.title || "Noma'lum modul"}</p>
                          <p className="text-xs text-foreground/50 flex items-center gap-1 mt-1">
                            <Clock size={12} /> {formatDate(m.completed_at)}
                          </p>
                        </div>
                        <div className="bg-primary/20 text-primary font-bold px-3 py-1 rounded-lg">
                          {m.score} ball
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Answers History */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-secondary" size={20} /> Testlar Tarixi
          </h2>

          {history.length === 0 ? (
            <div className="glass p-6 rounded-2xl text-center text-foreground/50">Hali test ishlaganingiz yo'q.</div>
          ) : (
            <div className="space-y-3">
              {history.map((answer) => (
                <div key={answer.id} className="glass border border-white/10 rounded-2xl overflow-hidden">
                  {/* Header (Summary) */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-start gap-3"
                    onClick={() => setExpandedAnswer(expandedAnswer === answer.id ? null : answer.id)}
                  >
                    <div className="mt-1">
                      {answer.is_correct ? (
                        <CheckCircle2 className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-foreground/50 mb-1 flex items-center gap-2">
                        <span>{answer.question?.module?.course?.title}</span>
                        <span>•</span>
                        <span>{answer.question?.module?.title}</span>
                      </div>
                      <div 
                        className="font-medium line-clamp-2 text-sm"
                        dangerouslySetInnerHTML={{ __html: answer.question?.question_text || "Savol topilmadi" }}
                      />
                      <div className="text-xs text-foreground/40 mt-2 flex items-center justify-between">
                        <span>{formatDate(answer.created_at)}</span>
                        {expandedAnswer === answer.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedAnswer === answer.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-white/10 bg-white/5 p-4 space-y-4 text-sm"
                    >
                      <div>
                        <p className="text-foreground/50 text-xs mb-1 uppercase tracking-wider font-semibold">Sizning javobingiz:</p>
                        <p className={`font-medium p-3 rounded-xl border ${answer.is_correct ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                          {answer.answer_text}
                        </p>
                      </div>

                      {answer.ai_feedback && (
                        <div>
                          <p className="text-foreground/50 text-xs mb-1 uppercase tracking-wider font-semibold flex items-center gap-1">
                            <MessageSquare size={12} /> AI Mulohazasi (Feedback):
                          </p>
                          <div className="bg-primary/10 border border-primary/20 text-primary-foreground p-3 rounded-xl italic leading-relaxed">
                            {answer.ai_feedback}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
