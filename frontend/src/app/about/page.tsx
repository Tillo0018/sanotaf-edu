"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Leaf, GraduationCap, BrainCircuit, FileText, BookOpen, Download, Loader2, Sparkles, Award, Target, Laptop, Activity, Briefcase } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const STORAGE_URL = API_URL.replace('/api', '') + '/storage/';

export default function About() {
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [activeAuthorId, setActiveAuthorId] = useState<number | null>(null);
  const [showAllCertificates, setShowAllCertificates] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi("/about");
        if (data.status === "success") {
          setAuthors(data.authors || []);
          setCertificates(data.certificates || []);
          if (data.authors && data.authors.length > 0) {
            setActiveAuthorId(data.authors[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeAuthor = authors.find(a => a.id === activeAuthorId);

  // Group works by type for the active author
  const groupedWorks = activeAuthor?.works?.reduce((acc: any, work: any) => {
    if (!acc[work.type]) acc[work.type] = [];
    acc[work.type].push(work);
    return acc;
  }, {});

  const getWorkIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('maqola')) return <FileText size={20} className="text-blue-400" />;
    if (lower.includes('kitob')) return <BookOpen size={20} className="text-orange-400" />;
    if (lower.includes('qollanma') || lower.includes('q\'ollanma')) return <GraduationCap size={20} className="text-green-400" />;
    if (lower.includes('tezis')) return <Award size={20} className="text-purple-400" />;
    return <FileText size={20} className="text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col relative">
      {/* Background creative shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Header />
      
      <main className="flex-1 pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-32">
          
          {/* --- AUTHORS SECTION (Moved to top) --- */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Muallif va Tadqiqotlar</h2>
              <p className="text-foreground/60 text-lg">Ilmiy maqolalar, nashrlar va mehnat faoliyati haqida ma'lumot</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={40}/></div>
            ) : (
              <>
                {authors.length > 1 && (
                  <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {authors.map(author => (
                      <button 
                        key={author.id}
                        onClick={() => setActiveAuthorId(author.id)}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-3
                          ${activeAuthorId === author.id 
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-105' 
                            : 'bg-white/5 hover:bg-white/10 text-foreground/70'}`}
                      >
                        {author.image_url ? (
                          <img src={STORAGE_URL + author.image_url} alt={author.name} className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                        ) : (
                          <GraduationCap size={20} />
                        )}
                        {author.name}
                      </button>
                    ))}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {activeAuthor && (
                    <motion.div 
                      key={activeAuthor.id}
                      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                    >
                      {/* Left Column: Author Info & Experience */}
                      <div className="lg:col-span-5 space-y-8">
                        {/* Bio Card */}
                        <div className="glass p-8 rounded-3xl text-center border border-white/10 shadow-2xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                          
                          <div className="relative w-48 h-56 sm:w-56 sm:h-64 mx-auto mb-6 rounded-3xl p-1 bg-gradient-to-br from-primary to-secondary shadow-xl">
                            <div className="w-full h-full rounded-[calc(1.5rem-4px)] bg-background overflow-hidden relative">
                              {activeAuthor.image_url ? (
                                <img src={STORAGE_URL + activeAuthor.image_url} alt={activeAuthor.name} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-foreground/50">
                                  <GraduationCap size={64} />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <h3 className="text-3xl font-bold text-foreground mb-2">{activeAuthor.name}</h3>
                          <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
                          
                          <p className="text-foreground/80 text-sm md:text-base leading-relaxed text-justify mb-2">
                            {activeAuthor.bio || "Muallif haqida ma'lumot kiritilmagan."}
                          </p>
                        </div>

                        {/* Experience Timeline */}
                        {activeAuthor.experiences && activeAuthor.experiences.length > 0 && (
                          <div className="glass p-8 rounded-3xl border border-white/10">
                            <h4 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                              <Briefcase className="text-secondary" /> Mehnat Faoliyati
                            </h4>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                              {activeAuthor.experiences.map((exp: any, i: number) => (
                                <div key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-background bg-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-[2px] z-10 relative"></div>
                                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 group-hover:bg-white/10 transition-colors shadow-lg">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                      <div className="font-bold text-primary">{exp.years}</div>
                                    </div>
                                    <div className="font-bold text-foreground/90">{exp.position}</div>
                                    <div className="text-sm text-foreground/60 leading-tight mt-1">{exp.workplace}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Author Works */}
                      <div className="lg:col-span-7 space-y-12">
                        {groupedWorks && Object.keys(groupedWorks).length > 0 ? (
                          Object.entries(groupedWorks).map(([type, works]: [string, any], index) => (
                            <motion.div 
                              key={type}
                              initial={{ opacity: 0, x: 30 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <h4 className="text-2xl font-bold mb-6 capitalize flex items-center gap-3 border-b border-white/10 pb-4">
                                {getWorkIcon(type)}
                                {type}
                              </h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {works.map((work: any) => (
                                  <div key={work.id} className="glass p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden flex flex-col h-full hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:-translate-y-1">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
                                    
                                    <div className="flex-1 z-10">
                                      <div className="text-xs text-primary font-bold mb-2 flex items-center gap-2">
                                        <span className="bg-primary/10 px-2 py-1 rounded-md">{work.year || "Yil noma'lum"}</span>
                                      </div>
                                      <h5 className="font-semibold text-foreground/90 text-sm leading-relaxed mb-4">
                                        {work.title}
                                      </h5>
                                    </div>
                                    
                                    {work.file_url && (
                                      <div className="mt-4 z-10">
                                        <a 
                                          href={STORAGE_URL + work.file_url} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="inline-flex items-center justify-center w-full gap-2 py-2 px-4 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary hover:text-white transition-all"
                                        >
                                          <Download size={16} /> Yuklab olish
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="glass p-10 rounded-3xl text-center border border-dashed border-white/10 h-full flex flex-col items-center justify-center">
                            <BookOpen size={48} className="text-foreground/20 mb-4" />
                            <p className="text-foreground/50 text-lg">Muallifning ishlari hozircha kiritilmagan.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>

          {/* --- CERTIFICATES SECTION --- */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative py-10"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <Award className="text-secondary" /> Sertifikat va Guvohnomalar
              </h2>
              <p className="text-foreground/60 text-lg">Muallifning xalqaro va mahalliy yutuqlari, patentlari</p>
            </div>

            {certificates && certificates.length > 0 ? (
              <>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {(showAllCertificates ? certificates : certificates.slice(0, 3)).map((cert, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        key={cert.id}
                        className="glass p-4 rounded-3xl border border-white/5 group hover:border-secondary/30 transition-all shadow-lg overflow-hidden flex flex-col"
                      >
                        <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white/5 mb-4 relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                            <p className="text-white font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              {cert.title}
                            </p>
                          </div>
                          {cert.image_url ? (
                            <img 
                              src={STORAGE_URL + cert.image_url} 
                              alt={cert.title} 
                              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-foreground/30">
                              <Award size={48} />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-center text-foreground/90 px-2 line-clamp-2" title={cert.title}>
                          {cert.title}
                        </h3>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {certificates.length > 3 && (
                  <div className="mt-12 text-center">
                    <button 
                      onClick={() => setShowAllCertificates(!showAllCertificates)}
                      className="px-8 py-3 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold transition-all border border-secondary/20 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                    >
                      {showAllCertificates ? "Yopish" : "Barchasini ko'rish"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass p-10 rounded-3xl text-center border border-dashed border-white/10 h-full flex flex-col items-center justify-center">
                <Award size={48} className="text-foreground/20 mb-4" />
                <p className="text-foreground/50 text-lg">Hozircha sertifikat va guvohnomalar kiritilmagan. Ularni admin panel orqali qo'shishingiz mumkin.</p>
              </div>
            )}
          </motion.div>

          {/* --- HERO SECTION (Moved to bottom) --- */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center relative pt-20 border-t border-white/10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Sparkles size={16} />
              <span className="text-sm font-bold tracking-wider uppercase">PhD Ilmiy Tadqiqot Loyihasi</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight">
              Raqamli ta'lim muhitida tinglovchilarning <br className="hidden md:block"/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary relative inline-block">
                sanogen tafakkurini
                <svg className="absolute w-full h-4 -bottom-2 left-0 text-secondary/50" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span> rivojlantirish
            </h1>
            <p className="text-xl text-foreground/70 font-medium max-w-3xl mx-auto">
              Biologiya fani o'qituvchilari misolida zamonaviy metodikalar, sun'iy intellekt va geymifikatsiya orqali ijobiy fikrlashni shakllantirish.
            </p>
          </motion.div>

          {/* --- RESEARCH CONCEPT CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
              <BrainCircuit size={48} className="text-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Sanogen Tafakkur</h3>
              <p className="text-foreground/70 leading-relaxed relative z-10">
                O'qituvchilarning hissiy zo'riqishlarini yengish, stressli vaziyatlarda muammolarni to'g'ri hal qilish va ta'lim jarayonida sog'lom fikrlash (sanogen) madaniyatini shakllantirish.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all"></div>
              <Laptop size={48} className="text-secondary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Raqamli Muhit</h3>
              <p className="text-foreground/70 leading-relaxed relative z-10">
                Malaka oshirish kurslarini zamonaviy LMS platformalari, interaktiv videodarslar va sun'iy intellektli assistentlar orqali to'liq raqamlashtirish.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <Target size={48} className="text-green-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Biologiya va Tabiat</h3>
              <p className="text-foreground/70 leading-relaxed relative z-10">
                Biologiya fanining hayotiyligini sanogen tafakkur orqali o'quvchilarga yetkazish metodikasini aynan biologiya o'qituvchilarida sinovdan o'tkazish va amaliyotga joriy etish.
              </p>
            </motion.div>
          </div>

          {/* --- METHODOLOGY DETAILS --- */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary via-secondary to-transparent"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Tadqiqotning amaliy ahamiyati</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Geymifikatsiya Tizimi</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        Tinglovchilarga modul va testlarni ishlagani sari ballar berib borish, reyting tizimi va maxsus "Daraxt o'stirish" vizualizatsiyasi orqali motivatsiyani oshirish.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">2</div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Sun'iy Intellekt (AI)</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        Tinglovchilarning ochiq turdagi savollarga yozgan javoblarini avtomatik tekshiruvchi, individual maslahatlar beruvchi va dars davomida uzluksiz yordam ko'rsatuvchi chatbot integratsiyasi.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">3</div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Metodik Qamrov</h4>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        Ushbu tajribalar bevosita biologiya fani o'qituvchilarining malaka oshirish jarayonida amaliyotga joriy etilib, sanogen (sog'lom) fikrlash orqali ularning ish samaradorligini va hayotiy qoniqishini oshirishga xizmat qiladi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-full border border-white/10 absolute -inset-8 animate-spin-slow opacity-20"></div>
                <div className="aspect-square rounded-full border border-primary/20 absolute -inset-4 animate-reverse-spin opacity-30"></div>
                <div className="w-full bg-black/40 rounded-3xl aspect-video border border-white/10 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                  <Activity size={80} className="text-white/50" />
                  <p className="absolute bottom-4 left-0 w-full text-center text-sm font-semibold tracking-widest text-white/50 uppercase">Tizim Ishlash Sxemasi</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
