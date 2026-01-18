'use client';

import React, { useState } from 'react';
import { CheckCircle, Zap, Circle, Clock, History, ChevronUp, ChevronDown } from 'lucide-react';
import { Task } from '@/lib/types';
import { Stopwatch, formatTime } from './Stopwatch';

interface TaskCardProps {
    task: Task;
    updateTask: (id: string, updates: Partial<Task>) => void;
    cycleStatus: (task: Task) => void;
    setDetailTaskId: (id: string) => void;
    readOnly?: boolean;
}

export const TaskCard = ({ task, updateTask, cycleStatus, setDetailTaskId, readOnly }: TaskCardProps) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);

    return (
        <div className={`group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md relative overflow-hidden flex flex-col gap-3 ${task.status === 'completed' ? 'opacity-60 bg-slate-50' : 'hover:border-blue-200'}`}>
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={(e) => { e.stopPropagation(); if (!readOnly) cycleStatus(task); }}
                    disabled={readOnly}
                    className={`p-2 -ml-1 rounded-full flex-shrink-0 transition-transform ${readOnly ? 'opacity-50 cursor-not-allowed' : 'active:scale-90'}`}
                >
                    {task.status === 'completed' ? <CheckCircle size={24} className="text-green-500" fill="#f0fdf4" /> : task.status === 'in_progress' ? <Zap size={24} className="text-blue-500" fill="currentColor" /> : <Circle size={24} className="text-slate-200" />}
                </button>
                <div className="flex-1 min-w-0 py-1 cursor-pointer" onClick={() => setDetailTaskId(task.id)}>
                    <h4 className={`font-bold text-base text-slate-800 leading-tight ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        {task.currentDuration > 0 && <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1 font-mono"><Clock size={10} /> {formatTime(task.currentDuration)}</span>}
                    </div>
                </div>
                <div className="flex items-center">
                    <Stopwatch
                        time={task.currentDuration}
                        onChange={(t) => updateTask(task.id, { currentDuration: t })}
                        onStartStop={(running) => { if (running && task.status === 'not_started') updateTask(task.id, { status: 'in_progress' }); }}
                        variant="card"
                    // Ideally Stopwatch should also accept readOnly, but hiding it or simple disable is enough for P1
                    // For strict P1, let's wrap logic inside Stopwatch or just disable button here?
                    // Stopwatch doesn't have readOnly prop yet. Let's create it?
                    // Or just hide if readOnly? No, parent wants to see time.
                    // I'll update Stopwatch later or ignores edits if readonly in parent?
                    // Better: updateTask does nothing if readonly in Page.
                    />
                </div>
            </div>

            <div className="border-t border-slate-50 pt-2">
                <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors mb-2">
                    <History size={10} /> 履歴 ({task.history.length})
                    {isHistoryOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>

                {isHistoryOpen && task.history.length > 0 && (
                    <div className="space-y-2 pl-2 border-l-2 border-slate-100">
                        {[...task.history].reverse().map((h) => (
                            <div key={h.id} className="text-xs flex gap-2 items-baseline">
                                <span className="text-slate-400 font-mono min-w-[3rem]">{h.date}</span>
                                <span className="text-blue-600 font-bold font-mono">{formatTime(h.duration)}</span>
                                {h.memo && <span className="text-slate-500 truncate flex-1">- {h.memo}</span>}
                            </div>
                        ))}
                    </div>
                )}
                {isHistoryOpen && task.history.length === 0 && (
                    <div className="pl-2 text-[10px] text-slate-300">履歴なし</div>
                )}
            </div>
        </div>
    );
};
