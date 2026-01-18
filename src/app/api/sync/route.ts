import { NextResponse } from 'next/server';

// In-memory store for development (resets on server restart)
// For production, replace this with Vercel KV or a real database.
const globalStore = new Map<string, any>();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { data } = body;

        // Generate a simple 6-digit ID
        const id = Math.floor(100000 + Math.random() * 900000).toString();

        // Store data (expires in 24 hours logic could be added here if using real DB)
        globalStore.set(id, data);
        console.log(`[Sync] Stored data for ID: ${id}`);

        return NextResponse.json({ id, success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const data = globalStore.get(id);

    if (!data) {
        return NextResponse.json({ error: 'ID not found or expired' }, { status: 404 });
    }

    return NextResponse.json({ data, success: true });
}
