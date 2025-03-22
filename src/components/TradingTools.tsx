import React, { useState } from 'react';
import Card from './Card';
import { 
  LineChart as LineChartIcon, 
  Calculator, 
  Calendar,
  ChevronDown,
  ArrowRight,
  Info
} from 'lucide-react';

const TradingTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'charts' | 'calculator' | 'calendar'>('charts');
  
  return (
    <div className="space-y-4">
      <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-theme-text-primary">Trading Tools & Analysis</h2>
            <p className="text-sm text-theme-accent">Advanced tools to improve your trading decisions</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                activeTab === 'charts' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('charts')}
            >
              <LineChartIcon size={14} className="mr-1" />
              Charts
            </button>
            <button
              className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                activeTab === 'calculator' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('calculator')}
            >
              <Calculator size={14} className="mr-1" />
              Calculator
            </button>
            <button
              className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                activeTab === 'calendar' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('calendar')}
            >
              <Calendar size={14} className="mr-1" />
              Calendar
            </button>
          </div>
        </div>

        {/* TradingView Chart Integration */}
        <div className="h-[500px] border border-theme-border rounded-lg bg-theme-bg mb-4">
          <div className="text-center p-4 bg-theme-accent/10 border-b border-theme-border">
            <p className="text-sm text-theme-text-primary">
              TradingView charts would be integrated here in a production environment
            </p>
          </div>
          <div className="p-4 h-[calc(100%-52px)] flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
              alt="Trading chart example" 
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
        </div>

        {/* Chart Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Price Chart" icon={<LineChartIcon size={14} />}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button className="text-xs px-3 py-1 rounded-lg bg-theme-accent text-theme-bg">1H</button>
                <button className="text-xs px-3 py-1 rounded-lg bg-theme-accent/10 text-theme-accent">1D</button>
                <button className="text-xs px-3 py-1 rounded-lg bg-theme-accent/10 text-theme-accent">1W</button>
                <button className="text-xs px-3 py-1 rounded-lg bg-theme-accent/10 text-theme-accent">1M</button>
                <button className="text-xs px-3 py-1 rounded-lg bg-theme-accent/10 text-theme-accent">1Y</button>
              </div>
            </div>

            <div className="h-64 bg-theme-accent/10 rounded-lg flex items-center justify-center">
              <p className="text-theme-text-secondary text-sm">Chart visualization would be rendered here</p>
            </div>
          </Card>

          <Card title="Market Profile" icon={<Info size={14} />}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-theme-text-primary">BTC/USD Value Areas</h3>
              <button className="text-theme-accent hover:text-theme-accent-dark">
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="relative h-64 bg-theme-accent/10 rounded-lg p-4">
              <div className="absolute right-4 top-4 flex flex-col space-y-1 text-right text-xs">
                <div className="flex items-center justify-end">
                  <span className="text-theme-text-secondary mr-1">High:</span>
                  <span className="font-medium text-theme-text-primary">$47,250</span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-theme-text-secondary mr-1">VA High:</span>
                  <span className="font-medium text-theme-text-primary">$46,100</span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-theme-text-secondary mr-1">POC:</span>
                  <span className="font-medium text-theme-text-primary">$45,500</span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-theme-text-secondary mr-1">VA Low:</span>
                  <span className="font-medium text-theme-text-primary">$44,800</span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-theme-text-secondary mr-1">Low:</span>
                  <span className="font-medium text-theme-text-primary">$43,950</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-theme-text-secondary">
              <p className="mb-2">
                <span className="font-medium text-theme-text-primary">Market Profile Analysis:</span> The Point of Control (POC) sits at $45,500 with 68% of volume trading within the Value Area. This suggests a balanced market with potential support forming at the VA Low.
              </p>
              <p>
                <span className="font-medium text-theme-text-primary">Key Levels:</span> Watch for reactions at the Value Area High and Low as price approaches these levels. A sustained break outside the Value Area may signal directional bias.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingTools;