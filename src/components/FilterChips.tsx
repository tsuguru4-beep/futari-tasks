import { useState } from 'react';
import { filterLabel } from '../people';
import { getLocal, setLocal } from '../local';
import { useSession } from '../session';
import type { Filter } from '../types';

const FILTERS: Filter[] = ['all', 'me', 'partner', 'both'];
const KEY = 'futari.filter';

// 絞り込みはホームとプロジェクト画面で共通、この端末に記憶する
export function useFilter(): [Filter, (f: Filter) => void] {
  const [f, setF] = useState<Filter>(() => getLocal<Filter>(KEY, 'all'));
  return [f, (v) => { setF(v); setLocal(KEY, v); }];
}

export function FilterChips({ value, onChange }: { value: Filter; onChange(f: Filter): void }) {
  const { me } = useSession();
  return (
    <div className="chips" role="radiogroup" aria-label="担当者で絞り込み">
      {FILTERS.map((f) => (
        <button key={f} type="button" role="radio" aria-checked={value === f}
          className={'chip' + (value === f ? ' on' : '')} onClick={() => onChange(f)}>
          {filterLabel(f, me)}
        </button>
      ))}
    </div>
  );
}
