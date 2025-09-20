import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authenticated = request.cookies.get('authenticated')?.value;
    
    if (!authenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const attempts = await prisma.loginAttempt.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    return NextResponse.json({ attempts });

  } catch {
    return NextResponse.json({ error: 'shit broke' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}