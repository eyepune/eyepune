'use client';

import { useEffect } from 'react';

export default function SecurityProvider() {
  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Prevent developer tools shortcuts
    const handleKeyDown = (e) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }
      
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
      
      // Prevent Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }
      
      // Prevent Ctrl+P (Print)
      if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
      }
    };

    // Prevent copying
    const handleCopy = (e) => {
      e.preventDefault();
    };

    // Prevent cutting
    const handleCut = (e) => {
      e.preventDefault();
    };

    // Prevent text selection
    const handleSelectStart = (e) => {
      e.preventDefault();
    };

    // Prevent dragging images/elements
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
