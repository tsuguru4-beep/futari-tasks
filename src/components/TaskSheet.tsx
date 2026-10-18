import { useState } from 'react';
import { addDays, fmtLong, nextSaturday, todayStr } from '../date';
import { assigneeLabel, partnerOf } from '../people';
import { getLocal, setLocal } from '../local';
import { useSession } from '../session';
import { sortProjects, useStore } from '../store';
import type { Assignee, Task } from '../types';
import { Segmented } from './Segmented';
import { Sheet } from './Sheet';

const LAST_PROJECT = 'futari.lastProject';

// task があれば編集、なければ新規追加
export function TaskSheet({ task, projectId, onClose }: { task?: Task; projectId?: string; onClose(): void }) {
  const { me } = useSession();
  const { data, saveTask, deleteTask } = useStore();
  const projects = sortProjects(data?.projects ?? []);
  const today = todayStr();

  const initialProject =
    task?.project_id ?? projectId ??
    (projects.find((p) => p.id === getLocal(LAST_PROJECT, '')) ?? projects[0])?.id ?? '';
  const [title, setTitle] = useState(task?.title ?? '');
  const [project, setProject] = useState(initialProject);
  const [assignee, setAssignee] = useState<Assignee>(task?.assignee ?? me);
  const [due, setDue] = useState<string | null>(task?.due_date ?? null);
  const [memo, setMemo] = useState(task?.memo ?? '');

  const canSave = title.trim() !== '' && projects.some((p) => p.id === project);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const now = new Date().toISOString();
    saveTask({
      id: task?.id ?? crypto.randomUUID(),
      project_id: project,
      title: title.trim(),
      assignee,
      due_date: due,
      memo: memo.trim(),
      done: task?.done ?? false,
      done_at: task?.done_at ?? null,
      created_at: task?.created_at ?? now,
      updated_at: now,
    });
    if (!task) setLocal(LAST_PROJECT, project);
    onClose();
  };

  const remove = () => {
    if (!task || !confirm(`「${task.title}」を削除しますか？`)) return;
    deleteTask(task.id);
    onClose();
  };

  const quickDue = [
    { label: '今日', value: today },
    { label: '明日', value: addDays(today, 1) },
    { label: '土曜', value: nextSaturday(today) },
    { label: 'なし', value: null },
  ];

  return (
    <Sheet title={task ? 'タスクを編集' : 'タスクを追加'} onClose={onClose}>
      <form onSubmit={save} className="form">
        <label className="field">
          <span>やること</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：ゴミ出し" autoFocus={!task}
            enterKeyHint="done" maxLength={200} />
        </label>

        <div className="field">
          <span>担当</span>
          <Segmented<Assignee> label="担当" value={assignee} onChange={setAssignee}
            options={([me, partnerOf(me), 'both'] as Assignee[]).map((a) => ({ value: a, label: assigneeLabel(a, me) }))} />
        </div>

        <div className="field">
          <span>期限 {due && <em className="field-note">{fmtLong(due)}</em>}</span>
          <div className="quick-due">
            {quickDue.map((q) => (
              <button key={q.label} type="button" className={'chip' + (due === q.value ? ' on' : '')}
                onClick={() => setDue(q.value)}>
                {q.label}
              </button>
            ))}
          </div>
          <input type="date" value={due ?? ''} onChange={(e) => setDue(e.target.value || null)} aria-label="期限の日付" />
        </div>

        <label className="field">
          <span>プロジェクト</span>
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.emoji ? `${p.emoji} ` : ''}{p.name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>メモ（任意）</span>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} maxLength={2000} />
        </label>

        <div className="form-actions">
          {task && <button type="button" className="btn danger" onClick={remove}>削除</button>}
          <button type="submit" className="btn primary" disabled={!canSave}>{task ? '保存' : '追加'}</button>
        </div>
      </form>
    </Sheet>
  );
}
