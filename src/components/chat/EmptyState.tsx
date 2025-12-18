import { MessageSquare, Sparkles, Image, Music } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 glow-soft">
        <MessageSquare className="w-10 h-10 text-primary" />
      </div>
      
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Start a Conversation
      </h2>
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        Send a message, upload an image, or share an audio file to begin chatting with AI.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-secondary-foreground">AI-powered</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
          <Image className="w-4 h-4 text-primary" />
          <span className="text-sm text-secondary-foreground">Image upload</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
          <Music className="w-4 h-4 text-primary" />
          <span className="text-sm text-secondary-foreground">Audio upload</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
