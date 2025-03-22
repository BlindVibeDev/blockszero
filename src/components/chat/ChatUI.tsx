import React, { useState, useRef, useEffect } from 'react';
import { Thread, Message } from '../../types/chat';
import MessageThread from './MessageThread';
import ThreadHistory from './ThreadHistory';
import SolanaTokenSearch from '../SolanaTokenSearch';
import { CoinSearchResult } from '../../services/cryptoApi';
import { Bot, Send, Plus, Loader2, BarChart as ChartBar, TrendingUp, LineChart, BarChart2, Search, X } from 'lucide-react';

interface ChatUIProps {
  threads: Thread[];
  currentThreadId: string | null;
  onSendMessage: (message: string, isNewThread: boolean) => Promise<void>;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  isProcessing: boolean;
}

const EXAMPLE_QUERIES = [
  {
    text: "Analyze Bitcoin's recent price action",
    icon: <ChartBar size={14} className="mr-1" />
  },
  {
    text: "What's causing the volatility in Ethereum?",
    icon: <TrendingUp size={14} className="mr-1" />
  },
  {
    text: "Compare the top 5 DeFi tokens by performance",
    icon: <LineChart size={14} className="mr-1" />
  },
  {
    text: "What's the sentiment around NFT markets?",
    icon: <BarChart2 size={14} className="mr-1" />
  }
];

const ChatUI: React.FC<ChatUIProps> = ({
  threads,
  currentThreadId,
  onSendMessage,
  onSelectThread,
  onDeleteThread,
  isProcessing
}) => {
  const [message, setMessage] = useState('');
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [showTokenSearch, setShowTokenSearch] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get current thread
  const currentThread = threads.find((thread) => thread.id === currentThreadId) || null;

  const handleSendMessage = async (messageText: string = message) => {
    if (!messageText.trim()) return;
    
    setMessage('');
    
    try {
      await onSendMessage(messageText, !currentThreadId);
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea as content grows
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle token selection
  const handleTokenSelect = (token: CoinSearchResult) => {
    // Create a message with token details
    const tokenMessage = `Tell me about ${token.name} (${token.symbol.toUpperCase()}) on Solana blockchain. What's the current price, market sentiment, and recent performance?`;
    setMessage(tokenMessage);
    setShowTokenSearch(false);
    
    // Focus back on the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages]);

  // Focus input on thread change
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentThreadId]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Thread History Sidebar */}
      <ThreadHistory
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={onSelectThread}
        onDeleteThread={onDeleteThread}
        isCollapsed={isHistoryCollapsed}
        onToggleCollapse={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-theme-bg bg-opacity-70 backdrop-blur-sm overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <div className="flex items-center">
            <Bot size={18} className="text-theme-accent mr-2" />
            <h2 className="text-theme-text-primary font-medium">
              {currentThread ? 'Chat with TradesXBT AI' : 'New Chat'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`text-xs px-3 py-1.5 rounded-lg flex items-center ${
                showTokenSearch
                  ? 'bg-theme-accent text-theme-bg'
                  : 'bg-theme-bg border border-theme-border text-theme-text-primary hover:bg-theme-accent/10'
              }`}
              onClick={() => setShowTokenSearch(!showTokenSearch)}
              title={showTokenSearch ? "Close token search" : "Search for tokens"}
            >
              {showTokenSearch ? (
                <>
                  <X size={14} className="mr-1" />
                  Close Token Search
                </>
              ) : (
                <>
                  <Search size={14} className="mr-1" />
                  Token Search
                </>
              )}
            </button>
            <button
              className="text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1.5 rounded-lg flex items-center"
              onClick={() => onSendMessage('', true)}
            >
              <Plus size={14} className="mr-1" />
              New Chat
            </button>
          </div>
        </div>

        {/* Token Search Panel */}
        {showTokenSearch && (
          <div className="p-4 border-b border-theme-border bg-theme-accent/5">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-theme-text-primary mb-2">Search for Crypto Tokens</h3>
              <p className="text-xs text-theme-text-secondary mb-3">
                Find and analyze cryptocurrency tokens to discuss with the AI. Select a token to create a prompt about it.
              </p>
            </div>
            <SolanaTokenSearch 
              onSelectToken={handleTokenSelect}
              placeholder="Search for any token (e.g., BTC, ETH, SOL)..."
            />
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4">
          {currentThread ? (
            <MessageThread messages={currentThread.messages} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Bot size={48} className="text-theme-accent mb-4" />
              <h3 className="text-theme-text-primary font-medium mb-2">Welcome to TradesXBT AI</h3>
              <p className="text-theme-text-secondary text-sm max-w-md mb-6">
                Your crypto market AI assistant is ready to help. Ask questions about market trends,
                get trading insights, or analyze crypto assets.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {EXAMPLE_QUERIES.map((query, index) => (
                  <button
                    key={index}
                    className="text-xs bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent p-2 rounded-md text-left flex items-center"
                    onClick={() => handleSendMessage(query.text)}
                  >
                    {query.icon}
                    {query.text}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <button
                  className="text-xs bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent p-2 rounded-md flex items-center"
                  onClick={() => setShowTokenSearch(true)}
                >
                  <Search size={14} className="mr-1" />
                  Search for a token to analyze
                </button>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-theme-border">
          <div className="relative">
            <textarea
              ref={inputRef}
              className="w-full p-3 pr-12 text-sm bg-theme-accent/10 border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none"
              placeholder="Message TradesXBT AI..."
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              rows={1}
              aria-label="AI chat message"
            />
            <button
              className="absolute right-3 bottom-3 text-theme-accent hover:text-theme-accent-dark disabled:text-theme-accent/30"
              onClick={() => handleSendMessage()}
              disabled={!message.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <div className="mt-2 text-[10px] text-theme-text-secondary text-center">
            TradesXBT provides analysis, not financial advice. Always verify information and trade responsibly.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;