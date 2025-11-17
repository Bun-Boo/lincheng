import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all'; // all, day, week, month, custom
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build date filter
    let tab1Query = supabase.from('orders_tab1').select('*');
    let tab2Query = supabase.from('orders_tab2').select('*');

    if (period === 'day') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      tab1Query = tab1Query.gte('created_at', today).lt('created_at', tomorrowStr);
      tab2Query = tab2Query.gte('created_at', today).lt('created_at', tomorrowStr);
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      tab1Query = tab1Query.gte('created_at', weekAgo.toISOString());
      tab2Query = tab2Query.gte('created_at', weekAgo.toISOString());
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      tab1Query = tab1Query.gte('created_at', monthAgo.toISOString());
      tab2Query = tab2Query.gte('created_at', monthAgo.toISOString());
    } else if (period === 'custom' && startDate && endDate) {
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      tab1Query = tab1Query.gte('created_at', startDate).lt('created_at', endDatePlusOne.toISOString().split('T')[0]);
      tab2Query = tab2Query.gte('created_at', startDate).lt('created_at', endDatePlusOne.toISOString().split('T')[0]);
    }

    // Fetch all data
    const [tab1Result, tab2Result] = await Promise.all([
      tab1Query,
      tab2Query,
    ]);

    if (tab1Result.error) {
      console.error('Tab1 error:', tab1Result.error);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }

    if (tab2Result.error) {
      console.error('Tab2 error:', tab2Result.error);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }

    const tab1Data = tab1Result.data || [];
    const tab2Data = tab2Result.data || [];

    // Calculate Tab 1 statistics
    const tab1Stats: Record<string, number> = {};
    tab1Data.forEach((order: any) => {
      tab1Stats[order.status] = (tab1Stats[order.status] || 0) + 1;
    });
    const tab1StatsArray = Object.entries(tab1Stats).map(([status, count]) => ({
      status,
      count_by_status: count,
    }));

    const tab1Total = {
      total: tab1Data.length,
      total_reported: tab1Data.reduce((sum: number, o: any) => sum + (o.reported_amount || 0), 0),
      total_deposit: tab1Data.reduce((sum: number, o: any) => sum + (o.deposit_amount || 0), 0),
      total_remaining: tab1Data.reduce((sum: number, o: any) => sum + (o.remaining_amount || 0), 0),
      total_quantity: tab1Data.reduce((sum: number, o: any) => sum + (o.quantity || 0), 0),
    };

    // Calculate Tab 2 statistics
    const tab2Stats: Record<string, number> = {};
    tab2Data.forEach((order: any) => {
      tab2Stats[order.status] = (tab2Stats[order.status] || 0) + 1;
    });
    const tab2StatsArray = Object.entries(tab2Stats).map(([status, count]) => ({
      status,
      count_by_status: count,
    }));

    const tab2Total = {
      total: tab2Data.length,
      total_capital: tab2Data.reduce((sum: number, o: any) => sum + (o.capital || 0), 0),
      total_profit: tab2Data.reduce((sum: number, o: any) => sum + (o.profit || 0), 0),
    };

    // Count unique customers
    let uniqueCustomers = 0;
    try {
      if (period !== 'all') {
        // When date filter is applied, count unique phones from orders
        const tab1Phones = tab1Data
          .map((o: any) => o.buyer_phone?.trim())
          .filter((p: string) => p);
        const tab2Phones = tab2Data
          .map((o: any) => o.buyer_phone?.trim())
          .filter((p: string) => p);
        const allPhones = new Set([...tab1Phones, ...tab2Phones]);
        uniqueCustomers = allPhones.size;
      } else {
        // When no date filter, count from customers table
        const { data: customersData } = await supabase
          .from('customers')
          .select('phone')
          .not('phone', 'is', null)
          .neq('phone', '');

        if (customersData && customersData.length > 0) {
          const uniquePhones = new Set(
            customersData
              .map((c: any) => c.phone?.trim())
              .filter((p: string) => p)
          );
          uniqueCustomers = uniquePhones.size;
        }

        // Fallback to orders if customers table is empty
        if (uniqueCustomers === 0) {
          const { data: allTab1Data } = await supabase.from('orders_tab1').select('buyer_phone');
          const { data: allTab2Data } = await supabase.from('orders_tab2').select('buyer_phone');
          
          const allPhones = new Set([
            ...(allTab1Data || []).map((o: any) => o.buyer_phone?.trim()).filter((p: string) => p),
            ...(allTab2Data || []).map((o: any) => o.buyer_phone?.trim()).filter((p: string) => p),
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
        byStatus: tab1StatsArray,
      },
      tab2: {
        total: tab2Total,
        byStatus: tab2StatsArray,
      },
      uniqueCustomers: uniqueCustomers,
    });
  } catch (error) {
    console.error('GET /api/statistics error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
