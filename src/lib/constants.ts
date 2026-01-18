import { Subject, SubjectConfig, Task, TestResult } from './types';

export const SUBJECT_CONFIG: Record<Subject, SubjectConfig> = {
    math: {
        id: 'math', label: '算数', short: '算',
        color: 'text-blue-600', bg: 'bg-blue-500',
        lightBg: 'bg-blue-50', border: 'border-blue-200',
        hex: '#2563eb',
    },
    japanese: {
        id: 'japanese', label: '国語', short: '国',
        color: 'text-rose-600', bg: 'bg-rose-500',
        lightBg: 'bg-rose-50', border: 'border-rose-200',
        hex: '#e11d48',
    },
    science: {
        id: 'science', label: '理科', short: '理',
        color: 'text-amber-600', bg: 'bg-amber-500',
        lightBg: 'bg-amber-50', border: 'border-amber-200',
        hex: '#d97706',
    },
    social: {
        id: 'social', label: '社会', short: '社',
        color: 'text-emerald-600', bg: 'bg-emerald-500',
        lightBg: 'bg-emerald-50', border: 'border-emerald-200',
        hex: '#059669',
    },
};

export const TEST_TYPE_CONFIG: Record<string, { label: string; color: string; activeClass: string }> = {
    kumiwake: { label: '組分け', color: 'text-purple-700', activeClass: 'bg-purple-600 text-white border-purple-600' },
    curriculum: { label: 'カリテ', color: 'text-slate-700', activeClass: 'bg-slate-600 text-white border-slate-600' },
    hantei: { label: '判定', color: 'text-orange-700', activeClass: 'bg-orange-600 text-white border-orange-600' },
};

export const CURRICULUM_PRESETS: Record<Subject, { category: string; items: string[] }[]> = {
    math: [
        { category: '予習シリーズ', items: ['類題', '基本問題', '練習問題'] },
        { category: '演習問題集', items: ['基本問題', '練習問題', 'トレーニング', '実戦演習'] },
        { category: '計算', items: ['①', '②', '③', '④', '⑤', '⑥', '⑦'] },
        { category: 'プリント', items: ['ミニテスト STANDARD', 'ミニテスト ADVANCE', '基礎力強化プリント'] },
    ],
    japanese: [
        { category: '予習シリーズ', items: ['基本問題', '発展問題', '言語知識'] },
        { category: '漢字とことば', items: ['漢字練習', '漢字確認', 'ことば'] },
        { category: '演習問題集', items: ['演習問題集'] },
        { category: 'プリント', items: ['漢字', 'ことば'] },
    ],
    science: [
        { category: '予習シリーズ', items: ['要点チェック'] },
        { category: '演習問題集', items: ['まとめてみよう', '練習問題', '発展問題'] },
        { category: '練成問題集', items: ['トレーニング', '基本問題', '練習問題'] },
        { category: 'プリント', items: ['確認テスト', 'まとめプリント 穴埋め編', 'まとめプリント まとめプリント'] },
    ],
    social: [
        { category: '予習シリーズ', items: ['要点チェック'] },
        { category: '演習問題集', items: ['まとめてみよう', '練習問題', '発展問題'] },
        { category: '練成問題集', items: ['トレーニング', '基本問題', '練習問題'] },
        { category: 'プリント', items: ['確認テスト', 'ジャンプアップ問題'] },
    ]
};

const generateDummyTasks = (): Task[] => {
    const tasks: Task[] = [];
    const subjects: Subject[] = ['math', 'japanese', 'science', 'social'];
    const today = new Date();

    [14, 13].forEach(unitNum => {
        const unit = `第${unitNum}回`;
        subjects.forEach(subj => {
            const presets = CURRICULUM_PRESETS[subj];
            presets.forEach(cat => {
                cat.items.forEach((item, idx) => {
                    const hasHistory = Math.random() > 0.3;
                    const history = [];
                    if (hasHistory) {
                        const entries = Math.floor(Math.random() * 3) + 1;
                        for (let i = 0; i < entries; i++) {
                            const daysAgo = Math.floor(Math.random() * 30);
                            const date = new Date(today);
                            date.setDate(today.getDate() - daysAgo);
                            const duration = (Math.floor(Math.random() * 40) + 10) * 60;
                            history.push({
                                id: Math.random().toString(36).substr(2, 9),
                                date: `${date.getMonth() + 1}/${date.getDate()}`,
                                duration,
                                memo: Math.random() > 0.7 ? '難しかった' : ''
                            });
                        }
                        history.sort((a, b) => {
                            const [ma, da] = a.date.split('/').map(Number);
                            const [mb, db] = b.date.split('/').map(Number);
                            return (ma * 31 + da) - (mb * 31 + db);
                        });
                    }
                    tasks.push({
                        id: `${unitNum}-${subj}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                        unit,
                        subject: subj,
                        category: cat.category,
                        title: item,
                        materialName: `${cat.category} - ${item}`,
                        status: hasHistory ? (Math.random() > 0.5 ? 'completed' : 'in_progress') : 'not_started',
                        currentDuration: 0,
                        currentMemo: '',
                        history,
                        createdAt: `${today.getMonth() + 1}/${today.getDate()}`
                    });
                });
            });
        });
    });
    return tasks;
};

export const INITIAL_TASKS: Task[] = generateDummyTasks();

export const INITIAL_TESTS: TestResult[] = [
    // --- カリキュラムテスト（下） ---
    {
        id: 't20251206', date: '2025/12/06', name: 'カリ下13-14', type: 'curriculum',
        subjects: {
            math: { score: 46, avg: 57.6, dev: 42.2, rank: '1665/2216' },
            japanese: { score: 76, avg: 73.6, dev: 51.7, rank: '1019/2216' },
            science: { score: 34, avg: 37.3, dev: 45.4, rank: '1537/2216' },
            social: { score: 38, avg: 40.9, dev: 44.4, rank: '1602/2216' },
        },
        total4: { score: 194, avg: 209.6, dev: 44.2, rank: '1615/2216' }
    },
    {
        id: 't20251122', date: '2025/11/22', name: 'カリ下11-12', type: 'curriculum',
        subjects: {
            math: { score: 46, avg: 54.5, dev: 44.8, rank: '1416/2133' },
            japanese: { score: 75, avg: 65.9, dev: 57.2, rank: '488/2133' },
            science: { score: 38, avg: 41.6, dev: 44.5, rank: '1574/2133' },
            social: { score: 46, avg: 41.0, dev: 58.8, rank: '225/2133' },
        },
        total4: { score: 205, avg: 203.2, dev: 50.6, rank: '1036/2133' }
    },
    {
        id: 't20251101', date: '2025/11/01', name: 'カリ下8-9', type: 'curriculum',
        subjects: {
            math: { score: 69, avg: 55.3, dev: 58.5, rank: '349/2281' },
            japanese: { score: 77, avg: 70.0, dev: 55.8, rank: '652/2281' },
            science: { score: 50, avg: 42.5, dev: 62.7, rank: '1/2281' },
            social: { score: 38, avg: 38.3, dev: 49.3, rank: '1140/2281' },
        },
        total4: { score: 234, avg: 206.3, dev: 60.1, rank: '329/2281' }
    },
    {
        id: 't20251018', date: '2025/10/18', name: 'カリ下6-7', type: 'curriculum',
        subjects: {
            math: { score: 90, avg: 65.4, dev: 67.1, rank: '28/2329' },
            japanese: { score: 75, avg: 64.5, dev: 57.6, rank: '502/2329' },
            science: { score: 40, avg: 35.1, dev: 56.2, rank: '637/2329' },
            social: { score: 48, avg: 43.7, dev: 58.0, rank: '261/2329' },
        },
        total4: { score: 253, avg: 208.9, dev: 66.7, rank: '80/2329' }
    },
    {
        id: 't20250927', date: '2025/09/27', name: 'カリ下3-4', type: 'curriculum',
        subjects: {
            math: { score: 73, avg: 62.6, dev: 57.1, rank: '514/2161' },
            japanese: { score: 61, avg: 71.1, dev: 42.4, rank: '1659/2161' },
            science: { score: 36, avg: 41.7, dev: 41.2, rank: '1770/2161' },
            social: { score: 46, avg: 40.9, dev: 58.5, rank: '250/2161' },
        },
        total4: { score: 216, avg: 216.5, dev: 49.7, rank: '1108/2161' }
    },
    {
        id: 't20250913', date: '2025/09/13', name: 'カリ下1-2', type: 'curriculum',
        subjects: {
            math: { score: 69, avg: 67.0, dev: 51.3, rank: '907/2150' },
            japanese: { score: 77, avg: 69.6, dev: 56.5, rank: '530/2150' },
            science: { score: 43, avg: 41.3, dev: 52.7, rank: '862/2150' },
            social: { score: 48, avg: 44.0, dev: 58.0, rank: '221/2150' },
        },
        total4: { score: 237, avg: 222.0, dev: 56.4, rank: '559/2150' }
    },
    {
        id: 't20250705', date: '2025/07/05', name: 'カリ上18-19', type: 'curriculum',
        subjects: {
            math: { score: 74, avg: 68.3, dev: 53.9, rank: '753/2185' },
            japanese: { score: 88, avg: 82.1, dev: 54.7, rank: '770/2185' },
            science: { score: 38, avg: 35.8, dev: 52.9, rank: '829/2185' },
            social: { score: 40, avg: 38.1, dev: 53.0, rank: '761/2185' },
        },
        total4: { score: 240, avg: 224.5, dev: 55.9, rank: '622/2185' }
    },
    {
        id: 't20250621', date: '2025/06/21', name: 'カリ上16-17', type: 'curriculum',
        subjects: {
            math: { score: 74, avg: 65.0, dev: 56.0, rank: '535/2147' },
            japanese: { score: 47, avg: 66.6, dev: 34.1, rank: '1982/2147' },
            science: { score: 36, avg: 35.9, dev: 50.0, rank: '1085/2147' },
            social: { score: 40, avg: 39.6, dev: 50.5, rank: '993/2147' },
        },
        total4: { score: 197, avg: 207.4, dev: 45.9, rank: '1417/2147' }
    },
    {
        id: 't20250531', date: '2025/05/31', name: 'カリ上13-14', type: 'curriculum',
        subjects: {
            math: { score: 80, avg: 61.7, dev: 62.5, rank: '156/2131' },
            japanese: { score: 62, avg: 59.6, dev: 51.8, rank: '899/2131' },
            science: { score: 37, avg: 37.9, dev: 48.5, rank: '1205/2131' },
            social: { score: 46, avg: 37.7, dev: 62.2, rank: '106/2131' },
        },
        total4: { score: 225, avg: 197.0, dev: 60.5, rank: '277/2131' }
    },
    {
        id: 't20250517', date: '2025/05/17', name: 'カリ上11-12', type: 'curriculum',
        subjects: {
            math: { score: 69, avg: 60.3, dev: 56.0, rank: '534/2175' },
            japanese: { score: 39, avg: 63.8, dev: 32.1, rank: '2055/2175' },
            science: { score: 41, avg: 29.5, dev: 65.2, rank: '105/2175' },
            social: { score: 32, avg: 35.4, dev: 44.7, rank: '1462/2175' },
        },
        total4: { score: 181, avg: 189.1, dev: 47.0, rank: '1344/2175' }
    },
    {
        id: 't20250419', date: '2025/04/19', name: 'カリ上8-9', type: 'curriculum',
        subjects: {
            math: { score: 83, avg: 61.9, dev: 64.3, rank: '178/2159' },
            japanese: { score: 96, avg: 78.2, dev: 63.8, rank: '83/2159' },
            science: { score: 37, avg: 36.7, dev: 50.3, rank: '1031/2159' },
            social: { score: 48, avg: 42.1, dev: 59.5, rank: '156/2159' },
        },
        total4: { score: 264, avg: 219.1, dev: 65.6, rank: '84/2159' }
    },
    {
        id: 't20250322', date: '2025/03/22', name: 'カリ上6-7', type: 'curriculum',
        subjects: {
            math: { score: 88, avg: 70.8, dev: 61.1, rank: '295/2010' },
            japanese: { score: 84, avg: 63.7, dev: 62.5, rank: '183/2010' },
            science: { score: 29, avg: 31.9, dev: 45.2, rank: '1332/2010' },
            social: { score: 46, avg: 37.2, dev: 63.2, rank: '55/2010' },
        },
        total4: { score: 247, avg: 203.8, dev: 65.4, rank: '102/2010' }
    },
    {
        id: 't20250301', date: '2025/03/01', name: 'カリ上3-4', type: 'curriculum',
        subjects: {
            math: { score: 94, avg: 75.5, dev: 62.1, rank: '166/1937' },
            japanese: { score: 71, avg: 70.1, dev: 50.5, rank: '986/1937' },
            science: { score: 42, avg: 37.1, dev: 55.8, rank: '538/1937' },
            social: { score: 46, avg: 40.2, dev: 58.0, rank: '261/1937' },
        },
        total4: { score: 253, avg: 223.0, dev: 58.9, rank: '341/1937' }
    },
    {
        id: 't20250215', date: '2025/02/15', name: 'カリ上1-2', type: 'curriculum',
        subjects: {
            math: { score: 88, avg: 69.8, dev: 61.1, rank: '233/1934' },
            japanese: { score: 88, avg: 79.3, dev: 56.5, rank: '486/1934' },
            science: { score: 47, avg: 37.0, dev: 64.2, rank: '63/1934' },
            social: { score: 50, avg: 38.7, dev: 65.4, rank: '1/1934' },
        },
        total4: { score: 273, avg: 224.9, dev: 65.2, rank: '46/1934' }
    },
    {
        id: 't20251109', date: '2025/11/09', name: '4年公開組分-07', type: 'kumiwake',
        subjects: {
            math: { score: 90, avg: 97.1, dev: 48.1, rank: '6082/10342' },
            japanese: { score: 75, avg: 69.4, dev: 52.3, rank: '4080/10342' },
            science: { score: 70, avg: 62.9, dev: 53.8, rank: '3805/10069' },
            social: { score: 87, avg: 60.7, dev: 61.4, rank: '1279/10001' },
        },
        total4: { score: 322, avg: 290.7, dev: 53.4, rank: '3844/10001' }
    },
    {
        id: 't20251005', date: '2025/10/05', name: '4年公開組分-06', type: 'kumiwake',
        subjects: {
            math: { score: 72, avg: 90.9, dev: 44.6, rank: '7317/10413' },
            japanese: { score: 98, avg: 85.8, dev: 54.8, rank: '3473/10413' },
            science: { score: 76, avg: 77.8, dev: 48.9, rank: '6301/10152' },
            social: { score: 81, avg: 66.8, dev: 55.9, rank: '3457/10075' },
        },
        total4: { score: 327, avg: 322.1, dev: 50.5, rank: '5210/10075' }
    },
    {
        id: 't20250831', date: '2025/08/31', name: '4年公開組分-05', type: 'kumiwake',
        subjects: {
            math: { score: 108, avg: 102.9, dev: 51.1, rank: '4812/10431' },
            japanese: { score: 95, avg: 81.0, dev: 55.1, rank: '3397/10431' },
            science: { score: 66, avg: 58.3, dev: 54.2, rank: '3497/10172' },
            social: { score: 84, avg: 60.8, dev: 59.2, rank: '2048/10095' },
        },
        total4: { score: 353, avg: 303.7, dev: 55.0, rank: '3370/10095' }
    },
    {
        id: 't20250712', date: '2025/07/12', name: '4年公開組分-04', type: 'kumiwake',
        subjects: {
            math: { score: 98, avg: 111.1, dev: 46.3, rank: '6478/10008' },
            japanese: { score: 92, avg: 84.0, dev: 53.1, rank: '3945/10008' },
            science: { score: 62, avg: 65.1, dev: 48.4, rank: '5732/9754' },
            social: { score: 73, avg: 58.5, dev: 56.8, rank: '2624/9691' },
        },
        total4: { score: 325, avg: 319.1, dev: 50.6, rank: '4922/9691' }
    },
    {
        id: 't20250426', date: '2025/04/26', name: '4年公開組分-02', type: 'kumiwake',
        subjects: {
            math: { score: 108, avg: 104.3, dev: 51.0, rank: '4593/9951' },
            japanese: { score: 95, avg: 93.7, dev: 50.5, rank: '5057/9951' },
            science: { score: 63, avg: 62.5, dev: 50.2, rank: '5024/9702' },
            social: { score: 50, avg: 61.3, dev: 44.7, rank: '6766/9632' },
        },
        total4: { score: 316, avg: 322.4, dev: 49.2, rank: '5367/9632' }
    },
    {
        id: 't20250308', date: '2025/03/08', name: '4年公開組分-01', type: 'kumiwake',
        subjects: {
            math: { score: 104, avg: 111.4, dev: 47.9, rank: '5673/9334' },
            japanese: { score: 81, avg: 79.0, dev: 50.7, rank: '4463/9334' },
            science: { score: 86, avg: 69.7, dev: 59.6, rank: '1386/9112' },
            social: { score: 77, avg: 66.2, dev: 55.7, rank: '2859/9057' },
        },
        total4: { score: 348, avg: 326.7, dev: 52.5, rank: '3946/9057' }
    },
];
