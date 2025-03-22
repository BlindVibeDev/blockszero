import React from 'react';
import ChatUI from './chat/ChatUI';
import { Thread } from '../types/chat';

interface TradesXBTProps {
  threads: Thread[];
  currentThreadId: string | null;
  onSendMessage: (message: string, isNewThread: boolean) => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  isProcessing: boolean;
}

const TradesXBT: React.FC<TradesXBTProps> = ({
  threads,
  currentThreadId,
  onSendMessage,
  onSelectThread,
  onDeleteThread,
  isProcessing
}) => {
  return (
    <div className="h-[calc(100vh-120px)] bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
      <ChatUI 
        threads={threads}
        currentThreadId={currentThreadId}
        onSendMessage={onSendMessage}
        onSelectThread={onSelectThread}
        onDeleteThread={onDeleteThread}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default TradesXBT;