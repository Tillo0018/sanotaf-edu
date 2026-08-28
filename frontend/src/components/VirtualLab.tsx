"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, Search, Maximize2, X, AlertCircle } from "lucide-react";

const PHET_SIMS = [
  {
    id: "natural-selection",
    title: "Tabiiy tanlanish (Natural Selection)",
    description: "Populyatsiyadagi mutatsiyalar va tabiiy tanlanish jarayonlarini o'rganing. Bo'rilar, quyonlar va oziq-ovqat zanjirini boshqaring.",
    url: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html",
    category: "Biologiya",
    image: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection-600.png"
  },
  {
    id: "gene-expression",
    title: "Gen ekspressiyasi (Gene Expression)",
    description: "DNK dan oqsil sintezlanish jarayoni: transkripsiya va translyatsiyani molekulyar darajada kuzating.",
    url: "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_en.html",
    category: "Genetika",
    image: "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials-600.png"
  },
  {
    id: "neuron",
    title: "Neyron va asab impulslari",
    description: "Neyron bo'ylab harakat potensialining qanday o'tishini, natriy va kaliy ionlari harakatini kuzating.",
    url: "https://phet.colorado.edu/sims/html/neuron/latest/neuron_en.html",
    category: "Fiziologiya",
    image: "https://phet.colorado.edu/sims/html/neuron/latest/neuron-600.png"
  },
  {
    id: "color-vision",
    title: "Ko'rish qobiliyati va yorug'lik",
    description: "Kozning yorug'lik spektrlarini qanday qabul qilishi va ranglarni ajratish mexanizmini o'rganing.",
    url: "https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_en.html",
    category: "Anatomiya",
    image: "https://phet.colorado.edu/sims/html/color-vision/latest/color-vision-600.png"
  },
  {
    id: "molecule-shapes",
    title: "Molekulalar shakli",
    description: "Molekulalarning 3D shakllari va biologik birikmalarning fazoviy tuzilishini tahlil qiling.",
    url: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_en.html",
    category: "Bio-kimyo",
    image: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes-600.png"
  },
  {
    id: "ph-scale",
    title: "pH shkalasi va kislotalilik",
    description: "Turli suyuqliklarning pH darajasini o'lchash va biologik muhitda kislotalilikning ahamiyati.",
    url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html",
    category: "Bio-kimyo",
    image: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale-600.png"
  }
];

export default function VirtualLab() {
  const [search, setSearch] = useState("");
  const [activeSim, setActiveSim] = useState<string | null>(null);

  const filteredSims = PHET_SIMS.filter(sim => 
    sim.title.toLowerCase().includes(search.toLowerCase()) || 
    sim.description.toLowerCase().includes(search.toLowerCase())
  );

  const activeSimData = PHET_SIMS.find(s => s.id === activeSim);

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-xl text-primary">
              <Beaker size={28} />
            </div>
            <h1 className="text-3xl font-bold">Virtual Laboratoriya</h1>
          </div>
          <p className="text-foreground/70 text-lg">
            Biologiya va turdosh fanlar bo'yicha interaktiv 3D simulyatsiyalar bazasi. Nazariy bilimlarni vizual ko'rinishda, real vaqt rejimida sinab ko'ring.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50" size={20} />
        <input 
          type="text" 
          placeholder="Simulyatsiya qidirish..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredSims.map((sim, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              key={sim.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors group cursor-pointer flex flex-col"
              onClick={() => setActiveSim(sim.id)}
            >
              <div className="h-48 bg-black/50 relative overflow-hidden">
                <img src={sim.image} alt={sim.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-white">
                  {sim.category}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{sim.title}</h3>
                <p className="text-foreground/60 text-sm flex-1">{sim.description}</p>
                
                <div className="mt-6 flex items-center text-primary text-sm font-medium gap-2">
                  <Maximize2 size={16} />
                  <span>Laboratoriyani ochish</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredSims.length === 0 && (
          <div className="col-span-full py-12 text-center text-foreground/50">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">So'rovingiz bo'yicha laboratoriya topilmadi</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeSim && activeSimData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col"
          >
            <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <Beaker className="text-primary" size={20} />
                <h2 className="font-bold text-lg">{activeSimData.title}</h2>
              </div>
              <button 
                onClick={() => setActiveSim(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors bg-white/5"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 w-full bg-black">
              <iframe 
                src={activeSimData.url}
                className="w-full h-full border-none"
                allowFullScreen
                title={activeSimData.title}
              ></iframe>
            </div>
            
            <div className="h-12 border-t border-white/10 bg-black/20 flex items-center justify-center text-sm text-foreground/50">
              Ushbu simulyatsiya PhET Interactive Simulations (Kolorado Universiteti) tomonidan taqdim etilgan.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
