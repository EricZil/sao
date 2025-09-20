import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'need user id dipshit' }, { status: 400 });
  }

  const SAO_API_URL = process.env.SAO_API_URL;
  const SAO_API_KEY = process.env.SAO_API_KEY;

  if (!SAO_API_URL || !SAO_API_KEY) {
    return NextResponse.json({ error: 'sao config fucked' }, { status: 500 });
  }

  try {
    const response = await fetch(`${SAO_API_URL}/users/${userId}`, {
      headers: {
        'key': SAO_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'sao api said no' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch {
    return NextResponse.json({ error: 'user fetch fucked' }, { status: 500 });
  }
}