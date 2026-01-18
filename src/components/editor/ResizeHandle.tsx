import React from 'react';

interface ResizeHandleProps {
  cursor: string;
  onMouseDown: (e: React.MouseEvent) => void;
  position: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ cursor, onMouseDown, position }) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left': return { top: -6, left: -6 };
      case 'top-right': return { top: -6, right: -6 };
      case 'bottom-left': return { bottom: -6, left: -6 };
      case 'bottom-right': return { bottom: -6, right: -6 };
      case 'rotate': return { top: -25, left: '50%', transform: 'translateX(-50%)' };
      default: return {};
    }
  };

  return (
    <div
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }}
      className={`absolute w-3 h-3 bg-white border border-blue-500 rounded-full z-50 hover:bg-blue-50 hover:scale-125 transition-transform ${position === 'rotate' ? 'cursor-grab' : ''}`}
      style={{ 
        cursor: position === 'rotate' ? 'grab' : cursor, 
        ...getPositionStyles() 
      }}
    >
      {position === 'rotate' && (
        <div className="absolute top-3 left-1/2 w-px h-3 bg-blue-500 -translate-x-1/2 pointer-events-none" />
      )}
    </div>
  );
};