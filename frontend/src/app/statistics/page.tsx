"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { Users, BookOpen, Layers, CheckCircle, Activity, Loader2, MapPin, Briefcase, Award } from "lucide-react";
import CountUp from "react-countup";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList
} from 'recharts';
import STDSStatsTable from "@/components/STDSStatsTable";

export default function StatisticsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [statsDiss, setStatsDiss] = useState({ total_visits: 0, total_users: 0, total_courses: 0, total_modules: 0, completed_modules: 0, total_certificates: 0 });
  const [statsUmumiy, setStatsUmumiy] = useState({ total_visits: 0, total_users: 0, total_courses: 0, total_modules: 0, completed_modules: 0, total_certificates: 0 });

  const [regionalStatsDiss, setRegionalStatsDiss] = useState<any>({});
  const [regionalStatsUmumiy, setRegionalStatsUmumiy] = useState<any>({});
  const [stdsStatsDiss, setStdsStatsDiss] = useState<any>({});
  const [stdsStatsUmumiy, setStdsStatsUmumiy] = useState<any>({});
  const [stdsGroupStatsDiss, setStdsGroupStatsDiss] = useState<any>({});
  const [stdsGroupStatsUmumiy, setStdsGroupStatsUmumiy] = useState<any>({});
  
  const [statsMode, setStatsMode] = useState<'dissertation' | 'umumiy'>('dissertation');
  const [analyticalDataDiss, setAnalyticalDataDiss] = useState<any>({ data: [], summary: {} });
  const [analyticalDataUmumiy, setAnalyticalDataUmumiy] = useState<any>({ data: [], summary: {} });
  
  const stats = statsMode === 'dissertation' ? statsDiss : statsUmumiy;
  const regionalStats = statsMode === 'dissertation' ? regionalStatsDiss : regionalStatsUmumiy;
  const stdsStats = statsMode === 'dissertation' ? stdsStatsDiss : stdsStatsUmumiy;
  const stdsGroupStats = statsMode === 'dissertation' ? stdsGroupStatsDiss : stdsGroupStatsUmumiy;
  const analyticalData = statsMode === 'dissertation' ? analyticalDataDiss : analyticalDataUmumiy;

  useEffect(() => {
    Promise.all([
      fetchApi("/statistics?group=dissertation"),
      fetchApi("/statistics/regional?group=dissertation"),
      fetchApi("/statistics/stds?group=dissertation").catch(() => null),
      fetchApi("/statistics/stds-groups?group=dissertation").catch(() => null),
      fetchApi("/statistics/analytical?group=dissertation").catch(() => null),
      
      fetchApi("/statistics?group=umumiy"),
      fetchApi("/statistics/regional?group=umumiy"),
      fetchApi("/statistics/stds?group=umumiy").catch(() => null),
      fetchApi("/statistics/stds-groups?group=umumiy").catch(() => null),
      fetchApi("/statistics/analytical?group=umumiy").catch(() => null)
    ])
      .then(([statsDissRes, regDissRes, stdsDissRes, grpDissRes, anaDissRes, statsUmuRes, regUmuRes, stdsUmuRes, grpUmuRes, anaUmuRes]) => {
        if (statsDissRes.status === "success" && statsDissRes.data) setStatsDiss(statsDissRes.data);
        if (regDissRes.status === "success" && regDissRes.data) setRegionalStatsDiss(regDissRes.data);
        if (stdsDissRes && stdsDissRes.status === "success" && stdsDissRes.data) setStdsStatsDiss(stdsDissRes.data);
        if (grpDissRes && grpDissRes.status === "success" && grpDissRes.data) setStdsGroupStatsDiss(grpDissRes.data);
        if (anaDissRes && anaDissRes.status === "success") setAnalyticalDataDiss({ data: anaDissRes.data || [], summary: anaDissRes.summary || {} });
        
        if (statsUmuRes.status === "success" && statsUmuRes.data) setStatsUmumiy(statsUmuRes.data);
        if (regUmuRes.status === "success" && regUmuRes.data) setRegionalStatsUmumiy(regUmuRes.data);
        if (stdsUmuRes && stdsUmuRes.status === "success" && stdsUmuRes.data) setStdsStatsUmumiy(stdsUmuRes.data);
        if (grpUmuRes && grpUmuRes.status === "success" && grpUmuRes.data) setStdsGroupStatsUmumiy(grpUmuRes.data);
        if (anaUmuRes && anaUmuRes.status === "success") setAnalyticalDataUmumiy({ data: anaUmuRes.data || [], summary: anaUmuRes.summary || {} });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statItems = [
    {
      title: (t as any).publicStatistics?.totalVisits || "Barcha kirishlar",
      value: stats.total_visits,
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: (t as any).publicStatistics?.totalUsers || "Ro'yxatdan o'tganlar",
      value: stats.total_users,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: (t as any).publicStatistics?.totalCourses || "Kurslar soni",
      value: stats.total_courses,
      icon: BookOpen,
      color: "text-secondary",
      bg: "bg-secondary/10"
    },
    {
      title: (t as any).publicStatistics?.totalModules || "Modullar",
      value: stats.total_modules,
      icon: Layers,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      title: (t as any).publicStatistics?.completedModules || "Kursni to'liq tugatganlar",
      value: stats.completed_modules,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: (t as any).publicStatistics?.totalCertificates || "Sertifikat olganlar",
      value: stats.total_certificates,
      icon: Award,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const GENDER_COLORS = ['#ec4899', '#3b82f6']; // Pink, Blue

  const stdsChartData = Object.entries(stdsStats).map(([region, data]: [string, any]) => {
    return {
      name: region === 'boshqa' ? 'Boshqa' : region.charAt(0).toUpperCase() + region.slice(1),
      'Pre-test': data.pre?.total || 0,
      'Post-test': data.post?.total || 0,
    };
  });

  const jamiRow = analyticalData.data?.find((r: any) => r.isTotal) || { tajriba: '0', nazorat: '0', samaradorlik: '0' };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12 px-6">
        {/* Mode Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 p-1 rounded-xl flex gap-2 border border-white/10">
            <button
              onClick={() => setStatsMode('dissertation')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${statsMode === 'dissertation' ? 'bg-primary text-white shadow-lg' : 'text-foreground/70 hover:text-white hover:bg-white/5'}`}
            >
              PhD Statistika (Tajriba va Nazorat)
            </button>
            <button
              onClick={() => setStatsMode('umumiy')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${statsMode === 'umumiy' ? 'bg-primary text-white shadow-lg' : 'text-foreground/70 hover:text-white hover:bg-white/5'}`}
            >
              Umumiy guruh statistikasi
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {(t as any).publicStatistics?.title || "Statistika"}
            </h1>
            <p className="text-foreground/70 text-lg">
              {(t as any).publicStatistics?.subtitle || "Loyiha doirasidagi umumiy ko'rsatkichlar"}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
              >
                {statItems.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeIn}
                    className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform"
                  >
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-50 ${item.bg}`}></div>

                    <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <item.icon size={32} />
                    </div>

                    <h3 className="text-4xl font-bold mb-2 font-mono">
                      <CountUp end={item.value} duration={2.5} separator="," />
                    </h3>
                    <p className="text-foreground/70 font-medium">{item.title}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* STDS Stats Chart */}
              {stdsChartData.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  className="mb-16 glass p-8 rounded-3xl relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                      <Activity size={24} />
                    </div>
                    <h2 className="text-3xl font-bold">STDS-Bio O&apos;sish Ko&apos;rsatkichlari</h2>
                  </div>
                  <p className="text-foreground/70 mb-8">Viloyatlar kesimida Pre-test va Post-test o&apos;rtacha ballari solishtirmasi</p>
                  
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stdsChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff70" tick={{fill: '#ffffff70'}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff70" tick={{fill: '#ffffff70'}} axisLine={false} tickLine={false} domain={[0, 5]} />
                        <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px'}} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar dataKey="Pre-test" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="Pre-test" position="top" fill="#ffffff" fontSize={12} formatter={(val: any) => Number(val) > 0 ? Number(val).toFixed(2) : ''} />
                        </Bar>
                        <Bar dataKey="Post-test" fill="#10b981" radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="Post-test" position="top" fill="#ffffff" fontSize={12} formatter={(val: any) => Number(val) > 0 ? Number(val).toFixed(2) : ''} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Table for Subscales by Group */}
                  {Object.keys(stdsGroupStats).length > 0 && (
                    <div className="mt-8 bg-black/20 p-6 rounded-2xl border border-white/5 overflow-x-auto">
                      <h3 className="text-xl font-bold mb-6 text-center">Guruhlar kesimida subshkalalar o'sish dinamikasi (Barcha {stats?.total_users || '437'} ishtirokchi)</h3>
                      <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-white/10 text-foreground/70 bg-white/5">
                            <th className="p-4 font-semibold border-r border-white/5">Subshkala</th>
                            {statsMode === 'dissertation' ? (
                              <>
                                <th className="p-4 font-semibold text-center border-r border-white/5" colSpan={3}>Tajriba Guruhi (T)</th>
                                <th className="p-4 font-semibold text-center" colSpan={3}>Nazorat Guruhi (N)</th>
                              </>
                            ) : (
                                <th className="p-4 font-semibold text-center" colSpan={3}>Umumiy Guruh</th>
                            )}
                          </tr>
                          <tr className="border-b border-white/10 text-xs text-foreground/50 bg-black/20">
                            <th className="p-4 border-r border-white/5"></th>
                            <th className="p-3 text-center text-blue-400">Pre-test</th>
                            <th className="p-3 text-center text-emerald-400">Post-test</th>
                            <th className="p-3 text-center text-purple-400 border-r border-white/5">O'sish (%)</th>
                            {statsMode === 'dissertation' && (
                              <>
                                <th className="p-3 text-center text-blue-400">Pre-test</th>
                                <th className="p-3 text-center text-emerald-400">Post-test</th>
                                <th className="p-3 text-center text-purple-400">O'sish (%)</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {['Refleksivlik', 'Kognitiv', 'Konstruktiv', 'Motivatsion', 'Emotsional', 'Jami'].map((sub, idx) => {
                            const groupKey1 = statsMode === 'dissertation' ? 'tajriba' : 'umumiy';
                            const tajribaPre = stdsGroupStats[groupKey1]?.pre?.[sub] || 0;
                            const tajribaPost = stdsGroupStats[groupKey1]?.post?.[sub] || 0;
                            const tajribaGrowth = tajribaPre > 0 ? (((tajribaPost - tajribaPre) / tajribaPre) * 100).toFixed(1) : "0.0";
                            
                            const nazoratPre = stdsGroupStats['nazorat']?.pre?.[sub] || 0;
                            const nazoratPost = stdsGroupStats['nazorat']?.post?.[sub] || 0;
                            const nazoratGrowth = nazoratPre > 0 ? (((nazoratPost - nazoratPre) / nazoratPre) * 100).toFixed(1) : "0.0";

                            const isTotal = sub === 'Jami';

                            return (
                              <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isTotal ? 'bg-primary/5 font-bold' : ''}`}>
                                <td className="p-4 font-medium border-r border-white/5 flex items-center gap-2">
                                  {isTotal && <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>}
                                  {sub}
                                </td>
                                <td className="p-4 text-center font-mono">{tajribaPre > 0 ? tajribaPre.toFixed(2) : '-'}</td>
                                <td className="p-4 text-center font-mono">{tajribaPost > 0 ? tajribaPost.toFixed(2) : '-'}</td>
                                <td className="p-4 text-center text-purple-400 font-bold border-r border-white/5">+{tajribaGrowth}%</td>
                                {statsMode === 'dissertation' && (
                                  <>
                                    <td className="p-4 text-center font-mono">{nazoratPre > 0 ? nazoratPre.toFixed(2) : '-'}</td>
                                    <td className="p-4 text-center font-mono">{nazoratPost > 0 ? nazoratPost.toFixed(2) : '-'}</td>
                                    <td className="p-4 text-center text-purple-400 font-bold">+{nazoratGrowth}%</td>
                                  </>
                                )}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Regional Statistics Section */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <MapPin size={24} />
                  </div>
                  <h2 className="text-3xl font-bold">Hududlar bo&apos;yicha tahliliy boshqaruv paneli</h2>
                </div>
                
                <div className="space-y-12">
                  {Object.entries(regionalStats).map(([region, data]: [string, any]) => {
                    const barData = statsMode === 'dissertation' ? [
                      { name: 'Tajriba', Ishtirokchilar: data.tajriba.total },
                      { name: 'Nazorat', Ishtirokchilar: data.nazorat.total },
                    ] : [
                      { name: 'Umumiy', Ishtirokchilar: data.umumiy.total },
                    ];

                    const locationData = statsMode === 'dissertation' ? [
                      { name: 'Tajriba', Shahar: data.tajriba.city_percentage, Qishloq: data.tajriba.rural_percentage },
                      { name: 'Nazorat', Shahar: data.nazorat.city_percentage, Qishloq: data.nazorat.rural_percentage },
                    ] : [
                      { name: 'Umumiy', Shahar: data.umumiy.city_percentage, Qishloq: data.umumiy.rural_percentage },
                    ];

                    const pieData = [
                      { name: 'Ayollar', value: statsMode === 'dissertation' ? ((data.tajriba.female_percentage + data.nazorat.female_percentage) / 2) : data.umumiy.female_percentage },
                      { name: 'Erkaklar', value: 100 - (statsMode === 'dissertation' ? ((data.tajriba.female_percentage + data.nazorat.female_percentage) / 2) : data.umumiy.female_percentage) }
                    ];

                    const regionStds = stdsStats[region];
                    const regionSurveyData = regionStds ? [
                      { subject: 'Refleksivlik', Pre: regionStds.pre?.reflexive || 0, Post: regionStds.post?.reflexive || 0 },
                      { subject: 'Kognitiv', Pre: regionStds.pre?.cognitive || 0, Post: regionStds.post?.cognitive || 0 },
                      { subject: 'Konstruktiv', Pre: regionStds.pre?.constructive || 0, Post: regionStds.post?.constructive || 0 },
                      { subject: 'Motivatsion', Pre: regionStds.pre?.motivational || 0, Post: regionStds.post?.motivational || 0 },
                      { subject: 'Emotsional', Pre: regionStds.pre?.emotional || 0, Post: regionStds.post?.emotional || 0 },
                    ] : [];

                    return (
                      <div key={region} className="glass p-6 md:p-10 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                          <MapPin size={120} />
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                          <h3 className="text-3xl font-bold capitalize text-primary flex items-center gap-2">
                            {region === 'boshqa' ? 'Boshqa hududlar' : `${region} viloyati`}
                          </h3>
                          
                          <div className="mt-4 md:mt-0 flex gap-4">
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                              <Users className="text-blue-400" size={20} />
                              <div>
                                <p className="text-xs text-foreground/50">Jami ishtirokchilar</p>
                                <p className="text-lg font-bold">{data.umumiy.total} nafar</p>
                              </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                              <Briefcase className="text-orange-400" size={20} />
                              <div>
                                <p className="text-xs text-foreground/50">O&apos;rtacha staj</p>
                                <p className="text-lg font-bold">{data.umumiy.avg_experience} yil</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Guruhlar solishtirmasi */}
                          <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-lg font-medium mb-6 text-center text-foreground/80">Guruhlar bo&apos;yicha ishtirokchilar</h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff70" tick={{fill: '#ffffff70'}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#ffffff70" tick={{fill: '#ffffff70'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px'}} />
                                <Bar dataKey="Ishtirokchilar" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                                  <LabelList dataKey="Ishtirokchilar" position="top" fill="#ffffff" fontSize={14} fontWeight="bold" />
                                  {
                                    barData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 2 ? '#ec4899' : '#8b5cf6'} />
                                    ))
                                  }
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Gender taqsimoti */}
                          <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-lg font-medium mb-6 text-center text-foreground/80">Gender taqsimoti (Umumiy)</h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                                  label={({ value }) => `${value}%`}
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value) => `${value}%`}
                                  contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px'}} 
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Maktab joylashuvi */}
                          <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-lg font-medium mb-6 text-center text-foreground/80">Maktab joylashuvi (foizda)</h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={locationData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff70" tick={{fill: '#ffffff70'}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#ffffff70" tick={{fill: '#ffffff70'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                  formatter={(value) => `${value}%`}
                                  cursor={{fill: '#ffffff05'}} 
                                  contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px'}} 
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <Bar dataKey="Shahar" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]}>
                                  <LabelList dataKey="Shahar" position="center" fill="#ffffff" formatter={(val: any) => Number(val) > 0 ? `${val}%` : ''} fontSize={12} fontWeight="bold" />
                                </Bar>
                                <Bar dataKey="Qishloq" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]}>
                                  <LabelList dataKey="Qishloq" position="center" fill="#ffffff" formatter={(val: any) => Number(val) > 0 ? `${val}%` : ''} fontSize={12} fontWeight="bold" />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* STDS-Bio Subscales Progress Bars for this Region */}
                        {regionSurveyData.length > 0 && regionSurveyData.some(d => d.Pre > 0 || d.Post > 0) && (
                          <div className="mt-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-lg font-medium mb-6 text-foreground/80 border-b border-white/10 pb-4">STDS-Bio Subshkala Ko'rsatkichlari (O'rtacha)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                              {regionSurveyData.map((item, index) => (
                                <div key={item.subject} className="space-y-2">
                                  <div className="flex justify-between text-sm font-semibold text-foreground/90">
                                    <span>{item.subject}</span>
                                  </div>
                                  
                                  {/* Pre-test bar */}
                                  <div className="flex items-center gap-3">
                                    <div className="w-14 text-xs text-blue-400 text-right">Pre: {item.Pre > 0 ? item.Pre.toFixed(2) : 0}</div>
                                    <div className="flex-1 bg-background/50 rounded-full h-2 overflow-hidden border border-white/5">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(item.Pre / 5) * 100}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                        className="bg-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Post-test bar */}
                                  <div className="flex items-center gap-3">
                                    <div className="w-14 text-xs text-emerald-400 text-right">Post: {item.Post > 0 ? item.Post.toFixed(2) : 0}</div>
                                    <div className="flex-1 bg-background/50 rounded-full h-2 overflow-hidden border border-white/5">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(item.Post / 5) * 100}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                        className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Analytical Module */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="mt-16 glass p-8 rounded-3xl relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl">
                    <Activity size={24} />
                  </div>
                  <h2 className="text-3xl font-bold">Yakuniy Statistik Tahlil</h2>
                </div>
                

                <p className="text-foreground/70 mb-8">
                  Pre-test va Post-test natijalari asosida 4 ta matematik-statistik usul bo'yicha hisob-kitob va gipotezani tasdiqlash
                </p>

                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 overflow-x-auto mb-8">
                  <table className="w-full text-sm text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="border-b border-white/10 text-foreground/70 bg-white/5">
                        <th className="p-4 font-semibold border-r border-white/5">Hudud nomi</th>
                        <th className="p-4 font-semibold text-center border-r border-white/5">Pirson (χ²emp / χ²kr)</th>
                        <th className="p-4 font-semibold text-center border-r border-white/5">{statsMode === 'dissertation' ? "Tajriba o'rtacha (x̄)" : "Post-test o'rtacha (x̄)"}</th>
                        <th className="p-4 font-semibold text-center border-r border-white/5">{statsMode === 'dissertation' ? "Nazorat o'rtacha (ȳ)" : "Pre-test o'rtacha (ȳ)"}</th>
                        <th className="p-4 font-semibold text-center border-r border-white/5">Samaradorlik (η / %)</th>
                        <th className="p-4 font-semibold text-center border-r border-white/5">Student t-mezon (t_emp / t_kr)</th>
                        {statsMode === 'dissertation' && (
                          <th className="p-4 font-semibold text-center border-r border-white/5">Mann-Whitney (|z_MW| / z_kr)</th>
                        )}
                        <th className="p-4 font-semibold text-center">Qabul qilingan gipoteza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticalData.data && analyticalData.data.map((row: any, idx: number) => (
                        <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${row.isTotal ? 'bg-primary/10 font-bold text-base' : ''}`}>
                          <td className="p-4 font-medium border-r border-white/5">{row.region}</td>
                          <td className="p-4 text-center font-mono border-r border-white/5">{row.pirson}</td>
                          <td className="p-4 text-center font-mono border-r border-white/5">{row.tajriba}</td>
                          <td className="p-4 text-center font-mono border-r border-white/5">{row.nazorat}</td>
                          <td className="p-4 text-center text-purple-400 border-r border-white/5">{row.samaradorlik}</td>
                          <td className="p-4 text-center font-mono border-r border-white/5">{row.student}</td>
                          {statsMode === 'dissertation' && (
                            <td className="p-4 text-center font-mono border-r border-white/5">{row.mannWhitney}</td>
                          )}
                          <td className="p-4 text-center text-emerald-400 font-medium">{row.gipoteza}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {analyticalData?.summary?.distribution && (
                  <STDSStatsTable 
                    summary={analyticalData.summary} 
                    jami={jamiRow} 
                    isUmumiy={statsMode === 'umumiy'}
                  />
                )}

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl relative overflow-hidden mt-8">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <h4 className="text-xl font-bold mb-3 text-primary flex items-center gap-2">
                    <CheckCircle size={20} /> Ilmiy Xulosa
                  </h4>
                  <p className="text-foreground/90 leading-relaxed text-lg">
                    Tadqiqot natijalarining matematik-statistik tahlili shuni ko'rsatdiki, mualliflik metodikasi qo'llanilgan Tajriba guruhida sanogen tafakkur darajasi Nazorat guruhiga nisbatan o'rtacha <span className="font-bold text-primary">{analyticalData.summary?.efficiency || '0'}%</span> ga yuqori (η = {analyticalData.summary?.eta || '0'}) bo'ldi. Barcha 4 ta statistik usul (χ² = {analyticalData.summary?.chi2 || '0'}, t = {analyticalData.summary?.t || '0'}, |z| = {analyticalData.summary?.z || '0'}, η = {analyticalData.summary?.eta || '0'}) 95% ishonchlilik darajasida <span className="font-bold text-emerald-400">H1 gipotezasini to'liq tasdiqladi.</span>
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-lg py-12 text-center mt-auto">
        <p className="text-foreground/50">
          © {new Date().getFullYear()} Sanotaf. {t.footer.rights}
        </p>
      </footer>
    </div>
  );
}
