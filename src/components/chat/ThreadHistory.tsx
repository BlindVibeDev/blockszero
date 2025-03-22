import React from 'react';
import { Thread } from '../../types/chat';
import { 
  ChevronRight, 
  MessageSquare, 
  Trash2,
  Eye,
  EyeOff,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  DollarSign,
  Shield
} from 'lucide-react';

interface ThreadHistoryProps {
  threads: Thread[];
  currentThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Trading signal type definition
interface TradingSignal {
  asset: string;
  type: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  timeframe: 'SHORT' | 'MEDIUM';
  price: number;
  stopLoss: number;
  takeProfit: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
}

// Example trading signals (in production, these would come from your AI analysis)
const tradingSignals: TradingSignal[] = [
  {
    asset: 'BTC',
    type: 'STRONG BUY',
    timeframe: 'SHORT',
    price: 45678.32,
    stopLoss: 44500,
    takeProfit: 48000,
    risk: 'MEDIUM',
    timestamp: Date.now() - 1800000 // 30 minutes ago
  },
  {
    asset: 'ETH',
    type: 'BUY',
    timeframe: 'MEDIUM',
    price: 3245.67,
    stopLoss: 3100,
    takeProfit: 3500,
    risk: 'LOW',
    timestamp: Date.now() - 3600000 // 1 hour ago
  },
  {
    asset: 'SOL',
    type: 'NEUTRAL',
    timeframe: 'SHORT',
    price: 120.89,
    stopLoss: 115,
    takeProfit: 128,
    risk: 'MEDIUM',
    timestamp: Date.now() - 7200000 // 2 hours ago
  }
];

const ThreadHistory: React.FC<ThreadHistoryProps> = ({
  threads,
  currentThreadId,
  onSelectThread,
  onDeleteThread,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Sort threads by most recent first
  const sortedThreads = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleDelete = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (onDeleteThread) {
      if (window.confirm('Are you sure you want to delete this chat thread? This action cannot be undone.')) {
        onDeleteThread(threadId);
      }
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Get signal color and icon
  const getSignalStyle = (type: TradingSignal['type']) => {
    switch (type) {
      case 'STRONG BUY':
        return { color: 'bg-theme-accent/20 text-theme-accent', icon: <TrendingUp size={12} className="mr-1" /> };
      case 'BUY':
        return { color: 'bg-theme-accent/10 text-theme-accent', icon: <ArrowUpRight size={12} className="mr-1" /> };
      case 'NEUTRAL':
        return { color: 'bg-theme-accent/10 text-theme-accent', icon: <Target size={12} className="mr-1" /> };
      case 'SELL':
        return { color: 'bg-theme-accent/10 text-theme-accent', icon: <ArrowDownRight size={12} className="mr-1" /> };
      case 'STRONG SELL':
        return { color: 'bg-theme-accent/20 text-theme-accent', icon: <TrendingDown size={12} className="mr-1" /> };
    }
  };

  // Get risk badge style
  const getRiskStyle = (risk: TradingSignal['risk']) => {
    switch (risk) {
      case 'LOW':
        return 'bg-theme-accent/10 text-theme-accent';
      case 'MEDIUM':
        return 'bg-theme-accent/20 text-theme-accent';
      case 'HIGH':
        return 'bg-theme-accent/30 text-theme-accent';
    }
  };

  return (
    <div
      className={`bg-theme-bg border-r border-theme-border h-full transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-theme-border">
        <h3
          className={`text-theme-text-primary font-medium ${
            isCollapsed ? 'hidden' : 'block'
          }`}
        >
          Chat History
        </h3>
        <button
          className="p-1 text-theme-accent hover:text-theme-accent-dark rounded-md"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand thread history' : 'Collapse thread history'}
        >
          <ChevronRight
            size={20}
            className={`transform transition-transform ${
              isCollapsed ? '-rotate-180' : ''
            }`}
          />
        </button>
      </div>

      <div className="h-[calc(100%-60px)] flex flex-col">
        {/* Chat Threads Section */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-theme-text-secondary">
              {!isCollapsed && (
                <>
                  <MessageSquare size={24} className="mb-2" />
                  <p className="text-xs">No chat history yet</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {sortedThreads.map((thread) => (
                <div
                  key={thread.id}
                  className={`relative group w-full text-left mb-1 p-2 rounded-md transition-colors ${
                    currentThreadId === thread.id
                      ? 'bg-theme-accent/20'
                      : 'hover:bg-theme-accent/10'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <button
                    className="w-full text-left"
                    onClick={() => onSelectThread(thread.id)}
                  >
                    {isCollapsed ? (
                      <div className="flex justify-center">
                        <MessageSquare
                          size={18}
                          className={`${
                            currentThreadId === thread.id
                              ? 'text-theme-accent'
                              : 'text-theme-text-secondary'
                          }`}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <MessageSquare
                            size={14}
                            className={`mr-2 ${
                              currentThreadId === thread.id
                                ? 'text-theme-accent'
                                : 'text-theme-text-secondary'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium truncate ${
                              currentThreadId === thread.id
                                ? 'text-theme-text-primary'
                                : 'text-theme-text-secondary'
                            }`}
                          >
                            {thread.title}
                          </span>
                          {!thread.isRead && (
                            <span className="ml-2 w-2 h-2 rounded-full bg-theme-accent"></span>
                          )}
                        </div>
                        <div className="mt-1 text-[10px] text-theme-text-secondary flex justify-between">
                          <span className="truncate max-w-[150px]">
                            {thread.messages[0]?.content.substring(0, 30)}
                            {thread.messages[0]?.content.length > 30 ? '...' : ''}
                          </span>
                          <span>
                            {new Date(thread.updatedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </>
                    )}
                  </button>
                  {!isCollapsed && onDeleteThread && (
                    <button
                      onClick={(e) => handleDelete(e, thread.id)}
                      className="absolute right-2 top-2 p-1 text-red-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete thread"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trading Signals Section */}
        {!isCollapsed && (
          <div className="border-t border-theme-border p-2">
            <div className="text-xs font-medium text-theme-text-primary mb-2 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              Trading Signals
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tradingSignals.map((signal, index) => (
                <div key={index} className="bg-theme-bg border border-theme-border rounded-md p-2">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <span className="font-medium text-theme-text-primary text-xs">{signal.asset}</span>
                      <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full flex items-center ${getSignalStyle(signal.type).color}`}>
                        {getSignalStyle(signal.type).icon}
                        {signal.type}
                      </span>
                    </div>
                    <span className="text-[9px] text-theme-text-secondary">
                      {formatTimeAgo(signal.timestamp)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-[9px] mb-1">
                    <div className="flex items-center text-theme-text-secondary">
                      <DollarSign size={10} className="mr-0.5" />
                      Entry: ${signal.price.toLocaleString()}
                    </div>
                    <div className="flex items-center text-theme-text-secondary">
                      <Clock size={10} className="mr-0.5" />
                      {signal.timeframe}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center space-x-1">
                      <span className="flex items-center text-red-500">
                        <ArrowDownRight size={10} className="mr-0.5" />
                        SL: ${signal.stopLoss}
                      </span>
                      <span className="flex items-center text-green-500">
                        <ArrowUpRight size={10} className="mr-0.5" />
                        TP: ${signal.takeProfit}
                      </span>
                    </div>
                    <span className={`flex items-center px-1.5 py-0.5 rounded-full ${getRiskStyle(signal.risk)}`}>
                      <Shield size={10} className="mr-0.5" />
                      {signal.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadHistory;