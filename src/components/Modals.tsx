'use client';

import React, { useState } from 'react';
import { AlertTriangle, Layers, X, Zap, Plus } from 'lucide-react';
import { Subject, TestResult, SubjectConfig } from '@/lib/types';
import { SUBJECT_CONFIG, TEST_TYPE_CONFIG } from '@/lib/constants';

// --- DeleteConfirmModal ---
interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}
export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm whitespace-pre-wrap">{message}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                    >
                        削除する
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CreateUnitOverlay ---
interface CreateUnitOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (n: number) => void;
}
export const CreateUnitOverlay = ({ isOpen, onClose, onCreate }: CreateUnitOverlayProps) => {
    const [unitNumber, setUnitNumber] = useState('');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800 flex items-center"><Layers className="mr-2 text-blue-600" /> 新しい回を追加</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Unit Number</label>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl font-black text-slate-300">第</span>
                        <input
                            type="number" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} placeholder="?"
                            className="w-24 bg-white border-2 border-blue-100 rounded-xl px-2 py-3 text-3xl font-black text-center text-blue-600 focus:outline-none focus:border-blue-500"
                            autoFocus
                        />
                        <span className="text-2xl font-black text-slate-300">回</span>
                    </div>
                </div>
                <button
                    onClick={() => { if (parseInt(unitNumber) > 0) { onCreate(parseInt(unitNumber)); setUnitNumber(''); onClose(); } }}
                    disabled={!unitNumber}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Zap size={20} fill="currentColor" /> カリキュラムを作成
                </button>
            </div>
        </div>
    );
};

// --- AddCustomTaskModal ---
interface AddCustomTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (title: string, category: string) => void;
    unit: string;
    subject: Subject;
}
export const AddCustomTaskModal = ({ isOpen, onClose, onAdd, unit, subject }: AddCustomTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('その他');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-slate-800">タスクを追加</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">カテゴリ</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold">
                            <option value="予習シリーズ">予習シリーズ</option>
                            <option value="演習問題集">演習問題集</option>
                            <option value="練成問題集">練成問題集</option>
                            <option value="プリント">プリント</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">タイトル</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例: 追加問題..." className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" autoFocus />
                    </div>
                    <button
                        onClick={() => { if (title) { onAdd(title, category); setTitle(''); setCategory('その他'); onClose(); } }}
                        disabled={!title}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg mt-2"
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- AddTestResultOverlay ---
interface AddTestResultOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (test: TestResult) => void;
}
export const AddTestResultOverlay = ({ isOpen, onClose, onAdd }: AddTestResultOverlayProps) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [name, setName] = useState('');
    const [type, setType] = useState('curriculum');
    const [devs, setDevs] = useState({ math: '', japanese: '', science: '', social: '' });
    const [totalDev, setTotalDev] = useState('');
    const [totalRank, setTotalRank] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        const newTest: TestResult = {
            id: Date.now().toString(),
            date: date.replace(/-/g, '/'),
            name,
            type,
            subjects: {
                math: { score: 0, avg: 0, dev: Number(devs.math) },
                japanese: { score: 0, avg: 0, dev: Number(devs.japanese) },
                science: { score: 0, avg: 0, dev: Number(devs.science) },
                social: { score: 0, avg: 0, dev: Number(devs.social) },
            },
            total4: { score: 0, avg: 0, dev: Number(totalDev), rank: totalRank }
        };
        onAdd(newTest);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-slate-800">テスト結果を追加</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">実施日</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">種類</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold">
                                {Object.entries(TEST_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">テスト名</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-slate-600 mb-3 text-sm">各教科の偏差値</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {(['math', 'japanese', 'science', 'social'] as Subject[]).map(subj => (
                                <div key={subj}>
                                    <label className={`block text-xs font-bold ${SUBJECT_CONFIG[subj].color} mb-1`}>{SUBJECT_CONFIG[subj].label}</label>
                                    <input
                                        type="number"
                                        placeholder="偏差値"
                                        value={devs[subj]}
                                        onChange={e => setDevs({ ...devs, [subj]: e.target.value })}
                                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-slate-600 mb-2 text-sm">4科合計</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">偏差値</label>
                                <input type="number" value={totalDev} onChange={e => setTotalDev(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">順位</label>
                                <input type="text" value={totalRank} onChange={e => setTotalRank(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSubmit} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg mt-4">追加する</button>
                </div>
            </div>
        </div>
    );
};
