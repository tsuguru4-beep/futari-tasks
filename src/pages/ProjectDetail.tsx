import { useEffect, useState } from 'react';
import { DoneSection } from '../components/DoneSection';
import { Fab } from '../components/Fab';
import { FilterChips, useFilter } from '../components/FilterChips';
import { Icon } from '../components/Icon';
import { ProjectBadge } from '../components/ProjectBadge';
import { ProjectSheet } from '../components/ProjectSheet';
import { TaskRow } from '../components/TaskRow';
import { TaskSheet } from '../components/TaskSheet';
import { todayStr } from '../date';
import { matchFilter } from '../people';
import { href } from '../router';
import { useSession } from '../session';
import { sortDone, sortOpen, useStore } from '../store';
import type { Task } from '../types';

const toProjects = () => location.replace(href({ name: 'projects' }));

export function ProjectDetail({ id }: { id: string }) {
  const { me } = useSession();
  const { data } = useStore();
  const [filter, setFilter] = useFilter();
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [editingProject, setEditingProject] = useState(false);

  const project = data!.projects.find((p) => p.id === id);
  // 相手が削除した場合などは一覧に戻す
  useEffect(() => {
    if (!project) toProjects();
  }, [project]);
  if (!project) return null;

  const today = todayStr();
  const tasks = data!.tasks.filter((t) => t.project_id === id && matchFilter(t, filter, me));
  const open = sortOpen(tasks.filter((t) => !t.done));
  const done = sortDone(tasks.filter((t) => t.done));
  const row = (t: Task) => <TaskRow key={t.id} task={t} today={today} onOpen={setEditing} />;

  return (
    <>
      <header className="page-head">
        <a href={href({ name: 'projects' })} className="icon-btn" aria-label="プロジェクト一覧に戻る">
          <Icon name="back" />
        </a>
        <ProjectBadge project={project} size={36} />
        <h1 className="grow ellipsis">{project.name}</h1>
        <button type="button" className="icon-btn" onClick={() => setEditingProject(true)} aria-label="プロジェクトを編集">
          <Icon name="edit" />
        </button>
      </header>

      <FilterChips value={filter} onChange={setFilter} />

      {open.length > 0 ? (
        <ul className="task-list">{open.map(row)}</ul>
      ) : (
        <p className="empty">{done.length ? 'すべて完了しています' : '右下の＋からタスクを追加できます'}</p>
      )}
      <DoneSection title="完了" count={done.length}>{done.map(row)}</DoneSection>

      <Fab label="タスクを追加" onClick={() => setEditing('new')} />

      {editing && (
        <TaskSheet task={editing === 'new' ? undefined : editing} projectId={id} onClose={() => setEditing(null)} />
      )}
      {editingProject && (
        <ProjectSheet project={project} onClose={() => setEditingProject(false)} onDeleted={toProjects} />
      )}
    </>
  );
}
