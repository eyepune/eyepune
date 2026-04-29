import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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
    
    // Protect Admin Routes
    const isAdminRoute = request.nextUrl.pathname.startsWith('/Admin_') || 
                        request.nextUrl.pathname.startsWith('/Admin-') ||
                        request.nextUrl.pathname === '/Admin_Dashboard';

    if (isAdminRoute) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // We can't easily check the 'role' field from the 'users' table in middleware 
      // without a database query (which we should avoid in middleware for performance).
      // However, we can check for a specific admin email or a JWT claim if available.
      // For now, we'll rely on the client-side AdminGuard for the role check,
      // but blocking unauthenticated users here is a huge first step.
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
