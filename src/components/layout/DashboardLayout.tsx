import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ChatbotModal } from '@/components/ChatbotModal';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* Floating AI Chatbot Button */}
      {!isChatOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            size="lg"
            onClick={() => setIsChatOpen(true)}
            className="rounded-full h-14 w-14 shadow-glow"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
