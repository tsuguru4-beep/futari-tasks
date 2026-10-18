import { useEffect, useMemo, useState } from 'react';
import { sb } from './backend';
import { BottomNav } from './components/BottomNav';
import { isDemo } from './config';
import { getLocal, setLocal } from './local';
import { Home } from './pages/Home';
import { ProjectDetail } from './pages/ProjectDetail';
import { Projects } from './pages/Projects';
import { Review } from './pages/Review';
import { Login, WhoAmI } from './pages/Welcome';
import { useRoute } from './router';
import { SessionCtx, type Session } from './session';
import { StoreProvider, useStore } from './store';
import type { Person } from './types';

const ME_KEY = 'futari.me';

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(isDemo ? true : null);
  const [me, setMeState] = useState<Person | null>(() => getLocal<Person | null>(ME_KEY, null));

  useEffect(() => {
    if (isDemo) return;
    sb().auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data } = sb().auth.onAuthStateChange((_event, session) => setAuthed(!!session));
    return () => data.subscription.unsubscribe();
  }, []);

  const session = useMemo<Session | null>(
    () =>
      me && {
        me,
        setMe: (p) => {
          setLocal(ME_KEY, p);
          setMeState(p);
        },
        signOut: () => void sb().auth.signOut(),
      },
    [me],
  );

  if (authed === null) return null;
  if (!authed) return <Login />;
  if (!session) return <WhoAmI onPick={(p) => { setLocal(ME_KEY, p); setMeState(p); }} />;

  return (
    <SessionCtx.Provider value={session}>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SessionCtx.Provider>
  );
}

function Main() {
  const route = useRoute();
  const { data, loadError, toast } = useStore();

  return (
    <>
      {isDemo && <div className="demo-banner">お試しモード：この端末だけに保存されます</div>}
      <main className="page">
        {!data ? (
          <p className="empty">{loadError ? '読み込めませんでした。電波を確認してください' : '読み込み中…'}</p>
        ) : route.name === 'project' ? (
          <ProjectDetail key={route.id} id={route.id} />
        ) : route.name === 'projects' ? (
          <Projects />
        ) : route.name === 'review' ? (
          <Review />
        ) : (
          <Home />
        )}
      </main>
      <BottomNav route={route} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
