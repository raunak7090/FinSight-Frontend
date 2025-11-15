import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { transactionAPI, userAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

type TrendInfo = {
  value: string;
  isPositive: boolean;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    budget: 0,
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all_time' | 'today' | 'this_week' | 'this_month'>('this_month');
  const [currency, setCurrency] = useState('USD');
  const [statTrends, setStatTrends] = useState<{
    income?: TrendInfo;
    expenses?: TrendInfo;
    savings?: TrendInfo;
    budget?: TrendInfo;
  }>({});

  const timeframeOptions: { label: string; value: typeof timeframe }[] = [
    { label: 'All Time', value: 'all_time' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
  ];

  useEffect(() => {
    fetchDashboardData(timeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const getDateRange = (range: typeof timeframe) => {
    const now = new Date();
    const end = new Date(now);

    switch (range) {
      case 'today': {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return { startDate: start.toISOString(), endDate: end.toISOString() };
      }
      case 'this_week': {
        const start = new Date(now);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return { startDate: start.toISOString(), endDate: end.toISOString() };
      }
      case 'this_month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return { startDate: start.toISOString(), endDate: end.toISOString() };
      }
      default:
        return {};
    }
  };

  const getPreviousDateRange = (range: typeof timeframe) => {
    const now = new Date();

    switch (range) {
      case 'today': {
        const start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { startDate: start.toISOString(), endDate: end.toISOString() };
      }
      case 'this_week': {
        const currentWeekStart = new Date(now);
        const day = currentWeekStart.getDay();
        const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1);
        currentWeekStart.setDate(diff);
        currentWeekStart.setHours(0, 0, 0, 0);

        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(previousWeekStart.getDate() - 7);

        const previousWeekEnd = new Date(previousWeekStart);
        previousWeekEnd.setDate(previousWeekEnd.getDate() + 6);
        previousWeekEnd.setHours(23, 59, 59, 999);

        return {
          startDate: previousWeekStart.toISOString(),
          endDate: previousWeekEnd.toISOString(),
        };
      }
      case 'this_month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return { startDate: start.toISOString(), endDate: end.toISOString() };
      }
      default:
        return null;
    }
  };

  const buildChartData = (transactions: any[], range: typeof timeframe) => {
    const buckets = new Map<
      string,
      {
        label: string;
        income: number;
        expenses: number;
        sortValue: number;
      }
    >();

    transactions.forEach((transaction) => {
      if (!transaction?.date) return;
      const txDate = new Date(transaction.date);
      if (Number.isNaN(txDate.getTime())) return;

      let key: string;
      let label: string;
      let sortValue: number;

      if (range === 'all_time') {
        key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        label = `${txDate.toLocaleString(undefined, { month: 'short' })} ${txDate.getFullYear()}`;
        sortValue = new Date(txDate.getFullYear(), txDate.getMonth(), 1).getTime();
      } else {
        key = txDate.toISOString().split('T')[0];
        label = txDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        sortValue = new Date(key).getTime();
      }

      const bucket = buckets.get(key) ?? { label, income: 0, expenses: 0, sortValue };
      if (transaction.type === 'income') {
        bucket.income += Number(transaction.amount) || 0;
      } else if (transaction.type === 'expense') {
        bucket.expenses += Number(transaction.amount) || 0;
      }
      buckets.set(key, bucket);
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.sortValue - b.sortValue)
      .map(({ sortValue, ...rest }) => rest);
  };

  const fetchDashboardData = async (range: typeof timeframe) => {
    try {
      setIsLoading(true);
      setStatTrends({});

      const dateRange = getDateRange(range);
      const previousDateRange = getPreviousDateRange(range);

      const transactionParams: {
        limit: number;
        startDate?: string;
        endDate?: string;
      } = { limit: 500 };

      if (dateRange.startDate) {
        transactionParams.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        transactionParams.endDate = dateRange.endDate;
      }

      const currentDate = new Date();

      const previousTransactionParams = previousDateRange
        ? {
            limit: transactionParams.limit,
            startDate: previousDateRange.startDate,
            endDate: previousDateRange.endDate,
          }
        : null;

      const previousTransactionsPromise = previousTransactionParams
        ? transactionAPI
            .getAll(previousTransactionParams)
            .catch((error) => {
              console.error('Failed to fetch previous transactions:', error);
              return null;
            })
        : Promise.resolve(null);

      const [transactionData, budgetData, profileData, previousTransactionData] = await Promise.all([
        transactionAPI.getAll(transactionParams),
        userAPI.getBudget(currentDate.getMonth() + 1, currentDate.getFullYear()),
        userAPI.getProfile(),
        previousTransactionsPromise,
      ]);

      const currencyCode = profileData?.currency ?? 'USD';
      setCurrency(currencyCode);
      const currencyFormatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
      });

      const transactions = transactionData.transactions || [];

      const totals = transactions.reduce(
        (acc, transaction) => {
          const amount = Number(transaction.amount) || 0;
          if (transaction.type === 'income') {
            acc.income += amount;
          } else if (transaction.type === 'expense') {
            acc.expense += amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      );

      const previousTransactions = previousTransactionData?.transactions ?? [];
      const previousTotals = previousTransactions.length
        ? previousTransactions.reduce(
            (acc, transaction) => {
              const amount = Number(transaction.amount) || 0;
              if (transaction.type === 'income') {
                acc.income += amount;
              } else if (transaction.type === 'expense') {
                acc.expense += amount;
              }
              return acc;
            },
            { income: 0, expense: 0 }
          )
        : { income: 0, expense: 0 };

      const budgetInfo = {
        monthly: budgetData?.budget?.monthly ?? profileData?.monthlyBudget ?? 0,
      };

      const budgetRemaining = typeof budgetData?.budget?.remaining === 'number'
        ? budgetData.budget.remaining
        : budgetInfo.monthly - totals.expense;

      setStats({
        totalIncome: totals.income,
        totalExpenses: totals.expense,
        savings: totals.income - totals.expense,
        budget: budgetInfo.monthly,
      });

      const formatTrendDelta = (diff: number): TrendInfo => {
        const formatted = currencyFormatter.format(Math.abs(diff));
        const value = diff < 0 ? `-${formatted}` : formatted;
        return {
          value,
          isPositive: diff >= 0,
        };
      };

      setStatTrends({
        income: formatTrendDelta(totals.income - previousTotals.income),
        expenses: formatTrendDelta(previousTotals.expense - totals.expense),
        savings: formatTrendDelta(
          totals.income - totals.expense - (previousTotals.income - previousTotals.expense)
        ),
        budget: formatTrendDelta(budgetRemaining),
      });

      // Prepare category chart data from filtered transactions
      const categoryMap: Record<string, number> = {};
      transactions.forEach((t: any) => {
        if (t.type === 'expense') {
          categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        }
      });

      const categoryChartData = Object.entries(categoryMap).map(([category, amount]) => ({
        name: category,
        value: amount,
      }));
      setCategoryData(categoryChartData);

      const monthlyChartData = buildChartData(transactions, range);
      setMonthlyData(monthlyChartData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatAxisValue = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {timeframeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeframe === option.value ? 'default' : 'outline'}
                onClick={() => setTimeframe(option.value)}
                size="sm"
                className="flex-1 min-w-[140px] sm:flex-initial"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Income"
            value={formatCurrency(stats.totalIncome)}
            icon={DollarSign}
            trend={statTrends.income}
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpenses)}
            icon={TrendingDown}
            trend={statTrends.expenses}
          />
          <StatCard
            title="Total Savings"
            value={formatCurrency(stats.savings)}
            icon={TrendingUp}
            trend={statTrends.savings}
          />
          <StatCard
            title="Monthly Budget"
            value={formatCurrency(stats.budget)}
            icon={Target}
            trend={statTrends.budget}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-4">
              <div className="h-[260px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" hide={monthlyData.length > 12} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={formatAxisValue}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="hsl(var(--chart-2))" name="Income" />
                    <Bar dataKey="expenses" fill="hsl(var(--chart-5))" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-4">
              {categoryData.length > 0 ? (
                <div className="h-[260px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[260px] sm:h-[300px] text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
