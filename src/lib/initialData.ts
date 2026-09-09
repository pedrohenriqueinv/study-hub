import { Subject, StudySession, DailyStudyRecord, Profile } from '@/types/database';
import { getTodayDateString } from './utils';

export const DEFAULT_PROFILE: Profile = {
  id: 'user_demo_01',
  full_name: 'Pedro Henrique',
  avatar_url: null,
  weekly_goal_hours: 25.0,
  daily_goal_minutes: 270, // 4h 30m
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj_1',
    user_id: 'user_demo_01',
    name: 'Algoritmos & Estruturas de Dados',
    description: 'Complexidade assintótica, grafos, árvores balanceadas e programação dinâmica',
    color: '#6366F1', // Indigo
    icon: 'code',
    weight_percentage: 35,
    target_hours_weekly: 8.75,
    current_topic: 'Árvores Rubro-Negras & Balanceamento AVL',
    grade_progress_percentage: 68,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'subj_2',
    user_id: 'user_demo_01',
    name: 'Direito Constitucional',
    description: 'Direitos fundamentais, jurisprudência do STF e controle de constitucionalidade',
    color: '#F59E0B', // Amber
    icon: 'gavel',
    weight_percentage: 25,
    target_hours_weekly: 6.25,
    current_topic: 'Direitos Individuais & Ações Coletivas (Art. 5º)',
    grade_progress_percentage: 25,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'subj_3',
    user_id: 'user_demo_01',
    name: 'Neurociência Cognitiva',
    description: 'Consolidação de memória de longo prazo, LTP e neurobiologia da atenção',
    color: '#0D9488', // Teal
    icon: 'psychology',
    weight_percentage: 25,
    target_hours_weekly: 6.25,
    current_topic: 'Consolidação Sináptica & Curva de Ebbinghaus',
    grade_progress_percentage: 70,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'subj_4',
    user_id: 'user_demo_01',
    name: 'Estatística Aplicada & Amostragem',
    description: 'Distribuições de probabilidade, Teorema Central do Limite e testes de hipóteses',
    color: '#64748B', // Slate
    icon: 'calculate',
    weight_percentage: 15,
    target_hours_weekly: 3.75,
    current_topic: 'Teorema Central do Limite & Variância',
    grade_progress_percentage: 10,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const today = getTodayDateString();

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'sess_1',
    user_id: 'user_demo_01',
    subject_id: 'subj_1',
    start_time: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    end_time: new Date(Date.now() - 3600 * 1000 * 2.1).toISOString(),
    duration_seconds: 3120, // 52 min
    session_type: 'study',
    efficiency_rate: 100,
    notes: 'Implementação de Grafos e cálculo de complexidade com Big-O.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sess_2',
    user_id: 'user_demo_01',
    subject_id: 'subj_3',
    start_time: new Date(Date.now() - 3600 * 1000 * 4.5).toISOString(),
    end_time: new Date(Date.now() - 3600 * 1000 * 3.9).toISOString(),
    duration_seconds: 1920, // 32 min
    session_type: 'study',
    efficiency_rate: 96,
    notes: '24 novos cartões memorizados no deck de Neurociência Cognitiva.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sess_3',
    user_id: 'user_demo_01',
    subject_id: 'subj_2',
    start_time: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    end_time: new Date(Date.now() - 3600 * 1000 * 5.1).toISOString(),
    duration_seconds: 3300, // 55 min
    session_type: 'study',
    efficiency_rate: 92,
    notes: 'Leitura e anotação dirigida de jurisprudência sobre o Artigo 5º.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sess_4',
    user_id: 'user_demo_01',
    subject_id: null,
    start_time: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    end_time: new Date(Date.now() - 3600 * 1000 * 1.25).toISOString(),
    duration_seconds: 2700, // 45 min
    session_type: 'break',
    efficiency_rate: 100,
    notes: 'Pausa consciente para café, respiração e descanso visual.',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_DAILY_RECORDS: DailyStudyRecord[] = [
  {
    id: 'rec_1',
    user_id: 'user_demo_01',
    subject_id: 'subj_1',
    date: today,
    learning_note: 'A rotação dupla à direita ocorre quando o fator de balanceamento do nó desbalanceado é -2 e o filho à esquerda possui fator +1 (caso LR). Primeiro rotaciona-se o filho à esquerda para a esquerda, e depois o pivô para a direita.',
    anki_completed: true,
    anki_cards_count: 24,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec_2',
    user_id: 'user_demo_01',
    subject_id: 'subj_2',
    date: today,
    learning_note: 'Partidos políticos com representação no Congresso Nacional (basta 1 deputado ou 1 senador) têm legitimidade ativa universal para impetrar MS Coletivo em prol de direitos coletivos em sentido estrito e individuais homogêneos.',
    anki_completed: false,
    anki_cards_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec_3',
    user_id: 'user_demo_01',
    subject_id: 'subj_3',
    date: today,
    learning_note: 'A ativação do receptor NMDA requer simultaneamente a ligação de glutamato e a despolarização da membrana pós-sináptica para expulsar o íon Magnésio (Mg2+) que obstrui o canal de Cálcio (Ca2+).',
    anki_completed: true,
    anki_cards_count: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
