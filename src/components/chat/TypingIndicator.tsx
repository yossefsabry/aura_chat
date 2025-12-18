const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-3 p-4 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-soft">
        <span className="text-xs font-bold text-primary-foreground">AI</span>
      </div>
      <div className="glass rounded-2xl rounded-tl-md px-4 py-3 border-l-2 border-chat-ai-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
