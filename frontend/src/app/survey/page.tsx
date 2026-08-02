"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/UserContext";
import Header from "@/components/Header";
import { Loader2, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface Question {
  id: number;
  text: string;
  subscale: string;
}

function SurveyContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "pre" | "post";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const [currentStep, setCurrentStep] = useState(0);
  const QUESTIONS_PER_PAGE = 5;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (type !== 'pre' && type !== 'post') {
      setError("Noto'g'ri so'rovnoma turi.");
      setLoading(false);
      return;
    }

    Promise.all([
      fetchApi('/stds-survey/status', { method: 'GET' }),
      fetchApi('/stds-survey/questions', { method: 'GET' })
    ]).then(([statusRes, qRes]) => {
      if (statusRes.status === 'success' && statusRes.data) {
        if (type === 'pre' && statusRes.data.has_pre) {
          setError("Siz kirish (Pre-test) so'rovnomasini allaqachon to'ldirgansiz. Endi kursni davom ettirishingiz mumkin.");
        } else if (type === 'post' && statusRes.data.has_post) {
          setError("Siz yakuniy (Post-test) so'rovnomani allaqachon to'ldirgansiz. Tabriklaymiz!");
        } else if (type === 'post' && !statusRes.data.is_course_completed) {
          setError("Siz avval kursning barcha modullarini to'liq o'qib, o'zlashtirishingiz kerak!");
        }
      }

      if (qRes.status === 'success' && qRes.data) {
        setQuestions(qRes.data);
      }
    }).catch(err => {
      console.error(err);
      setError("Xatolik yuz berdi. Iltimos, sahifani yangilang.");
    }).finally(() => {
      setLoading(false);
    });
  }, [user, type, router]);

  const handleOptionChange = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      alert("Iltimos, barcha savollarga javob belgilang.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/stds-survey/submit', {
        method: 'POST',
        body: JSON.stringify({ type, answers })
      });

      if (res.status === 'success') {
        setSuccess(true);
      } else {
        setError(res.message || "Xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      setError("Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestions = questions.slice(currentStep * QUESTIONS_PER_PAGE, (currentStep + 1) * QUESTIONS_PER_PAGE);
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-12 bg-black/20 border border-white/10 rounded-3xl text-center glass">
        <AlertTriangle className="text-yellow-500 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-4">{error}</h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 font-medium transition"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-12 bg-black/20 border border-white/10 rounded-3xl text-center glass">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
        <h2 className="text-3xl font-bold mb-4">Ajoyib! Natijalar saqlandi.</h2>
        <p className="text-foreground/70 mb-8">
          So&apos;rovnomada ishtirok etganingiz uchun rahmat. O&apos;z ustingizda ishlashdan to&apos;xtamang!
        </p>
        <button
          onClick={() => router.push(type === 'pre' ? '/courses' : '/dashboard')}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-full hover:scale-105 font-bold transition shadow-lg shadow-primary/25"
        >
          {type === 'pre' ? 'Kursni boshlash' : 'Bosh sahifaga qaytish'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">STDS-Bio Diagnostik So&apos;rovnomasi</h1>
        <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
          {type === 'pre' 
            ? "Ushbu so'rovnoma kursni boshlashdan oldin sizning kasbiy holatingizni baholash uchun xizmat qiladi." 
            : "Kursni muvaffaqiyatli yakunlaganingiz bilan tabriklaymiz! O'zgarishlarni bilish uchun yakuniy so'rovnomani to'ldiring."}
        </p>
      </div>

      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        <div className="mb-6 flex justify-between items-center text-sm font-medium text-foreground/50 border-b border-white/10 pb-4">
          <span>{currentStep + 1} / {totalPages} sahifa</span>
          <span>Umumiy {questions.length} ta savol</span>
        </div>

        <div className="space-y-8">
          {currentQuestions.map((q, idx) => {
            const actualIndex = currentStep * QUESTIONS_PER_PAGE + idx + 1;
            return (
              <div key={q.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h3 className="text-lg font-medium mb-6">
                  <span className="text-primary mr-2">{actualIndex}.</span> 
                  {q.text}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { val: 1, label: "Umuman qo'shilmayman" },
                    { val: 2, label: "Qisman qo'shilmayman" },
                    { val: 3, label: "Ikkilanaman" },
                    { val: 4, label: "Qisman qo'shilaman" },
                    { val: 5, label: "To'liq qo'shilaman" }
                  ].map((option) => (
                    <label 
                      key={option.val}
                      className={`
                        cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all
                        ${answers[q.id] === option.val 
                          ? 'bg-primary/20 border-primary text-primary shadow-sm shadow-primary/20' 
                          : 'bg-black/20 border-white/10 hover:bg-white/5'}
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={option.val}
                        checked={answers[q.id] === option.val}
                        onChange={() => handleOptionChange(q.id, option.val)}
                        className="hidden"
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-between items-center pt-6 border-t border-white/10">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition ${
              currentStep === 0 ? 'opacity-50 cursor-not-allowed text-foreground/50' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <ArrowLeft size={20} /> Oldingi
          </button>

          {currentStep === totalPages - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg shadow-primary/25 hover:scale-105 transition disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />} 
              Natijalarni saqlash
            </button>
          ) : (
            <button
              onClick={() => {
                // optional: validate if all in this page are answered
                setCurrentStep(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:opacity-90 transition"
            >
              Keyingi <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12 px-6">
        <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin" size={40}/></div>}>
          <SurveyContent />
        </Suspense>
      </main>
    </div>
  );
}
