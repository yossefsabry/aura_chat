import { useRef, useEffect, useState, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';
import PageLoader from './PageLoader';
import ScrollLoader from './ScrollLoader';

const ChatContainer = () => {
  const { messages, isLoading, sendMessage, clearMessages, loadOlderMessages, hasOlderMessages, isLoadingOlder } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initial page load simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Scroll to top detection for loading older messages
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (container.scrollTop < 50 && hasOlderMessages && !isLoadingOlder) {
      loadOlderMessages();
    }
  }, [hasOlderMessages, isLoadingOlder, loadOlderMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isPageLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Gradient Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <ChatHeader onClear={clearMessages} messageCount={messages.length} />

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin relative"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-4xl mx-auto py-4">
            {/* Scroll to top loader */}
            {isLoadingOlder && <ScrollLoader />}
            
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
          <p className="text-center text-xs text-muted-foreground mt-3">
            Demo mode • Connect your AI model for real responses
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
