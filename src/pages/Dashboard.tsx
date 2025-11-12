import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { transactionAPI, userAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch transactions
      const transactionData = await transactionAPI.getAll({ limit: 100 });
      
      // Use summary from API response
      const summary = transactionData.summary || {
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        count: 0,
      };

      // Fetch budget
      const currentDate = new Date();
      const budgetData = await userAPI.getBudget(currentDate.getMonth() + 1, currentDate.getFullYear());

      setStats({
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        savings: summary.totalIncome - summary.totalExpenses,
        budget: budgetData.monthlyBudget || 0,
      });

      // Prepare category chart data from transactions
      const categoryMap: Record<string, number> = {};
      transactionData.transactions?.forEach((t: any) => {
        if (t.type === 'expense') {
          categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        }
      });

      const categoryChartData = Object.entries(categoryMap).map(([category, amount]) => ({
        name: category,
        value: amount,
      }));
      setCategoryData(categoryChartData);

      // Prepare monthly data (demo data for now)
      const monthlyChartData = [
        { month: 'Jan', income: 4000, expenses: 2400 },
        { month: 'Feb', income: 3000, expenses: 1398 },
        { month: 'Mar', income: 2000, expenses: 9800 },
        { month: 'Apr', income: 2780, expenses: 3908 },
        { month: 'May', income: 1890, expenses: 4800 },
        { month: 'Jun', income: 2390, expenses: 3800 },
      ];
      setMonthlyData(monthlyChartData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Income"
            value={formatCurrency(stats.totalIncome)}
            icon={DollarSign}
            trend={{ value: '12.5%', isPositive: true }}
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpenses)}
            icon={TrendingDown}
            trend={{ value: '8.2%', isPositive: false }}
          />
          <StatCard
            title="Total Savings"
            value={formatCurrency(stats.savings)}
            icon={TrendingUp}
            trend={{ value: '23.1%', isPositive: true }}
          />
          <StatCard
            title="Monthly Budget"
            value={formatCurrency(stats.budget)}
            icon={Target}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
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
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
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
