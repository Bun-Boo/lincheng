import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all'; // all, day, week, month, custom
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
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = "AND created_at >= ?";
      dateParams.push(monthAgo.toISOString());
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = "AND DATE(created_at) >= ? AND DATE(created_at) <= ?";
      dateParams.push(startDate, endDate);
    }
    // Tab 1 Statistics
    const tab1StatsQuery = `
      SELECT 
        status,
        COUNT(*) as count_by_status
      FROM orders_tab1
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `;
    const tab1Stats = dateParams.length > 0 
      ? db.prepare(tab1StatsQuery).all(...dateParams)
      : db.prepare(tab1StatsQuery).all();

    const tab1TotalQuery = `
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(reported_amount), 0) as total_reported,
        COALESCE(SUM(deposit_amount), 0) as total_deposit,
        COALESCE(SUM(remaining_amount), 0) as total_remaining,
        COALESCE(SUM(quantity), 0) as total_quantity
      FROM orders_tab1
      WHERE 1=1 ${dateFilter}
    `;
    const tab1Total = dateParams.length > 0
      ? db.prepare(tab1TotalQuery).get(...dateParams) as any
      : db.prepare(tab1TotalQuery).get() as any;

    // Tab 2 Statistics
    const tab2StatsQuery = `
      SELECT 
        status,
        COUNT(*) as count_by_status
      FROM orders_tab2
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `;
    const tab2Stats = dateParams.length > 0
      ? db.prepare(tab2StatsQuery).all(...dateParams)
      : db.prepare(tab2StatsQuery).all();

    const tab2TotalQuery = `
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(capital), 0) as total_capital,
        COALESCE(SUM(profit), 0) as total_profit
      FROM orders_tab2
      WHERE 1=1 ${dateFilter}
    `;
    const tab2Total = dateParams.length > 0
      ? db.prepare(tab2TotalQuery).get(...dateParams) as any
      : db.prepare(tab2TotalQuery).get() as any;

    // Count unique customers by phone
    // If date filter is applied, count from orders. Otherwise, count from customers table
    let uniqueCustomers = 0;
    try {
      if (dateFilter) {
        // When date filter is applied, count unique phones from orders in that period
        const tab1Phones = db.prepare(`SELECT DISTINCT buyer_phone FROM orders_tab1 WHERE buyer_phone IS NOT NULL AND buyer_phone != '' ${dateFilter}`).all(...dateParams) as any[];
        const tab2Phones = db.prepare(`SELECT DISTINCT buyer_phone FROM orders_tab2 WHERE buyer_phone IS NOT NULL AND buyer_phone != '' ${dateFilter}`).all(...dateParams) as any[];
        
        const allPhones = new Set([
          ...tab1Phones.map(p => p.buyer_phone?.trim()).filter(p => p),
          ...tab2Phones.map(p => p.buyer_phone?.trim()).filter(p => p)
        ]);
        uniqueCustomers = allPhones.size;
      } else {
        // When no date filter, count from customers table (more accurate)
        const customersQuery = `
          SELECT COUNT(DISTINCT phone) as unique_count
          FROM customers
          WHERE phone IS NOT NULL AND phone != ''
        `;
        const customersResult = db.prepare(customersQuery).get() as any;
        uniqueCustomers = customersResult?.unique_count || 0;
        
        // Fallback to orders if customers table is empty
        if (uniqueCustomers === 0) {
          const tab1Phones = db.prepare(`SELECT DISTINCT buyer_phone FROM orders_tab1 WHERE buyer_phone IS NOT NULL AND buyer_phone != ''`).all() as any[];
          const tab2Phones = db.prepare(`SELECT DISTINCT buyer_phone FROM orders_tab2 WHERE buyer_phone IS NOT NULL AND buyer_phone != ''`).all() as any[];
          
          const allPhones = new Set([
            ...tab1Phones.map(p => p.buyer_phone?.trim()).filter(p => p),
            ...tab2Phones.map(p => p.buyer_phone?.trim()).filter(p => p)
          ]);
          uniqueCustomers = allPhones.size;
        }
      }
    } catch (error) {
      console.error('Error counting unique customers:', error);
    }

    return NextResponse.json({
      tab1: {
        total: tab1Total,
        byStatus: tab1Stats,
      },
      tab2: {
        total: tab2Total,
        byStatus: tab2Stats,
      },
      uniqueCustomers: uniqueCustomers,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

