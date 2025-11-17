import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { OrderTab1 } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const period = searchParams.get('period') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    let query = supabase
      .from('orders_tab1')
      .select('*')
      .order('stt', { ascending: true });

    // Search filter (LIKE queries)
    if (search) {
      const searchPattern = `%${search}%`;
      query = query.or(
        `buyer_name.ilike.${searchPattern},order_code.ilike.${searchPattern},buyer_phone.ilike.${searchPattern},buyer_address.ilike.${searchPattern}`
      );
    }

    // Status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Priority filter
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Date filter
    if (period === 'day') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      query = query.gte('created_at', today).lt('created_at', tomorrowStr);
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (period === 'month') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      query = query.gte('created_at', firstDay.toISOString());
    } else if (period === 'custom' && startDate && endDate) {
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      query = query.gte('created_at', startDate).lt('created_at', endDatePlusOne.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json(data as OrderTab1[]);
  } catch (error) {
    console.error('GET /api/orders/tab1 error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get max STT
    const { data: maxData } = await supabase
      .from('orders_tab1')
      .select('stt')
      .order('stt', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextStt = maxData?.stt ? maxData.stt + 1 : 1;

    const reportedAmount = body.reported_amount || 0;
    const depositAmount = body.deposit_amount || 0;
    const shippingFee = body.shipping_fee || 0;
    const remainingAmount = Math.max(0, reportedAmount - depositAmount + shippingFee);

    const orderData = {
      stt: nextStt,
      product_image: body.product_image || '',
      buyer_name: body.buyer_name || '',
      buyer_phone: body.buyer_phone || '',
      buyer_address: body.buyer_address || '',
      order_code: body.order_code || '',
      quantity: body.quantity || 0,
      reported_amount: reportedAmount,
      deposit_amount: depositAmount,
      shipping_fee: shippingFee,
      remaining_amount: remainingAmount,
      status: body.status || 'chưa lên đơn',
      priority: body.priority || 'Bình thường',
    };

    const { data, error } = await supabase
      .from('orders_tab1')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json(data as OrderTab1);
  } catch (error) {
    console.error('POST /api/orders/tab1 error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const reportedAmount = updateData.reported_amount || 0;
    const depositAmount = updateData.deposit_amount || 0;
    const shippingFee = updateData.shipping_fee || 0;
    const remainingAmount = Math.max(0, reportedAmount - depositAmount + shippingFee);

    const updatePayload = {
      product_image: updateData.product_image || '',
      buyer_name: updateData.buyer_name || '',
      buyer_phone: updateData.buyer_phone || '',
      buyer_address: updateData.buyer_address || '',
      order_code: updateData.order_code || '',
      quantity: updateData.quantity || 0,
      reported_amount: reportedAmount,
      deposit_amount: depositAmount,
      shipping_fee: shippingFee,
      remaining_amount: remainingAmount,
      status: updateData.status || 'chưa lên đơn',
      priority: updateData.priority || 'Bình thường',
    };

    const { data, error } = await supabase
      .from('orders_tab1')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PUT /api/orders/tab1 error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('orders_tab1')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/orders/tab1 error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
