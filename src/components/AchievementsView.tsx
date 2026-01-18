'use client';

import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, Subject, SubjectConfig } from '@/lib/types';
import { SUBJECT_CONFIG } from '@/lib/constants';

interface AchievementsViewProps {
    tasks: Task[];
}

export const AchievementsView = ({ tasks }: AchievementsViewProps) => {
    // 入力用日付フォーマット: YYYY-MM-DD
    const formatDateForInput = (d: Date) => {
        return d.toISOString().split('T')[0];
    };

    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);

    const [dateRange, setDateRange] = useState({
        start: formatDateForInput(twoWeeksAgo),
        end: formatDateForInput(today)
    });
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['math', 'japanese', 'science', 'social']);

    const toggleSubject = (subj: string) => {
        setSelectedSubjects(prev => prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]);
    };

    const setPresetRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setDateRange({
            start: formatDateForInput(start),
            end: formatDateForInput(end)
        });
    };

    // 期間に基づいてデータを処理
    const { chartData, pieData, maxStats } = useMemo(() => {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);

        const dateMap = new Map<string, any>();
        const totalBySubject: Record<string, number> = { math: 0, japanese: 0, science: 0, social: 0 };

        const addMinutes = (dateStr: string, subj: string, mins: number) => {
            const [m, d] = dateStr.split('/').map(Number);
            const dateKey = `${m}/${d}`;

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { name: dateKey, math: 0, japanese: 0, science: 0, social: 0, total: 0 });
            }
            const entry = dateMap.get(dateKey);
            // レコード内の科目存在チェック
            if (entry[subj] !== undefined) {
                entry[subj] += mins;
                totalBySubject[subj] += mins;
            }
            entry.total += mins;
        };

        tasks.forEach(task => {
            task.history.forEach(h => {
                const [m, d] = h.date.split('/').map(Number);
                const hDate = new Date(new Date().getFullYear(), m - 1, d);
                if (new Date().getMonth() < 3 && m > 9) hDate.setFullYear(hDate.getFullYear() - 1);

                if (hDate >= start && hDate <= end) {
                    addMinutes(h.date, task.subject, Math.floor(h.duration / 60));
                }
            });
        });

        const data = [];
        const loopDate = new Date(start);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= diffDays; i++) {
            const key = `${loopDate.getMonth() + 1}/${loopDate.getDate()}`;
            if (dateMap.has(key)) {
                data.push(dateMap.get(key));
            } else {
                data.push({ name: key, math: 0, japanese: 0, science: 0, social: 0, total: 0 });
            }
            loopDate.setDate(loopDate.getDate() + 1);
        }

        const totalMinutes = Object.values(totalBySubject).reduce((a, b) => a + b, 0);
        const pData = Object.entries(totalBySubject)
            .filter(([k, v]) => selectedSubjects.includes(k) && v > 0)
            .map(([k, v]) => ({
                name: SUBJECT_CONFIG[k as Subject].label,
                value: v,
                color: SUBJECT_CONFIG[k as Subject].hex,
                percent: totalMinutes > 0 ? Math.round((v / totalMinutes) * 100) : 0
            }));

        let maxTotal = { val: 0, date: '-' };
        const maxSubj: Record<string, { val: number, date: string }> = { math: { val: 0, date: '-' }, japanese: { val: 0, date: '-' }, science: { val: 0, date: '-' }, social: { val: 0, date: '-' } };

        for (const d of dateMap.values()) {
            if (d.total > maxTotal.val) maxTotal = { val: d.total, date: d.name };
            (['math', 'japanese', 'science', 'social'] as Subject[]).forEach(s => {
                if (d[s] > maxSubj[s].val) maxSubj[s] = { val: d[s], date: d.name };
            });
        }

        return { chartData: data, pieData: pData, maxStats: { total: maxTotal, subjects: maxSubj } };

    }, [tasks, dateRange, selectedSubjects]);

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <div className="bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 py-3 border-b border-slate-100 shadow-sm space-y-3">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div className="flex gap-2 items-center">
                            <CalendarIcon size={16} className="text-slate-400" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-transparent text-xs font-bold text-slate-600 outline-none w-24"
                            />
                            <span className="text-slate-300">-</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="bg-transparent text-xs font-bold text-slate-600 outline-none w-24"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {[
                            { l: '1週間', d: 7 },
                            { l: '2週間', d: 14 },
                            { l: '1ヶ月', d: 30 }
                        ].map(r => (
                            <button
                                key={r.l}
                                onClick={() => setPresetRange(r.d)}
                                className="flex-1 py-1.5 bg-white border border-slate-100 text-xs font-bold rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
                            >
                                {r.l}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {(['math', 'japanese', 'science', 'social'] as Subject[]).map(s => (
                        <button key={s} onClick={() => toggleSubject(s)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedSubjects.includes(s) ? `${SUBJECT_CONFIG[s].bg} text-white` : 'bg-white text-slate-300'}`}>
                            {SUBJECT_CONFIG[s].short}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scroll-smooth pb-28">
                <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 h-64 shrink-0">
                    <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><BarChart2 size={14} /> 学習時間の推移 (分)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={15} />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px' }} />
                            {selectedSubjects.includes('math') && <Bar dataKey="math" name={SUBJECT_CONFIG.math.label} stackId="a" fill={SUBJECT_CONFIG.math.hex} />}
                            {selectedSubjects.includes('japanese') && <Bar dataKey="japanese" name={SUBJECT_CONFIG.japanese.label} stackId="a" fill={SUBJECT_CONFIG.japanese.hex} />}
                            {selectedSubjects.includes('science') && <Bar dataKey="science" name={SUBJECT_CONFIG.science.label} stackId="a" fill={SUBJECT_CONFIG.science.hex} />}
                            {selectedSubjects.includes('social') && <Bar dataKey="social" name={SUBJECT_CONFIG.social.label} stackId="a" fill={SUBJECT_CONFIG.social.hex} />}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 min-h-[14rem] flex flex-col items-center">
                        <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1 w-full"><PieChartIcon size={14} /> 科目比率</h3>
                        {pieData.length > 0 ? (
                            <>
                                <div className="flex-1 w-full h-32 relative mb-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '10px' }} itemStyle={{ padding: 0 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full flex flex-col gap-1.5">
                                    {pieData.map(d => (
                                        <div key={d.name} className="flex items-center justify-between text-[10px] w-full">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                                                <span className="font-bold text-slate-600 truncate max-w-[3rem]">{d.name}</span>
                                            </div>
                                            <div className="text-right whitespace-nowrap">
                                                <span className="font-mono font-bold text-slate-700">{Math.floor(d.value / 60)}h{d.value % 60}m</span>
                                                <span className="text-slate-400 ml-1 font-bold">({d.percent}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : <div className="text-xs text-slate-300 mt-8">データなし</div>}
                    </div>

                    <div className="space-y-3">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg">
                            <div className="text-[10px] text-slate-300 font-bold mb-1">期間内ベスト(1日)</div>
                            <div className="text-2xl font-black">{Math.floor(maxStats.total.val / 60)}<span className="text-xs font-normal opacity-70">h</span>{maxStats.total.val % 60}<span className="text-xs font-normal opacity-70">m</span></div>
                            <div className="text-xs text-slate-400 text-right mt-1">{maxStats.total.date}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                            <div className="text-[10px] text-slate-400 font-bold mb-2">科目別ベスト</div>
                            <div className="space-y-1">
                                {(['math', 'japanese', 'science', 'social'] as Subject[]).map(s => (
                                    selectedSubjects.includes(s) && maxStats.subjects[s].val > 0 && (
                                        <div key={s} className="flex justify-between items-center text-xs">
                                            <span className={`font-bold ${SUBJECT_CONFIG[s].color}`}>{SUBJECT_CONFIG[s].short}</span>
                                            <span className="font-mono">{maxStats.subjects[s].val}m <span className="text-[9px] text-slate-300">({maxStats.subjects[s].date})</span></span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
