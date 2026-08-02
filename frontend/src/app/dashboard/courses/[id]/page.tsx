"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, Loader2, BookOpen, CheckCircle2, Bot, X, Send, ChevronRight, RefreshCcw, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import YouTube from 'react-youtube';

interface QuestionOption {
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  question_text: string;
  type?: string;
  video_timestamp?: number;
  options: QuestionOption[];
}

interface Module {
  id: number;
  title: string;
  content: string;
  video_url: string;
  presentation_url?: string;
  order: number;
  questions?: Question[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
  modules: Module[];
}

type TabType = 'video' | 'taqdimot' | 'content' | 'open_questions' | 'quiz';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [unlockedTabs, setUnlockedTabs] = useState<TabType[]>(['video']);

  // Video & In-Video Quiz State
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const htmlVideoRef = useRef<HTMLVideoElement>(null);
  const [inVideoQuizId, setInVideoQuizId] = useState<number | null>(null);
  const [answeredVideoQuestions, setAnsweredVideoQuestions] = useState<number[]>([]);
  const [videoQuizSelectedOption, setVideoQuizSelectedOption] = useState<number | null>(null);
  const [videoQuizError, setVideoQuizError] = useState(false);

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | string)[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Open questions state
  const [openQuestionAnswers, setOpenQuestionAnswers] = useState<{[key: number]: string}>({});
  const [openQuestionFeedback, setOpenQuestionFeedback] = useState<{[key: number]: {isCorrect: boolean, feedback: string}}>({});
  const [evaluatingOpen, setEvaluatingOpen] = useState<{[key: number]: boolean}>({});

  const testQuestions = activeModule?.questions?.filter(q => q.type !== 'open_ended') || [];
  const openQuestions = activeModule?.questions?.filter(q => q.type === 'open_ended') || [];

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([{role: 'ai', text: 'Salom! Men sizning maxsus AI yordamchigizman. Ushbu dars yuzasidan savollaringiz bo\'lsa bemalol bering.'}]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Check youtube video time interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (youtubePlayer && activeTab === 'video' && inVideoQuizId === null) {
      interval = setInterval(async () => {
        try {
          const state = await youtubePlayer.getPlayerState();
          if (state === 1 /* PLAYING */) {
            const time = await youtubePlayer.getCurrentTime();
            checkVideoTimestamp(time);
          }
        } catch(e) {}
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [youtubePlayer, activeTab, inVideoQuizId, answeredVideoQuestions, testQuestions]);

  const checkVideoTimestamp = (currentTime: number) => {
    // Find a question whose timestamp falls within [currentTime-2.5s, currentTime]
    // Using a backward window ensures we never miss a trigger even on fast-forwarding
    const q = testQuestions.find(q =>
      q.video_timestamp != null &&
      q.video_timestamp > 0 &&
      currentTime >= q.video_timestamp &&
      currentTime - q.video_timestamp < 2.5 &&
      !answeredVideoQuestions.includes(q.id)
    );
    if (q) {
      if (youtubePlayer) youtubePlayer.pauseVideo();
      else if (htmlVideoRef.current) htmlVideoRef.current.pause();
      
      setInVideoQuizId(q.id);
      setVideoQuizSelectedOption(null);
      setVideoQuizError(false);
    }
  };

  const handleVideoQuizCheck = () => {
    if (inVideoQuizId === null || videoQuizSelectedOption === null) return;
    const q = testQuestions.find(q => q.id === inVideoQuizId);
    if (!q) return;

    const isCorrect = q.options[videoQuizSelectedOption]?.is_correct;
    if (isCorrect) {
      setAnsweredVideoQuestions(prev => [...prev, inVideoQuizId]);
      setInVideoQuizId(null);
      if (youtubePlayer) youtubePlayer.playVideo();
      else if (htmlVideoRef.current) htmlVideoRef.current.play();
    } else {
      setVideoQuizError(true);
      setTimeout(() => {
        setInVideoQuizId(null);
        setVideoQuizError(false);
        if (youtubePlayer) {
          youtubePlayer.seekTo(0);
          youtubePlayer.playVideo();
        } else if (htmlVideoRef.current) {
          htmlVideoRef.current.currentTime = 0;
          htmlVideoRef.current.play();
        }
      }, 2500);
    }
  };

  const unlockNext = (current: TabType) => {
    setUnlockedTabs(prev => {
      const nextTabs = new Set(prev);
      if (current === 'video') {
        nextTabs.add('taqdimot');
        nextTabs.add('content');
      }
      if (current === 'taqdimot') nextTabs.add('content');
      if (current === 'content') nextTabs.add(openQuestions.length > 0 ? 'open_questions' : (testQuestions.length > 0 ? 'quiz' : 'content'));
      if (current === 'open_questions') nextTabs.add(testQuestions.length > 0 ? 'quiz' : 'open_questions');
      
      const newUnlocked = Array.from(nextTabs);
      if (activeModule && course) {
         localStorage.setItem(`course_${course.id}_module_${activeModule.id}_unlocked`, JSON.stringify(newUnlocked));
      }
      return newUnlocked as TabType[];
    });
  };

  const handleVideoEnd = () => {
    unlockNext('video');
    setActiveTab(activeModule?.presentation_url ? 'taqdimot' : 'content');
  };

  useEffect(() => {
    const getCourseDetails = async () => {
      try {
        // Avval so'rovnomani tekshiramiz
        const surveyData = await fetchApi('/stds-survey/status');
        if (surveyData.status === 'success' && surveyData.data) {
          if (!surveyData.data.has_pre) {
            router.push('/survey?type=pre');
            return; // Kursni ochmaymiz, chunki Pre-test yechilmagan
          }
        }

        const data = await fetchApi(`/courses/${params.id}`);
        if (data.status === "success") {
          setCourse(data.course);
          setCompletedModules(data.completed_module_ids || []);
          if (data.course.modules && data.course.modules.length > 0) {
            selectModule(data.course.modules[0], data.completed_module_ids || [], data.course);
          }
        }
      } catch (err) {
        console.error("Kursni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      getCourseDetails();
    }
  }, [params.id, router]);

  const selectModule = (module: Module, completedList?: number[], courseObj?: Course) => {
    setActiveModule(module);
    setCurrentQIndex(0);
    setSelectedAnswers([]);
    setQuizScore(null);
    setOpenQuestionAnswers({});
    setOpenQuestionFeedback({});
    setEvaluatingOpen({});
    setAnsweredVideoQuestions([]);
    setInVideoQuizId(null);
    setYoutubePlayer(null);

    const isCompleted = (completedList || completedModules).includes(module.id);
    const activeCourse = courseObj || course;

    if (isCompleted) {
      // If completed, unlock everything
      setUnlockedTabs(['video', 'taqdimot', 'content', 'open_questions', 'quiz']);
      setActiveTab('video');
    } else {
      let restoredTabs: TabType[] | null = null;
      if (activeCourse) {
        try {
          const saved = localStorage.getItem(`course_${activeCourse.id}_module_${module.id}_unlocked`);
          if (saved) {
             const parsed = JSON.parse(saved);
             if (Array.isArray(parsed) && parsed.length > 0) restoredTabs = parsed;
          }
        } catch(e) {}
      }

      if (restoredTabs) {
        setUnlockedTabs(restoredTabs);
        setActiveTab(restoredTabs[restoredTabs.length - 1]);
      } else if (!module.video_url) {
        // If no video, unlock taqdimot and content
        setUnlockedTabs(['video', 'taqdimot', 'content']);
        setActiveTab(module.presentation_url ? 'taqdimot' : 'content');
      } else {
        // Start fresh
        setUnlockedTabs(['video']);
        setActiveTab('video');
      }
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleComplete = async () => {
    if (!activeModule || completedModules.includes(activeModule.id)) return;
    
    setSubmitting(true);
    try {
      const data = await fetchApi('/progress/complete', {
        method: 'POST',
        body: JSON.stringify({ module_id: activeModule.id })
      });
      
      if (data.status === 'success') {
        setCompletedModules(prev => [...prev, activeModule.id]);
      }
    } catch (err) {
      console.error("Darsni saqlashda xatolik:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !activeModule) return;

    const userMessage = chatInput.trim();
    setMessages(prev => [...prev, {role: 'user', text: userMessage}]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const data = await fetchApi('/course-chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: userMessage, 
          module_title: activeModule.title,
          module_content: activeModule.content,
          history: messages 
        })
      });
      if (data.status === 'success') setMessages(prev => [...prev, {role: 'ai', text: data.reply}]);
      else setMessages(prev => [...prev, {role: 'ai', text: "Kechirasiz, xatolik yuz berdi."}]);
    } catch (err) {
      setMessages(prev => [...prev, {role: 'ai', text: "AI xizmati hozirda band. Biroz kuting va qayta urinib ko'ring. Shu vaqt ichida dars materialini o'qib chiqishingiz mumkin!"}]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQIndex] = optionIdx;
    setSelectedAnswers(newAnswers);
  };

  const handleEvaluateOpenQuestion = async (qId: number) => {
    const answer = openQuestionAnswers[qId];
    if (!answer) return;
    setEvaluatingOpen(prev => ({...prev, [qId]: true}));
    try {
      const data = await fetchApi(`/questions/${qId}/evaluate`, {
        method: 'POST',
        body: JSON.stringify({ answer })
      });
      if (data.status === 'success') {
        setOpenQuestionFeedback(prev => ({...prev, [qId]: {isCorrect: data.passed, feedback: data.feedback}}));
      } else {
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch (e: any) { 
      const msg = e.message === 'Failed to fetch' ? "Server yoki API bilan bog'lanishda xatolik (Tarmoq xatosi yoki uzoq kutilganlik). VPN yoqing yoki internetingizni tekshiring." : e.message;
      alert(msg || "Server bilan bog'lanishda xatolik yuz berdi (AI javob bermadi).");
    } finally { 
      setEvaluatingOpen(prev => ({...prev, [qId]: false})); 
    }
  };

  const allOpenQuestionsAnsweredCorrectly = () => {
    if (openQuestions.length === 0) return true;
    return openQuestions.every(q => openQuestionFeedback[q.id]?.isCorrect);
  };

  const nextQuestion = async () => {
    if (currentQIndex < testQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      submitWholeQuiz();
    }
  };

  const submitWholeQuiz = async () => {
      if (!activeModule) return;
      setSubmitting(true);
      try {
        const data = await fetchApi(`/modules/${activeModule.id}/submit-quiz`, {
          method: 'POST',
          body: JSON.stringify({ answers: selectedAnswers })
        });
        
        if (data.status === 'success') {
          setQuizScore(data.score);
          if (data.passed) {
             setCompletedModules(prev => [...prev, activeModule.id]);
          }
        }
      } catch (err) { console.error(err); } 
      finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!course) return <div className="flex flex-col h-full items-center justify-center text-center space-y-4"><h2 className="text-2xl font-bold text-foreground">Kurs topilmadi</h2><button onClick={() => router.push("/dashboard")} className="px-6 py-2 bg-primary text-white rounded-xl">Orqaga qaytish</button></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Column: Flow Player */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{course.title}</h1>
        </div>

        {activeModule ? (
          <div className="glass rounded-3xl border border-white/5 flex-1 flex flex-col overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar shrink-0">
              <button 
                onClick={() => unlockedTabs.includes('video') && setActiveTab('video')}
                className={`flex-1 min-w-[120px] py-4 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'video' ? 'border-primary text-primary bg-primary/5' : unlockedTabs.includes('video') ? 'border-transparent text-foreground/70 hover:text-foreground' : 'border-transparent text-foreground/30 cursor-not-allowed'}`}
              >
                <PlayCircle size={16} /> Video
                {!unlockedTabs.includes('video') && <Lock size={12} />}
              </button>
              
              {activeModule?.presentation_url && (
                <button 
                  onClick={() => unlockedTabs.includes('taqdimot') && setActiveTab('taqdimot')}
                  className={`flex-1 min-w-[120px] py-4 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'taqdimot' ? 'border-orange-500 text-orange-500 bg-orange-500/5' : unlockedTabs.includes('taqdimot') ? 'border-transparent text-foreground/70 hover:text-foreground' : 'border-transparent text-foreground/30 cursor-not-allowed'}`}
                >
                  <span className="text-lg leading-none">🖼️</span> Taqdimot
                  {!unlockedTabs.includes('taqdimot') && <Lock size={12} />}
                </button>
              )}

              <button 
                onClick={() => unlockedTabs.includes('content') && setActiveTab('content')}
                className={`flex-1 min-w-[120px] py-4 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'content' ? 'border-primary text-primary bg-primary/5' : unlockedTabs.includes('content') ? 'border-transparent text-foreground/70 hover:text-foreground' : 'border-transparent text-foreground/30 cursor-not-allowed'}`}
              >
                <BookOpen size={16} /> Ma'ruza
                {!unlockedTabs.includes('content') && <Lock size={12} />}
              </button>

              {openQuestions.length > 0 && (
                <button 
                  onClick={() => unlockedTabs.includes('open_questions') && setActiveTab('open_questions')}
                  className={`flex-1 min-w-[140px] py-4 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'open_questions' ? 'border-primary text-primary bg-primary/5' : unlockedTabs.includes('open_questions') ? 'border-transparent text-foreground/70 hover:text-foreground' : 'border-transparent text-foreground/30 cursor-not-allowed'}`}
                >
                  <BookOpen size={16} /> Nazorat
                  {!unlockedTabs.includes('open_questions') && <Lock size={12} />}
                </button>
              )}

              {testQuestions.length > 0 && (
                <button 
                  onClick={() => unlockedTabs.includes('quiz') && setActiveTab('quiz')}
                  className={`flex-1 min-w-[120px] py-4 px-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'quiz' ? 'border-primary text-primary bg-primary/5' : unlockedTabs.includes('quiz') ? 'border-transparent text-foreground/70 hover:text-foreground' : 'border-transparent text-foreground/30 cursor-not-allowed'}`}
                >
                  <CheckCircle2 size={16} /> Test
                  {!unlockedTabs.includes('quiz') && <Lock size={12} />}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 relative" style={{minWidth: 0}}>
              {/* VIDEO TAB */}
              {activeTab === 'video' && (
                <div className="flex flex-col h-full">
                  <h2 className="text-2xl font-bold mb-4">{activeModule.title}</h2>
                  {activeModule.video_url ? (
                    <div className="w-full aspect-video bg-black relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-2">
                      
                      {/* In-Video Quiz Overlay */}
                      <AnimatePresence>
                        {inVideoQuizId && (
                          <motion.div 
                            initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                            className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                          >
                            <div className="bg-background/90 border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-full overflow-y-auto">
                              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-secondary">
                                <Bot size={24} /> Diqqat, Savol!
                              </h3>
                              <p className="mb-6 font-medium">
                                {testQuestions.find(q => q.id === inVideoQuizId)?.question_text}
                              </p>
                              
                              <div className="space-y-3 mb-6">
                                {testQuestions.find(q => q.id === inVideoQuizId)?.options.map((opt, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setVideoQuizSelectedOption(idx)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                                      videoQuizSelectedOption === idx 
                                        ? 'bg-secondary/20 border-secondary text-secondary shadow-md' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-foreground/80 hover:text-foreground'
                                    }`}
                                  >
                                    <span className="inline-block w-6 font-bold">{String.fromCharCode(65 + idx)}.</span> {opt.text}
                                  </button>
                                ))}
                              </div>

                              {videoQuizError && (
                                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                                  Noto'g'ri! Video boshidan boshlanadi...
                                </motion.div>
                              )}

                              <button
                                onClick={handleVideoQuizCheck}
                                disabled={videoQuizSelectedOption === null || videoQuizError}
                                className="w-full py-3 bg-secondary text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                              >
                                Javobni tasdiqlash
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {getYoutubeId(activeModule.video_url) ? (
                        <YouTube 
                          videoId={getYoutubeId(activeModule.video_url)!}
                          opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0, modestbranding: 1, rel: 0 } }}
                          onReady={(e) => setYoutubePlayer(e.target)}
                          onEnd={handleVideoEnd}
                          className="absolute inset-0 w-full h-full"
                          iframeClassName="w-full h-full"
                        />
                      ) : (
                        <video
                          ref={htmlVideoRef}
                          src={activeModule.video_url}
                          controls
                          className="w-full h-full object-contain"
                          onTimeUpdate={(e) => checkVideoTimestamp(e.currentTarget.currentTime)}
                          onEnded={handleVideoEnd}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-primary bg-white/5 rounded-2xl border border-white/5">
                      <BookOpen size={48} className="mb-4 opacity-50" />
                      <p className="font-semibold text-lg mb-4">Bu darsda video mavjud emas</p>
                      <button onClick={() => { unlockNext('video'); setActiveTab(activeModule.presentation_url ? 'taqdimot' : 'content'); }} className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">Darsni davom ettirish</button>
                    </div>
                  )}
                  {activeModule.video_url && (
                    <div className="mt-6 flex justify-end">
                      <button 
                        onClick={() => { unlockNext('video'); setActiveTab(activeModule.presentation_url ? 'taqdimot' : 'content'); }}
                        disabled={!unlockedTabs.includes('content')}
                        className="px-6 py-2 bg-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-primary/90 transition-colors"
                      >
                        {activeModule.presentation_url ? "Taqdimotga o'tish" : "Ma'ruzaga o'tish"} <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAQDIMOT TAB */}
              {activeTab === 'taqdimot' && activeModule.presentation_url && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{activeModule.title} - Taqdimot</h2>
                    <a 
                      href={activeModule.presentation_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
                    >
                      Katta ekranda ochish
                    </a>
                  </div>
                  
                  <div className="flex-1 w-full bg-black/20 rounded-2xl border border-white/10 overflow-hidden relative" style={{ minHeight: '600px' }}>
                    {activeModule.presentation_url.endsWith('.pdf') ? (
                      <iframe 
                        src={`${activeModule.presentation_url}#toolbar=0&navpanes=0`} 
                        className="absolute inset-0 w-full h-full border-0" 
                        allowFullScreen 
                        title="Taqdimot (PDF)" 
                      />
                    ) : (
                      <iframe 
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(activeModule.presentation_url)}`} 
                        className="absolute inset-0 w-full h-full border-0 bg-white" 
                        allowFullScreen 
                        title="Taqdimot (PPT)" 
                      />
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-6">
                    <button onClick={() => setActiveTab('video')} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-xl flex items-center gap-2 transition-colors">
                      <ArrowLeft size={16} /> Videoga qaytish
                    </button>
                    <button 
                      onClick={() => { unlockNext('taqdimot'); setActiveTab('content'); }}
                      className="px-6 py-2 bg-primary text-white rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                      Ma'ruzaga o'tish <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* CONTENT TAB */}
              {activeTab === 'content' && (
                <div className="flex flex-col h-full" style={{minWidth: 0}}>
                  <h2 className="text-2xl font-bold mb-6">{activeModule.title} - Ma'ruza</h2>
                  {(() => {
                    const cleanContent = (activeModule.content || '<p>Ma\'lumot kiritilmagan.</p>')
                      .replace(/text-align:\s*justify\s*;?/gi, 'text-align:left;')
                      .replace(/&nbsp;/gi, ' ');
                    return (
                      <div 
                        className="course-content-html text-foreground/80 leading-relaxed flex-1 w-full break-words overflow-x-hidden [&_img]:max-w-full [&_img]:h-auto [&_table]:max-w-full [&_table]:overflow-x-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: cleanContent }}
                      />
                    );
                  })()}
                  <div className="mt-10 flex justify-between items-center border-t border-white/10 pt-6">
                    <button onClick={() => setActiveTab(activeModule.presentation_url ? 'taqdimot' : 'video')} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-xl flex items-center gap-2 transition-colors">
                      <ArrowLeft size={16} /> Orqaga
                    </button>
                    <button 
                      onClick={() => { unlockNext('content'); setActiveTab(openQuestions.length > 0 ? 'open_questions' : (testQuestions.length > 0 ? 'quiz' : 'content')); }}
                      className="px-6 py-2 bg-primary text-white rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                      Davom etish <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* OPEN QUESTIONS TAB */}
              {activeTab === 'open_questions' && (
                <div className="flex flex-col h-full">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary"><BookOpen size={24} /> Nazorat Savollari</h2>
                  <div className="space-y-6 flex-1">
                    {openQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg">
                        <p className="font-semibold mb-4 text-lg">{idx + 1}. {q.question_text}</p>
                        <textarea
                          value={openQuestionAnswers[q.id] || ''}
                          onChange={(e) => setOpenQuestionAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                          placeholder="Javobingizni batafsil yozing..."
                          disabled={!!openQuestionFeedback[q.id]?.isCorrect}
                          className="w-full h-32 bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none transition-colors mb-4 disabled:opacity-50"
                        />
                        {openQuestionFeedback[q.id] ? (
                          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className={`p-4 rounded-xl border ${openQuestionFeedback[q.id].isCorrect ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                            <h4 className="font-bold flex items-center gap-2 mb-1">
                              {openQuestionFeedback[q.id].isCorrect ? <CheckCircle2 /> : <RefreshCcw />}
                              {openQuestionFeedback[q.id].isCorrect ? "To'g'ri javob!" : "Qoniqarsiz javob"}
                            </h4>
                            <p className="text-sm opacity-90">{openQuestionFeedback[q.id].feedback}</p>
                          </motion.div>
                        ) : null}
                        
                        {!openQuestionFeedback[q.id]?.isCorrect && (
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => handleEvaluateOpenQuestion(q.id)}
                              disabled={!openQuestionAnswers[q.id]?.trim() || evaluatingOpen[q.id]}
                              className="px-6 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                            >
                              {evaluatingOpen[q.id] ? <Loader2 className="animate-spin" size={16} /> : null}
                              Tekshirish
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex justify-between items-center border-t border-white/10 pt-6">
                    <button onClick={() => setActiveTab('content')} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-xl flex items-center gap-2 transition-colors">
                      <ArrowLeft size={16} /> Ma'ruzaga qaytish
                    </button>
                    <button 
                      onClick={() => { unlockNext('open_questions'); setActiveTab('quiz'); }}
                      disabled={!allOpenQuestionsAnsweredCorrectly()}
                      className="px-6 py-2 bg-primary text-white rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {allOpenQuestionsAnsweredCorrectly() ? (
                        <>Testga o'tish <ChevronRight size={16} /></>
                      ) : (
                        <><Lock size={16} /> Barcha savollarga to'g'ri javob bering</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* QUIZ TAB */}
              {activeTab === 'quiz' && (
                <div className="flex flex-col h-full">
                  {quizScore === null ? (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col h-full max-w-2xl mx-auto w-full pt-4">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Test: {activeModule.title}</h2>
                        <div className="text-foreground/50 text-sm">Savol {currentQIndex + 1} / {testQuestions.length}</div>
                        <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentQIndex) / (testQuestions.length || 1)) * 100}%` }}></div>
                        </div>
                      </div>

                      <div className="glass p-6 rounded-3xl border border-white/5 mb-8 text-lg font-semibold text-center">
                        {testQuestions[currentQIndex]?.question_text}
                      </div>

                      <div className="space-y-3">
                        {testQuestions[currentQIndex]?.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              selectedAnswers[currentQIndex] === idx 
                                ? 'bg-primary/20 border-primary text-primary shadow-md' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-foreground/80 hover:text-foreground'
                            }`}
                          >
                            <span className="inline-block w-6 font-bold">{String.fromCharCode(65 + idx)}.</span> {opt.text}
                          </button>
                        ))}
                      </div>

                      <div className="mt-10 flex justify-between">
                        <button onClick={() => setActiveTab(openQuestions.length > 0 ? 'open_questions' : 'content')} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-xl flex items-center gap-2 transition-colors">
                          <ArrowLeft size={16} /> Ortga
                        </button>
                        <button
                          onClick={nextQuestion}
                          disabled={selectedAnswers[currentQIndex] === undefined || submitting}
                          className="px-8 py-3 bg-primary text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={18} /> : (currentQIndex === testQuestions.length - 1 ? "Yakunlash" : "Keyingisi")}
                          {!submitting && <ChevronRight size={18} />}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="flex flex-col h-full items-center justify-center text-center space-y-6 pt-10">
                      {quizScore >= 50 ? (
                        <>
                          <div className="w-24 h-24 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                            <CheckCircle2 size={48} />
                          </div>
                          <h2 className="text-3xl font-bold">Tabriklaymiz!</h2>
                          <p className="text-foreground/70 text-lg">Siz darsni muvaffaqiyatli yakunladingiz.</p>
                          <div className="text-4xl font-extrabold text-secondary">{quizScore.toFixed(0)}%</div>
                          <div className="text-sm text-foreground/50">Sizga ball taqdim etildi.</div>
                          <button onClick={handleComplete} disabled={submitting || completedModules.includes(activeModule.id)} className="mt-4 px-8 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-2">
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : (completedModules.includes(activeModule.id) ? "O'zlashtirilgan" : "Natijani Saqlash")}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-24 h-24 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                            <RefreshCcw size={48} />
                          </div>
                          <h2 className="text-3xl font-bold">Afsuski o'ta olmadingiz</h2>
                          <p className="text-foreground/70 text-lg">Test natijasi yetarli emas. Kamida 50% ball to'plashingiz kerak.</p>
                          <div className="text-4xl font-extrabold text-red-500">{quizScore.toFixed(0)}%</div>
                          <button 
                            onClick={() => { setQuizScore(null); setCurrentQIndex(0); setSelectedAnswers([]); }} 
                            className="mt-4 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                          >
                            Qayta urinish
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 border border-white/5 flex-1 flex items-center justify-center text-foreground/50">
            Ushbu kursda hozircha darslar mavjud emas
          </div>
        )}
      </div>

      {/* Right Column: Modules List */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col h-full">
        <div className="glass rounded-3xl p-6 border border-white/5 h-full flex flex-col">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Darslar ro'yxati
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {course.modules && course.modules.map((module) => {
              const isActive = activeModule?.id === module.id;
              
              return (
                <button 
                  key={module.id}
                  onClick={() => selectModule(module)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isActive ? "bg-primary/20 border-primary/50 text-primary shadow-lg" : "bg-white/5 border-white/5 hover:bg-white/10 text-foreground/70"
                  }`}
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary text-white" : "bg-white/10"}`}>
                    <span className="text-xs font-bold">{module.order}</span>
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${isActive ? "text-foreground" : ""}`}>
                      {module.title}
                    </div>
                    <div className="text-xs opacity-70 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        {module.video_url ? <PlayCircle size={12} /> : <BookOpen size={12} />}
                        {module.video_url ? "Video" : "Matn"}
                      </span>
                      {completedModules.includes(module.id) && (
                        <span className="flex items-center gap-1 text-secondary font-medium">
                          <CheckCircle2 size={12} /> O'zlashtirilgan
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {(!course.modules || course.modules.length === 0) && (
              <p className="text-sm text-foreground/50 text-center py-4">Darslar topilmadi</p>
            )}
          </div>
          
          {course.modules && course.modules.length > 0 && completedModules.length >= course.modules.length && (
            <div className="mt-4 p-4 bg-secondary/10 border border-secondary/30 rounded-xl shrink-0">
              <h4 className="font-bold text-secondary mb-2 flex items-center gap-2">
                <CheckCircle2 size={18} /> Kurs yakunlandi
              </h4>
              <p className="text-xs text-foreground/70 mb-3">Siz barcha darslarni o'zlashtirdingiz. Yakuniy so'rovnomani to'ldirishingiz mumkin.</p>
              <button 
                onClick={() => router.push('/survey?type=post')}
                className="w-full py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-colors"
              >
                Yakuniy so'rovnoma
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat ... */}
      <button onClick={() => setIsChatOpen(true)} className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110 transition-transform z-40 ${isChatOpen ? 'hidden' : 'flex'}`}>
        <Bot size={24} />
      </button>

      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-background/98 backdrop-blur-3xl border-l border-white/10 shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-background/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Bot size={20} /></div>
              <div><h3 className="font-bold text-foreground">AI Yordamchi</h3><p className="text-xs text-foreground/50">{activeModule?.title || "Dars"}</p></div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-foreground/70 transition-colors"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white/10 text-foreground rounded-tl-none border border-white/5'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-white/10 bg-white/5">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Savolingizni yozing..." className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors pr-12" />
              <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send size={16} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
