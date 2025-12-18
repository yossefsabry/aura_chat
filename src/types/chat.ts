export interface Attachment {
  id: string;
  type: 'image' | 'audio';
  file: File;
  preview: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}
