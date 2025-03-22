import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  BarChart2,
  MessageSquare,
  Bot,
  Newspaper,
  LineChart,
  PieChart,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  Menu,
  SendHorizontal,
  Loader2,
  Check,
  X,
  Clock
} from 'lucide-react';

interface GooeyMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSendMessage: (message: string, isNewThread: boolean) => void;
  threads: Thread[];
  currentThreadId: string | null;
}

const GooeyMenu: React.FC<GooeyMenuProps> = ({
  activeTab,
  setActiveTab,
  onSendMessage,
  threads,
  currentThreadId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'success' | 'error' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  const topMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'crypto', label: 'Crypto Market', icon: <BarChart2 size={18} /> },
    { id: 'social', label: 'Social & Sentiment', icon: <MessageSquare size={18} /> },
    { id: 'tradesxbt', label: 'TradesXBT', icon: <Bot size={18} /> },
    { id: 'news', label: 'News & Research', icon: <Newspaper size={18} /> },
  ];

  const bottomMenuItems = [
    { id: 'tools', label: 'Trading Tools', icon: <LineChart size={18} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <PieChart size={18} /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
    { id: 'help', label: 'Help & Community', icon: <HelpCircle size={18} /> },
  ];

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isExpanded]);

  const handleSendMessage = async (isNewThread: boolean) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    try {
      await onSendMessage(message, isNewThread);
      setShowFeedback('success');
      setMessage('');
      
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      
      setTimeout(() => {
        setIsLoading(false);
        setShowFeedback(null);
      }, 1500);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setShowFeedback('error');
      
      setTimeout(() => {
        setIsLoading(false);
        setShowFeedback(null);
      }, 1500);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 bg-theme-bg/30 transition-opacity duration-300 z-40" aria-hidden="true" />
      )}

      <button
        ref={buttonRef}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-theme-accent text-theme-bg shadow-lg flex items-center justify-center z-50 transition-all duration-300 transform hover:bg-theme-accent-dark ${
          isExpanded ? 'rotate-90 scale-110' : ''
        }`}
        onClick={toggleMenu}
        aria-expanded={isExpanded}
        aria-controls="gooey-menu"
        aria-label={isExpanded ? "Close navigation menu" : "Open navigation menu"}
      >
        <Menu size={24} />
      </button>

      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" 
              result="gooey" 
            />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
        </defs>
      </svg>

      <div 
        id="gooey-menu"
        ref={menuRef}
        className={`fixed left-0 right-0 bottom-0 z-40 transition-transform duration-500 ease-in-out ${
          isExpanded ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ filter: 'url(#gooey)', willChange: 'transform' }}
        role="menu"
        aria-labelledby="menu-button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="bg-theme-bg rounded-t-2xl shadow-lg pb-20">
          <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto p-4">
            <div className="col-span-6 flex flex-col justify-between h-full">
              <div className="grid grid-cols-5 gap-3">
                {topMenuItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="transform transition-transform duration-500 ease-out"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transform: isExpanded ? 'translateY(0)' : 'translateY(50px)',
                      opacity: isExpanded ? 1 : 0,
                      transition: `transform 500ms ease ${index * 30}ms, opacity 500ms ease ${index * 30}ms` 
                    }}
                  >
                    <button
                      className={`w-full flex flex-col items-center p-3 rounded-xl transition-colors ${
                        activeTab === item.id
                          ? 'bg-theme-accent/20 text-theme-accent'
                          : 'text-theme-accent hover:bg-theme-accent/10'
                      }`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsExpanded(false);
                      }}
                      role="menuitem"
                      tabIndex={isExpanded ? 0 : -1}
                      aria-current={activeTab === item.id ? 'page' : undefined}
                    >
                      <div className="p-2 mb-1 bg-theme-accent/20 rounded-full">
                        {item.icon}
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-3 mt-4">
                {bottomMenuItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="transform transition-transform duration-500 ease-out"
                    style={{ 
                      animationDelay: `${(index + 5) * 50}ms`,
                      transform: isExpanded ? 'translateY(0)' : 'translateY(50px)',
                      opacity: isExpanded ? 1 : 0,
                      transition: `transform 500ms ease ${(index + 5) * 30}ms, opacity 500ms ease ${(index + 5) * 30}ms` 
                    }}
                  >
                    <button
                      className={`w-full flex flex-col items-center p-3 rounded-xl transition-colors ${
                        activeTab === item.id
                          ? 'bg-theme-accent/20 text-theme-accent'
                          : 'text-theme-accent hover:bg-theme-accent/10'
                      }`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsExpanded(false);
                      }}
                      role="menuitem"
                      tabIndex={isExpanded ? 0 : -1}
                      aria-current={activeTab === item.id ? 'page' : undefined}
                    >
                      <div className="p-2 mb-1 bg-theme-accent/20 rounded-full">
                        {item.icon}
                      
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="col-span-6 transform transition-transform duration-500 ease-out"
              style={{ 
                transform: isExpanded ? 'translateY(0)' : 'translateY(50px)',
                opacity: isExpanded ? 1 : 0,
                transition: `transform 500ms ease 100ms, opacity 500ms ease 100ms` 
              }}
            >
              <div className="bg-theme-accent/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Bot size={18} className="text-theme-accent mr-2" />
                    <h3 className="text-sm font-medium text-theme-accent">Quick AI Chat</h3>
                  </div>
                  
                  <button 
                    className="text-xs text-theme-accent hover:text-theme-accent-dark underline flex items-center"
                    onClick={() => {
                      setActiveTab('tradesxbt');
                      setIsExpanded(false);
                    }}
                  >
                    View All Chats
                  </button>
                </div>

                {currentThreadId && threads.find(t => t.id === currentThreadId)?.messages.slice(-3).map((msg, index) => (
                  <div 
                    key={msg.id}
                    className={`p-2 rounded text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-theme-accent/30 text-theme-text-primary ml-8' 
                        : 'bg-theme-accent/50 text-theme-text-primary mr-8'
                    } mb-2`}
                  >
                    <div className="flex items-center mb-1">
                      <span className="text-xs opacity-70">
                        {msg.sender === 'user' ? 'You' : 'AI'}
                      </span>
                      <span className="text-xs opacity-50 ml-2 flex items-center">
                        <Clock size={10} className="mr-1" />
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs break-words">{msg.content}</p>
                  </div>
                ))}
                
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    className="w-full p-3 pr-10 text-sm bg-theme-accent/30 border border-theme-accent/20 rounded-lg text-theme-text-primary placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent/50 resize-none min-h-[80px]"
                    placeholder="Send a message to AI without leaving this menu..."
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    disabled={isLoading}
                    rows={1}
                    aria-label="AI chat message"
                  />
                </div>
                
                {showFeedback && (
                  <div className={`mt-2 text-xs flex items-center justify-center ${
                    showFeedback === 'success' ? 'text-theme-accent' : 'text-red-400'
                  }`}>
                    {showFeedback === 'success' ? (
                      <div className="flex items-center">
                        <Check size={14} className="mr-1" />
                        Message sent! View in TradesXBT.
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <X size={14} className="mr-1" />
                        Failed to send message. Please try again.
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex mt-3 space-x-2">
                  <button 
                    className="flex-1 bg-theme-accent/30 hover:bg-theme-accent/50 text-theme-accent text-xs font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleSendMessage(false)}
                    disabled={!message.trim() || isLoading}
                    title="Continue your conversation in the current thread"
                  >
                    Continue Current Thread
                  </button>
                  <button 
                    className="flex-1 bg-theme-accent hover:bg-theme-accent-dark text-theme-bg text-xs font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleSendMessage(true)}
                    disabled={!message.trim() || isLoading}
                    title="Start a new conversation thread with this message"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 size={14} className="animate-spin mr-1" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <SendHorizontal size={14} className="mr-1" />
                        Start New Chat
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GooeyMenu;