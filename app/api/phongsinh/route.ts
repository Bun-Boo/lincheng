import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // all, day, week, month, custom
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build date filter
    let query = supabase
      .from('orders_tab2')
      .select('*')
      .eq('status', 'Giao khách');

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
      return NextResponse.json({ error: 'Failed to fetch phong sinh statistics' }, { status: 500 });
    }

    const orders = data || [];
    const totalDeliveredOrders = orders.length;
    const totalProfit = orders.reduce((sum: number, order: any) => sum + (order.profit || 0), 0);
    const phongSinh = totalProfit * 0.1; // 10%

    return NextResponse.json({
      totalDeliveredOrders: totalDeliveredOrders,
      totalProfit: totalProfit,
      phongSinh: phongSinh,
    });
  } catch (error) {
    console.error('Error fetching phong sinh stats:', error);
    return NextResponse.json({ error: 'Failed to fetch phong sinh statistics' }, { status: 500 });
  }
}
