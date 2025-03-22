// Dashboard layout presets
import React from 'react';
import { ReactNode } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  Zap,
  LineChart,
  BarChart2,
  Brain,
  Calendar,
  List,
  Bell,
  MessageCircle,
  Briefcase,
  Coins,
  DollarSign,
  Code,
  Users
} from 'lucide-react';

// Define the structure for dashboard components
export interface DashboardComponent {
  id: string;
  name: string;
  icon: ReactNode;
  defaultVisible: boolean;
  colSpan?: number;
  rowSpan?: number;
  priority?: number;
}

// Define a preset dashboard layout
export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  components: string[];
  thumbnail: string;
  layout?: Record<string, any[]>;
}

// Available dashboard components
export const availableComponents: DashboardComponent[] = [
  { id: 'market-overview', name: 'Market Overview', icon: <TrendingUp size={14} />, defaultVisible: true, colSpan: 2, priority: 100 },
  { id: 'token-search', name: 'Token Search', icon: <Coins size={14} />, defaultVisible: true, priority: 90 },
  { id: 'news-feed', name: 'News Feed', icon: <Clock size={14} />, defaultVisible: true, rowSpan: 1, priority: 75 },
  { id: 'price-chart', name: 'Price Chart', icon: <LineChart size={14} />, defaultVisible: true, colSpan: 2, rowSpan: 1, priority: 95 },
  { id: 'top-movers', name: 'Top Movers', icon: <Zap size={14} />, defaultVisible: true, priority: 70 },
  { id: 'stock-financials', name: 'Stock Financials', icon: <DollarSign size={14} />, defaultVisible: true, colSpan: 2, priority: 65 },
  { id: 'volume-volatility', name: 'Volume & Volatility', icon: <BarChart2 size={14} />, defaultVisible: true, priority: 60 },
  { id: 'ai-insights', name: 'AI/ML Insights', icon: <Brain size={14} />, defaultVisible: true, priority: 55 },
  { id: 'economic-calendar', name: 'Economic Calendar', icon: <Calendar size={14} />, defaultVisible: true, priority: 50 },
  { id: 'watchlist', name: 'Watchlist', icon: <List size={14} />, defaultVisible: true, colSpan: 2, priority: 45 },
  { id: 'alerts', name: 'Alerts', icon: <Bell size={14} />, defaultVisible: true, priority: 40 },
  { id: 'discussion-trends', name: 'Discussion Trends', icon: <MessageCircle size={14} />, defaultVisible: true, priority: 35 },
  { id: 'portfolio-snapshot', name: 'Portfolio Snapshot', icon: <Briefcase size={14} />, defaultVisible: true, priority: 30 },
  { id: 'developer-activity', name: 'Developer Activity', icon: <Code size={14} />, defaultVisible: true, priority: 25 },
];

// Standard layout definition for components
const standardLayout = {
  lg: [
    { i: 'market-overview', x: 0, y: 0, w: 2, h: 3, minW: 1, minH: 2 },
    { i: 'token-search', x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'price-chart', x: 0, y: 3, w: 2, h: 4, minW: 1, minH: 3 },
    { i: 'news-feed', x: 2, y: 2, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'top-movers', x: 0, y: 7, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'watchlist', x: 0, y: 9, w: 2, h: 3, minW: 1, minH: 2 },
    { i: 'alerts', x: 2, y: 6, w: 1, h: 2, minW: 1, minH: 2 }
  ],
  md: [
    { i: 'market-overview', x: 0, y: 0, w: 2, h: 3, minW: 1, minH: 2 },
    { i: 'token-search', x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'price-chart', x: 0, y: 3, w: 2, h: 4, minW: 1, minH: 3 },
    { i: 'news-feed', x: 2, y: 2, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'top-movers', x: 0, y: 7, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'watchlist', x: 0, y: 9, w: 2, h: 3, minW: 1, minH: 2 },
    { i: 'alerts', x: 2, y: 6, w: 1, h: 2, minW: 1, minH: 2 }
  ],
  sm: [
    { i: 'market-overview', x: 0, y: 0, w: 3, h: 3, minW: 1, minH: 2 },
    { i: 'token-search', x: 0, y: 3, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'price-chart', x: 0, y: 5, w: 3, h: 4, minW: 1, minH: 3 },
    { i: 'news-feed', x: 0, y: 9, w: 3, h: 3, minW: 1, minH: 2 },
    { i: 'top-movers', x: 0, y: 12, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'watchlist', x: 0, y: 16, w: 3, h: 3, minW: 1, minH: 2 },
    { i: 'alerts', x: 0, y: 19, w: 3, h: 2, minW: 1, minH: 2 }
  ],
  xs: [
    { i: 'market-overview', x: 0, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'token-search', x: 0, y: 3, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'price-chart', x: 0, y: 5, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'news-feed', x: 0, y: 9, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'top-movers', x: 0, y: 12, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'watchlist', x: 0, y: 16, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'alerts', x: 0, y: 19, w: 1, h: 2, minW: 1, minH: 2 }
  ]
};

// Day trader layout
const dayTraderLayout = {
  lg: [
    { i: 'price-chart', x: 0, y: 0, w: 2, h: 4, minW: 1, minH: 3 },
    { i: 'top-movers', x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'volume-volatility', x: 2, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'market-overview', x: 0, y: 4, w: 2, h: 3, minW: 1, minH: 2 },
    { i: 'token-search', x: 0, y: 7, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'alerts', x: 1, y: 7, w: 2, h: 2, minW: 1, minH: 2 }
  ],
  md: [
    { i: 'price-chart', x: 0, y: 0, w: 2, h: 4, minW: 1, minH: 3 },
    { i: 'top-movers', x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'volume-volatility', x: 2, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'market-overview', x: 0, y: 4, w: 2, h: 3, minW: 1, minH: 2 },
    { i: 'token-search', x: 0, y: 7, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'alerts', x: 1, y: 7, w: 2, h: 2, minW: 1, minH: 2 }
  ],
  sm: [
    { i: 'price-chart', x: 0, y: 0, w: 3, h: 4, minW: 1, minH: 3 },
    { i: 'top-movers', x: 0, y: 4, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'volume-volatility', x: 0, y: 6, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'market-overview', x: 0, y: 8, w: 3, h: 3, minW: 1, minH: 2 },
    { i: 'token-search', x: 0, y: 11, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'alerts', x: 0, y: 13, w: 3, h: 2, minW: 1, minH: 2 }
  ],
  xs: [
    { i: 'price-chart', x: 0, y: 0, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'top-movers', x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'volume-volatility', x: 0, y: 6, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'market-overview', x: 0, y: 8, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'token-search', x: 0, y: 11, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'alerts', x: 0, y: 13, w: 1, h: 2, minW: 1, minH: 2 }
  ]
};

// Dashboard presets
export const dashboardPresets: DashboardPreset[] = [
  {
    id: 'standard',
    name: 'Standard Dashboard',
    description: 'A balanced dashboard with all key market components',
    components: [
      'market-overview', 'token-search', 'price-chart', 'news-feed', 
      'top-movers', 'watchlist', 'alerts'
    ],
    thumbnail: 'standard',
    layout: standardLayout
  },
  {
    id: 'day-trader',
    name: 'Day Trader',
    description: 'Focused on short-term price movements and high-frequency trading',
    components: [
      'price-chart', 'top-movers', 'volume-volatility', 'market-overview',
      'token-search', 'alerts'
    ],
    thumbnail: 'day-trader',
    layout: dayTraderLayout
  },
  {
    id: 'swing-trader',
    name: 'Swing Trader',
    description: 'Optimized for medium-term trades based on market trends',
    components: [
      'price-chart', 'market-overview', 'news-feed',
      'discussion-trends', 'watchlist', 'economic-calendar'
    ],
    thumbnail: 'swing-trader',
  },
  {
    id: 'investor',
    name: 'Long-Term Investor',
    description: 'Focus on fundamental analysis and long-term market trends',
    components: [
      'market-overview', 'stock-financials', 'watchlist', 'portfolio-snapshot',
      'economic-calendar', 'news-feed', 'ai-insights'
    ],
    thumbnail: 'investor',
  },
  {
    id: 'crypto-analyst',
    name: 'Crypto Analyst',
    description: 'Deep dive into cryptocurrency metrics and social signals',
    components: [
      'token-search', 'market-overview', 'price-chart',
      'volume-volatility', 'discussion-trends'
    ],
    thumbnail: 'crypto-analyst',
  },
  {
    id: 'minimal',
    name: 'Minimal View',
    description: 'A streamlined dashboard with just the essential components',
    components: [
      'market-overview', 'price-chart', 'token-search', 'top-movers', 'watchlist'
    ],
    thumbnail: 'standard',
  }
];

// Get component by ID
export const getComponentById = (id: string): DashboardComponent | undefined => {
  return availableComponents.find(component => component.id === id);
};

// Get preset by ID
export const getPresetById = (id: string): DashboardPreset | undefined => {
  return dashboardPresets.find(preset => preset.id === id);
};

// Default layout for the standard dashboard
export const defaultDashboardLayout = dashboardPresets.find(preset => preset.id === 'standard')?.components || 
  availableComponents.filter(c => c.defaultVisible).map(c => c.id);