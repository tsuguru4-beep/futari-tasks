import { useState } from 'react';
import { sb } from '../backend';
import { CONFIG } from '../config';
import { PERSON_NAME } from '../people';
import type { Person } from '../types';

export function Login() {
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await sb().auth.signInWithPassword({ email: CONFIG.loginEmail, password: pass });
    setBusy(false);
    if (error) setError(error.status === 400 ? '合言葉が違います' : 'つながりませんでした。電波を確認してください');
  };

  return (
    <main className="welcome">
      <img src="icon.svg" alt="" width={72} height={72} />
      <h1>ふたりのタスク</h1>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>合言葉</span>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus
            autoComplete="current-password" enterKeyHint="go" />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn primary" disabled={!pass || busy}>{busy ? '確認中…' : 'はじめる'}</button>
      </form>
    </main>
  );
}

export function WhoAmI({ onPick }: { onPick(p: Person): void }) {
  return (
    <main className="welcome">
      <h1>あなたはどちらですか？</h1>
      <p className="sub">この端末に記憶します（あとで設定から変更できます）</p>
      <div className="who-buttons">
        {(['husband', 'wife'] as Person[]).map((p) => (
          <button key={p} type="button" className="btn big" onClick={() => onPick(p)}>{PERSON_NAME[p]}</button>
        ))}
      </div>
    </main>
  );
}
