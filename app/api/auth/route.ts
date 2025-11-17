import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
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
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: 'Failed to check user',
        details: error?.message || 'Unknown error'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      exists: !!data,
      username: data?.username || null
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
    const supabase = await createClient();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle();

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
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: username.trim(),
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505' || error.message?.includes('UNIQUE') || error.message?.includes('duplicate')) {
        return NextResponse.json({ error: 'Tài khoản đã tồn tại' }, { status: 400 });
      }
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: error?.message || 'Unknown error'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      id: data.id,
      username: data.username
    });
  } catch (error: any) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
