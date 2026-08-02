"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Plus, Trash2, Edit, Loader2, BookOpen, GraduationCap, Briefcase } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const STORAGE_URL = API_URL.replace('/api', '') + '/storage/';

export default function AboutSettings() {
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Author State
  const [editingAuthor, setEditingAuthor] = useState<number | null>(null);
  const [authorForm, setAuthorForm] = useState({ name: '', bio: '', order: 0 });
  const [authorImage, setAuthorImage] = useState<File | null>(null);
  const [authorImagePreview, setAuthorImagePreview] = useState<string | null>(null);

  // Work State
  const [activeAuthorId, setActiveAuthorId] = useState<number | null>(null);
  const [editingWork, setEditingWork] = useState<number | null>(null);
  const [workForm, setWorkForm] = useState({ title: '', type: 'Maqola', year: '', order: 0 });
  const [workFile, setWorkFile] = useState<File | null>(null);

  // Experience State
  const [activeExpAuthorId, setActiveExpAuthorId] = useState<number | null>(null);
  const [editingExp, setEditingExp] = useState<number | null>(null);
  const [expForm, setExpForm] = useState({ years: '', position: '', workplace: '', order: 0 });

  // Certificate State
  const [editingCert, setEditingCert] = useState<number | null>(null);
  const [certForm, setCertForm] = useState({ title: '', order: 0 });
  const [certImage, setCertImage] = useState<File | null>(null);
  const [certImagePreview, setCertImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchApi("/about");
      if (data.status === "success") {
        setAuthors(data.authors || []);
        setCertificates(data.certificates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Author Functions ---
  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('sanotaf_token');
    const formData = new FormData();
    formData.append('name', authorForm.name);
    formData.append('bio', authorForm.bio);
    formData.append('order', authorForm.order.toString());
    if (authorImage) formData.append('image', authorImage);

    const url = editingAuthor ? `/about/authors/${editingAuthor}` : `/about/authors`;
    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      if (res.ok) {
        setEditingAuthor(null);
        setAuthorForm({ name: '', bio: '', order: 0 });
        setAuthorImage(null);
        setAuthorImagePreview(null);
        loadData();
      } else {
        const errorData = await res.json();
        alert('Xatolik yuz berdi: ' + (errorData.message || res.statusText));
      }
    } catch (err: any) { 
      alert('Tizim xatosi: ' + err.message);
      console.error(err); 
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    if (!confirm("Muallifni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await fetchApi(`/about/authors/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {}
  };

  // --- Work Functions ---
  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuthorId) return;
    const token = localStorage.getItem('sanotaf_token');
    const formData = new FormData();
    formData.append('title', workForm.title);
    formData.append('type', workForm.type);
    formData.append('year', workForm.year);
    formData.append('order', workForm.order.toString());
    if (workFile) formData.append('file', workFile);

    const url = editingWork ? `/about/authors/${activeAuthorId}/works/${editingWork}` : `/about/authors/${activeAuthorId}/works`;
    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      if (res.ok) {
        setEditingWork(null);
        setWorkForm({ title: '', type: 'Maqola', year: '', order: 0 });
        setWorkFile(null);
        loadData();
      } else {
        const errorData = await res.json();
        alert('Xatolik yuz berdi: ' + (errorData.message || res.statusText));
      }
    } catch (err: any) { 
      alert('Tizim xatosi: ' + err.message);
      console.error(err); 
    }
  };

  const handleDeleteWork = async (id: number) => {
    if (!confirm("Ishni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await fetchApi(`/about/works/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {}
  };

  // --- Experience Functions ---
  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExpAuthorId) return;
    const token = localStorage.getItem('sanotaf_token');
    
    const url = editingExp ? `/about/authors/${activeExpAuthorId}/experiences/${editingExp}` : `/about/authors/${activeExpAuthorId}/experiences`;
    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expForm)
      });
      if (res.ok) {
        setEditingExp(null);
        setExpForm({ years: '', position: '', workplace: '', order: 0 });
        loadData();
      } else {
        const errorData = await res.json();
        alert('Xatolik yuz berdi: ' + (errorData.message || res.statusText));
      }
    } catch (err: any) { 
      alert('Tizim xatosi: ' + err.message);
      console.error(err); 
    }
  };

  const handleDeleteExp = async (id: number) => {
    if (!confirm("Tajribani o'chirishni tasdiqlaysizmi?")) return;
    try {
      await fetchApi(`/about/experiences/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {}
  };

  // --- Certificate Functions ---
  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('sanotaf_token');
    const formData = new FormData();
    formData.append('title', certForm.title);
    formData.append('order', certForm.order.toString());
    if (certImage) formData.append('image', certImage);

    const url = editingCert ? `/about/certificates/${editingCert}` : `/about/certificates`;
    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      if (res.ok) {
        setEditingCert(null);
        setCertForm({ title: '', order: 0 });
        setCertImage(null);
        setCertImagePreview(null);
        loadData();
      } else {
        const errorData = await res.json();
        alert('Xatolik yuz berdi: ' + (errorData.message || res.statusText));
      }
    } catch (err: any) { 
      alert('Tizim xatosi: ' + err.message);
      console.error(err); 
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    if (!confirm("Sertifikatni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await fetchApi(`/about/certificates/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {}
  };


  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline" /> Yuklanmoqda...</div>;

  return (
    <div className="space-y-10 pb-20">
      <section className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Loyiha Mualliflari</h2>

        <div className="grid grid-cols-1 gap-6">
          {authors.map(author => (
            <div key={author.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-start gap-4 mb-4">
                {author.image_url ? (
                  <img src={STORAGE_URL + author.image_url} className="w-20 h-20 object-cover rounded-full" alt="Author" />
                ) : (
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center"><GraduationCap size={30} /></div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-primary">{author.name}</h3>
                  <p className="text-sm text-foreground/70">{author.bio}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditingAuthor(author.id);
                    setAuthorForm({ name: author.name, bio: author.bio || '', order: author.order });
                    setAuthorImagePreview(author.image_url ? STORAGE_URL + author.image_url : null);
                  }} className="p-2 text-primary hover:bg-white/10 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteAuthor(author.id)} className="p-2 text-red-500 hover:bg-white/10 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Experiences Management */}
                <div className="pl-4 lg:pl-12 border-l border-white/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-secondary"><Briefcase size={16} /> Mehnat Faoliyati</h4>
                  <div className="space-y-2 mb-4">
                    {author.experiences?.map((exp: any) => (
                      <div key={exp.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg text-sm">
                        <div>
                          <p className="font-bold">{exp.years}</p>
                          <p className="text-xs text-foreground/80">{exp.position} - {exp.workplace}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => {
                            setActiveExpAuthorId(author.id);
                            setEditingExp(exp.id);
                            setExpForm({ years: exp.years, position: exp.position, workplace: exp.workplace, order: exp.order });
                          }} className="p-1 text-primary hover:bg-white/10 rounded"><Edit size={14}/></button>
                          <button onClick={() => handleDeleteExp(exp.id)} className="p-1 text-red-500 hover:bg-white/10 rounded"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeExpAuthorId === author.id ? (
                    <form onSubmit={handleSaveExp} className="bg-secondary/5 p-3 rounded-xl space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        <input required type="text" placeholder="Yillar (masalan: 2015-2020)" className="bg-background border border-white/10 rounded-lg px-3 py-1 text-sm" value={expForm.years} onChange={e => setExpForm({...expForm, years: e.target.value})} />
                        <input required type="text" placeholder="Lavozim" className="bg-background border border-white/10 rounded-lg px-3 py-1 text-sm" value={expForm.position} onChange={e => setExpForm({...expForm, position: e.target.value})} />
                        <input required type="text" placeholder="Ish joyi" className="bg-background border border-white/10 rounded-lg px-3 py-1 text-sm" value={expForm.workplace} onChange={e => setExpForm({...expForm, workplace: e.target.value})} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => { setActiveExpAuthorId(null); setEditingExp(null); }} className="px-3 py-1 rounded text-xs bg-white/10">Bekor qilish</button>
                        <button type="submit" className="px-3 py-1 rounded text-xs bg-secondary text-white font-bold">Saqlash</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => { setActiveExpAuthorId(author.id); setExpForm({years:'', position:'', workplace:'', order:0}); setEditingExp(null); }} className="text-xs text-secondary font-bold flex items-center gap-1 hover:underline"><Plus size={14}/> Faoliyat qo'shish</button>
                  )}
                </div>

                {/* Author Works Management */}
                <div className="pl-4 lg:pl-0">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary"><BookOpen size={16} /> Ilmiy Ishlar</h4>
                  <div className="space-y-2 mb-4">
                    {author.works?.map((work: any) => (
                      <div key={work.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded uppercase text-xs font-bold">{work.type}</span>
                          <span>{work.title} ({work.year})</span>
                          {work.file_url && <a href={STORAGE_URL + work.file_url} target="_blank" rel="noreferrer" className="text-secondary underline text-xs ml-2">PDF</a>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => {
                            setActiveAuthorId(author.id);
                            setEditingWork(work.id);
                            setWorkForm({ title: work.title, type: work.type, year: work.year || '', order: work.order });
                          }} className="p-1 text-primary hover:bg-white/10 rounded"><Edit size={14}/></button>
                          <button onClick={() => handleDeleteWork(work.id)} className="p-1 text-red-500 hover:bg-white/10 rounded"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeAuthorId === author.id ? (
                    <form onSubmit={handleSaveWork} className="bg-primary/5 p-3 rounded-xl space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input required type="text" placeholder="Nomi" className="md:col-span-2 bg-background border border-white/10 rounded-lg px-3 py-1 text-sm" value={workForm.title} onChange={e => setWorkForm({...workForm, title: e.target.value})} />
                        
                        <input required list="work-types" placeholder="Ish turi (OAK, Tezis...)" className="bg-background border border-white/10 rounded-lg px-3 py-1 text-sm" value={workForm.type} onChange={e => setWorkForm({...workForm, type: e.target.value})} />
                        <datalist id="work-types">
                          <option value="ОАК tasarrufidagi ilmiy nashrlardagi maqolalar" />
                          <option value="Xalqaro ilmiy jurnallarda e’lon qilingan maqolalar" />
                          <option value="Xorijiy konferensiyalar" />
                          <option value="Xalqaro konferensiyalari" />
                          <option value="Respublika konferensiyalari" />
                        </datalist>

                        <input type="text" placeholder="Yili" className="bg-background border border-white/10 rounded-lg px-3 py-1 text-sm" value={workForm.year} onChange={e => setWorkForm({...workForm, year: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-2 justify-between">
                        <input type="file" accept=".pdf,.doc,.docx" onChange={e => {
                          if (e.target.files) setWorkFile(e.target.files[0]);
                        }} className="w-1/2 text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary/20 file:text-primary" />
                        
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setActiveAuthorId(null); setEditingWork(null); }} className="px-3 py-1 rounded text-xs bg-white/10">Bekor qilish</button>
                          <button type="submit" className="px-3 py-1 rounded text-xs bg-primary text-white font-bold">Saqlash</button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => { setActiveAuthorId(author.id); setWorkForm({title:'', type:'Maqola', year:'', order:0}); setEditingWork(null); }} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"><Plus size={14}/> Ish qo'shish</button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Form Author */}
        <form onSubmit={handleSaveAuthor} className="mt-8 bg-white/5 p-4 rounded-xl space-y-4 border border-secondary/20">
          <h3 className="font-semibold text-secondary">{editingAuthor ? "Muallifni tahrirlash" : "Yangi muallif qo'shish"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Ism sharifi (masalan: Abdulla Oripov)" className="w-full bg-background border border-white/10 rounded-xl px-4 py-2" value={authorForm.name} onChange={e => setAuthorForm({...authorForm, name: e.target.value})} />
            <input type="number" placeholder="Tartib raqami" className="w-full bg-background border border-white/10 rounded-xl px-4 py-2" value={authorForm.order} onChange={e => setAuthorForm({...authorForm, order: parseInt(e.target.value) || 0})} />
          </div>

          <textarea placeholder="Muallif haqida qisqacha ma'lumot (bio)..." className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 h-24 resize-none" value={authorForm.bio} onChange={e => setAuthorForm({...authorForm, bio: e.target.value})} />

          <div className="flex items-center gap-4">
            <input type="file" accept="image/*" onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setAuthorImage(e.target.files[0]);
                setAuthorImagePreview(URL.createObjectURL(e.target.files[0]));
              }
            }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary/20 file:text-secondary hover:file:bg-secondary/30" />
            
            {authorImagePreview && <img src={authorImagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-full" />}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {editingAuthor && <button type="button" onClick={() => { setEditingAuthor(null); setAuthorForm({name:'', bio:'', order:0}); setAuthorImagePreview(null); }} className="px-4 py-2 rounded-lg bg-white/10">Bekor qilish</button>}
            <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white font-semibold">Saqlash</button>
          </div>
        </form>

      </section>

      {/* Certificates Section */}
      <section className="glass p-6 rounded-2xl border border-accent/20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-accent">
          <BookOpen size={24} /> Sertifikatlar va Guvohnomalar
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-white/5 p-3 rounded-xl border border-white/10 group relative">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/50 mb-3 flex items-center justify-center">
                {cert.image_url ? (
                  <img src={STORAGE_URL + cert.image_url} alt={cert.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-foreground/50">Rasm yo'q</span>
                )}
              </div>
              <h4 className="font-semibold text-sm truncate" title={cert.title}>{cert.title}</h4>
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => {
                  setEditingCert(cert.id);
                  setCertForm({ title: cert.title, order: cert.order });
                  setCertImagePreview(cert.image_url ? STORAGE_URL + cert.image_url : null);
                }} className="p-1.5 bg-background border border-white/10 text-primary rounded shadow">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDeleteCertificate(cert.id)} className="p-1.5 bg-background border border-white/10 text-red-500 rounded shadow">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSaveCertificate} className="bg-white/5 p-4 rounded-xl space-y-4 border border-accent/20">
          <h3 className="font-semibold text-accent">{editingCert ? "Sertifikatni tahrirlash" : "Yangi sertifikat qo'shish"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Nomi (masalan: PhD Diplomi)" className="w-full bg-background border border-white/10 rounded-xl px-4 py-2" value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} />
            <input type="number" placeholder="Tartib raqami" className="w-full bg-background border border-white/10 rounded-xl px-4 py-2" value={certForm.order} onChange={e => setCertForm({...certForm, order: parseInt(e.target.value) || 0})} />
          </div>

          <div className="flex items-center gap-4">
            <input type="file" accept="image/*" required={!editingCert} onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setCertImage(e.target.files[0]);
                setCertImagePreview(URL.createObjectURL(e.target.files[0]));
              }
            }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30" />
            
            {certImagePreview && <img src={certImagePreview} alt="Preview" className="w-24 h-16 object-cover rounded-lg" />}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {editingCert && <button type="button" onClick={() => { setEditingCert(null); setCertForm({title:'', order:0}); setCertImagePreview(null); }} className="px-4 py-2 rounded-lg bg-white/10">Bekor qilish</button>}
            <button type="submit" className="px-4 py-2 rounded-lg bg-accent text-white font-semibold">Saqlash</button>
          </div>
        </form>
      </section>
    </div>
  );
}
