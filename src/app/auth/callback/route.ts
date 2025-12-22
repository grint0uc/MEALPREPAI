import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('[Auth Callback] Received request:', { code: !!code, type, next });

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log('[Auth Callback] Session exchange successful, redirecting to:', next);
      // If this is a password recovery, redirect to update password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`);
      }

      // Redirect to login with a verified flag so user can sign in
      return NextResponse.redirect(`${origin}/login?verified=true`);
    } else {
      console.error('[Auth Callback] Session exchange error:', error);
    }
  } else {
    console.error('[Auth Callback] No code provided');
  }

  // Return the user to an error page with instructions
  console.log('[Auth Callback] Redirecting to error page');
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
