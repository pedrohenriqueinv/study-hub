import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { TimerProvider } from '@/contexts/TimerContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { FocusTimerModal } from '@/components/timer/FocusTimerModal';
import { PostSessionDialog } from '@/components/timer/PostSessionDialog';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Synapse — Cognitive OS & Estudos',
  description: 'Sistema pessoal de estudos, retenção ativa, timer resiliente e sincronização multiplataforma.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-slate-950`}>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <TimerProvider>
                <div className="flex min-h-screen">
                  {/* Sidebar Desktop */}
                  <Sidebar />

                  {/* Main Viewport Container */}
                  <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen pb-16 lg:pb-0">
                    <TopHeader />
                    <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1440px] w-full mx-auto flex flex-col">
                      {children}
                    </main>
                  </div>

                  {/* Mobile Navigation Bar */}
                  <MobileNav />

                  {/* Global Floating Modals */}
                  <FocusTimerModal />
                  <PostSessionDialog />
                </div>
              </TimerProvider>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
