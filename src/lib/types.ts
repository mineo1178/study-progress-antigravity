
export type Subject = 'math' | 'japanese' | 'science' | 'social';

export interface SubjectConfig {
    id: Subject;
    label: string;
    short: string;
    color: string;
    bg: string;
    lightBg: string;
    border: string;
    hex: string;
}

export interface Task {
    id: string;
    unit: string;
    subject: Subject;
    category: string;
    title: string;
    materialName: string;
    status: 'not_started' | 'in_progress' | 'completed';
    currentDuration: number;
    currentMemo: string;
    history: { id: string; date: string; duration: number; memo: string }[];
    createdAt: string;
}

export interface TestResult {
    id: string;
    date: string;
    name: string;
    type: string;
    subjects: Record<Subject, { score: number; avg: number; dev: number; rank?: string }>;
    total4: { score: number; avg: number; dev: number; rank: string };
}
