import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ` AND (
        name LIKE ? OR 
        phone LIKE ? OR
        address LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    const customers = db.prepare(query).all(...params);
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = db.prepare(`
      INSERT INTO customers (name, phone, address)
      VALUES (?, ?, ?)
    `).run(
      body.name || '',
      body.phone || '',
      body.address || ''
    );

    return NextResponse.json({ id: result.lastInsertRowid, ...body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const result = db.prepare(`
      UPDATE customers 
      SET name = ?, phone = ?, address = ?
      WHERE id = ?
    `).run(
      body.name || '',
      body.phone || '',
      body.address || '',
      body.id
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ id: body.id, ...body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

