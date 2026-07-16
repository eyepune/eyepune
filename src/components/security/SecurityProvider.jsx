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

    // --- DevTools Detection & Defense ---
    
    // 1. Constantly clear the console
    const clearConsoleInterval = setInterval(() => {
      console.clear();
      // Print a massive warning message to deter inspection
      console.log("%c STOP!", "color: red; font-size: 50px; font-weight: bold; text-shadow: 1px 1px 5px black;");
      console.log("%cThis is a restricted browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or 'hack' someone's account, it is a scam and will give them access to your account.", "font-size: 16px; font-weight: bold;");
    }, 1000);

    // 2. The Debugger Trap
    // When DevTools is opened, this loop will pause execution constantly.
    const debuggerTrap = setInterval(() => {
      const start = new Date();
      debugger; // This halts the browser if DevTools is open
      const end = new Date();
      // If the difference is large, it means the debugger actually paused it.
      if (end - start > 100) {
        // Punish the attempt: crash the tab or redirect
        window.location.href = "about:blank";
      }
    }, 100);

    // Removed DevTools Dimension Check because it falsely triggers on mobile browsers
    // due to dynamic address bars and bottom navigation causing large differences 
    // between outerHeight and innerHeight.

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(clearConsoleInterval);
      clearInterval(debuggerTrap);
    };
  }, []);

  return null;
}
