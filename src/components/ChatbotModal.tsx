import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiAPI, type AIConversationEntry } from '@/lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const introMessage: Message = {
    id: 'intro',
    role: 'assistant',
    content: "Hello! I'm your AI financial advisor. How can I help you manage your finances better today?",
  };

  const [messages, setMessages] = useState<Message[]>([introMessage]);
  const [conversationHistory, setConversationHistory] = useState<AIConversationEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiAPI.chat({
        message: userMessage.content,
        conversationHistory,
      });

      const updatedHistory = response.conversationHistory ?? [];
      setConversationHistory(updatedHistory);

      const mappedMessages: Message[] = updatedHistory.map((entry, index) => ({
        id: entry.timestamp ? `${entry.timestamp}-${index}` : `${Date.now()}-${index}`,
        role: entry.role,
        content: entry.content,
      }));

      setMessages([introMessage, ...mappedMessages]);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      toast.error('Unable to connect to AI service');
      setMessages((prev) => prev.filter((message) => message.id !== userMessage.id));
      setInput(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 400, y: 400, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, y: 400, scale: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[460px] h-[680px] bg-card rounded-2xl shadow-glow border border-border z-50 flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-primary rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Financial Advisor</h3>
                  <p className="text-xs text-white/80">Powered by AI</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <ReactMarkdown
                          
                          className="prose prose-sm max-w-none text-foreground dark:prose-invert prose-headings:text-foreground prose-strong:text-foreground prose-li:marker:text-muted-foreground"
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your finances..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
