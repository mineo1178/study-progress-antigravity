'use client';

import React, { useMemo, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { TestResult, Subject } from '@/lib/types';
import { SUBJECT_CONFIG, TEST_TYPE_CONFIG } from '@/lib/constants';
import { AddTestResultOverlay } from './Modals';

interface TestsViewProps {
    tests: TestResult[];
    onAddTest: (test: TestResult) => void;
    readOnly?: boolean;
}

export const TestsView = ({ tests, onAddTest, readOnly }: TestsViewProps) => {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['4ko']);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');

    const toggleSubject = (subj: string) => {
        setSelectedSubjects(prev => prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]);
    };

    const chartData = useMemo(() => {
        let filtered = [...tests];
        if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
        return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => {
            const dp: any = { name: t.date.slice(5), testName: t.name };
            if (selectedSubjects.includes('4ko')) dp['4ko'] = t.total4.dev;
            ['math', 'japanese', 'science', 'social'].forEach(s => { if (selectedSubjects.includes(s)) dp[s] = t.subjects[s as Subject].dev; });
            return dp;
        });
    }, [tests, selectedSubjects, filterType]);

    const tableData = [...tests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <div className="bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 py-3 border-b border-slate-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-2">
                        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${filterType === 'all' ? 'bg-slate-800 text-white' : 'bg-white'}`}>全て</button>
                        {Object.entries(TEST_TYPE_CONFIG).map(([k, v]) => <button key={k} onClick={() => setFilterType(k)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${filterType === k ? v.activeClass : 'bg-white'}`}>{v.label}</button>)}
                    </div>
                    {!readOnly && <button onClick={() => setAddModalOpen(true)} className="bg-blue-50 text-blue-600 p-2 rounded-xl"><Plus size={20} /></button>}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button onClick={() => toggleSubject('4ko')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap ${selectedSubjects.includes('4ko') ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}>4科</button>
                    {(['math', 'japanese', 'science', 'social'] as Subject[]).map(s => <button key={s} onClick={() => toggleSubject(s)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap ${selectedSubjects.includes(s) ? `${SUBJECT_CONFIG[s].bg} text-white` : 'bg-white text-slate-500'}`}>{SUBJECT_CONFIG[s].short}</button>)}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scroll-smooth pb-28">
                <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 h-64 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                            {selectedSubjects.includes('4ko') && <Line type="monotone" dataKey="4ko" name="4科" stroke="#334155" strokeWidth={3} dot={{ r: 4 }} />}
                            {selectedSubjects.includes('math') && <Line type="monotone" dataKey="math" name={SUBJECT_CONFIG.math.label} stroke={SUBJECT_CONFIG.math.hex} strokeWidth={2} dot={false} />}
                            {selectedSubjects.includes('japanese') && <Line type="monotone" dataKey="japanese" name={SUBJECT_CONFIG.japanese.label} stroke={SUBJECT_CONFIG.japanese.hex} strokeWidth={2} dot={false} />}
                            {selectedSubjects.includes('science') && <Line type="monotone" dataKey="science" name={SUBJECT_CONFIG.science.label} stroke={SUBJECT_CONFIG.science.hex} strokeWidth={2} dot={false} />}
                            {selectedSubjects.includes('social') && <Line type="monotone" dataKey="social" name={SUBJECT_CONFIG.social.label} stroke={SUBJECT_CONFIG.social.hex} strokeWidth={2} dot={false} />}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h3 className="font-black text-slate-700 flex items-center gap-2 mb-3 px-1"><TrendingUp className="text-blue-500" size={20} /> テスト偏差値履歴</h3>
                    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-center text-xs">
                            <thead className="text-slate-400 bg-slate-50/50"><tr><th className="py-3 pl-3 text-left font-bold">テスト名</th><th className="py-3 font-bold">4科</th>{(['math', 'japanese', 'science', 'social'] as Subject[]).map(s => <th key={s} className={`py-3 font-bold ${SUBJECT_CONFIG[s].color}`}>{SUBJECT_CONFIG[s].short}</th>)}</tr></thead>
                            <tbody>
                                {tableData.map(t => (
                                    <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 pl-3 text-left"><div className="text-[9px] text-slate-400 font-bold">{t.date}</div><div className="font-bold text-slate-700">{t.name}</div></td>
                                        <td className="py-3 font-black text-slate-700 bg-slate-50/30">{t.total4.dev}</td>
                                        {(['math', 'japanese', 'science', 'social'] as Subject[]).map(s => <td key={s} className={`py-3 font-bold ${t.subjects[s].dev >= 60 ? 'text-rose-500' : 'text-slate-500'}`}>{t.subjects[s].dev}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <AddTestResultOverlay isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={onAddTest} />
        </div>
    );
};
