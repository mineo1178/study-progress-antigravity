'use client';

import React, { useMemo } from 'react';
import { Trophy, Star } from 'lucide-react';
import { Task } from '@/lib/types';
import { calculateLevel, getUnlockedBadges } from '@/lib/gamification';

interface ProfileCardProps {
    tasks: Task[];
}

export const ProfileCard = ({ tasks }: ProfileCardProps) => {
    const { level, xp, nextXP, progress, badges } = useMemo(() => {
        const totalMinutes = tasks.reduce((acc, t) => acc + t.history.reduce((h, i) => h + i.duration, 0) + t.currentDuration, 0) / 60;
        const { level, currentXP, nextLevelXP } = calculateLevel(totalMinutes);
        const badges = getUnlockedBadges(tasks);
        return {
            level,
            xp: Math.floor(currentXP),
            nextXP: Math.floor(nextLevelXP),
            progress: Math.min(100, (currentXP / nextLevelXP) * 100),
            badges
        };
    }, [tasks]);

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={120} /></div>

            <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                    <div className="text-xs font-bold text-indigo-100 mb-1 flex items-center gap-1"><Star size={12} fill="currentColor" /> YOUR LEVEL</div>
                    <div className="text-5xl font-black tracking-tighter flex items-baseline gap-2">
                        {level}
                        <span className="text-sm font-bold opacity-60">Lv</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-indigo-100 mb-1">NEXT LEVEL</div>
                    <div className="font-mono font-bold text-xl">{xp} <span className="text-xs opacity-50">/ {nextXP} XP</span></div>
                </div>
            </div>

            <div className="h-3 bg-black/20 rounded-full overflow-hidden mb-6 relative z-10">
                <div className="h-full bg-yellow-400 shadow-lg transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
            </div>

            <div className="relative z-10">
                <div className="text-xs font-bold text-indigo-100 mb-2">COLLECTED BADGES</div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {badges.length > 0 ? badges.map(b => (
                        <div key={b.id} className="bg-white/10 backdrop-blur-md p-2 rounded-xl flex flex-col items-center min-w-[4rem] border border-white/10">
                            <div className="text-2xl mb-1">{b.icon}</div>
                            <div className="text-[9px] font-bold text-center leading-tight truncate w-full">{b.label}</div>
                        </div>
                    )) : (
                        <div className="text-xs opacity-50 italic">まだバッジがありません... 学習を始めましょう！</div>
                    )}
                </div>
            </div>
        </div>
    );
};
