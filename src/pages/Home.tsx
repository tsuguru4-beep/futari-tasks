import { useState } from 'react';
import { DoneSection } from '../components/DoneSection';
import { Fab } from '../components/Fab';
import { FilterChips, useFilter } from '../components/FilterChips';
import { Icon } from '../components/Icon';
import { ProjectSheet } from '../components/ProjectSheet';
import { TaskRow } from '../components/TaskRow';
import { TaskSheet } from '../components/TaskSheet';
import { addDays, fmtLong, isLocalToday, todayStr } from '../date';
import { matchFilter } from '../people';
import { href } from '../router';
import { useSession } from '../session';
import { sortDone, sortOpen, useStore } from '../store';
import type { Task } from '../types';
import { SettingsSheet } from './SettingsSheet';

const UPCOMING_DAYS = 7;

export function Home() {
  const { me } = useSession();
  const { data } = useStore();
  const [filter, setFilter] = useFilter();
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [newProject, setNewProject] = useState(false);
  const [settings, setSettings] = useState(false);

  const today = todayStr();
  const { projects, tasks: all } = data!;
  const byId = new Map(projects.map((p) => [p.id, p]));
  const tasks = all.filter((t) => matchFilter(t, filter, me));
  const open = sortOpen(tasks.filter((t) => !t.done && t.due_date));
  const overdue = open.filter((t) => t.due_date! < today);
  const dueToday = open.filter((t) => t.due_date === today);
  const upcoming = open.filter((t) => t.due_date! > today && t.due_date! <= addDays(today, UPCOMING_DAYS));
  const doneToday = sortDone(tasks.filter((t) => t.done && !t.canceled && isLocalToday(t.done_at, today)));

  const row = (t: Task) => <TaskRow key={t.id} task={t} today={today} project={byId.get(t.project_id)} onOpen={setEditing} />;
  const section = (title: string, list: Task[], tone = '') =>
    list.length > 0 && (
      <section className="section">
        <h2 className={'section-title ' + tone}>{title}<span className="count">{list.length}</span></h2>
        <ul className="task-list">{list.map(row)}</ul>
      </section>
    );

  return (
    <>
      <header className="page-head">
        <div>
          <h1>ホーム</h1>
          <p className="sub">{fmtLong(today)}</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setSettings(true)} aria-label="設定">
          <Icon name="gear" />
        </button>
      </header>

      <FilterChips value={filter} onChange={setFilter} />

      {overdue.length > 0 && (
        <a href={href({ name: 'review' })} className="review-banner">
          <span>
            <strong>振り返り</strong>
            <small>期限が過ぎたタスクが{overdue.length}件あります。やる・延期・やめるに振り分けましょう</small>
          </span>
          <Icon name="chevron" size={22} />
        </a>
      )}

      {section('期限切れ', overdue, 'tone-over')}
      {section('今日', dueToday, 'tone-today')}
      {overdue.length === 0 && dueToday.length === 0 && (
        <p className="empty">今日やることはありません</p>
      )}
      {section(`これから（${UPCOMING_DAYS}日以内）`, upcoming)}
      <DoneSection title="今日完了" count={doneToday.length}>{doneToday.map(row)}</DoneSection>

      <Fab label="タスクを追加" onClick={() => (projects.length ? setEditing('new') : setNewProject(true))} />

      {editing && <TaskSheet task={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {newProject && <ProjectSheet onClose={() => setNewProject(false)} />}
      {settings && <SettingsSheet onClose={() => setSettings(false)} />}
    </>
  );
}
