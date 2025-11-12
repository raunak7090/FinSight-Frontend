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
    monthlyBudget: 0,
    savingsGoal: 15000,
    categoryBudgets: {} as Record<string, number>,
  });
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
      const data = await userAPI.getBudget(currentDate.getMonth() + 1, currentDate.getFullYear());
      setBudget(data);
      setFormData({
        monthlyBudget: data.monthlyBudget?.toString() || '',
        savingsGoal: data.savingsGoal?.toString() || '',
        food: data.categoryBudgets?.Food?.toString() || '',
        transport: data.categoryBudgets?.Transport?.toString() || '',
        entertainment: data.categoryBudgets?.Entertainment?.toString() || '',
        utilities: data.categoryBudgets?.Utilities?.toString() || '',
      });
    } catch (error) {
      console.error('Failed to fetch budget:', error);
      toast.error('Failed to load budget data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userAPI.updateBudget({
        monthlyBudget: parseFloat(formData.monthlyBudget),
        savingsGoal: parseFloat(formData.savingsGoal),
        categoryBudgets: {
          Food: parseFloat(formData.food) || 0,
          Transport: parseFloat(formData.transport) || 0,
          Entertainment: parseFloat(formData.entertainment) || 0,
          Utilities: parseFloat(formData.utilities) || 0,
        },
      });
      toast.success('Budget updated successfully');
      setIsEditing(false);
      fetchBudget();
    } catch (error) {
      console.error('Failed to update budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const currentSavings = 5420; // This should come from actual transaction data
  const savingsProgress = (currentSavings / budget.savingsGoal) * 100;

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
                  <CardTitle>Monthly Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatCurrency(budget.monthlyBudget)}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your total monthly spending limit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Budgets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(budget.categoryBudgets).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm">{category}</span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  {Object.keys(budget.categoryBudgets).length === 0 && (
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
