import { Message } from '@/types/chat';
import { User, Bot, Image, Music } from 'lucide-react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start gap-3 p-4 animate-slide-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-secondary'
            : 'bg-gradient-to-br from-primary to-accent glow-soft'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative rounded-xl overflow-hidden border border-border/50"
              >
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.preview}
                    alt="Uploaded"
                    className="max-w-[200px] max-h-[200px] object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-secondary">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="text-sm text-secondary-foreground truncate max-w-[150px]">
                      {attachment.file.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text Bubble */}
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-chat-user rounded-tr-md'
                : 'glass border-l-2 border-chat-ai-border rounded-tl-md'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground px-1">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
