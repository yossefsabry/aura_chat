import { Attachment } from '@/types/chat';
import { X, Image, Music } from 'lucide-react';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

const AttachmentPreview = ({ attachments, onRemove }: AttachmentPreviewProps) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-border/50">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative group rounded-lg overflow-hidden border border-border/50 bg-secondary animate-fade-in"
        >
          {attachment.type === 'image' ? (
            <img
              src={attachment.preview}
              alt="Preview"
              className="w-16 h-16 object-cover"
            />
          ) : (
            <div className="w-16 h-16 flex flex-col items-center justify-center gap-1 px-2">
              <Music className="w-5 h-5 text-primary" />
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {attachment.file.name.split('.').pop()?.toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Remove Button */}
          <button
            onClick={() => onRemove(attachment.id)}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AttachmentPreview;
