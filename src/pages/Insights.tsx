import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Sparkles,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  PiggyBank,
} from 'lucide-react';
import { ChatbotModal } from '@/components/ChatbotModal';
import { motion } from 'framer-motion';
import { insightsAPI, transactionAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type InsightBlock = {
  type: string;
  title?: string;
  insight?: string;
  message?: string;
  icon?: string;
  confidence?: number;
  highlights?: string[];
  tips?: string[];
  priority?: 'low' | 'medium' | 'high';
  data?: Record<string, unknown>;
};

type AnalysisSummary = {
  totalTransactions: number;
  totalExpenses: number;
  totalIncome: number;
  totalSavings: number;
  topCategories?: Array<{ category: string; amount: number; percentage?: string }>;
};

type AnalysisMetadata = {
  analyzedTransactions?: number;
  generatedAt?: string;
  mlModel?: string;
};

export default function Insights() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightBlock[]>([]);
  const [period, setPeriod] = useState<'last_7_days' | 'last_30_days' | 'this_month'>('last_30_days');
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [metadata, setMetadata] = useState<AnalysisMetadata | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  const [currency, setCurrency] = useState('USD');

  const periodOptions: { label: string; value: typeof period; description: string }[] = [
    { label: 'Last 7 Days', value: 'last_7_days', description: 'Quick pulse on weekly spending' },
    { label: 'Last 30 Days', value: 'last_30_days', description: 'Monthly overview with trends' },
    { label: 'This Month', value: 'this_month', description: 'Month-to-date performance' },
  ];

  const iconMap = useMemo(
    () => ({
      greeting: Sparkles,
      recommendation: Sparkles,
      summary: ShieldCheck,
      spending_overview: TrendingUp,
      spending: TrendingUp,
      savings: PiggyBank,
      savings_progress: PiggyBank,
      top_category: TrendingUp,
      risk: TrendingDown,
      opportunity: TrendingUp,
      default: Sparkles,
    }),
    []
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userAPI.getProfile();
        setCurrency(profile?.currency ?? 'USD');
      } catch (error) {
        console.error('Failed to load profile for insights:', error);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    fetchInsights(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchInsights = async (selectedPeriod: typeof period) => {
    setIsLoading(true);
    try {
      const transactionsResponse = await transactionAPI.getAll({ limit: 200 });
      const transactions = transactionsResponse.transactions ?? [];
      const payload = transactions.length
        ? { transactions, period: selectedPeriod }
        : { period: selectedPeriod };

      const response = await insightsAPI.analyze(payload);
      const analysisPayload = response?.analysis ?? response;
      const blocks: InsightBlock[] = Array.isArray(analysisPayload?.insights)
        ? analysisPayload.insights
        : Array.isArray(response)
          ? (response as InsightBlock[])
          : [];

      setInsights(blocks);
      setSummary((analysisPayload?.summary as AnalysisSummary) ?? null);
      setMetadata((response?.metadata as AnalysisMetadata) ?? null);
      setHasData(Boolean(analysisPayload?.hasData ?? blocks.length > 0));
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to load insights');
      setInsights([]);
      setSummary(null);
      setMetadata(null);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (icon?: string, type?: string) => {
    const normalizedIconKey = icon?.toLowerCase().replace(/[^a-z]/g, '_');
    const normalizedTypeKey = type?.toLowerCase().replace(/[^a-z]/g, '_');

    const Icon = (normalizedIconKey && iconMap[normalizedIconKey as keyof typeof iconMap]) ||
      (normalizedTypeKey && iconMap[normalizedTypeKey as keyof typeof iconMap]) ||
      iconMap.default;
    return <Icon className="h-6 w-6 text-primary" />;
  };

  const formatCurrencyValue = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const sanitizeText = (value: string) => {
    return value
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[ ]{2,}/g, ' ')
      .replace(/^\s+|\s+$/g, '');
  };

  const formatDataValue = (key: string, value: unknown) => {
    if (typeof value === 'number') {
      if (/(percent|percentage|rate)/i.test(key)) {
        return `${value.toFixed(1)}%`;
      }
      if (/(count|transactions)/i.test(key)) {
        return value.toLocaleString();
      }
      if (/(amount|expense|income|savings|total)/i.test(key)) {
        return formatCurrencyValue(value);
      }
      return value.toLocaleString();
    }

    if (typeof value === 'string') {
      const sanitizedValue = sanitizeText(value);
      const numeric = Number(sanitizedValue);
      if (!Number.isNaN(numeric) && value.trim() !== '') {
        if (/(percent|percentage|rate)/i.test(key)) {
          return `${numeric.toFixed(1)}%`;
        }
        if (/(amount|expense|income|savings|total)/i.test(key)) {
          return formatCurrencyValue(numeric);
        }
      }
      return sanitizedValue;
    }

    return Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
  };

  const formatLabel = (label: string) => {
    return label
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  };

  const renderMessage = (message: string) => {
    const sanitizedMessage = sanitizeText(message);
    if (!sanitizedMessage) return null;

    const lines = sanitizedMessage.split('\n');
    return lines.map((line, lineIndex) => (
      <span key={`${lineIndex}-${line}`} className={lineIndex > 0 ? 'block mt-1' : undefined}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((segment, segmentIndex) =>
          segment.startsWith('**') && segment.endsWith('**') ? (
            <strong key={`${lineIndex}-${segmentIndex}`}>{segment.slice(2, -2)}</strong>
          ) : (
            <span key={`${lineIndex}-${segmentIndex}`}>{segment}</span>
          )
        )}
      </span>
    ));
  };

  const renderDataDetails = (data?: Record<string, unknown>) => {
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">{formatLabel(key)}</span>
            <span className="font-medium">{formatDataValue(key, value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderPriority = (priority?: 'low' | 'medium' | 'high') => {
    if (!priority) return null;

    const styles: Record<typeof priority, string> = {
      low: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-900',
      medium: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-900',
      high: 'bg-destructive/10 text-destructive border-destructive/30',
    };

    return (
      <Badge variant="outline" className={`${styles[priority]} capitalize`}>
        {priority} priority
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">AI Insights</h1>
              <p className="text-muted-foreground">
                Personalized guidance generated from your recent transactions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {periodOptions.map(({ label, value }) => (
                <Button
                  key={value}
                  variant={period === value ? 'default' : 'outline'}
                  onClick={() => setPeriod(value)}
                  size="sm"
                  disabled={isLoading && period === value}
                >
                  {label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchInsights(period)}
                disabled={isLoading}
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-dashed">
            <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Automated Spending Review</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    We analyze your recent activity to highlight important patterns and opportunities.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setIsChatOpen(true)} className="shadow-glow">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask the Assistant
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Generating insights…</div>
              ) : !hasData ? (
                <div className="py-12 text-center text-muted-foreground">
                  We couldn’t find recent transactions to analyze. Try logging new activity or adjust your
                  filters, then refresh.
                </div>
              ) : insights.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No insights available yet.</div>
              ) : (
                <ScrollArea className="h-[560px] max-h-[560px] pr-4">
                  <div className="grid gap-4">
                    {insights.map((block, index) => (
                      <motion.div
                        key={`${block.type}-${index}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-border rounded-xl p-4 bg-card/60"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            {renderIcon(block.icon, block.type)}
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  {block.type?.replace(/_/g, ' ') ?? 'Insight'}
                                </p>
                                {renderPriority(block.priority)}
                              </div>
                              <h3 className="text-lg font-semibold">
                                {sanitizeText(
                                  (block.title ?? block.message?.split('.')?.[0] ?? 'Quick Insight').replace(
                                    /\*\*/g,
                                    ''
                                  )
                                )}
                              </h3>
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed">
                              {renderMessage(block.message ?? block.insight ?? '')}
                            </div>

                            {block.highlights?.length ? (
                              <ul className="pl-4 text-sm space-y-1 list-disc text-muted-foreground">
                                {block.highlights.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            ) : null}

                            {block.tips?.length ? (
                              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-primary mb-2">
                                  Suggested Actions
                                </p>
                                <ul className="space-y-2">
                                  {block.tips.map((tip, idx) => (
                                    <li key={idx} className="text-sm text-primary-foreground/80 leading-relaxed">
                                      • {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            {renderDataDetails(block.data)}

                            {typeof block.confidence === 'number' ? (
                              <p className="text-xs text-muted-foreground">
                                Confidence: {(block.confidence * 100).toFixed(0)}%
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {summary && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A quick snapshot of your financial activity for the selected period.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Transactions</p>
                    <p className="text-xl font-semibold">{summary.totalTransactions.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Income</p>
                    <p className="text-xl font-semibold">{formatCurrencyValue(summary.totalIncome)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Expenses</p>
                    <p className="text-xl font-semibold">{formatCurrencyValue(summary.totalExpenses)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Savings</p>
                    <p className="text-xl font-semibold">{formatCurrencyValue(summary.totalSavings)}</p>
                  </div>
                </div>

                {summary.topCategories?.length ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Top Spending Categories</p>
                    <div className="space-y-2">
                      {summary.topCategories.map((category) => (
                        <div
                          key={category.category}
                          className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
                        >
                          <span>{category.category}</span>
                          <span className="font-medium">
                            {formatCurrencyValue(category.amount)}
                            {category.percentage ? ` • ${Number(category.percentage).toFixed(0)}%` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {metadata && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {metadata.analyzedTransactions !== undefined && (
                      <span>
                        Analyzed {metadata.analyzedTransactions.toLocaleString()} transaction
                        {metadata.analyzedTransactions === 1 ? '' : 's'}
                      </span>
                    )}
                    {metadata.generatedAt && (
                      <span>
                        Generated {new Date(metadata.generatedAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    )}
                    {metadata.mlModel && <span>Model: {metadata.mlModel}</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </DashboardLayout>
  );
}
