import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'need a user ID dickhead' }, { status: 400 });
    }

    const token = process.env.SLACK_API_KEY;
    if (!token) {
      return NextResponse.json({ error: 'slack token fucked' }, { status: 500 });
    }

    const userInfoResponse = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const userInfo = await userInfoResponse.json();

    if (!userInfo.ok) {
      return NextResponse.json({ 
        error: userInfo.error === 'user_not_found' ? 'user not found' : 'slack api said no'
      }, { status: 404 });
    }

    const profileResponse = await fetch(`https://slack.com/api/users.profile.get?user=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const profileInfo = await profileResponse.json();
    
    const conversationsResponse = await fetch(`https://slack.com/api/users.conversations?user=${userId}&types=public_channel,private_channel,mpim,im&limit=100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const conversations = await conversationsResponse.json();

    return NextResponse.json({
      user: userInfo.user,
      profile: profileInfo.ok ? profileInfo.profile : null,
      conversations: conversations.ok ? conversations.channels : []
    });

  } catch {
    return NextResponse.json({ error: 'shit broke while fetching' }, { status: 500 });
  }
}