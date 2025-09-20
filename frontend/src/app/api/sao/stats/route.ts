import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'total';

  const SAO_API_URL = process.env.SAO_API_URL;
  const SAO_API_KEY = process.env.SAO_API_KEY;

  if (!SAO_API_URL || !SAO_API_KEY) {
    return NextResponse.json({ error: 'sao config fucked' }, { status: 500 });
  }

  try {
    const endpoint = `stats/${type}`;

    const response = await fetch(`${SAO_API_URL}/${endpoint}`, {
      headers: {
        'key': SAO_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'stats api fucked',
        amount: 0
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch {
    return NextResponse.json({ error: 'stats fucked', amount: 0 }, { status: 500 });
  }
}