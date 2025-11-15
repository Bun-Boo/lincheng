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

// Check if user exists
export async function GET(request: NextRequest) {
  try {
    const user = db.prepare('SELECT id, username FROM users LIMIT 1').get() as { id: number; username: string } | undefined;
    
    return NextResponse.json({ 
      exists: !!user,
      username: user?.username || null
    });
  } catch (error: any) {
    console.error('GET /api/auth error:', error);
    return NextResponse.json({ 
      error: 'Failed to check user',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// Register new user (only if no user exists)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
    if (existingUser) {
      return NextResponse.json({ error: 'Tài khoản đã tồn tại. Chỉ được có 1 tài khoản duy nhất.' }, { status: 400 });
    }

    // Validate username and password
    if (username.trim().length < 3) {
      return NextResponse.json({ error: 'Tên đăng nhập phải có ít nhất 3 ký tự' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 4 ký tự' }, { status: 400 });
    }

    // Hash password and create user
    const passwordHash = hashPassword(password);
    
    const result = db.prepare(`
      INSERT INTO users (username, password_hash)
      VALUES (?, ?)
    `).run(username.trim(), passwordHash);

    return NextResponse.json({ 
      success: true,
      id: result.lastInsertRowid,
      username: username.trim()
    });
  } catch (error: any) {
    console.error('POST /api/auth error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Tài khoản đã tồn tại' }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}


