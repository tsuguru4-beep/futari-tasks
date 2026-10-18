import { dueInfo } from '../date';
import { assigneeLabel } from '../people';
import { useSession } from '../session';
import { useStore } from '../store';
import type { Project, Task } from '../types';
import { Icon } from './Icon';

export function TaskRow({ task, today, project, onOpen }: {
  task: Task;
  today: string;
  project?: Project; // ホームなど、どのプロジェクトか表示したいとき
  onOpen(t: Task): void;
}) {
  const { me } = useSession();
  const { saveTask } = useStore();
  const due = task.due_date ? dueInfo(task.due_date, today) : null;
  const toggle = () =>
    saveTask({ ...task, done: !task.done, done_at: task.done ? null : new Date().toISOString() });

  return (
    <li className={'task' + (task.done ? ' done' : '')}>
      <button type="button" className="check" role="checkbox" aria-checked={task.done}
        aria-label={`${task.title}を${task.done ? '未完了に戻す' : '完了にする'}`} onClick={toggle}>
        <span className="check-mark"><Icon name="check" size={18} /></span>
      </button>
      <button type="button" className="task-main" onClick={() => onOpen(task)}>
        <span className="task-title">{task.title}</span>
        <span className="task-meta">
          {project && (
            <span className="meta-project" style={{ color: project.color }}>
              {project.emoji ? `${project.emoji} ` : ''}{project.name}
            </span>
          )}
          <span className={'pill who-' + (task.assignee === 'both' ? 'both' : task.assignee === me ? 'me' : 'partner')}>
            {assigneeLabel(task.assignee, me)}
          </span>
          {due && !task.done && <span className={'due due-' + due.tone}>{due.text}</span>}
          {task.memo && <span className="meta-memo" aria-label="メモあり"><Icon name="memo" size={16} /></span>}
        </span>
      </button>
    </li>
  );
}
