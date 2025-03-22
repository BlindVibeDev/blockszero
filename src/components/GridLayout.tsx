import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/styles.css';
import { debounceLocalStorage, memoize, createTimer, useRenderCount } from '../utils/performanceUtils';
import { autoArrangeLayout, snapToGrid, autoFillLayout, hasGaps } from '../utils/gridUtils';

// Width provider enhances the base responsive grid layout
const ResponsiveGridLayout = WidthProvider(Responsive);

// Memoized version of findOptimalDimensions for better performance
const memoizedFindOptimalDimensions = memoize(
  (layout: Layout[], item: Layout, cols: number): { w: number, h: number } => {
    // Initialize dimensions to current size
    let optimalWidth = item.w;
    let optimalHeight = item.h;
    
    // First, check if we can increase width to fill empty space to the right
    let maxPossibleWidth = cols - item.x;
    
    // Now check for items that would block this expansion
    layout.forEach(otherItem => {
      if (otherItem.i !== item.i && 
          otherItem.y < item.y + item.h && 
          otherItem.y + otherItem.h > item.y && 
          otherItem.x > item.x && 
          otherItem.x < item.x + maxPossibleWidth) {
        // An item is blocking full expansion
        maxPossibleWidth = Math.min(maxPossibleWidth, otherItem.x - item.x);
      }
    });
    
    // Determine if we should expand to fill empty space
    // Only expand if there's at least one column of space available
    if (maxPossibleWidth > item.w) {
      optimalWidth = maxPossibleWidth;
    }
    
    // Now check if we can optimize height
    // First find the closest item below this one
    let nextItemY = Infinity;
    layout.forEach(otherItem => {
      if (otherItem.i !== item.i && 
          otherItem.y > item.y && 
          otherItem.x < item.x + optimalWidth && 
          otherItem.x + otherItem.w > item.x) {
        nextItemY = Math.min(nextItemY, otherItem.y);
      }
    });
    
    // If we found a valid item below, resize height to match
    if (nextItemY !== Infinity) {
      optimalHeight = nextItemY - item.y;
    }
    
    // Apply min/max constraints
    const minW = item.minW || 1;
    const minH = item.minH || 1;
    const maxW = item.maxW || Infinity;
    const maxH = item.maxH || Infinity;
    
    return {
      w: Math.max(minW, Math.min(optimalWidth, maxW)),
      h: Math.max(minH, Math.min(optimalHeight, maxH))
    };
  }
);

// Memoized version of compactLayout for better performance
const memoizedCompactLayout = memoize((layout: Layout[]): Layout[] => {
  // Sort by y position first, then x position
  const sortedLayout = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  const compacted = [...sortedLayout];
  
  // Loop through items and adjust their positions
  for (let i = 0; i < compacted.length; i++) {
    let item = compacted[i];
    
    // Try to move each item up as far as possible
    let newY = item.y;
    while (newY > 0) {
      let canMoveUp = true;
      
      // Check if any item is blocking the move up
      for (let j = 0; j < compacted.length; j++) {
        if (i === j) continue; // Skip comparing with self
        
        const otherItem = compacted[j];
        
        // Check if items overlap horizontally
        const horizontalOverlap = 
          item.x < otherItem.x + otherItem.w && 
          item.x + item.w > otherItem.x;
        
        // Check if moving up would cause vertical overlap
        const wouldOverlap = otherItem.y + otherItem.h > newY - 1 && otherItem.y < newY;
        
        if (horizontalOverlap && wouldOverlap) {
          canMoveUp = false;
          break;
        }
      }
      
      if (canMoveUp) {
        newY--; // Move up by one position
      } else {
        break; // Can't move up further
      }
    }
    
    // Update the item's position if it moved
    if (newY !== item.y) {
      compacted[i] = { ...item, y: newY };
    }
  }
  
  return compacted;
});

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

interface GridLayoutProps {
  children: React.ReactNode;
  layouts: { [breakpoint: string]: LayoutItem[] };
  breakpoints?: { [breakpoint: string]: number };
  cols?: { [breakpoint: string]: number };
  rowHeight?: number;
  containerPadding?: [number, number];
  margin?: [number, number];
  className?: string;
  onLayoutChange?: (currentLayout: LayoutItem[], allLayouts: { [breakpoint: string]: LayoutItem[] }) => void;
  isDraggable?: boolean;
  isResizable?: boolean;
  preventCollision?: boolean;
  compactType?: 'vertical' | 'horizontal' | null;
  autoSize?: boolean;
  enablePerformanceTracking?: boolean;
  autoArrange?: boolean;
  snapToGrid?: boolean;
  autoFill?: boolean;
  gapDetection?: boolean;
}

const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  layouts,
  breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight = 100,
  containerPadding = [10, 10],
  margin = [10, 10],
  className = '',
  onLayoutChange,
  isDraggable = true,
  isResizable = true,
  preventCollision = false,
  compactType = 'vertical',
  autoSize = true,
  enablePerformanceTracking = false,
  autoArrange = true,
  snapToGrid: enableSnapToGrid = true,
  autoFill = false,
  gapDetection = true
}) => {
  // Track render count in development for performance optimization
  const renderCount = process.env.NODE_ENV !== 'production' && enablePerformanceTracking 
    ? useRenderCount('GridLayout')
    : 0;

  const [currentLayouts, setCurrentLayouts] = useState(layouts);
  const [mounted, setMounted] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('lg');
  const [isAutoResizing, setIsAutoResizing] = useState(false);
  const [hasLayoutGaps, setHasLayoutGaps] = useState(false);
  
  // Create a debounced localStorage save function
  const saveLayoutToLocalStorage = useMemo(
    () => debounceLocalStorage<{ [breakpoint: string]: LayoutItem[] }>('dashboardLayout', 500),
    []
  );

  // We need to detect if we're in the browser 
  // for server-side rendering compatibility
  useEffect(() => {
    setMounted(true);
    
    // Try to restore saved layout from localStorage on mount
    try {
      const savedLayout = localStorage.getItem('dashboardLayout');
      if (savedLayout) {
        const parsedLayout = JSON.parse(savedLayout);
        setCurrentLayouts(parsedLayout);
      }
    } catch (error) {
      console.error('Error restoring layout from localStorage:', error);
    }
  }, []);

  // Apply layout optimizations when needed
  useEffect(() => {
    if (!mounted || isAutoResizing) return;
    
    const currentColCount = cols[currentBreakpoint];
    const currentBreakpointLayout = currentLayouts[currentBreakpoint];
    
    // Only proceed if we have a layout for the current breakpoint
    if (!currentBreakpointLayout || currentBreakpointLayout.length === 0) return;
    
    // Check for gaps if gap detection is enabled
    if (gapDetection) {
      const layoutHasGaps = hasGaps(currentBreakpointLayout, currentColCount);
      setHasLayoutGaps(layoutHasGaps);
      
      // Auto arrange if gaps are detected and autoArrange is enabled
      if (layoutHasGaps && autoArrange) {
        const timer = enablePerformanceTracking ? createTimer('autoArrangeLayout') : null;
        
        // Apply auto-arrange to remove gaps
        const optimizedLayout = autoArrangeLayout(currentBreakpointLayout, currentColCount);
        
        // Apply auto-fill if enabled
        const finalLayout = autoFill 
          ? autoFillLayout(optimizedLayout, currentColCount)
          : optimizedLayout;
        
        // Update the layout
        const updatedLayouts = {
          ...currentLayouts,
          [currentBreakpoint]: finalLayout
        };
        
        setCurrentLayouts(updatedLayouts);
        saveLayoutToLocalStorage(updatedLayouts);
        
        if (onLayoutChange) {
          onLayoutChange(finalLayout, updatedLayouts);
        }
        
        if (timer) timer.stop();
      }
    }
  }, [mounted, currentBreakpoint, cols, currentLayouts, isAutoResizing, autoArrange, autoFill, gapDetection]);

  // Memoize the breakpoint change handler
  const handleBreakpointChange = useCallback((newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  }, []);

  // Handle layout changes with improved performance
  const handleLayoutChange = useCallback((currentLayout: LayoutItem[], allLayouts: { [breakpoint: string]: LayoutItem[] }) => {
    // Performance tracking in development
    const timer = enablePerformanceTracking ? createTimer('handleLayoutChange') : null;
    
    // Only update layouts if we're not in the middle of auto-resizing
    if (!isAutoResizing) {
      // Apply snap to grid if enabled
      let processedLayout = currentLayout;
      
      if (enableSnapToGrid) {
        processedLayout = snapToGrid(currentLayout);
      }
      
      // Update allLayouts with the processed layout
      const processedAllLayouts = {
        ...allLayouts,
        [currentBreakpoint]: processedLayout
      };
      
      setCurrentLayouts(processedAllLayouts);
      
      // If a layout change callback is provided, call it
      if (onLayoutChange) {
        onLayoutChange(processedLayout, processedAllLayouts);
      }
      
      // Save the layout to localStorage using debounced function
      saveLayoutToLocalStorage(processedAllLayouts);
    }
    
    // Log performance metrics if enabled
    if (timer) timer.stop();
  }, [isAutoResizing, onLayoutChange, saveLayoutToLocalStorage, enablePerformanceTracking, currentBreakpoint, enableSnapToGrid]);

  // Handle drag stop with memoized optimal dimensions calculation
  const handleDragStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => {
    if (!autoSize) return;
    
    // Performance tracking in development
    const timer = enablePerformanceTracking ? createTimer('handleDragStop') : null;

    // Get the current breakpoint's column count
    const currentCols = cols[currentBreakpoint];
    
    // Apply snap to grid if enabled
    let processedLayout = layout;
    let processedNewItem = newItem;
    
    if (enableSnapToGrid) {
      processedLayout = snapToGrid(layout);
      processedNewItem = processedLayout.find(item => item.i === newItem.i) || newItem;
    }
    
    // Find optimal dimensions at new position using memoized function
    const optimalDimensions = memoizedFindOptimalDimensions(processedLayout, processedNewItem, currentCols);
    
    // Only proceed with auto-resizing if dimensions need to change
    if (optimalDimensions.w !== processedNewItem.w || optimalDimensions.h !== processedNewItem.h) {
      setIsAutoResizing(true);
      
      // Create a new layout with the updated item size
      const updatedLayout = processedLayout.map(item => {
        if (item.i === processedNewItem.i) {
          return {
            ...item,
            w: optimalDimensions.w,
            h: optimalDimensions.h,
            className: 'auto-resizing'
          };
        }
        return item;
      });
      
      // Apply auto-arrange if enabled
      let finalLayout = updatedLayout;
      
      if (autoArrange) {
        finalLayout = autoArrangeLayout(updatedLayout, currentCols);
        
        // Apply auto-fill if enabled
        if (autoFill) {
          finalLayout = autoFillLayout(finalLayout, currentCols);
        }
      }
      
      // Update the current layout
      const updatedLayouts = {
        ...currentLayouts,
        [currentBreakpoint]: finalLayout
      };
      
      setCurrentLayouts(updatedLayouts);
      
      // Save the updated layout using debounced function
      saveLayoutToLocalStorage(updatedLayouts);
      
      // Call the onLayoutChange callback if provided
      if (onLayoutChange) {
        onLayoutChange(finalLayout, updatedLayouts);
      }
      
      // Reset the auto-resizing flag after a short delay
      setTimeout(() => {
        setIsAutoResizing(false);
      }, 300);
    }
    
    // Log performance metrics if enabled
    if (timer) timer.stop();
  }, [autoSize, cols, currentBreakpoint, currentLayouts, onLayoutChange, saveLayoutToLocalStorage, enablePerformanceTracking, enableSnapToGrid, autoArrange, autoFill]);

  // Handle resize stop to recompact the layout with improved performance
  const handleResizeStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => {
    if (!autoSize) return;
    
    // Performance tracking in development
    const timer = enablePerformanceTracking ? createTimer('handleResizeStop') : null;
    
    // Apply snap to grid if enabled
    let processedLayout = layout;
    
    if (enableSnapToGrid) {
      processedLayout = snapToGrid(layout);
    }
    
    // Recompact the layout to eliminate gaps using memoized function or autoArrange
    const compactedLayout = autoArrange 
      ? autoArrangeLayout(processedLayout, cols[currentBreakpoint])
      : memoizedCompactLayout(processedLayout);
    
    // Apply auto-fill if enabled
    let finalLayout = compactedLayout;
    if (autoFill) {
      finalLayout = autoFillLayout(compactedLayout, cols[currentBreakpoint]);
    }
    
    // Only update if there are changes
    if (JSON.stringify(finalLayout) !== JSON.stringify(layout)) {
      setIsAutoResizing(true);
      
      // Update the current layout
      const updatedLayouts = {
        ...currentLayouts,
        [currentBreakpoint]: finalLayout
      };
      
      setCurrentLayouts(updatedLayouts);
      
      // Save the updated layout using debounced function
      saveLayoutToLocalStorage(updatedLayouts);
      
      // Call the onLayoutChange callback if provided
      if (onLayoutChange) {
        onLayoutChange(finalLayout, updatedLayouts);
      }
      
      // Reset the auto-resizing flag after a short delay
      setTimeout(() => {
        setIsAutoResizing(false);
      }, 300);
    }
    
    // Log performance metrics if enabled
    if (timer) timer.stop();
  }, [autoSize, currentBreakpoint, cols, currentLayouts, onLayoutChange, saveLayoutToLocalStorage, enablePerformanceTracking, enableSnapToGrid, autoArrange, autoFill]);

  // Return null before mounting to avoid server-side rendering issues
  if (!mounted) return null;
  
  return (
    <div className={`grid-layout-container ${className} ${hasLayoutGaps ? 'has-gaps' : ''}`}>
      {mounted && (
        <ResponsiveGridLayout
          layouts={currentLayouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={rowHeight}
          containerPadding={containerPadding}
          margin={margin}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          isDraggable={isDraggable}
          isResizable={isResizable}
          preventCollision={preventCollision}
          compactType={compactType}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          className={`${className} ${enablePerformanceTracking ? 'performance-tracking' : ''} ${autoArrange ? 'auto-arrange' : ''} ${enableSnapToGrid ? 'snap-to-grid' : ''} ${autoFill ? 'auto-fill' : ''}`}
        >
          {children}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};

export default GridLayout;