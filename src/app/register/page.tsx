'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    const { error: signErr } = await signUpWithEmail(email, password, fullName);
    setIsLoading(false);

    if (signErr) {
      setError(signErr);
    } else {
      router.push('/');
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-[#090D16] flex flex-col lg:flex-row">
      {/* LEFT PANEL */}
      <section className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

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

        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Comece hoje sua jornada cognitiva
          </div>

          <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight text-white leading-tight mb-4">
            Crie sua conta no Synapse.<br />
            <span className="text-slate-400 font-normal">Domine seus ciclos de aprendizagem.</span>
          </h1>

          <p className="text-slate-400 text-sm xl:text-base leading-relaxed mb-10">
            Sua conta garante sincronização segura de sessões do timer, notas de estudo diárias e retenção no Anki entre desktop e celular.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-6">
          <span>© 2025 Synapse Technologies</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-400" /> Isolamento com Supabase RLS
          </span>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 xl:p-20 bg-slate-50 dark:bg-[#0E131F] relative">
        <header className="lg:hidden flex items-center justify-between pb-6 mb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center p-1 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Synapse</span>
          </div>
          <Link
            href="/login"
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-3 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            Já tenho conta
          </Link>
        </header>

        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-8">
            <div className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Cadastro Gratuito
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Criar sua conta
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Configure seu espaço pessoal de estudos em poucos segundos.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Nome completo
              </label>
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-ring">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Pedro Henrique"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                E-mail institucional ou pessoal
              </label>
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-ring">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Senha (mínimo 6 caracteres)
              </label>
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-ring">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-11 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Confirmar senha
              </label>
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-ring">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 px-5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 mt-4"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Já possui uma conta?{' '}
              <Link
                href="/login"
                className="font-medium text-slate-900 dark:text-white hover:underline decoration-slate-400 underline-offset-4 ml-1"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        <footer className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400 text-center">
          <span>Design acessível com criptografia de ponta a ponta</span>
        </footer>
      </section>
    </div>
  );
}
