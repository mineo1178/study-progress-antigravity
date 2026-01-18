import { Task } from './types';

export const LEVEL_thresholds = Array.from({ length: 100 }, (_, i) => Math.floor(100 * Math.pow(1.2, i))); // 指数関数カーブ

export const calculateLevel = (totalMinutes: number) => {
    let level = 1;
    let xp = totalMinutes; // 簡略化のため 1分 = 1 XP

    for (let i = 0; i < LEVEL_thresholds.length; i++) {
        if (xp >= LEVEL_thresholds[i]) {
            level = i + 2;
            xp -= LEVEL_thresholds[i];
        } else {
            break;
        }
    }
    return { level, currentXP: xp, nextLevelXP: LEVEL_thresholds[level - 2] || 100 };
};

export interface Badge {
    id: string;
    label: string;
    icon: string; // 絵文字またはアイコン名
    description: string;
    condition: (tasks: Task[], totalMinutes: number) => boolean;
}

export const BADGES: Badge[] = [
    {
        id: 'first_step',
        label: 'はじめの一歩',
        icon: '🐣',
        description: '初めてタスクを完了した',
        condition: (tasks) => tasks.some(t => t.status === 'completed')
    },
    {
        id: 'three_days',
        label: '三日坊主卒業',
        icon: '🔥',
        description: '3日間連続で学習した',
        condition: (tasks) => {
            const dates = new Set<string>();
            tasks.forEach(t => t.history.forEach(h => dates.add(h.date)));
            // 正確な日付なしでのstreak判定は複雑なため、現在は3日以上ユニークな日付があるかで簡易判定
            return dates.size >= 3;
        }
    },
    {
        id: 'math_master',
        label: '算数博士',
        icon: '📐',
        description: '算数を5時間以上勉強した',
        condition: (tasks) => {
            const mins = tasks.filter(t => t.subject === 'math').reduce((acc, t) => acc + t.history.reduce((h, i) => h + i.duration, 0), 0) / 60;
            return mins >= 300;
        }
    },
    {
        id: 'level_10',
        label: '一人前',
        icon: '⭐',
        description: 'レベル10に到達した',
        condition: (_, totalMinutes) => calculateLevel(totalMinutes).level >= 10
    }
];

export const getUnlockedBadges = (tasks: Task[]) => {
    const totalMinutes = tasks.reduce((acc, t) => acc + t.history.reduce((h, i) => h + i.duration, 0) + t.currentDuration, 0) / 60;
    return BADGES.filter(b => b.condition(tasks, totalMinutes));
};
