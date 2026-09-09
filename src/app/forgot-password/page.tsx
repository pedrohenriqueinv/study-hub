'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: resetErr } = await resetPassword(email);
    setIsLoading(false);

    if (resetErr) {
      setError(resetErr);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-[#090D16] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao login</span>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg">Synapse</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
          Recuperar senha
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 leading-relaxed">
          Informe o e-mail cadastrado na sua conta para receber o link de redefinição de acesso.
        </p>

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">E-mail de recuperação enviado!</span>
              <p className="mt-1">
                Verifique sua caixa de entrada e a pasta de spam para instruções de redefinição.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Seu e-mail cadastrado
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 px-5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
