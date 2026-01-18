'use client';

import React from 'react';
import { X, Circle, Zap, CheckCircle, Clock, History, Trash2 } from 'lucide-react';
import { Task, SubjectConfig } from '@/lib/types';
import { Stopwatch, formatTime } from './Stopwatch';

interface TaskDetailModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updates: Partial<Task>) => void;
    onSaveHistory: () => void;
    onDelete: () => void;
    setDeleteConfirmation: (args: any) => void;
    subjectConfig: Record<string, SubjectConfig>;
    readOnly?: boolean;
}

export const TaskDetailModal = ({ task, isOpen, onClose, onUpdate, onSaveHistory, onDelete, setDeleteConfirmation, subjectConfig, readOnly }: TaskDetailModalProps) => {
    if (!isOpen || !task) return null;
    const conf = subjectConfig[task.subject];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500 text-white border-green-500';
            case 'in_progress': return 'bg-blue-500 text-white border-blue-500';
            default: return 'bg-white text-slate-400 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md h-[92vh] sm:h-[85vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${conf?.lightBg || 'bg-gray-50'} ${conf?.color || 'text-gray-500'} border ${conf?.border || 'border-gray-200'}`}>{conf?.label || task.subject}</span>
                            <span className="text-xs font-bold text-slate-400">{task.unit} - {task.category}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 leading-tight pr-4">{task.title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scroll-smooth">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">状態</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'not_started', label: '未着手', icon: Circle },
                                { id: 'in_progress', label: '勉強中', icon: Zap },
                                { id: 'completed', label: '完了', icon: CheckCircle },
                            ].map(s => (
                                <button key={s.id} onClick={() => !readOnly && onUpdate({ status: s.id as any })}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border-2 transition-all ${task.status === s.id ? getStatusColor(s.id) : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                                        } ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                                    disabled={readOnly}
                                >
                                    <s.icon size={20} />{s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1"><Clock size={12} /> タイマー</label>
                        <div className={readOnly ? 'opacity-50 pointer-events-none' : ''}>
                            <Stopwatch time={task.currentDuration} onChange={(t) => onUpdate({ currentDuration: t })} onStartStop={(running) => { if (running && task.status === 'not_started') onUpdate({ status: 'in_progress' }); }} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">メモ</label>
                        <textarea
                            value={task.currentMemo} onChange={(e) => onUpdate({ currentMemo: e.target.value })}
                            placeholder={readOnly ? "メモなし" : "ここにつまづいた、次はこうする..."}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 resize-none h-24 disabled:bg-slate-100 disabled:text-slate-500"
                            disabled={readOnly}
                        />
                    </div>

                    {!readOnly && (
                        <button onClick={onSaveHistory} disabled={task.currentDuration === 0} className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            <History size={20} /> 記録を保存
                        </button>
                    )}

                    <div className="space-y-3 pt-6 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">学習履歴 ({task.history.length})</label>
                        {task.history.length === 0 ? (
                            <div className="text-center py-8 text-slate-300 text-sm font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">まだ記録がありません</div>
                        ) : (
                            <div className="space-y-3">
                                {[...task.history].reverse().map((h: any, i: number) => (
                                    <div key={h.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex gap-4">
                                        <div className="flex flex-col items-center justify-center px-2 border-r border-slate-100 min-w-[3.5rem]">
                                            <span className="text-[10px] font-bold text-slate-400">回目</span>
                                            <span className="text-xl font-black text-slate-700">{task.history.length - i}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 py-0.5">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{h.date}</span>
                                                <span className="text-sm font-bold text-blue-600 font-mono flex items-center gap-1"><Clock size={12} />{formatTime(h.duration)}</span>
                                            </div>
                                            {h.memo && <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">{h.memo}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="h-4"></div>
                </div>

                <div className="p-4 border-t border-slate-50 bg-white sm:rounded-b-3xl shrink-0 flex gap-3 pb-safe-bottom">
                    <button
                        onClick={() => {
                            setDeleteConfirmation({
                                title: 'タスクの削除',
                                message: '本当にこのタスクを削除しますか？',
                                onConfirm: () => {
                                    onDelete();
                                    onClose();
                                }
                            });
                        }}
                        className="text-red-400 hover:bg-red-50 p-3 rounded-xl flex-1 border border-transparent hover:border-red-100 font-bold text-xs flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} /> 削除
                    </button>
                    <button onClick={onClose} className="bg-slate-100 text-slate-500 font-bold py-3 rounded-xl flex-1">閉じる</button>
                </div>
            </div>
        </div>
    );
};
