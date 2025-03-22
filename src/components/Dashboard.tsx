import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  Settings,
  Eye,
  EyeOff,
  Info,
  Layout,
  Check,
  X,
  RotateCw
} from 'lucide-react';
import DashboardSelectionModal from './DashboardSelectionModal';
import { 
  availableComponents, 
  dashboardPresets,
  defaultDashboardLayout,
  getComponentById,
  DashboardPreset
} from '../utils/dashboardPresets';
import { snapToGrid, hasGaps, autoArrangeLayout } from '../utils/gridUtils';

// Import all dashboard component widgets
import MarketOverview from './dashboard/MarketOverview';
import NewsFeed from './dashboard/NewsFeed';
import TopMovers from './dashboard/TopMovers';
import PriceChart from './dashboard/PriceChart';
import VolumeVolatility from './dashboard/VolumeVolatility';
import AIInsights from './dashboard/AIInsights';
import EconomicCalendar from './dashboard/EconomicCalendar';
import Watchlist from './dashboard/Watchlist';
import Alerts from './dashboard/Alerts';
import DiscussionTrends from './dashboard/DiscussionTrends';
import PortfolioSnapshot from './dashboard/PortfolioSnapshot';
import TokenSearchCard from './dashboard/TokenSearchCard';
import StockFinancials from './dashboard/StockFinancials';
import DeveloperActivity from './dashboard/DeveloperActivity';

const ResponsiveGridLayout = WidthProvider(Responsive);
// Generate layout definitions from the preset components
const generateLayoutsFromPreset = (preset: DashboardPreset, defaultLayouts: any) => {
  const layouts: {[key: string]: any[]} = { lg: [], md: [], sm: [], xs: [] };
  const breakpoints = ['lg', 'md', 'sm', 'xs'];
  
  preset.components.forEach((componentId, index) => {
    const component = getComponentById(componentId);
    if (!component) return;
    
    // Find default layout for this component if it exists
    const defaultLayoutItem = defaultLayouts.lg.find((item: any) => item.i === componentId);
    
    breakpoints.forEach(breakpoint => {
      const cols = { lg: 3, md: 3, sm: 3, xs: 1 }[breakpoint] || 3;
      const isWideComponent = component.colSpan && component.colSpan > 1;
      const isTallComponent = component.rowSpan && component.rowSpan > 1;
      
      // Calculate position (simple auto-layout)
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      const width = isWideComponent && (breakpoint !== 'xs') ? Math.min(component.colSpan || 1, cols) : 1;
      const height = isTallComponent ? component.rowSpan || 1 : 1;
      
      layouts[breakpoint].push({
        i: componentId,
        x: breakpoint === 'xs' ? 0 : col,
        y: row * height,
        w: width,
        h: defaultLayoutItem?.h || (height * 2),
        minW: 1,
        minH: defaultLayoutItem?.minH || 2
      });
    });
  });
  
  return layouts;
};

// Default layouts for the components
const defaultLayouts = {
  lg: [
    { i: 'market-overview', x: 0, y: 0, w: 2, h: 4, minW: 1, minH: 3 },
    { i: 'token-search', x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'token-social', x: 2, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'social-sentiment', x: 0, y: 4, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'price-chart', x: 1, y: 4, w: 2, h: 4, minW: 1, minH: 3 },
    { i: 'news-feed', x: 0, y: 7, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'top-movers', x: 1, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'volume-volatility', x: 2, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'ai-insights', x: 0, y: 11, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'economic-calendar', x: 1, y: 11, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'watchlist', x: 0, y: 13, w: 2, h: 3, minW: 1, minH: 2 },
    { i: 'alerts', x: 2, y: 13, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'portfolio-snapshot', x: 0, y: 16, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'discussion-trends', x: 1, y: 16, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'stock-financials', x: 0, y: 18, w: 2, h: 3, minW: 1, minH: 2 }
  ],
  md: [
    { i: 'market-overview', x: 0, y: 0, w: 2, h: 4, minW: 1, minH: 3 },
    { i: 'token-search', x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'token-social', x: 2, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'social-sentiment', x: 0, y: 4, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'price-chart', x: 1, y: 4, w: 2, h: 4, minW: 1, minH: 3 },
    { i: 'news-feed', x: 0, y: 7, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'top-movers', x: 1, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'volume-volatility', x: 2, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'ai-insights', x: 0, y: 11, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'economic-calendar', x: 1, y: 11, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'watchlist', x: 0, y: 13, w: 2, h: 3, minW: 1, minH: 2 },
    { i: 'alerts', x: 2, y: 13, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'portfolio-snapshot', x: 0, y: 16, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'discussion-trends', x: 1, y: 16, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'stock-financials', x: 0, y: 18, w: 2, h: 3, minW: 1, minH: 2 }
  ],
  sm: [
    { i: 'market-overview', x: 0, y: 0, w: 3, h: 4, minW: 1, minH: 3 },
    { i: 'token-search', x: 0, y: 4, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'token-social', x: 0, y: 6, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'social-sentiment', x: 0, y: 8, w: 3, h: 3, minW: 1, minH: 2 },
    { i: 'price-chart', x: 0, y: 11, w: 3, h: 4, minW: 1, minH: 3 },
    { i: 'news-feed', x: 0, y: 15, w: 3, h: 4, minW: 1, minH: 3 },
    { i: 'top-movers', x: 0, y: 19, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'volume-volatility', x: 0, y: 21, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'ai-insights', x: 0, y: 23, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'economic-calendar', x: 0, y: 25, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'watchlist', x: 0, y: 27, w: 3, h: 3, minW: 1, minH: 2 },
    { i: 'alerts', x: 0, y: 30, w: 3, h: 3, minW: 1, minH: 2 },
    { i: 'portfolio-snapshot', x: 0, y: 33, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'discussion-trends', x: 0, y: 35, w: 3, h: 2, minW: 1, minH: 2 },
    { i: 'stock-financials', x: 0, y: 37, w: 3, h: 3, minW: 1, minH: 2 }
  ],
  xs: [
    { i: 'market-overview', x: 0, y: 0, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'token-search', x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'token-social', x: 0, y: 6, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'social-sentiment', x: 0, y: 8, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'price-chart', x: 0, y: 11, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'news-feed', x: 0, y: 15, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'top-movers', x: 0, y: 19, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'volume-volatility', x: 0, y: 21, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'ai-insights', x: 0, y: 23, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'economic-calendar', x: 0, y: 25, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'watchlist', x: 0, y: 27, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'alerts', x: 0, y: 30, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'portfolio-snapshot', x: 0, y: 33, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'discussion-trends', x: 0, y: 35, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'stock-financials', x: 0, y: 37, w: 1, h: 3, minW: 1, minH: 2 }
  ]
};
const Dashboard: React.FC = () => {
  const [visibleComponents, setVisibleComponents] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dashboardComponents');
      return saved ? JSON.parse(saved) : defaultDashboardLayout;
    } catch (e) {
      return defaultDashboardLayout;
    }
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [layouts, setLayouts] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardLayouts');
      return saved ? JSON.parse(saved) : defaultLayouts;
    } catch (e) {
      return defaultLayouts;
    }
  });
  
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [hasLayoutGaps, setHasLayoutGaps] = useState(false);
  const [autoArrange, setAutoArrange] = useState(false);
  const [snapFit, setSnapFit] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('dashboardComponents', JSON.stringify(visibleComponents));
  }, [visibleComponents]);

  useEffect(() => {
    localStorage.setItem('dashboardLayouts', JSON.stringify(layouts));
  }, [layouts]);

  // Filter layouts to only show visible components
  const getFilteredLayouts = () => {
    const filtered: {[key: string]: any[]} = {};
    Object.keys(layouts).forEach(breakpoint => {
      filtered[breakpoint] = layouts[breakpoint].filter(item => 
        visibleComponents.includes(item.i)
      );
    });
    return filtered;
  };

  // Process layout with optimizations
  const processedLayouts = () => {
    const currentLayout = getFilteredLayouts()[currentBreakpoint] || [];
    
    let processedLayout = [...currentLayout];

    // Apply snap to grid if enabled
    if (snapFit) {
      processedLayout = snapToGrid(processedLayout);
    }
    
    // Apply auto arrange if enabled 
    if (autoArrange) {
      const cols = {lg: 3, md: 3, sm: 3, xs: 1}[currentBreakpoint] || 3;
      processedLayout = autoArrangeLayout(processedLayout, cols);
    }

    return {
      [currentBreakpoint]: processedLayout
    };
  };

  // Check for gaps whenever layouts change
  useEffect(() => {
    if (layouts[currentBreakpoint]) {
      const cols = {lg: 3, md: 3, sm: 3, xs: 1}[currentBreakpoint] || 3;
      setHasLayoutGaps(hasGaps(layouts[currentBreakpoint], cols));
    }
  }, [layouts, currentBreakpoint]);

  // Toggle component visibility
  const toggleComponent = (componentId: string) => {
    setActivePreset(null);
    setVisibleComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  // Apply preset layout
  const handleSelectPreset = (presetId: string) => {
    const preset = dashboardPresets.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(presetId);
      setVisibleComponents(preset.components);
      
      // Generate layout from the preset
      if (preset.layout) {
        setLayouts(preset.layout);
      } else {
        // Create layout from the preset's components list
        const newLayouts = generateLayoutsFromPreset(preset, defaultLayouts);
        
        // Apply snap to grid to ensure uniform layout
        Object.keys(newLayouts).forEach(breakpoint => {
          newLayouts[breakpoint] = snapToGrid(newLayouts[breakpoint]);
        });
        
        setLayouts(newLayouts);
      }
      
      // Apply auto-arrange for optimal layout
      setAutoArrange(true);
      setShowLayoutModal(false);
    }
  };

  // Handle custom component selection
  const handleCustomSelection = (componentIds: string[]) => {
    setVisibleComponents(componentIds);
    setActivePreset(null);
    
    // Create a fresh layout for the custom selection
    const customPreset = {
      id: 'custom',
      name: 'Custom',
      components: componentIds,
      description: 'Your custom dashboard',
      thumbnail: 'standard'
    };
    
    // Generate new layouts and ensure they're uniform
    const newLayouts = generateLayoutsFromPreset(customPreset, defaultLayouts);
    Object.keys(newLayouts).forEach(breakpoint => {
      newLayouts[breakpoint] = snapToGrid(newLayouts[breakpoint]);
    });
    
    setLayouts(newLayouts);
    setAutoArrange(true);
    setShowLayoutModal(false);
  };

  // Handle layout changes
  const onLayoutChange = (currentLayout: any[], allLayouts: any) => {
    setLayouts(allLayouts);
  };

  // Reset to default layout
  const resetLayout = () => {
    setLayouts(defaultLayouts);
    setVisibleComponents(defaultDashboardLayout);
    setActivePreset('standard');
  };

  // Render the content for a specific component
  const renderComponentContent = (componentId: string) => {
    switch(componentId) {
      case 'market-overview':
        return <MarketOverview />;
      case 'token-search':
        return <TokenSearchCard />;
      case 'price-chart':
        return <PriceChart />;
      case 'news-feed':
        return <NewsFeed />;
      case 'top-movers':
        return <TopMovers />;
      case 'volume-volatility':
        return <VolumeVolatility />;
      case 'ai-insights':
        return <AIInsights />;
      case 'economic-calendar':
        return <EconomicCalendar />;
      case 'watchlist':
        return <Watchlist />;
      case 'alerts':
        return <Alerts />;
      case 'portfolio-snapshot':
        return <PortfolioSnapshot />;
      case 'discussion-trends':
        return <DiscussionTrends />;
      case 'stock-financials':
        return <StockFinancials />;
      case 'developer-activity':
        return <DeveloperActivity />;
      default:
        return <div>Component not found</div>;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Settings Bar */}
      <div className="bg-theme-bg/30 backdrop-blur-sm rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-theme-text-primary">Dashboard</h2>
              <p className="text-sm text-theme-accent">
                {activePreset 
                  ? `${dashboardPresets.find(p => p.id === activePreset)?.name || 'Custom'} Layout` 
                  : 'Custom Layout'}
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                className="flex items-center text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1.5 rounded-lg transition-colors"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={14} className="mr-1.5" />
                {showSettings ? 'Hide Settings' : 'Show Settings'}
              </button>
              <button 
                className="flex items-center text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1.5 rounded-lg transition-colors"
                onClick={() => setShowLayoutModal(true)}
              >
                <Layout size={14} className="mr-1.5" />
                Change Layout
              </button>
            </div>
          </div>
          
          {/* Layout Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Grid Settings */}
            <div className="flex items-center gap-1">
              <button
                className={`flex items-center text-xs px-2 py-1 rounded ${
                  autoArrange 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-accent/10 text-theme-text-primary hover:bg-theme-accent/20'
                }`}
                onClick={() => setAutoArrange(!autoArrange)}
                title="Auto arrange grid items to eliminate gaps"
              >
                <span className="mr-1">Auto-Arrange</span>
                {autoArrange ? <Check size={12} /> : <X size={12} />}
              </button>
              
              <button
                className={`flex items-center text-xs px-2 py-1 rounded ${
                  snapFit 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-accent/10 text-theme-text-primary hover:bg-theme-accent/20'
                }`}
                onClick={() => setSnapFit(!snapFit)}
                title="Snap items to grid"
              >
                <span className="mr-1">Snap-Grid</span>
                {snapFit ? <Check size={12} /> : <X size={12} />}
              </button>
              
              <button 
                className="flex items-center text-xs bg-theme-accent/10 text-theme-text-primary hover:bg-theme-accent/20 px-2 py-1 rounded"
                onClick={resetLayout}
                title="Reset to default layout"
              >
                <RotateCw size={12} className="mr-1" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Component Visibility Settings */}
        {showSettings && (
          <div className="mt-4 p-3 bg-theme-accent/10 rounded-lg border border-theme-border">
            <h3 className="text-sm font-medium text-theme-text-primary mb-3">Visible Components</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableComponents.map(component => (
                <button
                  key={component.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    visibleComponents.includes(component.id)
                      ? 'bg-theme-bg text-theme-text-primary'
                      : 'bg-theme-accent/5 text-theme-text-secondary hover:bg-theme-accent/10'
                  }`}
                  onClick={() => toggleComponent(component.id)}
                >
                  <div className="flex items-center">
                    {component.icon}
                    <span className="ml-2 text-xs">{component.name}</span>
                  </div>
                  {visibleComponents.includes(component.id) ? (
                    <Eye size={14} className="text-theme-accent" />
                  ) : (
                    <EyeOff size={14} className="text-theme-text-secondary" />
                  )}
                </button>
              ))}
            </div>
            
            {hasLayoutGaps && (
              <div className="mt-3 flex items-center text-xs text-amber-500 dark:text-amber-400">
                <Info size={12} className="mr-1" />
                Layout has gaps. Enable Auto-Arrange to optimize.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {visibleComponents.length > 0 ? (
          <ResponsiveGridLayout
            className="layout layout-transition"
            layouts={processedLayouts()}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 3, md: 3, sm: 3, xs: 1 }}
            rowHeight={120}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            onLayoutChange={onLayoutChange}
            onBreakpointChange={setCurrentBreakpoint}
            draggableHandle=".card-header"
            useCSSTransforms={true}
            isDraggable
            isResizable
          >
            {getFilteredLayouts()[currentBreakpoint]?.map(item => {
              const component = getComponentById(item.i);
              return (
                <div key={item.i} className="rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out h-full">
                  <Card
                    title={component?.name || item.i}
                    icon={component?.icon}
                    isDraggable={true}
                    isResizable={true}
                    className="h-full w-full"
                  >
                    <div className="h-full overflow-auto">
                      {renderComponentContent(item.i)}
                    </div>
                  </Card>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center p-8 bg-theme-bg-secondary rounded-lg border border-theme-border">
            <Info size={32} className="text-theme-accent mb-4" />
            <h3 className="text-lg font-medium text-theme-text-primary mb-2">No Dashboard Components Selected</h3>
            <p className="text-sm text-theme-text-secondary mb-4 text-center">
              Your dashboard is empty. Add components or select a preset layout to get started.
            </p>
            <button 
              className="bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-4 py-2 rounded-lg transition-colors text-sm"
              onClick={() => setShowLayoutModal(true)}
            >
              Select Dashboard Layout
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Selection Modal */}
      <DashboardSelectionModal 
        isOpen={showLayoutModal}
        onClose={() => setShowLayoutModal(false)}
        onSelectPreset={handleSelectPreset}
        onCustomSelection={handleCustomSelection}
        presets={dashboardPresets}
        availableComponents={availableComponents}
        selectedComponents={visibleComponents}
      />
    </div>
  );
};

export default Dashboard;