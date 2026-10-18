import { useState } from 'react';
import { Fab } from '../components/Fab';
import { Icon } from '../components/Icon';
import { ProjectBadge } from '../components/ProjectBadge';
import { ProjectSheet } from '../components/ProjectSheet';
import { SUGGESTED_PROJECTS } from '../projectStyle';
import { href } from '../router';
import { sortProjects, useStore } from '../store';

export function Projects() {
  const { data, saveProject } = useStore();
  const [creating, setCreating] = useState(false);
  const projects = sortProjects(data!.projects);

  const openCount = new Map<string, number>();
  for (const t of data!.tasks) if (!t.done) openCount.set(t.project_id, (openCount.get(t.project_id) ?? 0) + 1);

  // 使い始めのうちは、まだ作っていないおすすめをワンタップで作れるようにする
  const suggestions =
    projects.length < SUGGESTED_PROJECTS.length
      ? SUGGESTED_PROJECTS.filter((s) => !projects.some((p) => p.name === s.name))
      : [];
  const addSuggested = (s: (typeof SUGGESTED_PROJECTS)[number]) =>
    saveProject({
      id: crypto.randomUUID(),
      ...s,
      sort: Math.max(0, ...projects.map((p) => p.sort)) + 1,
      created_at: new Date().toISOString(),
    });

  return (
    <>
      <header className="page-head">
        <h1>プロジェクト</h1>
      </header>

      {projects.length === 0 && <p className="empty">まだプロジェクトがありません</p>}
      <ul className="project-list">
        {projects.map((p) => {
          const n = openCount.get(p.id) ?? 0;
          return (
            <li key={p.id}>
              <a href={href({ name: 'project', id: p.id })} className="project-row">
                <ProjectBadge project={p} />
                <span className="project-name">{p.name}</span>
                <span className={'open-count' + (n ? '' : ' zero')} aria-label={`未完了${n}件`}>{n}</span>
                <Icon name="chevron" size={20} />
              </a>
            </li>
          );
        })}
      </ul>

      {suggestions.length > 0 && (
        <section className="suggest-block">
          <h2 className="section-title">タップですぐ作れます</h2>
          <div className="suggest">
            {suggestions.map((s) => (
              <button key={s.name} type="button" className="btn" onClick={() => addSuggested(s)}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <Fab label="プロジェクトを作成" onClick={() => setCreating(true)} />
      {creating && <ProjectSheet onClose={() => setCreating(false)} />}
    </>
  );
}
