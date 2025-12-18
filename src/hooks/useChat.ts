import { useState, useCallback } from 'react';
import { Message, Attachment } from '@/types/chat';
import { sendMessageToApi, getDailyUsage } from '@/lib/chatApi';
import { toast } from 'sonner';

const mockOlderMessages: Message[] = [
  {
    id: 'old-1',
    role: 'user',
    content: 'Hey, this is an older message for testing scroll loading!',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 'old-2',
    role: 'assistant',
    content: 'Yes! This demonstrates the infinite scroll feature. When you scroll to the top, older messages load automatically.',
    timestamp: new Date(Date.now() - 3500000),
  },
  {
    id: 'old-3',
    role: 'user',
    content: 'That\'s really cool! How does it work?',
    timestamp: new Date(Date.now() - 3400000),
  },
  {
    id: 'old-4',
    role: 'assistant',
    content: 'It uses a scroll event listener to detect when you\'re near the top of the chat, then fetches more messages. In production, this would call your API.',
    timestamp: new Date(Date.now() - 3300000),
  },
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [olderLoadCount, setOlderLoadCount] = useState(0);
  const [dailyUsage, setDailyUsage] = useState(getDailyUsage());

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare context: include previous messages + new user message
      const contextMessages = [...messages, userMessage];

      const responseContent = await sendMessageToApi(contextMessages);
      setDailyUsage(getDailyUsage()); // Update usage after success

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      toast.error(error.message || "Failed to send message");

      // Optional: Remove the user message if it failed? 
      // For now, let's keep it but maybe mark as error (not implemented in UI yet)
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasOlderMessages) return;

    setIsLoadingOlder(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (olderLoadCount < 2) {
      const olderMessagesWithNewIds = mockOlderMessages.map((msg, index) => ({
        ...msg,
        id: `${msg.id}-batch-${olderLoadCount}-${index}`,
        timestamp: new Date(msg.timestamp.getTime() - olderLoadCount * 4000000),
      }));

      setMessages(prev => [...olderMessagesWithNewIds, ...prev]);
      setOlderLoadCount(prev => prev + 1);
    } else {
      setHasOlderMessages(false);
    }

    setIsLoadingOlder(false);
  }, [isLoadingOlder, hasOlderMessages, olderLoadCount]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setOlderLoadCount(0);
    setHasOlderMessages(true);
  }, []);

  return {
    messages,
    isLoading,
    isLoadingOlder,
    hasOlderMessages,
    sendMessage,
    clearMessages,
    loadOlderMessages,
    dailyUsage,
  };
};
