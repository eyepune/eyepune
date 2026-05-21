import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  // Bypass middleware for crawlers
  const userAgent = request.headers.get("user-agent") || "";
  const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|linkedinbot/i.test(userAgent);
  
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (isBot) {
    return supabaseResponse;
  }

  // Rate Limiting Logic (Upstash)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Limit to 5 requests per minute for sensitive routes
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
    });

    const pathname = request.nextUrl.pathname;
    if (pathname.toLowerCase().includes('/login') || pathname.toLowerCase().includes('/admin')) {
      const ip = request.ip || '127.0.0.1';
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new NextResponse("Too Many Requests - Rate Limit Exceeded", { status: 429 });
      }
    }
  }

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session so it doesn't expire
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const pathname = request.nextUrl.pathname;

    // ── SEO Standardization: Redirect Underscore Routes to Hyphenated Routes ──
    // e.g., /Admin_Dashboard -> /Admin-Dashboard
    if (pathname.includes('_') && !pathname.startsWith('/api') && !pathname.includes('.')) {
      const newPathname = pathname.replace(/_/g, '-');
      const url = request.nextUrl.clone();
      url.pathname = newPathname;
      return NextResponse.redirect(url, 301); // Permanent redirect for SEO
    }

    // Protect Admin Routes
    const isAdminRoute = pathname.startsWith('/Admin-');

    if (isAdminRoute) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      const adminEmails = ['connect@eyepune.com', 'eyepune.contact@gmail.com']; 
      if (!adminEmails.includes(user.email || '')) {
         return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch (e) {
    // Ignore session errors for public routes/crawlers
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
