'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, Subject, SubjectConfig } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { AddCustomTaskModal } from './Modals';

interface SubjectSectionProps {
    unit: string;
    subject: Subject;
    tasks: Task[];
    updateTask: (id: string, updates: Partial<Task>) => void;
    cycleStatus: (task: Task) => void;
    setDetailTaskId: (id: string) => void;
    onAddTask: (unit: string, subject: Subject, title: string, category: string) => void;
    subjectConfig: Record<string, SubjectConfig>;
    readOnly?: boolean;
}

export const SubjectSection = ({ unit, subject, tasks, updateTask, cycleStatus, setDetailTaskId, onAddTask, subjectConfig, readOnly }: SubjectSectionProps) => {
    const [filter, setFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const subjTasks = tasks.filter((t: Task) => t.unit === unit && t.subject === subject);

    if (subjTasks.length === 0 && filter === 'all') return null;

    const totalDuration = subjTasks.reduce((acc: number, curr: Task) => acc + curr.currentDuration + curr.history.reduce((hAcc, h) => hAcc + h.duration, 0), 0);
    const conf = subjectConfig[subject as Subject];

    const filteredTasks = subjTasks.filter((t: Task) => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    const tasksByCategory: Record<string, Task[]> = {};
    filteredTasks.forEach((task: Task) => {
        if (!tasksByCategory[task.category]) tasksByCategory[task.category] = [];
        tasksByCategory[task.category].push(task);
    });

    return (
        <div className="relative">
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-end justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-8 rounded-full ${conf.bg}`} />
                        <h3 className={`font-black text-2xl ${conf.color}`}>{conf.label}</h3>
                    </div>
                    <div className="text-sm font-bold text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-lg">
                        Total: {Math.floor(totalDuration / 60)}m
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {(['all', 'not_started', 'in_progress', 'completed'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${filter === f ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {f === 'all' ? '全て' : f === 'not_started' ? '未着手' : f === 'in_progress' ? '勉強中' : '完了'}
                            </button>
                        ))}
                    </div>
                    {!readOnly && (
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                        >
                            <Plus size={14} /> 追加
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {Object.keys(tasksByCategory).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-bold border-2 border-dashed border-slate-100 rounded-2xl">
                        タスクがありません
                    </div>
                ) : (
                    Object.keys(tasksByCategory).map(cat => (
                        <div key={cat} className="pl-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2 border-l-2 border-slate-200">{cat}</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {tasksByCategory[cat].map((task: Task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        updateTask={updateTask}
                                        cycleStatus={cycleStatus}
                                        setDetailTaskId={setDetailTaskId}
                                        readOnly={readOnly}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddCustomTaskModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                unit={unit}
                subject={subject}
                onAdd={(title: string, category: string) => onAddTask(unit, subject, title, category)}
            />
        </div>
    );
};
