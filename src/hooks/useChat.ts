import { useState, useCallback } from 'react';
import { Message, Attachment } from '@/types/chat';

const mockResponses = [
  "That's a great question! I'm here to help you with anything you need. Feel free to ask me about coding, design, or any topic you're curious about.",
  "I see you've shared some content with me. This is really interesting! In a real implementation, I would analyze this and provide detailed insights.",
  "Thanks for reaching out! I'm currently in demo mode, but once connected to a real API, I'll be able to provide much more sophisticated responses.",
  "Excellent point! Let me think about that... In the meantime, know that I'm designed to be helpful, harmless, and honest.",
  "I appreciate you testing out this chat interface! The design looks pretty sleek, doesn't it? 😊",
  "That's fascinating! I'd love to dive deeper into this topic. What specific aspects would you like to explore?",
  "Great observation! Here's what I think about it based on my training data and reasoning capabilities.",
  "I'm processing your request... Just kidding! But when connected to a real model, I'll provide thoughtful, contextual responses.",
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateMockResponse = useCallback((): string => {
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }, []);

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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: generateMockResponse(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  }, [generateMockResponse]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
