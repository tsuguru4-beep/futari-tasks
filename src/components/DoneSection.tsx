import { useState, type ReactNode } from 'react';
import { getLocal, setLocal } from '../local';
import { Icon } from './Icon';

const KEY = 'futari.showDone';

// 完了したタスクは下にまとめて折りたたむ。開閉はこの端末に記憶する
export function DoneSection({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(() => getLocal(KEY, false));
  if (count === 0) return null;
  const toggle = () => {
    setOpen(!open);
    setLocal(KEY, !open);
  };
  return (
    <section className="done-section">
      <button type="button" className={'done-toggle' + (open ? ' open' : '')} aria-expanded={open} onClick={toggle}>
        <Icon name="chevron" size={20} />
        <span>{title}（{count}）</span>
      </button>
      {open && <ul className="task-list">{children}</ul>}
    </section>
  );
}
