import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Use environment variables for connection
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const KEY = 'studyapp:v1';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tasks, tests, updatedAt } = body;

        // Save to Redis
        await redis.set(KEY, { tasks, tests, updatedAt });

        console.log(`[Sync] Saved data to Redis. UpdatedAt: ${updatedAt}`);

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[Sync] POST Error:', e);
        return NextResponse.json({ ok: false, error: 'Failed to save data to cloud' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const data = await redis.get(KEY) as any;

        if (!data) {
            // No data in cloud yet, returning null data is not an error, just empty
            return NextResponse.json({ ok: true, data: null });
        }

        // Ensure data integrity
        if (!Array.isArray(data.tasks)) data.tasks = [];
        if (!Array.isArray(data.tests)) data.tests = [];
        if (typeof data.updatedAt !== 'number') data.updatedAt = 0;

        return NextResponse.json({ ok: true, data });
    } catch (e) {
        console.error('[Sync] GET Error:', e);
        return NextResponse.json({ ok: false, error: 'Failed to fetch data from cloud' }, { status: 500 });
    }
}
