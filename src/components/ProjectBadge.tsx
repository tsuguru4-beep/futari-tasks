import type { Project } from '../types';

// 絵文字があれば絵文字、なければ名前の1文字目をプロジェクトの色で丸く表示
export function ProjectBadge({ project, size = 40 }: { project: Project; size?: number }) {
  return (
    <span className="project-badge" aria-hidden="true"
      style={{ background: project.color, width: size, height: size, fontSize: size * 0.5 }}>
      {project.emoji || project.name.slice(0, 1)}
    </span>
  );
}
