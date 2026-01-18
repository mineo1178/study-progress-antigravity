'use client';

import React, { useMemo, useState } from 'react';
import { LayoutDashboard, ChevronDown, Award, Layers, Trash2 } from 'lucide-react';
import { Task, Subject } from '@/lib/types';
import { SUBJECT_CONFIG } from '@/lib/constants';
import { SubjectSection } from './SubjectSection';
import { TaskDetailModal } from './TaskDetailModal';
import { ProfileCard } from './ProfileCard';

interface DailyViewProps {
    tasks: Task[];
    updateTask: (id: string, updates: Partial<Task>) => void;
    cycleStatus: (task: Task) => void;
    saveHistory: (task: Task) => void;
    deleteTask: (id: string) => void;
    deleteUnit: (unit: string) => void;
    setAddModalOpen: (open: boolean) => void;
    selectedUnit: string | null;
    setSelectedUnit: (unit: string | null) => void;
    unitsWithTasks: string[];
    onAddTask: (unit: string, subject: Subject, title: string, category: string) => void;
    setDeleteConfirmation: (args: any) => void;
    readOnly?: boolean;
}

export const DailyView = ({
    tasks, updateTask, cycleStatus, saveHistory, deleteTask, deleteUnit,
    setAddModalOpen, selectedUnit, setSelectedUnit, unitsWithTasks, onAddTask, setDeleteConfirmation, readOnly
}: DailyViewProps) => {
    const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

    const getStats = (targetTasks: Task[]) => {
        if (targetTasks.length === 0) return { progress: 0, totalTime: 0 };
        const completed = targetTasks.filter(t => t.status === 'completed').length;
        const progress = Math.round((completed / targetTasks.length) * 100);
        const totalTime = targetTasks.reduce((acc, curr) => {
            return acc + curr.history.reduce((hAcc, h) => hAcc + h.duration, 0) + curr.currentDuration;
        }, 0);
        return { progress, totalTime };
    };

    const getSubjectStats = (targetTasks: Task[], subject: Subject) => {
        return getStats(targetTasks.filter(t => t.subject === subject));
    };

    const allStats = useMemo(() => {
        const total = getStats(tasks);
        const subjects = (Object.keys(SUBJECT_CONFIG) as Subject[]).map(subj => ({
            id: subj,
            ...getSubjectStats(tasks, subj)
        }));
        return { total, subjects };
    }, [tasks]);

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <div className="bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 py-3 border-b border-slate-100 shadow-sm">
                <div className="flex gap-3">
                    <button onClick={() => setSelectedUnit(null)} className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${!selectedUnit ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>
                        <LayoutDashboard size={18} /> 全体サマリー
                    </button>
                    <div className="flex-1 relative">
                        <select
                            value={selectedUnit || ''}
                            onChange={(e) => e.target.value === 'NEW' ? setAddModalOpen(true) : setSelectedUnit(e.target.value)}
                            className={`w-full h-full appearance-none rounded-2xl font-black text-sm pl-4 pr-10 focus:outline-none transition-all cursor-pointer ${selectedUnit ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-2 border-slate-100 text-slate-400'}`}
                        >
                            <option value="" disabled>回を選択...</option>
                            <optgroup label="学習中の回">
                                {unitsWithTasks.map((w: string) => <option key={w} value={w} className="text-slate-800 bg-white">{w}</option>)}
                            </optgroup>
                            {!readOnly && <optgroup label="アクション"><option value="NEW" className="text-blue-600 bg-white">+ 新しい回を追加</option></optgroup>}
                        </select>
                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${selectedUnit ? 'text-white' : 'text-slate-300'}`} size={18} strokeWidth={3} />
                    </div>
                </div>
            </div>

            <div className="pb-28 pt-4 px-4 space-y-6 flex-1">
                {!selectedUnit && <ProfileCard tasks={tasks} />}

                {selectedUnit ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {(Object.keys(SUBJECT_CONFIG) as Subject[]).map(subj => (
                            <SubjectSection
                                key={subj}
                                unit={selectedUnit}
                                subject={subj}
                                tasks={tasks}
                                updateTask={updateTask}
                                cycleStatus={cycleStatus}
                                setDetailTaskId={setDetailTaskId}
                                onAddTask={onAddTask}
                                subjectConfig={SUBJECT_CONFIG}
                                readOnly={readOnly}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-blue-100 border border-blue-50">
                            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Award className="text-blue-500" /> 全期間のサマリー</h2>
                            <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-100">
                                <div>
                                    <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">全体進捗</div>
                                    <div className="text-4xl font-black text-slate-800 tracking-tight">{allStats.total.progress}<span className="text-lg font-bold text-slate-400 ml-1">%</span></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">総勉強時間</div>
                                    <div className="text-2xl font-black text-blue-600 font-mono">
                                        {Math.floor(allStats.total.totalTime / 3600)}<span className="text-sm text-slate-400 mx-1">h</span>
                                        {Math.floor((allStats.total.totalTime % 3600) / 60)}<span className="text-sm text-slate-400 ml-1">m</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {allStats.subjects.map(s => {
                                    const conf = SUBJECT_CONFIG[s.id as Subject];
                                    return (
                                        <div key={s.id} className="flex items-center gap-3">
                                            <span className={`text-xs font-bold w-8 ${conf.color}`}>{conf.short}</span>
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${conf.bg}`} style={{ width: `${s.progress}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 w-16 text-right font-mono">
                                                {Math.floor(s.totalTime / 3600)}h {Math.floor((s.totalTime % 3600) / 60)}m
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider pl-2">学習回ごとの詳細</h3>

                        {unitsWithTasks.map((unit: string) => {
                            const unitTasks = tasks.filter((t: Task) => t.unit === unit);
                            const { progress, totalTime } = getStats(unitTasks);
                            return (
                                <div key={unit} onClick={() => setSelectedUnit(unit)} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 active:scale-[0.98] transition-all cursor-pointer hover:border-blue-200 group relative">
                                    {(!readOnly) && <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmation({
                                                title: `「${unit}」の削除`,
                                                message: `本当に「${unit}」を削除しますか？\n含まれる全てのタスクと学習履歴が消去されます。`,
                                                onConfirm: () => deleteUnit(unit)
                                            });
                                        }}
                                        className="absolute top-4 right-4 p-2 text-slate-200 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors z-10"
                                    >
                                        <Trash2 size={18} />
                                    </button>}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><Layers size={24} className="text-slate-400 group-hover:text-blue-500" /></div>
                                            <div className="font-black text-xl text-slate-800">{unit}</div>
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 font-mono mr-8">{Math.floor(totalTime / 3600)}h {Math.floor((totalTime % 3600) / 60)}m</div>
                                    </div>
                                    <div className="mb-6"><div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-sm" style={{ width: `${progress}%` }} /></div></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <TaskDetailModal
                task={tasks.find((t: Task) => t.id === detailTaskId) || null}
                isOpen={!!detailTaskId}
                onClose={() => setDetailTaskId(null)}
                onUpdate={(updates: any) => updateTask(detailTaskId!, updates)}
                onSaveHistory={() => { const t = tasks.find((t: Task) => t.id === detailTaskId); if (t) saveHistory(t); }}
                onDelete={() => {
                    setDeleteConfirmation({
                        title: 'タスクの削除',
                        message: '本当にこのタスクを削除しますか？',
                        onConfirm: () => {
                            if (detailTaskId) deleteTask(detailTaskId);
                            setDetailTaskId(null);
                        }
                    });
                }}
                setDeleteConfirmation={setDeleteConfirmation}
                subjectConfig={SUBJECT_CONFIG}
                readOnly={readOnly}
            />
        </div>
    );
};
