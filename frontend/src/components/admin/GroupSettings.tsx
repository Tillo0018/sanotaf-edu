import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Loader2, Plus, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";

export default function GroupSettings() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editGroup, setEditGroup] = useState<any>(null);

  const [formData, setFormData] = useState({ name: "", is_open: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/admin/groups");
      setGroups(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editGroup) {
        await fetchApi(`/admin/groups/${editGroup.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await fetchApi("/admin/groups", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setIsAdding(false);
      setEditGroup(null);
      setFormData({ name: "", is_open: true });
      loadGroups();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      await fetchApi(`/admin/groups/${id}`, { method: "DELETE" });
      loadGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (group: any) => {
    try {
      await fetchApi(`/admin/groups/${group.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: group.name, is_open: !group.is_open }),
      });
      loadGroups();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Guruhlarni Boshqarish</h2>
        <button
          onClick={() => { setIsAdding(true); setEditGroup(null); setFormData({ name: "", is_open: true }); }}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} /> Yangi Guruh
        </button>
      </div>

      {(isAdding || editGroup) && (
        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-bold mb-4">{editGroup ? "Guruhni Tahrirlash" : "Yangi Guruh Qo'shish"}</h3>
          <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="text-sm text-foreground/70 mb-1 block">Guruh Nomi</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-foreground/70">Holati:</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_open: !formData.is_open })}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.is_open ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
              >
                {formData.is_open ? 'Ochiq' : 'Yopiq'}
              </button>
            </div>
            <div className="flex gap-3 mt-2">
              <button disabled={saving} type="submit" className="bg-primary text-white px-6 py-2 rounded-xl font-medium">
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button type="button" onClick={() => { setIsAdding(false); setEditGroup(null); }} className="bg-white/5 px-6 py-2 rounded-xl">
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-foreground/70">
              <th className="p-4 font-semibold">Guruh Nomi</th>
              <th className="p-4 font-semibold text-center">Holati</th>
              <th className="p-4 font-semibold text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 font-medium">{group.name}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleStatus(group)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${group.is_open ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                  >
                    {group.is_open ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {group.is_open ? "Ochiq (Aktiv)" : "Yopiq"}
                  </button>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => { setEditGroup(group); setFormData({ name: group.name, is_open: group.is_open }); setIsAdding(false); }}
                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors inline-block"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-block"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-foreground/50">Guruhlar topilmadi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
