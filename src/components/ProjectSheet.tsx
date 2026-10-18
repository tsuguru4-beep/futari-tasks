import { useState } from 'react';
import { PROJECT_COLORS, PROJECT_EMOJIS } from '../projectStyle';
import { useStore } from '../store';
import type { Project } from '../types';
import { ProjectBadge } from './ProjectBadge';
import { Sheet } from './Sheet';

// project があれば編集、なければ新規作成
export function ProjectSheet({ project, onClose, onDeleted }: { project?: Project; onClose(): void; onDeleted?(): void }) {
  const { data, saveProject, deleteProject } = useStore();
  const [name, setName] = useState(project?.name ?? '');
  const [emoji, setEmoji] = useState(project?.emoji ?? '');
  const [color, setColor] = useState(project?.color ?? PROJECT_COLORS[0]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const projects = data?.projects ?? [];
    saveProject({
      id: project?.id ?? crypto.randomUUID(),
      name: name.trim(),
      emoji,
      color,
      sort: project?.sort ?? Math.max(0, ...projects.map((p) => p.sort)) + 1,
      created_at: project?.created_at ?? new Date().toISOString(),
    });
    onClose();
  };

  const remove = () => {
    if (!project) return;
    const n = (data?.tasks ?? []).filter((t) => t.project_id === project.id).length;
    const msg = `「${project.name}」を削除しますか？` + (n ? `\n中のタスク${n}件もすべて削除されます。` : '');
    if (!confirm(msg)) return;
    deleteProject(project.id);
    onClose();
    onDeleted?.();
  };

  const preview: Project = { id: '', name: name || '？', emoji, color, sort: 0, created_at: '' };

  return (
    <Sheet title={project ? 'プロジェクトを編集' : 'プロジェクトを作成'} onClose={onClose}>
      <form onSubmit={save} className="form">
        <div className="project-name-row">
          <ProjectBadge project={preview} size={48} />
          <label className="field grow">
            <span>名前</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：家事" autoFocus={!project}
              enterKeyHint="done" maxLength={40} />
          </label>
        </div>

        <div className="field">
          <span>絵文字</span>
          <div className="emoji-grid">
            <button type="button" className={'emoji-opt' + (emoji === '' ? ' on' : '')} onClick={() => setEmoji('')}
              aria-label="絵文字なし">なし</button>
            {PROJECT_EMOJIS.map((em) => (
              <button key={em} type="button" className={'emoji-opt' + (emoji === em ? ' on' : '')} onClick={() => setEmoji(em)}>
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>色</span>
          <div className="color-grid">
            {PROJECT_COLORS.map((c) => (
              <button key={c} type="button" className={'color-opt' + (color === c ? ' on' : '')} style={{ background: c }}
                onClick={() => setColor(c)} aria-label={`色 ${c}`} aria-pressed={color === c} />
            ))}
          </div>
        </div>

        <div className="form-actions">
          {project && <button type="button" className="btn danger" onClick={remove}>削除</button>}
          <button type="submit" className="btn primary" disabled={!name.trim()}>{project ? '保存' : '作成'}</button>
        </div>
      </form>
    </Sheet>
  );
}
