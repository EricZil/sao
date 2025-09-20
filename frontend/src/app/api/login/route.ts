import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!password) {
      await prisma.loginAttempt.create({
        data: {
          password: '',
          success: false,
          ip,
          userAgent,
        },
      });
      
      return NextResponse.json({ error: 'i aint stupid bozo' }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: { isActive: true }
    });

    if (users.length === 0) {
      await prisma.loginAttempt.create({
        data: {
          password,
          success: false,
          ip,
          userAgent,
        },
      });
      
      return NextResponse.json({ error: 'who the fuck are you?' }, { status: 401 });
    }

    let isValid = false;

    for (const user of users) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        isValid = true;
        break;
      }
    }

    await prisma.loginAttempt.create({
      data: {
        password,
        success: isValid,
        ip,
        userAgent,
      },
    });

    if (!isValid) {
      return NextResponse.json({ error: 'who the fuck are you?' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('authenticated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: undefined
    });

    return response;

  } catch {
    return NextResponse.json({ error: 'system fucked up' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}