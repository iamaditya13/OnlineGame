import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find or create user
    // NOTE: In a real app, you would verify a token or password here.
    // For this wireframe-to-production step, we keep it simple but "real".
    let user = await User.findOne({ username });

    if (!user) {
      user = await User.create({
        username,
        hasSeenTutorial: false,
        wins: 0,
        losses: 0,
        draws: 0,
      });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
