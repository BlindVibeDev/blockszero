import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/authService';
import Dashboard from './Dashboard';
import CryptoExplorer from './CryptoExplorer';
import NewsResearch from './NewsResearch';
import TradingTools from './TradingTools';
import Portfolio from './Portfolio';
import Alerts from './Alerts';
import Settings from './Settings';
import HelpCommunity from './HelpCommunity';
import TradesXBT from './TradesXBT';
import ThemeToggle from './ThemeToggle';
import Authentication from './Authentication';
import ConnectSupabase from './ConnectSupabase';
import UserMenu from './UserMenu';
import HeaderNotifications from './HeaderNotifications';
import HeaderTokenSearch from './HeaderTokenSearch';
import TokenSelectedNotification from './TokenSelectedNotification';
import GooeyMenu from './GooeyMenu';
import { LayoutDashboard, BarChart3, LineChart, PieChart, BellRing, Settings as SettingsIcon, MessageSquare, Newspaper, Wrench, Users, HelpCircle, LogIn } from 'lucide-react';
import { Thread } from '../types/chat';
import { createThread, createMessage, testAIChat } from '../utils/chatUtils';
import { generateEnhancedAIResponse } from '../utils/aiUtils';

const navItems = useMemo(() => [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <LayoutDashboard size={18} />, 
    collapsedIcon: <LayoutDashboard size={20} /> 
  },
  { 
    id: 'crypto-explorer', 
    label: 'Crypto Explorer', 
    icon: <BarChart3 size={18} />, 
    collapsedIcon: <BarChart3 size={20} /> 
  },
  { 
    id: 'tradesxbt', 
    label: 'TradesXBT Assistant', 
    icon: <MessageSquare size={18} />, 
    collapsedIcon: <MessageSquare size={20} /> 
  },
  { 
    id: 'news', 
    label: 'News & Research', 
    icon: <Newspaper size={18} />, 
    collapsedIcon: <Newspaper size={20} /> 
  },
  { 
    id: 'tools', 
    label: 'Trading Tools', 
    icon: <Wrench size={18} />, 
    collapsedIcon: <Wrench size={20} /> 
  },
  { 
    id: 'portfolio', 
    label: 'Portfolio', 
    icon: <PieChart size={18} />, 
    collapsedIcon: <PieChart size={20} /> 
  },
  { 
    id: 'alerts', 
    label: 'Alerts', 
    icon: <BellRing size={18} />, 
    collapsedIcon: <BellRing size={20} /> 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <SettingsIcon size={18} />, 
    collapsedIcon: <SettingsIcon size={20} /> 
  },
  { 
    id: 'help', 
    label: 'Help & Community', 
    icon: <HelpCircle size={18} />, 
    collapsedIcon: <HelpCircle size={20} /> 
  }
], []);

const MainApp: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupabaseConnect, setShowSupabaseConnect] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const [aiStatus, setAiStatus] = useState<{
    isWorking: boolean;
    lastTested: Date | null;
    error: string | null;
  }>({
    isWorking: false,
    lastTested: null,
    error: null
  });

  useEffect(() => {
    const verifyAIChat = async () => {
      try {
        console.log('Verifying AI chat functionality...');
        const isWorking = await testAIChat();
        setAiStatus({
          isWorking,
          lastTested: new Date(),
          error: isWorking ? null : 'AI chat verification failed'
        });
        console.log('AI chat verification complete:', isWorking ? 'WORKING' : 'NOT WORKING');
      } catch (error) {
        console.error('Error verifying AI chat:', error);
        setAiStatus({
          isWorking: false,
          lastTested: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    };

    verifyAIChat();
  }, []);

  useEffect(() => {
    const savedThreads = localStorage.getItem('chatThreads');
    if (savedThreads) {
      try {
        setThreads(JSON.parse(savedThreads));
      } catch (e) {
        console.error('Error loading chat threads from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('chatThreads', JSON.stringify(threads));
    }
  }, [threads]);

  useEffect(() => {
    if (activeTab === 'tradesxbt' && newMessageCount > 0) {
      setNewMessageCount(0);
    }
  }, [activeTab, newMessageCount]);

  const handleSendMessage = async (message: string, isNewThread: boolean) => {
    if (!message && !isNewThread) return;
    
    setIsProcessing(true);
    console.log('Processing message:', { message, isNewThread });
    
    try {
      if (isNewThread || !currentThreadId) {
        const newThread = createThread(message);
        console.log('Created new thread:', newThread);
        
        setThreads(prevThreads => [...prevThreads, newThread]);
        setCurrentThreadId(newThread.id);
        
        if (message) {
          console.log('Generating AI response for new thread');
          const aiResponse = await generateEnhancedAIResponse(message);
          console.log('Received AI response:', aiResponse);
          
          setThreads(prevThreads => {
            const updatedThreads = prevThreads.map(thread => {
              if (thread.id === newThread.id) {
                return {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    createMessage(aiResponse, 'ai')
                  ],
                  updatedAt: Date.now(),
                  isRead: activeTab === 'tradesxbt'
                };
              }
              return thread;
            });
            return updatedThreads;
          });
          
          if (activeTab !== 'tradesxbt') {
            setNewMessageCount(prev => prev + 1);
          }
        }
      } else {
        console.log('Adding message to existing thread:', currentThreadId);
        
        setThreads(prevThreads => {
          const updatedThreads = prevThreads.map(thread => {
            if (thread.id === currentThreadId) {
              return {
                ...thread,
                messages: [
                  ...thread.messages,
                  createMessage(message, 'user')
                ],
                updatedAt: Date.now()
              };
            }
            return thread;
          });
          return updatedThreads;
        });
        
        console.log('Generating AI response for existing thread');
        const aiResponse = await generateEnhancedAIResponse(message);
        console.log('Received AI response:', aiResponse);
        
        setThreads(prevThreads => {
          const updatedThreads = prevThreads.map(thread => {
            if (thread.id === currentThreadId) {
              return {
                ...thread,
                messages: [
                  ...thread.messages,
                  createMessage(aiResponse, 'ai')
                ],
                updatedAt: Date.now(),
                isRead: activeTab === 'tradesxbt'
              };
            }
            return thread;
          });
          return updatedThreads;
        });
        
        if (activeTab !== 'tradesxbt') {
          setNewMessageCount(prev => prev + 1);
        }
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error processing message:', error);
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    
    setThreads(prevThreads => 
      prevThreads.map(thread => 
        thread.id === threadId ? { ...thread, isRead: true } : thread
      )
    );
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads(prevThreads => prevThreads.filter(thread => thread.id !== threadId));
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
    }
  };

  const handleUserAuthenticated = (userData: any) => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setThreads([]);
      setCurrentThreadId(null);
      setNewMessageCount(0);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'crypto-explorer':
        return <CryptoExplorer />;
      case 'tradesxbt':
        return (
          <TradesXBT 
            threads={threads}
            currentThreadId={currentThreadId}
            onSendMessage={handleSendMessage}
            onSelectThread={handleSelectThread}
            onDeleteThread={handleDeleteThread}
            isProcessing={isProcessing}
          />
        );
      case 'news':
        return <NewsResearch />;
      case 'tools':
        return <TradingTools />;
      case 'portfolio':
        return <Portfolio />;
      case 'alerts':
        return <Alerts />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <HelpCommunity />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-theme-accent"></div>
      </div>
    );
  }

  if (showSupabaseConnect) {
    return (
      <div className="min-h-screen bg-theme-bg p-4">
        <ConnectSupabase />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg flex">
      <div 
        className={`fixed left-0 top-0 h-full bg-theme-bg border-r border-theme-border transition-all duration-300 z-40 flex flex-col ${
          isSidebarExpanded ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="p-4 border-b border-theme-border flex-shrink-0">
          <div className="flex items-center">
            <div className={`flex items-center justify-center ${isSidebarExpanded ? 'w-auto' : 'w-full'}`}>
              <LayoutDashboard size={24} className="text-theme-accent" />
            </div>
            {isSidebarExpanded && (
              <span className="ml-3 font-bold text-theme-text-primary">
                TradesXBT
              </span>
            )}
          </div>
        </div>

        <nav className="py-2 flex-grow overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center ${isSidebarExpanded ? 'justify-start px-5' : 'justify-center px-0'} py-3.5 my-0.5 transition-colors relative ${
                activeTab === item.id 
                  ? 'bg-theme-accent/20 text-theme-accent' 
                  : 'text-theme-text-secondary hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab(item.id)}
              title={!isSidebarExpanded ? item.label : undefined}
            >
              <div className={`flex items-center justify-center ${isSidebarExpanded ? 'w-6' : 'w-full'}`}>
                {isSidebarExpanded ? item.icon : item.collapsedIcon}
              </div>
              {isSidebarExpanded && (
                <span className="ml-3 font-medium">
                  {item.label}
                </span>
              )}
              {item.id === 'tradesxbt' && newMessageCount > 0 && (
                <span className={`${isSidebarExpanded ? 'ml-auto mr-2' : 'absolute top-1.5 right-1.5'} bg-theme-accent text-theme-bg text-xs min-w-5 h-5 flex items-center justify-center px-1.5 rounded-full`}>
                  {newMessageCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-theme-border flex-shrink-0">
          {user ? (
            <div className={`flex items-center ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-theme-accent flex items-center justify-center text-theme-bg flex-shrink-0">
                {user.email?.[0].toUpperCase()}
              </div>
              {isSidebarExpanded && (
                <div className="ml-3 overflow-hidden">
                  <div className="text-sm font-medium text-theme-text-primary truncate max-w-[180px]">
                    {user.email}
                  </div>
                  <button 
                    className="text-xs text-red-500 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className={`w-full flex items-center justify-center ${isSidebarExpanded ? 'px-4 py-2' : 'p-2'} bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors`}
              onClick={() => setShowAuthModal(true)}
              title="Sign In"
            >
              {isSidebarExpanded ? (
                <span>Sign In</span>
              ) : (
                <LogIn size={18} />
              )}
            </button>
          )}
        </div>
      </div>

      <div className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-theme-text-primary">
                {navItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-theme-text-secondary">
                {new Date().toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {activeTab !== 'settings' && <HeaderTokenSearch className="mr-2" />}
              <ThemeToggle />
              <HeaderNotifications />
              {user && (
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onSettings={() => setActiveTab('settings')}
                />
              )}
            </div>
          </div>

          {renderContent()}
        </div>
      </div>

      <GooeyMenu 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSendMessage={handleSendMessage}
        threads={threads}
        currentThreadId={currentThreadId}
      />

      <TokenSelectedNotification autoHide={true} />

      <Authentication 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onAuthenticated={handleUserAuthenticated}
      />
    </div>
  );
};

export default MainApp;