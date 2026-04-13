/**
 * React Router DOM Compatibility Shim for Next.js
 * 
 * This module provides drop-in replacements for react-router-dom APIs
 * using Next.js navigation primitives. It allows existing components
 * that import from 'react-router-dom' to work seamlessly in Next.js.
 * 
 * Supported APIs:
 * - Link (maps to Next.js Link, converts `to` → `href`)
 * - useNavigate (maps to Next.js useRouter)
 * - useLocation (maps to Next.js usePathname + useSearchParams)
 * - BrowserRouter, Route, Routes (no-op wrappers for compatibility)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Compatible Link component that accepts `to` prop (react-router-dom style)
 * and maps it to Next.js `href`.
 */
const CompatibleLink = React.forwardRef(function CompatibleLink(
  { to, replace, state, ...props },
  ref
) {
  return <Link href={to || '/'} {...props} ref={ref} />;
});

/**
 * useNavigate hook that mimics react-router-dom's useNavigate
 * using Next.js router.
 */
function useNavigate() {
  const router = useRouter();
  
  return (to, options) => {
    if (typeof to === 'number') {
      // navigate(-1) for going back
      router.back();
    } else if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

/**
 * useLocation hook that mimics react-router-dom's useLocation
 * using Next.js navigation hooks.
 */
function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
  };
}

/**
 * No-op BrowserRouter - Next.js handles routing
 */
function BrowserRouter({ children }) {
  return children;
}

/**
 * No-op Routes wrapper
 */
function Routes({ children }) {
  return children;
}

/**
 * No-op Route wrapper
 */
function Route({ element, children }) {
  return element || children || null;
}

export {
  CompatibleLink as Link,
  useNavigate,
  useLocation,
  BrowserRouter,
  Routes,
  Route,
};

export default CompatibleLink;
