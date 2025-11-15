import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { OrderTab2 } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const period = searchParams.get('period') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    let query = 'SELECT * FROM orders_tab2 WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ` AND (
        buyer_name LIKE ? OR 
        order_code LIKE ? OR 
        buyer_phone LIKE ? OR
        buyer_address LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Date filter
    if (period === 'day') {
      const today = new Date().toISOString().split('T')[0];
      query += ' AND DATE(created_at) = ?';
      params.push(today);
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query += ' AND created_at >= ?';
      params.push(weekAgo.toISOString());
    } else if (period === 'month') {
      // Current month from day 1
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      query += ' AND DATE(created_at) >= ?';
      params.push(firstDay.toISOString().split('T')[0]);
    } else if (period === 'custom' && startDate && endDate) {
      query += ' AND DATE(created_at) >= ? AND DATE(created_at) <= ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY stt ASC';

    const orders = db.prepare(query).all(...params) as OrderTab2[];
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const maxStt = db.prepare('SELECT MAX(stt) as max FROM orders_tab2').get() as { max: number | null };
    const nextStt = (maxStt?.max || 0) + 1;

    const reportedAmount = body.reported_amount || 0;
    const capital = body.capital || 0;
    const profit = reportedAmount - capital;
    const shippingFee = body.shipping_fee || 0;

    const order: OrderTab2 = {
      stt: nextStt,
      product_image: body.product_image || '',
      buyer_name: body.buyer_name || '',
      buyer_phone: body.buyer_phone || '',
      buyer_address: body.buyer_address || '',
      order_code: body.order_code || '',
      reported_amount: reportedAmount,
      capital: capital,
      profit: profit,
      shipping_fee: shippingFee,
      status: body.status || 'chưa lên đơn',
      priority: body.priority || 'Bình thường',
      created_at: new Date().toISOString(),
    };

    const result = db.prepare(`
      INSERT INTO orders_tab2 (
        stt, product_image, buyer_name, buyer_phone, buyer_address,
        order_code, reported_amount, capital, profit, shipping_fee,
        status, priority, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      order.stt,
      order.product_image,
      order.buyer_name,
      order.buyer_phone,
      order.buyer_address,
      order.order_code,
      order.reported_amount,
      order.capital,
      order.profit,
      order.shipping_fee,
      order.status,
      order.priority,
      order.created_at
    );

    return NextResponse.json({ id: result.lastInsertRowid, ...order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const reportedAmount = updateData.reported_amount || 0;
    const capital = updateData.capital || 0;
    const profit = reportedAmount - capital;
    const shippingFee = updateData.shipping_fee || 0;

    db.prepare(`
      UPDATE orders_tab2 SET
        product_image = ?,
        buyer_name = ?,
        buyer_phone = ?,
        buyer_address = ?,
        order_code = ?,
        reported_amount = ?,
        capital = ?,
        profit = ?,
        shipping_fee = ?,
        status = ?,
        priority = ?
      WHERE id = ?
    `).run(
      updateData.product_image || '',
      updateData.buyer_name || '',
      updateData.buyer_phone || '',
      updateData.buyer_address || '',
      updateData.order_code || '',
      reportedAmount,
      capital,
      profit,
      shippingFee,
      updateData.status || 'chưa lên đơn',
      updateData.priority || 'Bình thường',
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM orders_tab2 WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}

