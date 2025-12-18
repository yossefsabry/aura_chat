import { Loader2 } from 'lucide-react';

const ScrollLoader = () => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Loading older messages...</span>
      </div>
    </div>
  );
};

export default ScrollLoader;
