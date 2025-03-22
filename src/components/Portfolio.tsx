import React, { useState } from 'react';
import Card from './Card';
import { 
  Briefcase, 
  PieChart, 
  LineChart, 
  Clock, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  AlertCircle,
  ChevronDown,
  BarChart2,
  CreditCard,
  Info,
  X
} from 'lucide-react';

const Portfolio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'transactions'>('overview');
  
  return (
    <div className="space-y-4">
      <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-theme-text-primary">Portfolio Management</h2>
            <p className="text-sm text-theme-accent">Track and analyze your crypto investments</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                activeTab === 'overview' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <PieChart size={14} className="mr-1" />
              Overview
            </button>
            <button
              className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                activeTab === 'assets' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('assets')}
            >
              <BarChart2 size={14} className="mr-1" />
              Assets
            </button>
            <button
              className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                activeTab === 'transactions' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              <Clock size={14} className="mr-1" />
              Transactions
            </button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Portfolio Overview" icon={<Briefcase size={14} />}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-theme-accent/10 p-3 rounded-md">
                <div className="text-xs text-theme-accent mb-1">Total Portfolio Value</div>
                <div className="text-xl font-bold text-theme-text-primary">$166,383.63</div>
                <div className="flex items-center text-sm text-theme-accent">
                  <ArrowDown size={16} className="mr-1" />
                  -$2,184.29 (-1.30%) 24h
                </div>
              </div>

              <div className="bg-theme-accent/10 p-3 rounded-md">
                <div className="text-xs text-theme-accent mb-1">Total Invested</div>
                <div className="text-xl font-bold text-theme-text-primary">$149,897.50</div>
                <div className="flex items-center text-sm text-theme-accent">
                  <ArrowUp size={16} className="mr-1" />
                  +$16,486.13 (+11.00%)
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-medium text-theme-text-primary">Top Holdings</div>
                <button className="text-[10px] text-theme-accent hover:text-theme-accent-dark">View All</button>
              </div>

              <div className="space-y-2">
                {[
                  { symbol: 'BTC', amount: '1.550000', value: '$70,801.40', change: '+8.76%' },
                  { symbol: 'ETH', amount: '15.300000', value: '$49,658.75', change: '+15.92%' },
                  { symbol: 'SOL', amount: '210.500000', value: '$25,447.35', change: '+9.90%' },
                  { symbol: 'DOT', amount: '300.000000', value: '$7,767.00', change: '+15.07%' }
                ].map((asset, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-theme-accent/10 rounded-md">
                    <div className="flex items-center">
                      <div className="w-7 h-7 bg-theme-accent/20 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold text-theme-accent">{asset.symbol}</span>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-theme-text-primary">{asset.symbol}</div>
                        <div className="text-[10px] text-theme-text-secondary">{asset.amount}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-theme-text-primary">{asset.value}</div>
                      <div className="text-[10px] text-theme-accent">{asset.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-theme-text-primary mb-2">Portfolio Value History</div>
              <div className="h-32 bg-theme-accent/10 rounded-lg"></div>
            </div>
          </Card>

          <Card title="Performance" icon={<LineChart size={14} />}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-theme-accent/10 p-3 rounded-md">
                  <div className="text-xs text-theme-accent mb-1">1M Return</div>
                  <div className="text-lg font-bold text-theme-text-primary">+5.8%</div>
                </div>
                <div className="bg-theme-accent/10 p-3 rounded-md">
                  <div className="text-xs text-theme-accent mb-1">3M Return</div>
                  <div className="text-lg font-bold text-theme-text-primary">+12.4%</div>
                </div>
                <div className="bg-theme-accent/10 p-3 rounded-md">
                  <div className="text-xs text-theme-accent mb-1">1Y Return</div>
                  <div className="text-lg font-bold text-theme-text-primary">+32.7%</div>
                </div>
              </div>

              <div className="bg-theme-accent/10 p-3 rounded-md">
                <div className="text-xs text-theme-accent mb-2">Monthly Performance</div>
                <div className="h-32"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;