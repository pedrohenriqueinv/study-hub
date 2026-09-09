'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validação em tempo real
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function handleEmailChange(val: string) {
    setEmail(val);
    if (val.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Insira um endereço de e-mail válido.');
    } else {
      setEmailError('');
    }
  }

  function handlePasswordChange(val: string) {
    setPassword(val);
    if (val.length > 0 && val.length < 6) {
      setPasswordError('A senha deve conter ao menos 6 caracteres.');
    } else {
      setPasswordError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError('');

    if (!isEmailValid) {
      setEmailError('Insira um endereço de e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('A senha deve conter ao menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithEmail(email, password);
    setIsLoading(false);

    if (error) {
      setGeneralError(error);
    } else {
      router.push('/');
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);
    if (error) {
      setGeneralError(error);
    } else {
      router.push('/');
    }
  }

  // Simulador de Estados UX (para validação imediata conforme o mockup)
  function simulateState(state: 'normal' | 'filled' | 'error' | 'loading') {
    if (state === 'normal') {
      setEmail('');
      setPassword('');
      setEmailError('');
      setPasswordError('');
      setGeneralError('');
      setIsLoading(false);
    } else if (state === 'filled') {
      setEmail('aluno.foco@synapse.edu');
      setPassword('estudos2025*');
      setEmailError('');
      setPasswordError('');
      setGeneralError('');
      setIsLoading(false);
    } else if (state === 'error') {
      setEmail('email-invalido');
      setPassword('123');
      setEmailError('Insira um endereço de e-mail válido.');
      setPasswordError('A senha deve conter ao menos 6 caracteres.');
      setIsLoading(false);
    } else if (state === 'loading') {
      setEmail('aluno.foco@synapse.edu');
      setPassword('estudos2025*');
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-[#090D16] flex flex-col lg:flex-row">
      {/* LEFT PANEL: Atmospheric brand column */}
      <section className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1.5 backdrop-blur-sm text-teal-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-white">Synapse</span>
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
              Estudos
            </span>
          </div>
        </div>

        {/* Center Philosophy Message */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Ambiente imersivo sem distrações
          </div>

          <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight text-white leading-tight mb-4">
            Volte ao foco.<br />
            <span className="text-slate-400 font-normal">Continue construindo seu conhecimento.</span>
          </h1>

          <p className="text-slate-400 text-sm xl:text-base leading-relaxed mb-10">
            Um espaço calmo concebido para longas sessões de estudo, retenção ativa e clareza mental. Sem ruídos, sem pressões externas.
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-8">
            <div>
              <div className="text-xl font-semibold text-white tracking-tight">Ritmo Contínuo</div>
              <div className="text-xs text-slate-400 mt-1">
                Sessões estruturadas por blocos e pausas intencionais.
              </div>
            </div>
            <div>
              <div className="text-xl font-semibold text-white tracking-tight">Sincronização</div>
              <div className="text-xs text-slate-400 mt-1">
                Seus resumos, metas e progresso em perfeita ordem.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footnote */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-6">
          <span>© 2025 Synapse Technologies</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-400" /> Criptografia de ponta a ponta
          </span>
        </div>
      </section>

      {/* RIGHT PANEL: Authentication Form */}
      <section className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 xl:p-20 bg-slate-50 dark:bg-[#0E131F] relative">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between pb-6 mb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center p-1 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Synapse
            </span>
          </div>
          <Link
            href="/register"
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-3 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            Criar conta
          </Link>
        </header>

        {/* Central Form Card */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-8">
            <div className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Acesso ao seu espaço
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Entrar no Synapse
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Retome seus cadernos e metas de onde parou.
            </p>
          </div>

          {/* Social Sign-In */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-400 font-medium">
              ou com seu e-mail
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {generalError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                E-mail institucional ou pessoal
              </label>

              <div
                className={`relative rounded-xl border bg-white dark:bg-slate-900 transition-all focus-ring ${
                  emailError
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20'
                    : isEmailValid && email.length > 0
                    ? 'border-emerald-400 dark:border-emerald-500'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="nome@exemplo.com"
                  autoComplete="email"
                  required
                  className="w-full h-11 pl-10 pr-10 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none"
                />
                {isEmailValid && email.length > 0 && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                )}
              </div>
              {emailError && (
                <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Sua senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <div
                className={`relative rounded-xl border bg-white dark:bg-slate-900 transition-all focus-ring ${
                  passwordError
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20'
                    : password.length >= 6
                    ? 'border-emerald-400 dark:border-emerald-500'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 pl-10 pr-11 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar ou ocultar senha"
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {passwordError}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 focus:ring-slate-900 accent-slate-900 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Manter conectado por 30 dias
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 px-5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-[0.99] font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 focus:outline-none cursor-pointer disabled:opacity-80"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </div>

            {/* State Preview Switcher for UX Review */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Simular Estados UX
                </span>
                <span className="text-[10px] text-slate-400">Interativo</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => simulateState('normal')}
                  className="py-1 px-2 text-[11px] rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => simulateState('filled')}
                  className="py-1 px-2 text-[11px] rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Preenchido
                </button>
                <button
                  type="button"
                  onClick={() => simulateState('error')}
                  className="py-1 px-2 text-[11px] rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 cursor-pointer"
                >
                  Erro
                </button>
                <button
                  type="button"
                  onClick={() => simulateState('loading')}
                  className="py-1 px-2 text-[11px] rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                >
                  Loading
                </button>
              </div>
            </div>
          </form>

          {/* Footer Sign-up prompt */}
          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Novo no Synapse?{' '}
              <Link
                href="/register"
                className="font-medium text-slate-900 dark:text-white hover:underline decoration-slate-400 underline-offset-4 ml-1"
              >
                Criar minha conta gratuita
              </Link>
            </p>
          </div>
        </div>

        {/* Legal & Accessibility Note */}
        <footer className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <a href="#privacidade" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Privacidade
            </a>
            <span>•</span>
            <a href="#termos" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Termos
            </a>
            <span>•</span>
            <a href="#ajuda" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Ajuda
            </a>
          </div>
          <span className="text-[11px] text-slate-400">Design acessível (WCAG AA)</span>
        </footer>
      </section>
    </div>
  );
}
