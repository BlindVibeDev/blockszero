import React, { ReactNode, useState } from 'react';
import { X, ChevronDown, Maximize2, Minimize2, GripVertical } from 'lucide-react';

interface CardProps {
  title?: string;
  children?: ReactNode;
  content?: React.ReactNode;
  color?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  isDraggable?: boolean;
  isResizable?: boolean;
  onExpandToggle?: (expanded: boolean) => void;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  content,
  color = 'theme-accent',
  icon,
  footer,
  onClose,
  className = '',
  isDraggable = false,
  isResizable = false,
  onExpandToggle,
}) => {
  const [expanded, setExpanded] = useState(true);
  
  const handleExpandToggle = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    if (onExpandToggle) {
      onExpandToggle(newExpandedState);
    }
  };
  
  const displayContent = content || children;
  
  return (
    <div className={`card flex flex-col h-full w-full bg-theme-card rounded-lg shadow-md transition-shadow border border-theme-border/10 hover:border-theme-border/20 ${className}`}>
      {title && (
        <div className={`card-header flex items-center justify-between p-3 border-b border-theme-border/20 bg-theme-card-header ${isDraggable ? 'cursor-move' : ''}`}>
          <div className="flex items-center">
            {isDraggable && (
              <div className="cursor-move p-1 text-theme-accent/50 hover:text-theme-accent touch-none">
                <GripVertical size={14} />
              </div>
            )}
            {icon && <span className={`text-${color} mr-2`}>{icon}</span>}
            <h3 className="text-sm font-medium text-theme-text-primary">{title}</h3>
          </div>
          <div className="flex items-center space-x-1">
            {isResizable && (
              <button 
                className="text-theme-accent hover:text-theme-accent-dark p-1 rounded transition-colors"
                onClick={handleExpandToggle}
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-theme-text-secondary hover:text-theme-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className={`transition-all duration-300 ease-in-out overflow-auto relative ${expanded ? 'flex-grow p-3' : 'h-0 p-0'}`}>
        {expanded && displayContent}
      </div>
      
      {footer && expanded && (
        <div className="p-3 border-t border-theme-border mt-auto">
          {footer}
        </div>
      )}
      
      <style jsx>{`
        .card {
          transition: 
            box-shadow 0.3s ease,
            border-color 0.3s ease,
            transform 0.1s ease;
        }
        
        .card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .card.react-draggable-dragging {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          transform: scale(1.01);
          z-index: 100;
        }
        
        .card .overflow-auto::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .card .overflow-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        
        .card .overflow-auto::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 3px;
        }
        
        .card .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Card;