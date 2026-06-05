import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } else {
      console.error('Auth Callback Error:', error.message);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=Could not authenticate user', requestUrl.origin));
}
