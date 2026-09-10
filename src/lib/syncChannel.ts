/**
 * Cross-tab Realtime Synchronization via BroadcastChannel
 * Sincroniza estado instantaneamente entre todas as abas abertas no navegador.
 */

export type SyncMessage =
  | { type: 'SESSION_ADDED'; payload: any }
  | { type: 'SESSION_DELETED'; payload: string }
  | { type: 'SUBJECT_ADDED'; payload: any }
  | { type: 'SUBJECT_UPDATED'; payload: any }
  | { type: 'SUBJECT_DELETED'; payload: string }
  | { type: 'RECORD_SAVED'; payload: any }
  | { type: 'TIMER_STATE_CHANGED'; payload: any }
  | { type: 'SYNC_ALL' };

let channelInstance: BroadcastChannel | null = null;

export function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channelInstance && typeof BroadcastChannel !== 'undefined') {
    try {
      channelInstance = new BroadcastChannel('study_hub_sync_bus');
    } catch {
      return null;
    }
  }
  return channelInstance;
}

export function broadcastSync(message: SyncMessage): void {
  try {
    const ch = getSyncChannel();
    if (ch) {
      ch.postMessage({ ...message, timestamp: Date.now() });
    }
  } catch (err) {
    console.warn('BroadcastChannel sync failed:', err);
  }
}
