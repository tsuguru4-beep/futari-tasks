import { useEffect, useState } from 'react';

export type Route = { name: 'home' } | { name: 'projects' } | { name: 'project'; id: string };

function parse(hash: string): Route {
  const m = hash.match(/^#\/p\/([\w-]+)/);
  if (m) return { name: 'project', id: m[1] };
  if (hash.startsWith('#/projects')) return { name: 'projects' };
  return { name: 'home' };
}

export const href = (r: Route) => (r.name === 'project' ? `#/p/${r.id}` : r.name === 'projects' ? '#/projects' : '#/');

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const h = () => {
      setRoute(parse(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return route;
}
