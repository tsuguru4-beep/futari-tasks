import { textOn } from '../projectStyle';
import type { Project } from '../types';

// 名前の1文字目をプロジェクトの色で丸く表示
export function ProjectBadge({ project, size = 40 }: { project: Project; size?: number }) {
  return (
    <span className="project-badge" aria-hidden="true"
      style={{ background: project.color, color: textOn(project.color), width: size, height: size, fontSize: size * 0.45 }}>
      {project.name.slice(0, 1)}
    </span>
  );
}
