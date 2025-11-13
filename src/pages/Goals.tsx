import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Goals() {
  const [budget, setBudget] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthlyBudget: 0,
    savingsGoal: 0,
    spent: 0,
    remaining: 0,
    percentageUsed: 0,
    dailyBudget: 0,
    status: '',
    daysRemaining: 0,
    categoryBudgets: {} as Record<string, number>,
  });
  const [profile, setProfile] = useState<{
    uid: string;
    email: string;
    name: string;
    currency: string;
    monthlyBudget: number;
    savingsGoal: number;
    preferences?: any;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    monthlyBudget: '',
    savingsGoal: '',
    food: '',
    transport: '',
    entertainment: '',
    utilities: '',
  });

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const currentDate = new Date();
      const [budgetData, profileData] = await Promise.all([
        userAPI.getBudget(currentDate.getMonth() + 1, currentDate.getFullYear()),
        userAPI.getProfile(),
      ]);

      setProfile(profileData);

      const categoryBudgets = Array.isArray(budgetData?.categoryBreakdown)
        ? budgetData.categoryBreakdown.reduce((acc, item) => {
            if (item?.category) {
              acc[item.category] = item.amount ?? 0;
            }
            return acc;
          }, {} as Record<string, number>)
        : {};
      const normalizedBudget = {
        month: budgetData?.period?.month ?? profileData?.preferences?.defaultBudgetMonth ?? currentDate.getMonth() + 1,
        year: budgetData?.period?.year ?? profileData?.preferences?.defaultBudgetYear ?? currentDate.getFullYear(),
        monthlyBudget: profileData?.monthlyBudget ?? budgetData?.budget?.monthly ?? 0,
        savingsGoal: profileData?.savingsGoal ?? 0,
        spent: budgetData?.budget?.spent ?? 0,
        remaining: budgetData?.budget?.remaining ?? 0,
        percentageUsed: budgetData?.budget?.percentageUsed ?? 0,
        dailyBudget: budgetData?.budget?.dailyBudget ?? 0,
        status: budgetData?.budget?.status ?? '',
        daysRemaining: budgetData?.period?.daysRemaining ?? 0,
        categoryBudgets,
      };

      setBudget(normalizedBudget);
      setFormData({
        monthlyBudget: normalizedBudget.monthlyBudget ? normalizedBudget.monthlyBudget.toString() : '',
        savingsGoal: normalizedBudget.savingsGoal ? normalizedBudget.savingsGoal.toString() : '',
        food: categoryBudgets.Food ? categoryBudgets.Food.toString() : '',
        transport: categoryBudgets.Transport ? categoryBudgets.Transport.toString() : '',
        entertainment: categoryBudgets.Entertainment ? categoryBudgets.Entertainment.toString() : '',
        utilities: categoryBudgets.Utilities ? categoryBudgets.Utilities.toString() : '',
      });
    } catch (error) {
      console.error('Failed to fetch budget:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load budget data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedMonthlyBudget = parseFloat(formData.monthlyBudget) || 0;
    const updatedSavingsGoal = parseFloat(formData.savingsGoal) || 0;

    try {
      const targetMonth = budget.month ?? new Date().getMonth() + 1;
      const targetYear = budget.year ?? new Date().getFullYear();

      await Promise.all([
        userAPI.updateProfile({
          name: profile?.name ?? '',
          currency: profile?.currency ?? 'USD',
          monthlyBudget: updatedMonthlyBudget,
          savingsGoal: updatedSavingsGoal,
          preferences: profile?.preferences ?? {},
        }),
        userAPI.updateBudget({
          month: targetMonth,
          year: targetYear,
          monthlyBudget: updatedMonthlyBudget,
          savingsGoal: updatedSavingsGoal,
          categoryBudgets: {
            Food: parseFloat(formData.food) || 0,
            Transport: parseFloat(formData.transport) || 0,
            Entertainment: parseFloat(formData.entertainment) || 0,
            Utilities: parseFloat(formData.utilities) || 0,
          },
        }),
      ]);
      toast.success('Budget updated successfully');
      setIsEditing(false);
      fetchBudget();
    } catch (error) {
      console.error('Failed to update budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const currency = profile?.currency ?? 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const currentSavings = 5420; // This should come from actual transaction data
  const savingsProgress = budget.savingsGoal
    ? (currentSavings / budget.savingsGoal) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Budget Goals</h1>
            <p className="text-muted-foreground">Set and track your financial goals</p>
          </div>

          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Goals'}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Savings Goal Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Savings</span>
                <span className="font-semibold">{formatCurrency(currentSavings)}</span>
              </div>
              <Progress value={savingsProgress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goal</span>
                <span className="font-semibold">{formatCurrency(budget.savingsGoal)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {savingsProgress.toFixed(1)}% of your savings goal achieved
              </p>
            </CardContent>
          </Card>

          {isEditing ? (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Update Your Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                      <Input
                        id="monthlyBudget"
                        type="number"
                        step="0.01"
                        placeholder="3000.00"
                        value={formData.monthlyBudget}
                        onChange={(e) =>
                          setFormData({ ...formData, monthlyBudget: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="savingsGoal">Savings Goal</Label>
                      <Input
                        id="savingsGoal"
                        type="number"
                        step="0.01"
                        placeholder="15000.00"
                        value={formData.savingsGoal}
                        onChange={(e) =>
                          setFormData({ ...formData, savingsGoal: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Category Budgets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="food">Food</Label>
                        <Input
                          id="food"
                          type="number"
                          step="0.01"
                          placeholder="500.00"
                          value={formData.food}
                          onChange={(e) => setFormData({ ...formData, food: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transport">Transport</Label>
                        <Input
                          id="transport"
                          type="number"
                          step="0.01"
                          placeholder="200.00"
                          value={formData.transport}
                          onChange={(e) =>
                            setFormData({ ...formData, transport: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="entertainment">Entertainment</Label>
                        <Input
                          id="entertainment"
                          type="number"
                          step="0.01"
                          placeholder="150.00"
                          value={formData.entertainment}
                          onChange={(e) =>
                            setFormData({ ...formData, entertainment: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="utilities">Utilities</Label>
                        <Input
                          id="utilities"
                          type="number"
                          step="0.01"
                          placeholder="300.00"
                          value={formData.utilities}
                          onChange={(e) =>
                            setFormData({ ...formData, utilities: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Save Budget Goals
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Your Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Budget Target</span>
                    <span className="font-semibold">{formatCurrency(budget.monthlyBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Savings Goal</span>
                    <span className="font-semibold">{formatCurrency(budget.savingsGoal)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Month Status</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {budget.daysRemaining} days remaining in this cycle
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Spent</p>
                      <p className="text-lg font-semibold">{formatCurrency(budget.spent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</p>
                      <p className="text-lg font-semibold">{formatCurrency(budget.remaining)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Daily Budget</p>
                      <p className="text-lg font-semibold">{formatCurrency(budget.dailyBudget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Usage</p>
                      <p className="text-lg font-semibold">{budget.percentageUsed.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                      <p className="text-lg font-semibold capitalize">{budget.status || 'n/a'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Budgets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(budget.categoryBudgets ?? {}).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm">{category}</span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  {Object.keys(budget.categoryBudgets ?? {}).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No category budgets set yet. Click Edit Goals to add some.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
