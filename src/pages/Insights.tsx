import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatbotModal } from '@/components/ChatbotModal';
import { motion } from 'framer-motion';

export default function Insights() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">Get personalized financial advice powered by AI</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="p-6 bg-primary/10 rounded-full mb-6">
            <Sparkles className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Get Smart Financial Insights</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Our AI assistant can help you understand your spending patterns, create budgets, and make
            better financial decisions.
          </p>
          <Button size="lg" onClick={() => setIsChatOpen(true)} className="shadow-glow">
            <MessageSquare className="mr-2 h-5 w-5" />
            Open AI Insights
          </Button>
        </motion.div>
      </div>

      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </DashboardLayout>
  );
}
