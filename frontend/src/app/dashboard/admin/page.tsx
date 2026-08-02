"use client";

import React, { useEffect, useState } from "react";
import { fetchApi, uploadFile } from "@/lib/api";
import { Loader2, Users, BookOpen, Plus, Trash2, Edit, ChevronDown, ChevronRight, Video, FileText, HelpCircle, CheckCircle2, MessageSquare, Upload, BarChart3 } from "lucide-react";
import { useAuth } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#14b8a6', '#f97316'];
import 'react-quill-new/dist/quill.snow.css';

const ReactQuillWrapper = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    if (typeof window !== 'undefined') {
      (window as any).Quill = RQ.Quill;
      try {
        const BlotFormatter = (await import('quill-blot-formatter')).default;
        RQ.Quill.register('modules/blotFormatter', BlotFormatter);
        
        const BaseImageFormat = RQ.Quill.import('formats/image');
        const ImageFormatAttributesList = ['alt', 'height', 'width', 'style', 'class'];
        class ImageFormat extends (BaseImageFormat as any) {
          static formats(domNode: any) {
            return ImageFormatAttributesList.reduce(function(formats: any, attribute) {
              if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
              }
              return formats;
            }, {});
          }
          format(name: string, value: any) {
            if (ImageFormatAttributesList.indexOf(name) > -1) {
              if (value) {
                (this as any).domNode.setAttribute(name, value);
              } else {
                (this as any).domNode.removeAttribute(name);
              }
            } else {
              super.format(name, value);
            }
          }
        }
        RQ.Quill.register(ImageFormat as any, true);
      } catch (err) {
        console.error("Blot formatter yuklanmadi", err);
      }
    }
    return function ForwardedQuill(props: any) {
      return <RQ {...props} />;
    };
  },
  { ssr: false, loading: () => <p className="text-primary p-4 text-sm animate-pulse">Muharrir yuklanmoqda...</p> }
);

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean']
  ],
  blotFormatter: {}
};

import AboutSettings from "@/components/admin/AboutSettings";
import GroupSettings from "@/components/admin/GroupSettings";

type ModuleSection = 'maruza' | 'test' | 'nazorat' | 'taqdimot';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'about' | 'messages' | 'analytics' | 'groups'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Message reply states
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [userProgressData, setUserProgressData] = useState<any[]>([]);
  const [loadingUserProgress, setLoadingUserProgress] = useState(false);

  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [activeModuleSection, setActiveModuleSection] = useState<Record<number, ModuleSection>>({});

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', image_url: '' });

  const [showModuleForm, setShowModuleForm] = useState<number | null>(null);
  const [editingModule, setEditingModule] = useState<number | null>(null);
  const [newModule, setNewModule] = useState({ title: '', video_url: '', presentation_url: '', order: 1 });

  const [showContentForm, setShowContentForm] = useState<number | null>(null);
  const [moduleContent, setModuleContent] = useState('');

  const [showTestForm, setShowTestForm] = useState<number | null>(null);
  const [showControlForm, setShowControlForm] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    ai_rubric: '',
    video_timestamp: '',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });

  // Presentation upload state
  const [uploadingPresentation, setUploadingPresentation] = useState<number | null>(null);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    if (!authLoading) {
      if (user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      loadData();
    }
  }, [user, authLoading, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await fetchApi("/admin/users");
        if (data.status === 'success') setUsers(data.users);
      } else if (activeTab === 'courses') {
        const data = await fetchApi("/courses");
        if (data.status === 'success') setCourses(data.courses);
      } else if (activeTab === 'messages') {
        const data = await fetchApi("/admin/contact-messages");
        if (data.status === 'success') setMessages(data.messages);
      } else if (activeTab === 'analytics') {
        const data = await fetchApi("/admin/analytics");
        if (data.status === 'success') setAnalyticsData(data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    setLoadingUserProgress(true);
    setUserProgressData([]);
    try {
      const data = await fetchApi(`/admin/users/${userId}/progress`);
      if (data.status === 'success') {
        setUserProgressData(data.progress || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserProgress(false);
    }
  };

  const handleUploadPresentation = async (e: React.FormEvent, moduleId: number, courseId: number) => {
    e.preventDefault();
    if (!presentationFile) return;

    setUploadingPresentation(moduleId);
    setUploadProgress('Yuklanmoqda...');

    const formData = new FormData();
    formData.append('file', presentationFile);

    try {
      const data = await uploadFile(`/admin/modules/${moduleId}/upload-presentation`, formData);
      if (data.status === 'success') {
        setPresentationFile(null);
        setUploadProgress('');
        loadCourseDetails(courseId, true);
      } else {
        alert(data.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      alert(err.message || "Yuklashda xatolik");
    } finally {
      setUploadingPresentation(null);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/admin/courses/${editingCourse}` : "/admin/courses";
      const method = editingCourse ? "PUT" : "POST";
      const data = await fetchApi(url, { method, body: JSON.stringify(newCourse) });
      if (data.status === 'success') {
        setShowCourseForm(false); setEditingCourse(null);
        setNewCourse({ title: '', description: '', image_url: '' });
        loadData();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      const data = await fetchApi(`/admin/courses/${id}`, { method: "DELETE" });
      if (data.status === 'success') loadData();
    } catch (err: any) { alert(err?.message || 'Xatolik yuz berdi'); console.error(err); }
  };

  const handleSaveModule = async (e: React.FormEvent, courseId: number) => {
    e.preventDefault();
    try {
      const url = editingModule ? `/admin/modules/${editingModule}` : "/admin/modules";
      const method = editingModule ? "PUT" : "POST";
      const payload = { ...newModule, course_id: courseId, order: newModule.order || 1 };
      const data = await fetchApi(url, { method, body: JSON.stringify(payload) });
      if (data.status === 'success') {
        setShowModuleForm(null); setEditingModule(null);
        setNewModule({ title: '', video_url: '', presentation_url: '', order: 1 });
        loadCourseDetails(courseId, true);
      }
    } catch (err: any) { alert(err?.message || 'Xatolik yuz berdi'); console.error(err); }
  };

  const handleSaveModuleContent = async (e: React.FormEvent, moduleId: number, courseId: number) => {
    e.preventDefault();
    try {
      const data = await fetchApi(`/admin/modules/${moduleId}`, { method: "PUT", body: JSON.stringify({ content: moduleContent }) });
      if (data.status === 'success') { setShowContentForm(null); loadCourseDetails(courseId, true); }
    } catch (err: any) { alert(err?.message || 'Xatolik yuz berdi'); console.error(err); }
  };

  const handleDeleteModule = async (id: number, courseId: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      const data = await fetchApi(`/admin/modules/${id}`, { method: "DELETE" });
      if (data.status === 'success') loadCourseDetails(courseId, true);
    } catch (err: any) { alert(err?.message || 'Xatolik yuz berdi'); console.error(err); }
  };

  const handleSaveQuestion = async (e: React.FormEvent, moduleId: number, courseId: number, type: 'multiple_choice' | 'open_ended') => {
    e.preventDefault();
    try {
      const url = editingQuestion ? `/admin/questions/${editingQuestion}` : "/admin/questions";
      const method = editingQuestion ? "PUT" : "POST";
      const parsedTimestamp = parseInt(String(newQuestion.video_timestamp), 10);
      const payload = {
        ...newQuestion, module_id: moduleId, type,
        video_timestamp: !isNaN(parsedTimestamp) ? parsedTimestamp : null,
      };
      const data = await fetchApi(url, { method, body: JSON.stringify(payload) });
      if (data.status === 'success') {
        setShowTestForm(null); setShowControlForm(null); setEditingQuestion(null);
        setNewQuestion({ question_text: '', ai_rubric: '', video_timestamp: '', options: [{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }] });
        loadCourseDetails(courseId, true);
      }
    } catch (err: any) { 
      console.error("Save question error:", err);
      alert(err?.message || "Savolni saqlashda xatolik yuz berdi");
    }
  };

  const handleDeleteQuestion = async (id: number, courseId: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      const data = await fetchApi(`/admin/questions/${id}`, { method: "DELETE" });
      if (data.status === 'success') loadCourseDetails(courseId, true);
    } catch (err: any) { alert(err?.message || 'Xatolik yuz berdi'); console.error(err); }
  };

  const loadCourseDetails = async (courseId: number, forceRefresh = false) => {
    if (expandedCourse === courseId && !forceRefresh) { setExpandedCourse(null); return; }
    try {
      const data = await fetchApi(`/courses/${courseId}`);
      if (data.status === 'success') {
        setCourses(prev => prev.map(c => c.id === courseId ? data.course : c));
        setExpandedCourse(courseId);
      }
    } catch (err) { console.error(err); }
  };

  const getSectionLabel = (s: ModuleSection) => {
    switch(s) {
      case 'maruza': return "📄 Ma'ruza";
      case 'test': return "✅ Test Savollari";
      case 'nazorat': return "🎯 Nazorat Savollari";
      case 'taqdimot': return "🖼️ Taqdimot";
    }
  };

  const handleSendReply = async (e: React.FormEvent, msgId: number) => {
    e.preventDefault();
    try {
      const data = await fetchApi(`/admin/contact-messages/${msgId}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply: replyText })
      });
      if (data.status === 'success') {
        setReplyingTo(null);
        setReplyText('');
        loadData();
      }
    } catch (err) { console.error(err); }
  };

  const handleMarkAsRead = async (msgId: number) => {
    try {
      const data = await fetchApi(`/admin/contact-messages/${msgId}/read`, {
        method: "POST"
      });
      if (data.status === 'success') loadData();
    } catch (err) { console.error(err); }
  };

  const handleCourseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Show uploading state if necessary, but here we can just wait
      const data = await uploadFile('/admin/upload-course-image', formData);
      if (data.status === 'success') {
        setNewCourse({...newCourse, image_url: data.image_url});
      } else {
        alert("Rasm yuklashda xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Rasm yuklashda xatolik");
    }
  };

  if (authLoading || loading && users.length === 0 && courses.length === 0) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  return (
    <div className="flex flex-col w-full space-y-6 pb-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Boshqaruv Paneli
        </h1>
      </div>

      {/* Top Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-foreground/70'}`}>
          <Users size={18} /> Foydalanuvchilar
        </button>
        <button onClick={() => setActiveTab('courses')} className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${activeTab === 'courses' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-foreground/70'}`}>
          <BookOpen size={18} /> Kurslar va Darslar
        </button>
        <button onClick={() => setActiveTab('about')} className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${activeTab === 'about' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-foreground/70'}`}>
          <FileText size={18} /> Loyiha va Mualliflar
        </button>
        <button onClick={() => setActiveTab('messages')} className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${activeTab === 'messages' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-foreground/70'}`}>
          <MessageSquare size={20} /> Xabarlar
        </button>
        <button onClick={() => setActiveTab('groups')} className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${activeTab === 'groups' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-foreground/70'}`}>
          <Users size={20} /> Guruhlar
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-foreground/70'}`}>
          <BarChart3 size={20} /> Statistika
        </button>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col">

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && analyticsData && (
          <div className="flex-1 space-y-6">
            <h2 className="text-xl font-bold">Analitika va Statistika</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-sm text-foreground/60 mb-1">Jami Foydalanuvchilar</p>
                <p className="text-2xl font-bold">{analyticsData.total_users}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-sm text-foreground/60 mb-1">Jami Kurslar</p>
                <p className="text-2xl font-bold">{analyticsData.total_courses}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-sm text-foreground/60 mb-1">Bajarilgan Testlar</p>
                <p className="text-2xl font-bold">{analyticsData.total_tests_completed}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-sm text-foreground/60 mb-1">O'rtacha Ball</p>
                <p className="text-2xl font-bold text-secondary">{analyticsData.average_score}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Regional Performance Chart */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 h-[400px]">
                <h3 className="font-semibold mb-4">Viloyatlar bo'yicha ko'rsatkichlar (O'rtacha ball)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.regional_performance} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                    <XAxis dataKey="region" stroke="#ffffff80" fontSize={12} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                    <YAxis stroke="#ffffff80" fontSize={12} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                    <Bar dataKey="avg_score" name="O'rtacha Ball" radius={[4, 4, 0, 0]}>
                      {analyticsData.regional_performance?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Most Active Users */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 h-[400px]">
                <h3 className="font-semibold mb-4">Eng faol foydalanuvchilar (Bajarilgan testlar)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.most_active_users} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                    <XAxis type="number" stroke="#ffffff80" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#ffffff80" fontSize={12} width={100} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                    <Bar dataKey="tests_completed" name="Bajarilgan Testlar" radius={[0, 4, 4, 0]}>
                      {analyticsData.most_active_users?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent History Table */}
            <div>
              <h3 className="font-semibold mb-4">Oxirgi Bajarilgan Testlar Tarixi</h3>
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-foreground/60 bg-black/20">
                      <th className="p-4 font-medium">Foydalanuvchi</th>
                      <th className="p-4 font-medium">Viloyat</th>
                      <th className="p-4 font-medium">Kurs & Dars</th>
                      <th className="p-4 font-medium">Vaqt</th>
                      <th className="p-4 font-medium text-right">Ball</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.recent_history?.map((hist: any) => (
                      <tr key={hist.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">{hist.user?.name || '-'}</td>
                        <td className="p-4 capitalize">{hist.user?.region || '-'}</td>
                        <td className="p-4">
                          <span className="text-foreground/60 text-xs block">{hist.module?.course?.title || '-'}</span>
                          {hist.module?.title || '-'}
                        </td>
                        <td className="p-4 text-foreground/70">{new Date(hist.created_at).toLocaleString('uz-UZ')}</td>
                        <td className="p-4 font-bold text-right text-secondary">{hist.score}</td>
                      </tr>
                    ))}
                    {(!analyticsData.recent_history || analyticsData.recent_history.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-foreground/40">Ma'lumot topilmadi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-4">O'qituvchilar ro'yxati</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-foreground/60 text-sm">
                  <th className="p-4 font-medium">Ismi</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Viloyat</th>
                  <th className="p-4 font-medium">Lavozim</th>
                  <th className="p-4 font-medium">Jinsi</th>
                  <th className="p-4 font-medium">Maktab</th>
                  <th className="p-4 font-medium">Staj</th>
                  <th className="p-4 font-medium">Guruh</th>
                  <th className="p-4 font-medium text-right">To'plagan Ball</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <React.Fragment key={u.id}>
                    <tr onClick={() => handleUserClick(u.id)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                      <td className="p-4 font-medium flex items-center gap-2">
                        {expandedUser === u.id ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        {u.name} {u.role === 'admin' && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded ml-2">Admin</span>}
                      </td>
                      <td className="p-4 text-foreground/70">{u.email}</td>
                      <td className="p-4 text-foreground/70 capitalize">{u.region}</td>
                      <td className="p-4 text-foreground/70">{u.position}</td>
                      <td className="p-4 text-foreground/70 capitalize">{u.gender || '-'}</td>
                      <td className="p-4 text-foreground/70 capitalize">{u.school_location || '-'}</td>
                      <td className="p-4 text-foreground/70">{u.pedagogical_experience ? `${u.pedagogical_experience} yil` : '-'}</td>
                      <td className="p-4 text-foreground/70 capitalize">{u.group || '-'}</td>
                      <td className="p-4 font-bold text-right text-secondary">{u.total_score}</td>
                    </tr>
                    {expandedUser === u.id && (
                      <tr className="bg-black/20">
                        <td colSpan={9} className="p-6">
                           {loadingUserProgress ? (
                             <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" size={24}/></div>
                           ) : (
                             <div className="space-y-4">
                                <h4 className="font-bold mb-4">{u.name} ning O'zlashtirish Holati</h4>
                                {userProgressData.map((cp, idx) => (
                                  <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className="font-semibold">{cp.course.title}</h5>
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        cp.status === 'Tugallangan' ? 'bg-green-500/20 text-green-400' :
                                        cp.status === 'Jarayonda' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-foreground/10 text-foreground/50'
                                      }`}>{cp.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm mb-3">
                                      <span className="text-foreground/70">Tugatilgan darslar: <b className="text-foreground">{cp.completed_modules_count} / {cp.course.total_modules}</b></span>
                                      <span className="text-foreground/70">To'plangan ball: <b className="text-secondary">{cp.score}</b></span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                                      <div className={`h-full rounded-full ${cp.status === 'Tugallangan' ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${cp.course.total_modules > 0 ? (cp.completed_modules_count / cp.course.total_modules) * 100 : 0}%` }}></div>
                                    </div>
                                    {cp.details && cp.details.length > 0 && (
                                      <div className="mt-4">
                                        <p className="text-xs text-foreground/50 mb-2">Tugatilgan modullar tarixi:</p>
                                        <ul className="space-y-1">
                                          {cp.details.map((dt: any, i: number) => (
                                            <li key={i} className="text-xs flex justify-between bg-white/5 px-3 py-2 rounded">
                                              <span>{dt.module_title}</span>
                                              <span className="text-foreground/50">{new Date(dt.completed_at).toLocaleString('uz-UZ')} - <b className="text-secondary">{dt.score} ball</b></span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {userProgressData.length === 0 && (
                                  <div className="text-center p-4 text-foreground/50 text-sm">Ma'lumot topilmadi.</div>
                                )}
                             </div>
                           )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="flex-1 flex flex-col pr-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Kurslar ro'yxati</h2>
              <button onClick={() => setShowCourseForm(!showCourseForm)} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <Plus size={16} /> Yangi kurs
              </button>
            </div>

            {showCourseForm && (
              <form onSubmit={handleSaveCourse} className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6 space-y-4">
                <h3 className="font-bold">{editingCourse ? "Kursni tahrirlash" : "Yangi kurs qo'shish"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required placeholder="Kurs nomi" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="bg-background/50 border border-white/10 rounded-lg px-4 py-2" />
                  
                  <div className="flex gap-2 items-center">
                    <input placeholder="Rasm URL yozing yoki fayl yuklang..." value={newCourse.image_url} onChange={e => setNewCourse({...newCourse, image_url: e.target.value})} className="bg-background/50 border border-white/10 rounded-lg px-4 py-2 flex-1" />
                    <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center shrink-0" title="Kompyuterdan rasm yuklash">
                      <Upload size={16} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleCourseImageUpload} />
                    </label>
                  </div>
                </div>
                <textarea required placeholder="Ta'rif" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} className="bg-background/50 border border-white/10 rounded-lg px-4 py-2 w-full h-24" />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setShowCourseForm(false); setEditingCourse(null); setNewCourse({title:'', description:'', image_url:''}); }} className="px-4 py-2 bg-white/10 rounded-lg">Bekor qilish</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Saqlash</button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
                  {/* Course Header */}
                  <div onClick={() => loadCourseDetails(course.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5">
                    <div>
                      <h3 className="font-bold text-lg">{course.title}</h3>
                      <p className="text-sm text-foreground/60">{course.modules?.length || 0} ta dars</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditingCourse(course.id); setNewCourse({title: course.title, description: course.description, image_url: course.image_url}); setShowCourseForm(true); }} className="p-2 text-foreground/50 hover:text-foreground hover:bg-white/10 rounded-lg transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                      {expandedCourse === course.id ? <ChevronDown /> : <ChevronRight />}
                    </div>
                  </div>

                  {/* Modules (Expanded) */}
                  {expandedCourse === course.id && (
                    <div className="p-5 pt-0 border-t border-white/5 bg-black/20">
                      <div className="flex items-center justify-between my-4">
                        <h4 className="font-bold flex items-center gap-2"><BookOpen size={16} className="text-primary"/> Darslar (Modullar)</h4>
                        <button onClick={() => setShowModuleForm(course.id)} className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm flex items-center gap-1 hover:bg-primary/30">
                          <Plus size={14} /> Dars qo'shish
                        </button>
                      </div>

                      {/* Module Form */}
                      {showModuleForm === course.id && (
                        <form onSubmit={(e) => handleSaveModule(e, course.id)} className="bg-background p-4 rounded-xl border border-white/10 mb-4 space-y-3">
                          <h5 className="font-bold mb-2">{editingModule ? "Darsni tahrirlash" : "Yangi dars qo'shish"}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input required placeholder="Dars sarlavhasi" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                            <input type="number" required placeholder="Tartib (Order)" value={newModule.order} onChange={e => setNewModule({...newModule, order: e.target.value === '' ? '' as any : parseInt(e.target.value, 10)})} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                          </div>
                          <input placeholder="Video URL (YouTube/Vimeo) — ixtiyoriy" value={newModule.video_url} onChange={e => setNewModule({...newModule, video_url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                          <input placeholder="Taqdimot URL (video bo'lmasa ko'rsatiladi) — ixtiyoriy" value={newModule.presentation_url} onChange={e => setNewModule({...newModule, presentation_url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => { setShowModuleForm(null); setEditingModule(null); setNewModule({title:'', video_url:'', presentation_url:'', order:1}); }} className="px-3 py-1.5 text-sm bg-white/10 rounded-lg">Bekor qilish</button>
                            <button type="submit" className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg">Saqlash</button>
                          </div>
                        </form>
                      )}

                      {/* Modules List */}
                      <div className="space-y-3">
                        {course.modules?.map((module: any) => {
                          const currentSection: ModuleSection = activeModuleSection[module.id] || 'maruza';
                          const sections: ModuleSection[] = ['maruza', 'test', 'nazorat', 'taqdimot'];

                          return (
                            <div key={module.id} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                              {/* Module Header */}
                              <div
                                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{module.order}</div>
                                  <span className="font-medium">{module.title}</span>
                                </div>
                                <div className="flex items-center gap-3 text-foreground/50 text-xs">
                                  {module.video_url && <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full"><Video size={12}/> Video</span>}
                                  {module.presentation_url && <span className="flex items-center gap-1 bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">🖼️ Taqdimot</span>}
                                  {module.content && <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full"><FileText size={12}/> Ma'ruza</span>}
                                  <span className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full"><HelpCircle size={12}/> {module.questions?.length || 0} savol</span>
                                  <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => { setEditingModule(module.id); setNewModule({title: module.title, video_url: module.video_url || '', presentation_url: module.presentation_url || '', order: module.order}); setShowModuleForm(course.id); }} className="p-1.5 hover:bg-white/10 hover:text-foreground rounded transition-colors"><Edit size={14}/></button>
                                    <button onClick={() => handleDeleteModule(module.id, course.id)} className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={14}/></button>
                                  </div>
                                  {expandedModule === module.id ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                </div>
                              </div>

                              {/* Module Sections (Expanded) */}
                              {expandedModule === module.id && (
                                <div className="border-t border-white/5">
                                  {/* Section Tab Navigation */}
                                  <div className="flex border-b border-white/5 bg-black/20">
                                    {sections.map(s => (
                                      <button
                                        key={s}
                                        onClick={() => setActiveModuleSection(prev => ({...prev, [module.id]: s}))}
                                        className={`flex-1 py-2.5 px-2 text-xs font-medium transition-all border-b-2 ${
                                          currentSection === s
                                            ? 'border-primary text-primary bg-primary/5'
                                            : 'border-transparent text-foreground/50 hover:text-foreground hover:bg-white/5'
                                        }`}
                                      >
                                        {getSectionLabel(s)}
                                      </button>
                                    ))}
                                  </div>

                                  {/* ====== MA'RUZA SECTION ====== */}
                                  {currentSection === 'maruza' && (
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <h5 className="font-semibold flex items-center gap-2 text-primary"><FileText size={15}/> Ma'ruza Matni</h5>
                                        <button
                                          onClick={() => { setModuleContent(module.content || ''); setShowContentForm(module.id); }}
                                          className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs flex items-center gap-1 hover:bg-primary/30"
                                        >
                                          <Edit size={12}/> {module.content ? "Tahrirlash" : "Qo'shish"}
                                        </button>
                                      </div>

                                      {showContentForm === module.id ? (
                                        <form onSubmit={(e) => handleSaveModuleContent(e, module.id, course.id)} className="space-y-3">
                                          <div className="bg-white text-black rounded-md">
                                            <ReactQuillWrapper
                                              theme="snow"
                                              value={moduleContent}
                                              onChange={setModuleContent}
                                              modules={quillModules}
                                              className="bg-white min-h-[300px]"
                                            />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setShowContentForm(null)} className="px-3 py-1.5 text-sm bg-white/10 rounded-lg">Bekor qilish</button>
                                            <button type="submit" className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg">Saqlash</button>
                                          </div>
                                        </form>
                                      ) : module.content ? (
                                        <div className="bg-white/5 p-4 rounded-xl text-sm text-foreground/80 course-content-html" dangerouslySetInnerHTML={{ __html: module.content }} />
                                      ) : (
                                        <div className="text-center py-8 text-foreground/40 text-sm border border-dashed border-white/10 rounded-xl">
                                          Ma'ruza matni kiritilmagan. "Qo'shish" tugmasini bosing.
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* ====== TEST SAVOLLARI SECTION ====== */}
                                  {currentSection === 'test' && (
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <h5 className="font-semibold flex items-center gap-2 text-secondary"><CheckCircle2 size={15}/> Test Savollari</h5>
                                        <button
                                          onClick={() => { setShowTestForm(module.id); setShowControlForm(null); setEditingQuestion(null); setNewQuestion({question_text:'', ai_rubric:'', video_timestamp:'', options:[{text:'', is_correct:true},{text:'', is_correct:false},{text:'', is_correct:false},{text:'', is_correct:false}]}); }}
                                          className="px-3 py-1.5 bg-secondary/20 text-secondary rounded-lg text-xs flex items-center gap-1 hover:bg-secondary/30"
                                        >
                                          <Plus size={12}/> Test qo'shish
                                        </button>
                                      </div>

                                      {showTestForm === module.id && (
                                        <form onSubmit={(e) => handleSaveQuestion(e, module.id, course.id, 'multiple_choice')} className="bg-black/20 p-4 rounded-xl border border-white/10 mb-4 space-y-3">
                                          <h6 className="font-bold text-sm">{editingQuestion ? "Testni tahrirlash" : "Yangi test savoli"}</h6>
                                          <textarea required placeholder="Savol matni..." value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm h-20" />
                                          <input type="number" placeholder="📹 Video vaqti (sekundda) — video ichida savol chiqarish uchun" value={newQuestion.video_timestamp} onChange={e => setNewQuestion({...newQuestion, video_timestamp: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                                          <div className="space-y-2">
                                            <p className="text-xs text-foreground/50">Variantlar (to'g'ri javobni radio tugma bilan belgilang):</p>
                                            {newQuestion.options.map((opt, idx) => (
                                              <div key={idx} className="flex items-center gap-2">
                                                <input type="radio" name="correct_option" checked={opt.is_correct} onChange={() => { const u = newQuestion.options.map((o, i) => ({...o, is_correct: i===idx})); setNewQuestion({...newQuestion, options: u}); }} className="w-4 h-4 accent-secondary" />
                                                <input required placeholder={`Variant ${idx + 1}`} value={opt.text} onChange={(e) => { const u=[...newQuestion.options]; u[idx].text=e.target.value; setNewQuestion({...newQuestion, options: u}); }} className={`flex-1 bg-white/5 border rounded-lg px-3 py-1.5 text-sm ${opt.is_correct ? 'border-secondary/50' : 'border-white/10'}`} />
                                              </div>
                                            ))}
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => { setShowTestForm(null); setEditingQuestion(null); }} className="px-3 py-1.5 text-sm bg-white/10 rounded-lg">Bekor qilish</button>
                                            <button type="submit" className="px-3 py-1.5 text-sm bg-secondary text-white rounded-lg">Saqlash</button>
                                          </div>
                                        </form>
                                      )}

                                      <div className="space-y-2">
                                        {module.questions?.filter((q:any) => q.type !== 'open_ended').length === 0 && !showTestForm && (
                                          <div className="text-center py-8 text-foreground/40 text-sm border border-dashed border-white/10 rounded-xl">Hozircha testlar yo'q.</div>
                                        )}
                                        {module.questions?.filter((q:any) => q.type !== 'open_ended').map((q: any, qIdx: number) => (
                                          <div key={q.id} className="bg-white/5 p-3 rounded-xl text-sm group">
                                            <div className="font-semibold mb-2 flex justify-between items-start">
                                              <span>{qIdx + 1}. {q.question_text}</span>
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                                <button onClick={() => { setEditingQuestion(q.id); setNewQuestion({question_text: q.question_text, ai_rubric: q.ai_rubric||'', video_timestamp: q.video_timestamp||'', options: q.options&&q.options.length?q.options:[{text:'',is_correct:true},{text:'',is_correct:false},{text:'',is_correct:false},{text:'',is_correct:false}]}); setShowTestForm(module.id); setShowControlForm(null); setShowContentForm(null); }} className="p-1 hover:bg-white/10 rounded"><Edit size={13}/></button>
                                                <button onClick={() => handleDeleteQuestion(q.id, course.id)} className="p-1 hover:bg-red-500/10 rounded text-red-500/70 hover:text-red-500"><Trash2 size={13}/></button>
                                              </div>
                                            </div>
                                            {q.video_timestamp > 0 && (
                                              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full mb-2 inline-block">
                                                📹 Video: {q.video_timestamp}s ({Math.floor(q.video_timestamp/60)}:{String(q.video_timestamp%60).padStart(2,'0')})
                                              </span>
                                            )}
                                            <ul className="space-y-1 pl-4 mt-1">
                                              {q.options?.map((opt: any, oIdx: number) => (
                                                <li key={oIdx} className={`flex items-center gap-2 ${opt.is_correct ? 'text-secondary font-medium' : 'text-foreground/60'}`}>
                                                  {opt.is_correct ? <CheckCircle2 size={12}/> : <div className="w-3 h-3 rounded-full border border-current opacity-40"/>} {opt.text}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* ====== NAZORAT SAVOLLARI SECTION ====== */}
                                  {currentSection === 'nazorat' && (
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <h5 className="font-semibold flex items-center gap-2 text-green-400"><HelpCircle size={15}/> Nazorat Savollari (AI baholaydi)</h5>
                                        <button
                                          onClick={() => { setShowControlForm(module.id); setShowTestForm(null); setShowContentForm(null); setEditingQuestion(null); setNewQuestion({question_text:'', ai_rubric:'', video_timestamp:'', options:[]}); }}
                                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs flex items-center gap-1 hover:bg-green-500/30"
                                        >
                                          <Plus size={12}/> Savol qo'shish
                                        </button>
                                      </div>

                                      {showControlForm === module.id && (
                                        <form onSubmit={(e) => handleSaveQuestion(e, module.id, course.id, 'open_ended')} className="bg-black/20 p-4 rounded-xl border border-white/10 mb-4 space-y-3">
                                          <h6 className="font-bold text-sm">{editingQuestion ? "Savolni tahrirlash" : "Yangi nazorat savoli"}</h6>
                                          <textarea required placeholder="Savol matni..." value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm h-20" />
                                          <div>
                                            <p className="text-xs text-foreground/50 mb-1">AI uchun baholash mezoni (Rubric):</p>
                                            <textarea required placeholder="Masalan: Talaba javobida fotosintez jarayonida quyosh energiyasi ishlatilishini aytishi shart..." value={newQuestion.ai_rubric} onChange={e => setNewQuestion({...newQuestion, ai_rubric: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm h-20" />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => { setShowControlForm(null); setEditingQuestion(null); }} className="px-3 py-1.5 text-sm bg-white/10 rounded-lg">Bekor qilish</button>
                                            <button type="submit" className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg">Saqlash</button>
                                          </div>
                                        </form>
                                      )}

                                      <div className="space-y-2">
                                        {module.questions?.filter((q:any) => q.type === 'open_ended').length === 0 && !showControlForm && (
                                          <div className="text-center py-8 text-foreground/40 text-sm border border-dashed border-white/10 rounded-xl">Hozircha nazorat savollari yo'q.</div>
                                        )}
                                        {module.questions?.filter((q:any) => q.type === 'open_ended').map((q: any, qIdx: number) => (
                                          <div key={q.id} className="bg-white/5 p-3 rounded-xl text-sm group">
                                            <div className="font-semibold mb-2 flex justify-between items-start">
                                              <span>{qIdx + 1}. {q.question_text}</span>
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                                <button onClick={() => { setEditingQuestion(q.id); setNewQuestion({question_text: q.question_text, ai_rubric: q.ai_rubric||'', video_timestamp: '', options: q.options||[]}); setShowControlForm(module.id); setShowTestForm(null); setShowContentForm(null); }} className="p-1 hover:bg-white/10 rounded"><Edit size={13}/></button>
                                                <button onClick={() => handleDeleteQuestion(q.id, course.id)} className="p-1 hover:bg-red-500/10 rounded text-red-500/70 hover:text-red-500"><Trash2 size={13}/></button>
                                              </div>
                                            </div>
                                            <div className="pl-3 border-l-2 border-green-500/30 text-xs text-foreground/50 italic mt-2">
                                              🤖 AI mezon: {q.ai_rubric || "Kiritilmagan"}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* ====== TAQDIMOT SECTION ====== */}
                                  {currentSection === 'taqdimot' && (
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <h5 className="font-semibold flex items-center gap-2 text-orange-400">🖼️ Taqdimot Yuklash</h5>
                                      </div>
                                      
                                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-4">
                                        <form onSubmit={(e) => handleUploadPresentation(e, module.id, course.id)} className="flex items-center gap-4">
                                          <input 
                                            type="file" 
                                            accept=".pdf,.ppt,.pptx,.odp"
                                            onChange={(e) => setPresentationFile(e.target.files?.[0] || null)}
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30"
                                            disabled={uploadingPresentation === module.id}
                                          />
                                          <button 
                                            type="submit" 
                                            disabled={!presentationFile || uploadingPresentation === module.id}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
                                          >
                                            {uploadingPresentation === module.id ? <><Loader2 size={14} className="animate-spin" /> Yuklanmoqda...</> : "Yuklash"}
                                          </button>
                                        </form>
                                        {uploadProgress && uploadingPresentation === module.id && <p className="text-xs text-orange-400 mt-2">{uploadProgress}</p>}
                                      </div>

                                      {module.presentation_url ? (
                                        <div className="space-y-3">
                                          <div className="bg-black/20 border border-orange-500/20 rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                              <p className="text-xs text-foreground/50 mb-1">Joriy taqdimot:</p>
                                              <a href={module.presentation_url} target="_blank" rel="noopener noreferrer" className="text-orange-400 text-sm underline break-all">Taqdimotni ochish</a>
                                            </div>
                                            <button 
                                              onClick={async () => {
                                                if(confirm("Taqdimotni o'chirib tashlaysizmi?")) {
                                                  // We can just update the module to remove the URL
                                                  try {
                                                    await fetchApi(`/admin/modules/${module.id}`, { method: 'PUT', body: JSON.stringify({ presentation_url: '' }) });
                                                    loadCourseDetails(course.id, true);
                                                  } catch(e) {}
                                                }
                                              }}
                                              className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                          <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                                            {module.presentation_url.endsWith('.pdf') ? (
                                              <iframe src={`${module.presentation_url}#toolbar=0`} className="w-full h-full" allowFullScreen title="Taqdimot" />
                                            ) : (
                                              <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(module.presentation_url)}`} className="w-full h-full" allowFullScreen title="Taqdimot" />
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center py-12 text-foreground/40 text-sm border border-dashed border-white/10 rounded-xl">
                                          <div className="text-4xl mb-3">📁</div>
                                          <p>Taqdimot kiritilmagan.</p>
                                          <p className="text-xs mt-1">PDF, PPT yoki PPTX formatidagi faylni yuklang.</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(!course.modules || course.modules.length === 0) && (
                          <p className="text-sm text-foreground/50 text-center py-4">Bu kursda hozircha darslar yo'q</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="flex-1">
            <AboutSettings />
          </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <div className="flex-1">
            <GroupSettings />
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-4">Murojaatlar</h2>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-foreground/40 text-sm border border-dashed border-white/10 rounded-xl">Xabarlar yo'q</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`glass p-6 rounded-2xl border ${msg.is_read ? 'border-white/5' : 'border-primary/50'} space-y-4 relative`}>
                    {!msg.is_read && <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse"></div>}
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{msg.name}</h3>
                        <p className="text-sm text-foreground/50 mb-3">{msg.email} {msg.user && <span className="ml-2 px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs">Sayt a'zosi</span>}</p>
                        <p className="text-foreground/90 bg-white/5 p-4 rounded-xl">{msg.message}</p>
                      </div>
                      <div className="text-xs text-foreground/50 shrink-0">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>

                    {msg.admin_reply ? (
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-4 relative">
                        <h4 className="font-bold text-sm text-primary mb-1">Sizning javobingiz:</h4>
                        <p className="text-foreground/90">{msg.admin_reply}</p>
                      </div>
                    ) : (
                      <div className="mt-4 border-t border-white/5 pt-4">
                        {!msg.is_read && (
                           <button onClick={() => handleMarkAsRead(msg.id)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm mr-2">O'qildi deb belgilash</button>
                        )}
                        
                        {replyingTo === msg.id ? (
                          <form onSubmit={(e) => handleSendReply(e, msg.id)} className="space-y-3 mt-3">
                            <textarea
                              required
                              placeholder="Foydalanuvchiga javob yozing..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm h-24"
                            />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-4 py-2 text-sm bg-white/10 rounded-lg">Bekor qilish</button>
                              <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg">Javob yuborish</button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => { setReplyingTo(msg.id); setReplyText(''); }} className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-sm">
                            Javob yozish
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
