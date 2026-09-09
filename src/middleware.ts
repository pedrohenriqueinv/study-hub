import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkrhwhqrktateueqozdf.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_hSHIKp-ToLtiz8MifwrtwA_AVSoIHy2';

  // Se Supabase não estiver configurado, permite navegação no modo demonstração
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('sua-url') || supabaseAnonKey.length < 20) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

    const { data: { user } } = await supabase.auth.getUser();

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                        request.nextUrl.pathname.startsWith('/register') ||
                        request.nextUrl.pathname.startsWith('/forgot-password');

    // Se usuário autenticado tentar ir para /login, redireciona para a home
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (err) {
    console.error('Middleware Supabase error:', err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
