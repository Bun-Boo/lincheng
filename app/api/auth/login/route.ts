import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Simple password hashing function
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Check if password matches hash
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Find user by username
    const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username.trim()) as {
      id: number;
      username: string;
      password_hash: string;
    } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' }, { status: 401 });
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true,
      id: user.id,
      username: user.username
    });
  } catch (error: any) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json({ 
      error: 'Failed to login',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

