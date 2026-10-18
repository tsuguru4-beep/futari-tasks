import { href, type Route } from '../router';
import { Icon } from './Icon';

export function BottomNav({ route }: { route: Route }) {
  const onProjects = route.name !== 'home';
  return (
    <nav className="bottom-nav">
      <a href={href({ name: 'home' })} className={onProjects ? '' : 'on'} aria-current={onProjects ? undefined : 'page'}>
        <Icon name="home" />
        <span>ホーム</span>
      </a>
      <a href={href({ name: 'projects' })} className={onProjects ? 'on' : ''} aria-current={onProjects ? 'page' : undefined}>
        <Icon name="folder" />
        <span>プロジェクト</span>
      </a>
    </nav>
  );
}
