"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/UserContext";
import Header from "@/components/Header";
import { PlayCircle, BookOpen, Brain, Lock, Unlock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export default function Courses() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchApi("/courses");
        if (data.status === "success" && data.courses) {
          setCourses(data.courses);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Use default icons and colors for dynamic courses based on their order or ID
  const getCourseStyle = (index: number) => {
    const styles = [
      { icon: Brain, color: "text-primary", bg: "bg-primary/20" },
      { icon: BookOpen, color: "text-secondary", bg: "bg-secondary/20" },
      { icon: PlayCircle, color: "text-accent", bg: "bg-accent/20" },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary mb-6">
              {t.guestCourses.title}
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              {t.guestCourses.subtitle}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, idx) => {
                const style = getCourseStyle(idx);
                const Icon = style.icon;
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="glass p-8 rounded-3xl group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Icon size={100} />
                    </div>
                    
                    {course.image_url ? (
                      <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden relative shadow-lg">
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl ${style.bg} flex items-center justify-center ${style.color} mb-6 shadow-lg`}>
                        <Icon size={32} />
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-4">{course.title}</h3>
                    <p className="text-foreground/70 leading-relaxed mb-8 flex-1">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      {user ? (
                        <>
                          <span className="text-sm font-semibold text-green-500 flex items-center gap-2">
                            <Unlock size={16} /> Ochiq
                          </span>
                          <Link href={`/dashboard/courses/${course.id}`} className="px-5 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-full font-medium transition-colors text-sm">
                            Darsga o'tish
                          </Link>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-foreground/50 flex items-center gap-2">
                            <Lock size={16} /> Yopiq
                          </span>
                          <Link href="/register" className="px-5 py-2.5 bg-white/10 hover:bg-primary/20 text-foreground hover:text-primary rounded-full font-medium transition-colors text-sm">
                            {t.guestCourses.startBtn}
                          </Link>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-foreground/50">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>Hozircha kurslar qo'shilmagan.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
