import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { CONFIG, isDemo } from './config';
import type { Project, Snapshot, Task } from './types';

export interface Backend {
  load(): Promise<Snapshot>;
  saveProject(p: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  saveTask(t: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
  // データが変わったかもしれないときに呼ばれる。戻り値で購読をやめる
  subscribe(onChange: () => void): () => void;
}

let client: SupabaseClient | null = null;
export const sb = () => (client ??= createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey));

function check<T extends { error: unknown }>(res: T): T {
  if (res.error) throw res.error;
  return res;
}

const supabaseBackend: Backend = {
  async load() {
    const [p, t] = await Promise.all([sb().from('projects').select('*'), sb().from('tasks').select('*')]);
    return { projects: check(p).data as Project[], tasks: check(t).data as Task[] };
  },
  async saveProject(p) {
    check(await sb().from('projects').upsert(p));
  },
  async deleteProject(id) {
    check(await sb().from('projects').delete().eq('id', id));
  },
  async saveTask(t) {
    check(await sb().from('tasks').upsert(t));
  },
  async deleteTask(id) {
    check(await sb().from('tasks').delete().eq('id', id));
  },
  subscribe(onChange) {
    const ch = sb()
      .channel('futari-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, onChange)
      // つなぎ直したときは、切れていた間の変更を取りこぼさないよう読み直す
      .subscribe((status) => status === 'SUBSCRIBED' && onChange());
    return () => void sb().removeChannel(ch);
  },
};

// お試しモード：localStorage に保存。別タブの変更は storage イベントで受け取る
const DEMO_KEY = 'futari.demo';
const readDemo = (): Snapshot => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '') as Snapshot;
  } catch {
    return { projects: [], tasks: [] };
  }
};
const writeDemo = (fn: (s: Snapshot) => Snapshot) => localStorage.setItem(DEMO_KEY, JSON.stringify(fn(readDemo())));
const upsert = <T extends { id: string }>(list: T[], item: T) => [...list.filter((x) => x.id !== item.id), item];

const demoBackend: Backend = {
  async load() {
    return readDemo();
  },
  async saveProject(p) {
    writeDemo((s) => ({ ...s, projects: upsert(s.projects, p) }));
  },
  async deleteProject(id) {
    writeDemo((s) => ({ projects: s.projects.filter((p) => p.id !== id), tasks: s.tasks.filter((t) => t.project_id !== id) }));
  },
  async saveTask(t) {
    writeDemo((s) => ({ ...s, tasks: upsert(s.tasks, t) }));
  },
  async deleteTask(id) {
    writeDemo((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  },
  subscribe(onChange) {
    const h = (e: StorageEvent) => e.key === DEMO_KEY && onChange();
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  },
};

export const backend: Backend = isDemo ? demoBackend : supabaseBackend;
