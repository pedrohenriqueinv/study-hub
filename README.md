# Synapse — Cognitive OS & Sistema de Estudos Multiplataforma

Aplicativo completo de estudos multiplataforma de alta fidelidade desenvolvido com **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (Auth + PostgreSQL com RLS)**, **Recharts** e pronto para deploy na **Vercel**.

O projeto foi projetado com arquitetura modular e resiliente, preparado para empacotamento futuro com **Tauri** (Windows, Linux, macOS) e **Capacitor** (Android, iOS).

---

## 🌟 Funcionalidades Principais

1. **Gestão de Matérias & Ciclos**:
   - Cadastro, edição, exclusão e visualização de matérias com pesos percentuais e metas semanais.
   - Barra de ciclo segmentada com distribuição de foco ponderada.
2. **Timer de Foco Resiliente (Baseado em Timestamps)**:
   - Protocolos configuráveis: **Deep Work** (50m · 10m), **Pomodoro** (25m · 5m), **Active Recall** (15m), **Pausa Consciente** (10m) e Cronômetro Livre.
   - Cálculo baseado em `timestamps` reais (`Date.now()`) e persistência no `localStorage`: nunca perde a contagem se a aba for minimizada, recarregada ou em caso de perda temporária de conexão.
   - Display SVG circular animado com contagem regressiva em *JetBrains Mono*.
   - Áudio procedural sintetizado em tempo real via **Web Audio API** (Onda Binaural 40Hz Gama para sincronização neural, Brown Noise e Chime de conclusão).
3. **Diário de Retenção Ativa & Integração Anki**:
   - Campo para registrar *"Hoje eu aprendi..."* com frase curta de síntese imediata ao finalizar blocos.
   - Checklist interativo *"Criei os flashcards no Anki"* com contador de cartões e sincronização no banco.
4. **Retenção Cognitiva & Analytics Avançado**:
   - Visualizador vetorial interativo da **Curva de Ebbinghaus** (decaimento passivo vs. estabilização FSRS v4).
   - Heatmap de densidade e consistência diária dos últimos 90 dias (estilo GitHub/WakaTime).
   - Gráficos **Recharts** (tempo por matéria, evolução diária e mensal).
   - Análise de janelas circadianas de pico de desempenho (Manhã, Tarde, Noite).
   - Diagnósticos e ações prescritivas geradas pelo sistema.
5. **Histórico Completo Auditável**:
   - Filtros por matéria, período e tipo de sessão (estudo ou pausa).
   - Exportação direta para relatório `.CSV`.
6. **Autenticação Segura & Isolamento Multi-usuário**:
   - Supabase Auth com login por E-mail/Senha, Google OAuth e recuperação de senha.
   - Políticas estritas de **Row Level Security (RLS)** em todas as tabelas PostgreSQL: nenhum usuário acessa dados de outro.
   - Modo de demonstração local instantâneo com persistência quando as chaves do Supabase ainda não foram adicionadas.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js 18+ ou 20+ instalado
* npm ou pnpm

### 2. Instalação
```bash
# Na pasta do projeto:
npm install
```

### 3. Configurar o Supabase (Opcional para teste imediato)
Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Abra o `.env.local` e preencha com as credenciais do seu projeto Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Nota**: Se você iniciar sem preencher as chaves, o aplicativo iniciará em **Modo Demonstração Local**, permitindo testar 100% das páginas, timers, matérias e diários sem bloqueios.

### 4. Criar o Banco de Dados no Supabase
1. Acesse o painel do seu projeto no Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor** no menu lateral esquerdo.
3. Abra o arquivo `supabase/schema.sql` deste projeto, copie o conteúdo e cole no editor.
4. Clique em **Run** para criar todas as tabelas, índices, triggers automáticos e políticas RLS.

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## ☁️ Como Fazer Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**.
3. Importe o repositório do projeto.
4. Na seção **Environment Variables**, adicione as mesmas variáveis do seu `.env.local`:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_SITE_URL` (URL fornecida pela Vercel, ex: `https://seu-app.vercel.app`)
5. Clique em **Deploy**. O deploy será concluído em menos de 2 minutos!

---

## 📱 Estrutura para Tauri / Capacitor (Futuro App Desktop & Mobile)

O código foi cuidadosamente isolado de dependências que amarrem a aplicação exclusivamente ao navegador:
* Sons de foco são gerados proceduralmente com Web Audio API padrão.
* Rotas e estados locais usam Next.js App Router compatível com SSG e client-side routing.
* Para empacotar com **Capacitor**:
  ```bash
  npm install @capacitor/core @capacitor/cli
  npx cap init
  ```
* Para empacotar com **Tauri**:
  ```bash
  npm install --save-dev @tauri-apps/cli
  npx tauri init
  ```

---

## 🔒 Políticas de Segurança (Row Level Security)

Todas as consultas ao banco no PostgreSQL possuem RLS ativado:
* `public.profiles`: apenas o próprio usuário pode visualizar e atualizar seu perfil.
* `public.subjects`: apenas o próprio usuário pode criar, visualizar, atualizar e deletar suas matérias.
* `public.study_sessions`: sessões de estudo isoladas por `auth.uid() = user_id`.
* `public.daily_study_records`: registros diários e checklist Anki isolados por `auth.uid() = user_id`.
