"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/verify-certificate/${params.id}`)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data || data.status !== 'success') {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-red-50 p-4">
        <XCircle className="text-red-500 w-24 h-24 mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-2">Sertifikat Topilmadi</h1>
        <p className="text-red-600/80 text-center">Bunday raqamli sertifikat tizimda mavjud emas yoki qalbaki bo'lishi mumkin.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-green-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-green-100 text-center">
        <CheckCircle2 className="text-green-500 w-20 h-20 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Haqiqiy Sertifikat</h1>
        <p className="text-gray-500 mb-6">Ushbu sertifikat rasmiy ravishda tasdiqlangan.</p>
        
        <div className="space-y-4 text-left border-t pt-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Ism-Sharif</p>
            <p className="font-bold text-lg text-gray-800">{data.user.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Tugatilgan Kurs</p>
            <p className="font-medium text-gray-800">"Sanogen Tafakkur" mualliflik dasturi</p>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Umumiy Natija</p>
              <p className="font-bold text-xl text-yellow-600">{data.score} / 100</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Berilgan Sana</p>
              <p className="font-medium text-gray-800">{data.date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
