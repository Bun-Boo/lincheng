import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // all, day, week, month, custom
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build date filter
    let dateFilter = '';
    const dateParams: string[] = [];

    if (period === 'day') {
      const today = new Date().toISOString().split('T')[0];
      dateFilter = "AND DATE(created_at) = ?";
      dateParams.push(today);
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = "AND created_at >= ?";
      dateParams.push(weekAgo.toISOString());
    } else if (period === 'month') {
      // Current month from day 1
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = "AND DATE(created_at) >= ?";
      dateParams.push(firstDay.toISOString().split('T')[0]);
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = "AND DATE(created_at) >= ? AND DATE(created_at) <= ?";
      dateParams.push(startDate, endDate);
    }

    // Count orders with status "Giao khách" from tab2
    const deliveredOrdersQuery = `
      SELECT COUNT(*) as total
      FROM orders_tab2
      WHERE status = 'Giao khách' ${dateFilter}
    `;
    const deliveredOrders = dateParams.length > 0
      ? db.prepare(deliveredOrdersQuery).get(...dateParams) as any
      : db.prepare(deliveredOrdersQuery).get() as any;

    // Calculate total profit from tab2 with status "Giao khách"
    const totalProfitQuery = `
      SELECT COALESCE(SUM(profit), 0) as total_profit
      FROM orders_tab2
      WHERE status = 'Giao khách' ${dateFilter}
    `;
    const totalProfit = dateParams.length > 0
      ? db.prepare(totalProfitQuery).get(...dateParams) as any
      : db.prepare(totalProfitQuery).get() as any;

    const totalProfitValue = totalProfit?.total_profit || 0;
    const phongSinh = totalProfitValue * 0.1; // 10%

    return NextResponse.json({
      totalDeliveredOrders: deliveredOrders?.total || 0,
      totalProfit: totalProfitValue,
      phongSinh: phongSinh,
    });
  } catch (error) {
    console.error('Error fetching phong sinh stats:', error);
    return NextResponse.json({ error: 'Failed to fetch phong sinh statistics' }, { status: 500 });
  }
}

