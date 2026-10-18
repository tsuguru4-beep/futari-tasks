import type { Assignee, Filter, Person, Task } from './types';

export const PERSON_NAME: Record<Person, string> = { husband: '夫', wife: '妻' };

export const partnerOf = (me: Person): Person => (me === 'husband' ? 'wife' : 'husband');

export function assigneeLabel(a: Assignee, me: Person): string {
  if (a === 'both') return '2人';
  return a === me ? '自分' : PERSON_NAME[a];
}

export function filterLabel(f: Filter, me: Person): string {
  if (f === 'all') return 'すべて';
  if (f === 'me') return '自分';
  if (f === 'partner') return PERSON_NAME[partnerOf(me)];
  return '2人';
}

export function matchFilter(t: Task, f: Filter, me: Person): boolean {
  if (f === 'all') return true;
  if (f === 'me') return t.assignee === me;
  if (f === 'partner') return t.assignee === partnerOf(me);
  return t.assignee === 'both';
}
