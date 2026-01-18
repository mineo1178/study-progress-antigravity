'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Edit2, CheckCircle } from 'lucide-react';

// Helper: Format Seconds
export const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h${m}m`;
    return `${m}m${s}s`;
};

interface StopwatchProps {
    time: number;
    onChange: (t: number) => void;
    onStartStop: (running: boolean) => void;
    variant?: 'modal' | 'card';
}

export const Stopwatch = React.memo(({
    time, onChange, onStartStop, variant = 'modal'
}: StopwatchProps) => {
    const [running, setRunning] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editVal, setEditVal] = useState('');

    // Ref to track start time for accurate delta calculation
    const startTimeRef = useRef<number | null>(null);
    const accumulatedTimeRef = useRef(time);

    // Sync prop updates when not running
    useEffect(() => {
        if (!running) {
            accumulatedTimeRef.current = time;
        }
    }, [time, running]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (running) {
            startTimeRef.current = Date.now();
            interval = setInterval(() => {
                const now = Date.now();
                const delta = Math.floor((now - (startTimeRef.current || now)) / 1000);
                const next = accumulatedTimeRef.current + delta;
                onChange(next);
            }, 1000);
        } else {
            startTimeRef.current = null;
        }
        return () => clearInterval(interval);
    }, [running, onChange]);

    const toggleTimer = (e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (running) {
            // Stopping: Commit the final time
            const now = Date.now();
            const delta = startTimeRef.current ? Math.floor((now - startTimeRef.current) / 1000) : 0;
            accumulatedTimeRef.current += delta;
            onChange(accumulatedTimeRef.current);
        } else {
            // Starting
            startTimeRef.current = Date.now();
        }

        const nextState = !running;
        setRunning(nextState);
        onStartStop(nextState);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditVal(Math.floor(accumulatedTimeRef.current / 60).toString());
        setRunning(false);
        onStartStop(false);
    };

    const saveEdit = () => {
        const val = parseInt(editVal) || 0;
        const newTime = val * 60;
        accumulatedTimeRef.current = newTime;
        onChange(newTime);
        setIsEditing(false);
    };

    if (variant === 'card') {
        return (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {accumulatedTimeRef.current > 0 && (
                    <span className={`font-mono text-xs font-bold ${running ? 'text-blue-600' : 'text-slate-400'}`}>
                        {formatTime(accumulatedTimeRef.current)}
                    </span>
                )}
                <button
                    onClick={toggleTimer}
                    className={`p-1.5 rounded-full transition-all ${running ? 'bg-red-50 text-red-500 ring-2 ring-red-100' : 'bg-slate-50 text-blue-500 hover:bg-blue-50'
                        }`}
                >
                    {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="flex items-center justify-center bg-slate-100 rounded-2xl py-2 px-4 w-full h-16">
                <input
                    type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                    className="w-20 text-center bg-transparent text-3xl font-black text-slate-800 focus:outline-none"
                    autoFocus
                />
                <span className="text-sm font-bold text-slate-500 mr-4 mt-2">分</span>
                <button onClick={saveEdit} className="bg-green-500 text-white p-2 rounded-full active:scale-95"><CheckCircle size={20} /></button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2 pr-4 w-full h-16 border border-slate-100 shadow-inner">
            <div className="flex-1 text-center">
                <span className={`font-mono text-3xl font-black tracking-widest ${running ? 'text-blue-600' : 'text-slate-700'}`}>
                    {formatTime(accumulatedTimeRef.current)}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleEdit} className="text-slate-300 hover:text-slate-500 p-2"><Edit2 size={18} /></button>
                <button
                    onClick={toggleTimer}
                    className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-all ${running ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                        }`}
                >
                    {running ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
            </div>
        </div>
    );
});
Stopwatch.displayName = 'Stopwatch';
