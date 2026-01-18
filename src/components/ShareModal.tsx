'use client';

import React, { useState } from 'react';
import { Share2, Download, Upload, X, Check, Copy, Loader2 } from 'lucide-react';
import { Task, TestResult } from '@/lib/types';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    tests: TestResult[];
    onLoadData: (tasks: Task[], tests: TestResult[]) => void;
    setReadOnly: (readonly: boolean) => void;
}

export const ShareModal = ({ isOpen, onClose, tasks, tests, onLoadData, setReadOnly }: ShareModalProps) => {
    const [mode, setMode] = useState<'menu' | 'upload' | 'download'>('menu');
    const [shareId, setShareId] = useState<string | null>(null);
    const [inputId, setInputId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    if (!isOpen) return null;

    const handleUpload = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { tasks, tests } }),
            });
            const json = await res.json();
            if (json.success) {
                setShareId(json.id);
                setMode('upload');
            } else {
                setMessage({ text: '保存に失敗しました', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: '通信エラーが発生しました', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!inputId) return;
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/sync?id=${inputId}`);
            const json = await res.json();
            if (json.success) {
                onLoadData(json.data.tasks, json.data.tests);
                setReadOnly(true); // Parent mode implies Read Only for safety
                onClose();
                alert('データを読み込みました (親モード: 閲覧専用)');
            } else {
                setMessage({ text: 'IDが見つかりません', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: '通信エラーが発生しました', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const copyId = () => {
        if (shareId) {
            navigator.clipboard.writeText(shareId);
            alert('IDをコピーしました');
        }
    };

    const reset = () => {
        setMode('menu');
        setShareId(null);
        setInputId('');
        setMessage(null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 relative">
                <button onClick={() => { onClose(); reset(); }} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={20} /></button>

                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
                    <Share2 className="text-blue-500" /> データ共有
                </h3>

                {mode === 'menu' && (
                    <div className="space-y-4">
                        <button onClick={handleUpload} disabled={isLoading} className="w-full py-4 bg-blue-50 hover:bg-blue-100 rounded-2xl flex flex-col items-center gap-2 transition-colors border border-blue-100 group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                {isLoading ? <Loader2 className="animate-spin text-blue-500" /> : <Upload className="text-blue-500" />}
                            </div>
                            <div className="font-bold text-slate-700">共有IDを発行する</div>
                            <div className="text-[10px] text-slate-400 font-bold">今のデータをクラウドに保存</div>
                        </button>
                        <div className="flex items-center gap-3 text-slate-300 text-xs font-bold my-2 px-4">
                            <div className="h-px bg-slate-100 flex-1"></div>OR<div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                        <button onClick={() => setMode('download')} className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex flex-col items-center gap-2 transition-colors border border-slate-100 group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Download className="text-slate-500" />
                            </div>
                            <div className="font-bold text-slate-700">データを読み込む</div>
                            <div className="text-[10px] text-slate-400 font-bold">親モード(閲覧専用)で開く</div>
                        </button>
                    </div>
                )}

                {mode === 'upload' && shareId && (
                    <div className="text-center space-y-6">
                        <div className="bg-green-50 text-green-600 p-4 rounded-2xl font-bold flex flex-col items-center gap-2">
                            <Check size={32} />
                            <span>保存しました</span>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 mb-2">共有ID (24時間有効)</div>
                            <div className="text-4xl font-black text-slate-800 tracking-widest font-mono bg-slate-50 py-4 rounded-xl border border-slate-200 select-all" onClick={copyId}>
                                {shareId}
                            </div>
                            <button onClick={copyId} className="flex items-center justify-center gap-2 text-blue-500 font-bold text-xs mt-3 w-full py-2 hover:bg-blue-50 rounded-lg transition-colors">
                                <Copy size={14} /> IDをコピー
                            </button>
                        </div>
                        <button onClick={() => { onClose(); reset(); }} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl">閉じる</button>
                    </div>
                )}

                {mode === 'download' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">共有IDを入力</label>
                            <input
                                type="number"
                                value={inputId}
                                onChange={(e) => setInputId(e.target.value)}
                                className="w-full text-center text-3xl font-black tracking-widest p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:outline-none"
                                placeholder="000000"
                                autoFocus
                            />
                        </div>
                        {message && <div className={`text-xs font-bold text-center ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{message.text}</div>}
                        <button onClick={handleDownload} disabled={!inputId || isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                            {isLoading ? <Loader2 className="animate-spin" /> : <Download size={20} />} 読み込む
                        </button>
                        <button onClick={reset} className="w-full text-slate-400 font-bold text-xs py-2">戻る</button>
                    </div>
                )}
            </div>
        </div>
    );
};
