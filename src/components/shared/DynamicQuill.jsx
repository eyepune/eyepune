'use client';

import dynamic from 'next/dynamic';

/**
 * Dynamically loaded ReactQuill that skips SSR.
 *
 * The `quill` package references `document` at the module top-level,
 * which crashes Next.js server-side rendering.  This wrapper uses
 * `next/dynamic` with `ssr: false` so the editor is only loaded in
 * the browser.
 *
 * Usage:  import DynamicQuill from '@/components/shared/DynamicQuill';
 *         <DynamicQuill value={val} onChange={setVal} />
 *
 * All props are forwarded to the underlying ReactQuill component.
 */
const DynamicQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full rounded border bg-muted animate-pulse flex items-center justify-center text-muted-foreground text-sm">
      Loading editor…
    </div>
  ),
});

export default DynamicQuill;
