export type Person = 'husband' | 'wife';
export type Assignee = Person | 'both';

export interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sort: number;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  assignee: Assignee;
  due_date: string | null; // YYYY-MM-DD
  memo: string;
  done: boolean;
  done_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Snapshot {
  projects: Project[];
  tasks: Task[];
}

// 絞り込みは端末ごとに「自分から見て」で持つ
export type Filter = 'all' | 'me' | 'partner' | 'both';
