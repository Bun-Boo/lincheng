import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { InventoryItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';

    let query = supabase
      .from('orders_inventory')
      .select('*')
      .order('stt', { ascending: true });

    // Search filter
    if (search) {
      const searchPattern = `%${search}%`;
      query = query.or(
        `order_code.ilike.${searchPattern},note.ilike.${searchPattern}`
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

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }

    return NextResponse.json(data as InventoryItem[]);
  } catch (error) {
    console.error('GET /api/orders/inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get max STT
    const { data: maxData } = await supabase
      .from('orders_inventory')
      .select('stt')
      .order('stt', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextStt = maxData?.stt ? maxData.stt + 1 : 1;

    const inventoryData = {
      stt: nextStt,
      product_image: body.product_image || '',
      order_code: body.order_code || '',
      quantity: body.quantity || 0,
      capital: body.capital || 0,
      reported_amount: body.reported_amount || 0,
      profit: body.profit || 0,
      shipping_fee: body.shipping_fee || 0,
      domestic_shipping_fee: body.domestic_shipping_fee || 0,
      status: body.status || 'Kho',
      priority: body.priority || 'Bình thường',
      note: body.note || '',
      sync_id: body.sync_id || crypto.randomUUID(),
    };

    const { data, error } = await supabase
      .from('orders_inventory')
      .insert(inventoryData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
    }

    return NextResponse.json(data as InventoryItem);
  } catch (error) {
    console.error('POST /api/orders/inventory error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
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

    const updatePayload: any = {
      product_image: updateData.product_image || '',
      order_code: updateData.order_code || '',
      quantity: updateData.quantity || 0,
      capital: updateData.capital || 0,
      reported_amount: updateData.reported_amount || 0,
      profit: updateData.profit || 0,
      shipping_fee: updateData.shipping_fee || 0,
      domestic_shipping_fee: updateData.domestic_shipping_fee || 0,
      status: updateData.status || 'Kho',
      priority: updateData.priority || 'Bình thường',
      note: updateData.note || '',
    };
    
    // Only update sync_id if provided (though it shouldn't usually change)
    if (updateData.sync_id) {
      updatePayload.sync_id = updateData.sync_id;
    }

    const { data, error } = await supabase
      .from('orders_inventory')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PUT /api/orders/inventory error:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
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
      .from('orders_inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/orders/inventory error:', error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
