"use client";

import React, { useRef } from 'react';
import { Download, Printer } from 'lucide-react';

interface DistributionRow {
  score: number;
  level: string;
  t_n: number;
  t_percent: number;
  n_n: number;
  n_percent: number;
}

interface STDSStatsTableProps {
  summary: {
    efficiency: string;
    chi2: string;
    t: string;
    z: string;
    eta: string;
    distribution?: DistributionRow[];
  };
  jami: {
    tajriba: string;
    nazorat: string;
    samaradorlik: string;
  };
  isUmumiy?: boolean;
}

export default function STDSStatsTable({ summary, jami, isUmumiy }: STDSStatsTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const distribution = summary?.distribution || [];

  const formatNumber = (num: number | string) => {
    return num.toString().replace('.', ',');
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const printContent = tableRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = `<div style="padding: 20px;">${printContent}</div>`;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Reload to restore React state cleanly
    }
  };

  const downloadCSV = () => {
    if (!distribution.length) return;

    let csv = '';
    if (isUmumiy) {
      csv = 'Ball,DSQ darajasi,Pre-test (n),Pre-test (%),Post-test (n),Post-test (%),Farq (%)\n';
    } else {
      csv = 'Ball,DSQ darajasi,Tajriba (n),Tajriba (%),Nazorat (n),Nazorat (%),Farq (%)\n';
    }
    
    distribution.forEach(row => {
      const farq = (isUmumiy ? row.n_percent - row.t_percent : row.t_percent - row.n_percent).toFixed(1);
      csv += `"${row.score}-ball","${row.level}","${row.t_n}","${formatNumber(row.t_percent)}%","${row.n_n}","${formatNumber(row.n_percent)}%","${formatNumber(farq)}%"\n`;
    });
    
    const totalT = distribution.reduce((sum, row) => sum + row.t_n, 0);
    const totalN = distribution.reduce((sum, row) => sum + row.n_n, 0);
    csv += `"JAMI","","${totalT}","100%","${totalN}","100%",""`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'stds_statistikasi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!distribution.length) return null;

  return (
    <div className="mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
          {isUmumiy 
            ? "Barcha viloyatlar bo'yicha STDS-Bio chiqish testi umumiy statistikasi"
            : "Uchala Pedagogik mahorat markazi bo'yicha STDS-Bio chiqish testi umumiy statistikasi"}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Excel (CSV)
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            PDF / Chop etish
          </button>
        </div>
      </div>

      <div ref={tableRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <style type="text/css" media="print">
          {`
            @page { size: landscape; margin: 1cm; }
            body { background: white; color: black; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; color: black !important; }
            * { color: black !important; }
            .no-print { display: none; }
          `}
        </style>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{isUmumiy ? 'Pre-test (x̄)' : 'Tajriba guruhi (x̄)'}</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatNumber(jami.tajriba)}</p>
          </div>
          <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg border border-green-100 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{isUmumiy ? 'Post-test (ȳ)' : 'Nazorat guruhi (ȳ)'}</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatNumber(jami.nazorat)}</p>
          </div>
          <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg border border-purple-100 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Samaradorlik (η)</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{formatNumber(summary.eta)}</p>
          </div>
          <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg border border-orange-100 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Umumiy samaradorlik</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">+{formatNumber(summary.efficiency)}%</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border-collapse border border-gray-200 dark:border-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">Ball</th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">DSQ darajasi</th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">{isUmumiy ? 'Pre-test (n)' : 'Tajriba (n)'}</th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">{isUmumiy ? 'Pre-test (%)' : 'Tajriba (%)'}</th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">{isUmumiy ? 'Post-test (n)' : 'Nazorat (n)'}</th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">{isUmumiy ? 'Post-test (%)' : 'Nazorat (%)'}</th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">Farq (%)</th>
              </tr>
            </thead>
            <tbody>
              {distribution.map((row) => {
                const farq = (isUmumiy ? row.n_percent - row.t_percent : row.t_percent - row.n_percent).toFixed(1);
                const isPositive = parseFloat(farq) > 0;
                
                return (
                  <tr key={row.score} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center font-medium">{row.score}-ball</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">{row.level}</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">{row.t_n}</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center font-medium text-blue-600 dark:text-blue-400">{formatNumber(row.t_percent)}%</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">{row.n_n}</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center font-medium text-green-600 dark:text-green-400">{formatNumber(row.n_percent)}%</td>
                    <td className={`border border-gray-200 dark:border-gray-700 px-4 py-3 text-center font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isPositive ? '+' : ''}{formatNumber(farq)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 dark:bg-gray-900 font-bold text-gray-900 dark:text-white">
                <td colSpan={2} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-right">JAMI:</td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                  {distribution.reduce((acc, curr) => acc + curr.t_n, 0)}
                </td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">100%</td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                  {distribution.reduce((acc, curr) => acc + curr.n_n, 0)}
                </td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">100%</td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
