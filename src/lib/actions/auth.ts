'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  redirect('/');
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const displayName = formData.get('displayName') as string;
  
  if (!email || !password || !username || !displayName) {
    return { error: 'All fields are required' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  redirect('/');
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  redirect('/login');
}

export async function signInWithDiscord() {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      // Need absolute URL for server action redirect
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    console.error('Discord OAuth Error:', error.message);
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
