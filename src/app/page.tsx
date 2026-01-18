'use client';

import React, { useState, useEffect } from 'react';
import { Zap, BarChart2, Award, Share2 } from 'lucide-react';
import { Task, TestResult, Subject } from '@/lib/types';
import { INITIAL_TASKS, INITIAL_TESTS, CURRICULUM_PRESETS } from '@/lib/constants';
import { DailyView } from '@/components/DailyView';
import { TestsView } from '@/components/TestsView';
import { AchievementsView } from '@/components/AchievementsView';
import { CreateUnitOverlay, DeleteConfirmModal } from '@/components/Modals';
import { ShareModal } from '@/components/ShareModal';

export default function StudyApp() {
    const [activeTab, setActiveTab] = useState('daily');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tests, setTests] = useState<TestResult[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);

    // データ永続化: 読み込み
    useEffect(() => {
        try {
            const loadedTasks = localStorage.getItem('studyapp_tasks');
            const loadedTests = localStorage.getItem('studyapp_tests');

            if (loadedTasks) {
                setTasks(JSON.parse(loadedTasks));
            } else {
                setTasks(INITIAL_TASKS);
            }

            if (loadedTests) {
                setTests(JSON.parse(loadedTests));
            } else {
                setTests(INITIAL_TESTS);
            }
        } catch (e) {
            console.error("Failed to load data", e);
            setTasks(INITIAL_TASKS);
            setTests(INITIAL_TESTS);
        }
        setIsLoaded(true);
    }, []);

    // データ永続化: 保存
    useEffect(() => {
        if (isLoaded && !readOnly) {
            localStorage.setItem('studyapp_tasks', JSON.stringify(tasks));
            localStorage.setItem('studyapp_tests', JSON.stringify(tests));
        }
    }, [tasks, tests, isLoaded, readOnly]);

    const unitsWithTasks = Array.from(new Set(tasks.map(t => t.unit))).sort((a, b) => {
        const numA = parseInt(a.replace('第', '').replace('回', '')) || 0;
        const numB = parseInt(b.replace('第', '').replace('回', '')) || 0;
        return numB - numA;
    });

    const addUnitWithPresets = (unitNumber: number) => {
        if (readOnly) return;
        const unitName = `第${unitNumber}回`;
        const newTasks: Task[] = [];
        (['math', 'japanese', 'science', 'social'] as Subject[]).forEach(subject => {
            CURRICULUM_PRESETS[subject].forEach(preset => {
                preset.items.forEach((item, index) => {
                    newTasks.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
                        unit: unitName,
                        subject: subject,
                        category: preset.category,
                        title: item,
                        materialName: `${preset.category} - ${item}`,
                        status: 'not_started',
                        currentDuration: 0,
                        currentMemo: '',
                        history: [],
                        createdAt: new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
                    });
                });
            });
        });
        setTasks(prev => [...newTasks, ...prev]);
        setSelectedUnit(unitName);
    };

    const deleteUnit = (unit: string) => {
        if (readOnly) return;
        setTasks(prev => prev.filter(t => t.unit !== unit));
        if (selectedUnit === unit) setSelectedUnit(null);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        if (readOnly) return;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const cycleStatus = (task: Task) => {
        if (readOnly) return;
        const next = task.status === 'not_started' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'not_started';
        updateTask(task.id, { status: next });
    };

    const saveHistory = (task: Task) => {
        if (readOnly) return;
        if (task.currentDuration === 0) return;
        const newHistory = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
            duration: task.currentDuration,
            memo: task.currentMemo
        };
        updateTask(task.id, { history: [...task.history, newHistory], currentDuration: 0, currentMemo: '' });
    };

    const deleteTask = (id: string) => {
        if (readOnly) return;
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const onAddTask = (unit: string, subject: Subject, title: string, category: string) => {
        if (readOnly) return;
        const newTask: Task = {
            id: Date.now().toString(),
            unit,
            subject,
            category,
            title,
            materialName: `${category} - ${title}`,
            status: 'not_started',
            currentDuration: 0,
            currentMemo: '',
            history: [],
            createdAt: new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
        };
        setTasks(prev => [...prev, newTask]);
    };

    const addTestResult = (test: TestResult) => {
        if (readOnly) return;
        setTests(prev => [test, ...prev]);
    };

    const onLoadData = (loadedTasks: Task[], loadedTests: TestResult[]) => {
        setTasks(loadedTasks);
        setTests(loadedTests);
        // 注意: 閲覧専用モードでは、データの誤った上書きを防ぐため自動保存をスキップすべきか検討が必要。
        // 現状は読み込み時にセットされるが、readOnlyフラグでuseEffect内の保存がブロックされる。
    };

    if (!isLoaded) return <div className="flex h-screen items-center justify-center text-slate-400">Loading...</div>;

    return (
        <div className={`flex flex-col h-screen bg-slate-50 font-sans text-slate-900 max-w-md mx-auto shadow-2xl overflow-hidden relative ${readOnly ? 'border-4 border-amber-400 rounded-xl' : ''}`}>
            {readOnly && <div className="bg-amber-400 text-white text-xs font-bold text-center py-1">閲覧専用モード (Parent Mode)</div>}
            <header className="bg-white/80 backdrop-blur-xl pt-4 sticky top-0 z-30">
                <div className="h-16 flex items-center justify-between px-6">
                    <h1 className="font-black text-xl text-slate-800 tracking-tight">Level Up Study<span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold align-middle">4年生</span></h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShareModalOpen(true)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Share2 size={18} />
                        </button>
                        <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">{new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto overscroll-contain no-scrollbar flex flex-col">
                {activeTab === 'daily' ? (
                    <DailyView
                        tasks={tasks} updateTask={updateTask} cycleStatus={cycleStatus} saveHistory={saveHistory}
                        deleteTask={deleteTask} deleteUnit={deleteUnit} setAddModalOpen={setAddModalOpen}
                        selectedUnit={selectedUnit} setSelectedUnit={setSelectedUnit} unitsWithTasks={unitsWithTasks} onAddTask={onAddTask}
                        setDeleteConfirmation={setDeleteConfirmation}
                        readOnly={readOnly}
                    />
                ) : activeTab === 'tests' ? (
                    <TestsView tests={tests} onAddTest={addTestResult} readOnly={readOnly} />
                ) : (
                    <AchievementsView tasks={tasks} />
                )}
            </main>

            <nav className="bg-white/90 backdrop-blur-lg border-t border-slate-100 fixed bottom-0 left-0 right-0 z-40 pb-6 max-w-md mx-auto rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <div className="h-20 flex justify-around items-center px-4">
                    <button onClick={() => setActiveTab('daily')} className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 transition-all duration-300 ${activeTab === 'daily' ? 'text-blue-600 -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}>
                        <div className={`p-1.5 rounded-xl ${activeTab === 'daily' ? 'bg-blue-50' : ''}`}><Zap size={26} strokeWidth={activeTab === 'daily' ? 3 : 2.5} fill={activeTab === 'daily' ? "currentColor" : "none"} /></div><span className="text-[10px] font-black">学習</span>
                    </button>
                    <button onClick={() => setActiveTab('achievements')} className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 transition-all duration-300 ${activeTab === 'achievements' ? 'text-blue-600 -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}>
                        <div className={`p-1.5 rounded-xl ${activeTab === 'achievements' ? 'bg-blue-50' : ''}`}><BarChart2 size={26} strokeWidth={activeTab === 'achievements' ? 3 : 2.5} /></div><span className="text-[10px] font-black">実績</span>
                    </button>
                    <button onClick={() => setActiveTab('tests')} className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 transition-all duration-300 ${activeTab === 'tests' ? 'text-blue-600 -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}>
                        <div className={`p-1.5 rounded-xl ${activeTab === 'tests' ? 'bg-blue-50' : ''}`}><Award size={26} strokeWidth={activeTab === 'tests' ? 3 : 2.5} /></div><span className="text-[10px] font-black">成績</span>
                    </button>
                </div>
            </nav>

            <CreateUnitOverlay isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onCreate={addUnitWithPresets} />

            <DeleteConfirmModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={deleteConfirmation?.onConfirm || (() => { })}
                title={deleteConfirmation?.title}
                message={deleteConfirmation?.message}
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setShareModalOpen(false)}
                tasks={tasks}
                tests={tests}
                onLoadData={onLoadData}
                setReadOnly={setReadOnly}
            />
        </div>
    );
}
