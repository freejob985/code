import React, { useState, useEffect, useRef } from 'react';
import { Copy, Edit, Trash2, Star, Upload, Eye, Download, Share } from 'lucide-react';

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  visible: boolean;
}

export function ContextMenu({ x, y, items, onClose, visible }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{
        left: x,
        top: y,
        transform: 'translate(0, 0)'
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.separator && index > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          )}
          <button
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left transition-colors ${
              item.disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// Hook لاستخدام قائمة السياق
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
    items: ContextMenuItem[];
  }>({
    x: 0,
    y: 0,
    visible: false,
    items: []
  });

  const showContextMenu = (event: React.MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = document.body.getBoundingClientRect();
    const x = Math.min(event.clientX, rect.width - 200);
    const y = Math.min(event.clientY, rect.height - items.length * 40);

    setContextMenu({
      x,
      y,
      visible: true,
      items
    });
  };

  const hideContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };
}