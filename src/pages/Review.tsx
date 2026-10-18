import { useState } from 'react';
import { FilterChips, useFilter } from '../components/FilterChips';
import { Icon } from '../components/Icon';
import { addDays, dueInfo, fmtMD, todayStr } from '../date';
import { assigneeLabel, matchFilter } from '../people';
import { href } from '../router';
import { useSession } from '../session';
import { isOverdue, sortOpen, useStore } from '../store';
import type { Task } from '../types';

// 振り分けた結果。取り消しで before に戻す
interface Decision {
  text: string;
  before: Task;
}

export function Review() {
  const { me } = useSession();
  const { data, saveTask } = useStore();
  const [filter, setFilter] = useFilter();
  const today = todayStr();
  // 振り分けると期限切れでなくなるので、開いた時点の対象を覚えておく
  const [ids] = useState(() => sortOpen(data!.tasks.filter((t) => isOverdue(t, today))).map((t) => t.id));
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [postponing, setPostponing] = useState<string | null>(null);

  const byId = new Map(data!.tasks.map((t) => [t.id, t]));
  const projects = new Map(data!.projects.map((p) => [p.id, p]));
  // 振り分け前に相手が完了・削除したものは出さない
  const targets = ids
    .map((id) => byId.get(id))
    .filter((t): t is Task => !!t && matchFilter(t, filter, me) && (!!decisions[t.id] || isOverdue(t, today)));
  const remaining = targets.filter((t) => !decisions[t.id]).length;

  const decide = (t: Task, next: Task, text: string) => {
    setDecisions((d) => ({ ...d, [t.id]: { text, before: t } }));
    setPostponing(null);
    saveTask(next);
  };
  const undo = (id: string) => {
    saveTask(decisions[id].before);
    setDecisions(({ [id]: _, ...rest }) => rest);
  };
  const doTomorrow = (t: Task) => {
    const due = addDays(today, 1);
    decide(t, { ...t, due_date: due }, `明日 ${fmtMD(due)} にやる`);
  };
  const postpone = (t: Task, due: string | null) =>
    decide(t, { ...t, due_date: due }, due ? `${fmtMD(due)} に延期` : '期限なしに延期');
  const drop = (t: Task) =>
    decide(t, { ...t, done: true, canceled: true, done_at: new Date().toISOString() }, 'やめた');

  return (
    <>
      <header className="page-head">
        <a href={href({ name: 'home' })} className="icon-btn" aria-label="ホームに戻る">
          <Icon name="back" />
        </a>
        <div className="grow">
          <h1>振り返り</h1>
          <p className="sub">期限が過ぎたタスクを振り分けます</p>
        </div>
      </header>

      <FilterChips value={filter} onChange={setFilter} />

      {targets.length === 0 ? (
        <p className="empty">振り分けるタスクはありません</p>
      ) : (
        <ul className="review-list">
          {targets.map((t) => {
            const d = decisions[t.id];
            const project = projects.get(t.project_id);
            return (
              <li key={t.id} className={'review-card' + (d ? ' decided' : '')}>
                <div className="review-title">{t.title}</div>
                <div className="task-meta">
                  {project && <span className="meta-project" style={{ color: project.color }}>{project.name}</span>}
                  <span className="pill">{assigneeLabel(t.assignee, me)}</span>
                  {!d && t.due_date && <span className="due due-over">{dueInfo(t.due_date, today).text}</span>}
                </div>
                {d ? (
                  <div className="review-result">
                    <span><Icon name="check" size={18} /> {d.text}</span>
                    <button type="button" className="link-btn" onClick={() => undo(t.id)}>取り消し</button>
                  </div>
                ) : postponing === t.id ? (
                  <div className="review-postpone">
                    <div className="review-actions">
                      <button type="button" className="btn" onClick={() => postpone(t, addDays(today, 7))}>
                        1週間後<small>{fmtMD(addDays(today, 7))}</small>
                      </button>
                      <button type="button" className="btn" onClick={() => postpone(t, addDays(today, 14))}>
                        2週間後<small>{fmtMD(addDays(today, 14))}</small>
                      </button>
                      <button type="button" className="btn" onClick={() => postpone(t, null)}>期限なし</button>
                    </div>
                    <div className="review-actions">
                      <input type="date" min={addDays(today, 1)} aria-label="延期する日付"
                        onChange={(e) => e.target.value && postpone(t, e.target.value)} />
                      <button type="button" className="btn" onClick={() => setPostponing(null)}>戻る</button>
                    </div>
                  </div>
                ) : (
                  <div className="review-actions">
                    <button type="button" className="btn primary" onClick={() => doTomorrow(t)}>やる</button>
                    <button type="button" className="btn" onClick={() => setPostponing(t.id)}>延期</button>
                    <button type="button" className="btn" onClick={() => drop(t)}>やめる</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {targets.length > 0 && remaining === 0 && (
        <div className="review-done">
          <p>すべて振り分けました</p>
          <a href={href({ name: 'home' })} className="btn primary">ホームに戻る</a>
        </div>
      )}
    </>
  );
}
