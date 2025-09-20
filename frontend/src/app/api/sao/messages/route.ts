import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  const SAO_API_URL = process.env.SAO_API_URL;
  const SAO_API_KEY = process.env.SAO_API_KEY;

  if (!SAO_API_URL || !SAO_API_KEY) {
    return NextResponse.json({ error: 'sao config fucked' }, { status: 500 });
  }

  try {
    const endpoint = type === 'all' ? 'messages/all' : 
                   type === 'open' ? 'messages/open' : 
                   'messages/closed';

    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(`${SAO_API_URL}/${endpoint}`, {
      headers: {
        'key': SAO_API_KEY,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return NextResponse.json({ 
        messages: [], 
        error: 'sao api fucked'
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }
}