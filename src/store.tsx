import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { backend } from './backend';
import type { Project, Snapshot, Task } from './types';

interface Store {
  data: Snapshot | null;
  loadError: boolean;
  saveProject(p: Project): void;
  deleteProject(id: string): void;
  saveTask(t: Task): void;
  deleteTask(id: string): void;
  toast: string | null;
  showToast(msg: string): void;
}

const Ctx = createContext<Store | null>(null);

export const useStore = () => useContext(Ctx)!;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // 読み込み中に自分が書き込んだら、その読み込み結果は古いので捨てる
  const writes = useRef({ version: 0, pending: 0 });
  const toastTimer = useRef<number>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const reload = useCallback(async () => {
    const started = writes.current.version;
    try {
      const snap = await backend.load();
      if (writes.current.version !== started || writes.current.pending > 0) return;
      setData(snap);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const soon = () => {
      clearTimeout(timer);
      timer = window.setTimeout(reload, 250);
    };
    reload();
    const unsubscribe = backend.subscribe(soon);
    // スマホでアプリに戻ってきたとき・電波が戻ったときにも最新にする
    const onVisible = () => document.visibilityState === 'visible' && soon();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', soon);
    return () => {
      clearTimeout(timer);
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', soon);
    };
  }, [reload]);

  const mutate = useCallback(
    (local: (s: Snapshot) => Snapshot, remote: () => Promise<void>) => {
      writes.current.version++;
      writes.current.pending++;
      setData((s) => (s ? local(s) : s));
      remote()
        .catch(() => showToast('保存できませんでした。電波を確認してもう一度お試しください'))
        .finally(() => {
          writes.current.pending--;
          if (writes.current.pending === 0) reload();
        });
    },
    [reload, showToast],
  );

  const store = useMemo<Store>(
    () => ({
      data,
      loadError,
      toast,
      showToast,
      saveProject: (p) =>
        mutate(
          (s) => ({ ...s, projects: [...s.projects.filter((x) => x.id !== p.id), p] }),
          () => backend.saveProject(p),
        ),
      deleteProject: (id) =>
        mutate(
          (s) => ({ projects: s.projects.filter((x) => x.id !== id), tasks: s.tasks.filter((t) => t.project_id !== id) }),
          () => backend.deleteProject(id),
        ),
      saveTask: (t) => {
        const saved = { ...t, updated_at: new Date().toISOString() };
        mutate(
          (s) => ({ ...s, tasks: [...s.tasks.filter((x) => x.id !== t.id), saved] }),
          () => backend.saveTask(saved),
        );
      },
      deleteTask: (id) =>
        mutate(
          (s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }),
          () => backend.deleteTask(id),
        ),
    }),
    [data, loadError, toast, showToast, mutate],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export const sortProjects = (ps: Project[]) =>
  [...ps].sort((a, b) => a.sort - b.sort || a.created_at.localeCompare(b.created_at));

// 未完了：期限が近い順（期限なしは最後）→ 作った順
export const sortOpen = (ts: Task[]) =>
  [...ts].sort(
    (a, b) =>
      (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999') || a.created_at.localeCompare(b.created_at),
  );

// 完了：新しく完了した順
export const sortDone = (ts: Task[]) => [...ts].sort((a, b) => (b.done_at ?? '').localeCompare(a.done_at ?? ''));

export const isOverdue = (t: Task, today: string) => !t.done && !!t.due_date && t.due_date < today;
