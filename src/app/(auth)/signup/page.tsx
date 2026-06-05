'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, UserPlus, User, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';

import { signUp } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    const formData = new FormData();
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('username', form.username);
    formData.append('displayName', form.displayName);
    
    const result = await signUp(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
        {/* Top glow */}
        <div className="h-px bg-gradient-to-r from-transparent via-vc-cyan-500/60 to-transparent" />

        <div className="p-8">
          {/* Logo */}
          <div className="mb-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-3 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-vc-cyan-500 to-vc-purple-500 p-3 shadow-lg shadow-vc-cyan-500/30"
            >
              <UserPlus size={28} className="text-white" />
            </motion.div>
            <h1 className="text-gradient-brand font-display text-2xl font-bold tracking-wider">
              JOIN THE CLUTCH
            </h1>
            <p className="mt-2 font-body text-sm text-gray-500">
              Create your gamer identity
            </p>
          </div>

          {/* Form */}
          {error && (
            <div className="mb-4 rounded-xl bg-vc-red-500/10 p-3 text-sm text-vc-red-500 border border-vc-red-500/20">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
              >
                Display Name
              </label>
              <div className="glass group flex items-center gap-3 rounded-xl px-4 py-3 transition-all focus-within:ring-1 focus-within:ring-vc-cyan-500/50">
                <User
                  size={16}
                  className="shrink-0 text-gray-500 transition-colors group-focus-within:text-vc-cyan-500"
                />
                <input
                  id="displayName"
                  type="text"
                  placeholder="PhantomAce"
                  value={form.displayName}
                  onChange={(e) => updateField('displayName', e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
              >
                Username
              </label>
              <div className="glass group flex items-center gap-3 rounded-xl px-4 py-3 transition-all focus-within:ring-1 focus-within:ring-vc-cyan-500/50">
                <AtSign
                  size={16}
                  className="shrink-0 text-gray-500 transition-colors group-focus-within:text-vc-cyan-500"
                />
                <input
                  id="username"
                  type="text"
                  placeholder="phantomace"
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
              >
                Email
              </label>
              <div className="glass group flex items-center gap-3 rounded-xl px-4 py-3 transition-all focus-within:ring-1 focus-within:ring-vc-cyan-500/50">
                <Mail
                  size={16}
                  className="shrink-0 text-gray-500 transition-colors group-focus-within:text-vc-cyan-500"
                />
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
              >
                Password
              </label>
              <div className="glass group flex items-center gap-3 rounded-xl px-4 py-3 transition-all focus-within:ring-1 focus-within:ring-vc-cyan-500/50">
                <Lock
                  size={16}
                  className="shrink-0 text-gray-500 transition-colors group-focus-within:text-vc-cyan-500"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-gray-500 transition-colors hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
              >
                Confirm Password
              </label>
              <div className="glass group flex items-center gap-3 rounded-xl px-4 py-3 transition-all focus-within:ring-1 focus-within:ring-vc-cyan-500/50">
                <Lock
                  size={16}
                  className="shrink-0 text-gray-500 transition-colors group-focus-within:text-vc-cyan-500"
                />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField('confirmPassword', e.target.value)
                  }
                  className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="shrink-0 text-gray-500 transition-colors hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className={cn(
                'relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-vc-cyan-500 to-vc-purple-500 py-3 font-display text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-vc-cyan-500/25 transition-all hover:shadow-vc-cyan-500/40',
                isLoading && 'cursor-wait opacity-80'
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
              {/* Shine */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 hover:translate-x-full" />
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-600">or sign up with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-3 gap-3">
            <OAuthBtn
              label="Discord"
              bg="bg-indigo-600 hover:bg-indigo-500"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
                </svg>
              }
            />
            <OAuthBtn
              label="Google"
              bg="bg-white/10 hover:bg-white/15"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
            />
            <OAuthBtn
              label="Steam"
              bg="bg-gray-800 hover:bg-gray-700"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0z" />
                </svg>
              }
            />
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-vc-red-500 transition-colors hover:text-vc-red-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function OAuthBtn({
  label,
  bg,
  icon,
}: {
  label: string;
  bg: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-colors',
        bg
      )}
      title={`Sign up with ${label}`}
    >
      {icon}
    </motion.button>
  );
}
