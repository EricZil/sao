import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 64; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendSlackDM(slackId: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: slackId,
        text: `you've been granted admin access to the SAO panel\n\n*your password:* \`${password}\`\n\ndon't lose this - we ain't doing password resets \n\naccess: https://sao.eryxks.dev/`,
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok || !responseData.ok) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = request.cookies.get('authenticated')?.value;
    if (!authenticated) {
      return NextResponse.json({ error: 'who tf are you?' }, { status: 401 });
    }

    const { slackId } = await request.json();

    if (!slackId || !slackId.trim()) {
      return NextResponse.json({ error: 'need a slack id duh' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { slackId: slackId.trim() }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'already admin bruh' }, { status: 400 });
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const newAdmin = await prisma.user.create({
      data: {
        password: hashedPassword,
        slackId: slackId.trim(),
        isActive: true,
      },
    });

    const dmSent = await sendSlackDM(slackId, plainPassword);

    if (!dmSent) {
      await prisma.user.delete({
        where: { id: newAdmin.id }
      });
      return NextResponse.json({ error: 'wtf is this slack id' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `added. password sent to ${slackId}` 
    });

  } catch {
    return NextResponse.json({ error: 'this shit is broken asf' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}