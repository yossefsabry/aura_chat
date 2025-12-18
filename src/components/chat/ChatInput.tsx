import { useState, useRef, KeyboardEvent } from 'react';
import { Send, ImagePlus, Mic, Paperclip } from 'lucide-react';
import { Attachment } from '@/types/chat';
import AttachmentPreview from './AttachmentPreview';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
  onSend: (content: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    
    onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (files: FileList | null, type: 'image' | 'audio') => {
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      type,
      file,
      preview: type === 'image' ? URL.createObjectURL(file) : '',
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  return (
    <div className="glass rounded-2xl border border-border/50 overflow-hidden">
      <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />
      
      <div className="flex items-end gap-2 p-3">
        {/* Attachment Buttons */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => imageInputRef.current?.click()}
                disabled={disabled}
              >
                <ImagePlus className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => audioInputRef.current?.click()}
                disabled={disabled}
              >
                <Mic className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload Audio</TooltipContent>
          </Tooltip>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFileSelect(e.target.files, 'image');
            e.target.value = '';
          }}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFileSelect(e.target.files, 'audio');
            e.target.value = '';
          }}
        />

        {/* Text Input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 min-h-[44px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-sm"
          rows={1}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          size="icon"
          className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-200 glow disabled:opacity-50 disabled:cursor-not-allowed disabled:glow-none"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
