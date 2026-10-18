import { Segmented } from '../components/Segmented';
import { Sheet } from '../components/Sheet';
import { isDemo } from '../config';
import { PERSON_NAME } from '../people';
import { useSession } from '../session';
import type { Person } from '../types';

export function SettingsSheet({ onClose }: { onClose(): void }) {
  const { me, setMe, signOut } = useSession();
  return (
    <Sheet title="設定" onClose={onClose}>
      <div className="form">
        <div className="field">
          <span>この端末の持ち主</span>
          <Segmented<Person> label="この端末の持ち主" value={me} onChange={setMe}
            options={(['husband', 'wife'] as Person[]).map((p) => ({ value: p, label: PERSON_NAME[p] }))} />
        </div>
        {isDemo ? (
          <p className="note">お試しモードです。データはこの端末の中だけに保存され、相手とは共有されません。</p>
        ) : (
          <button type="button" className="btn" onClick={() => confirm('ログアウトしますか？') && signOut()}>
            ログアウト
          </button>
        )}
        <p className="note">バージョン {__APP_VERSION__}</p>
      </div>
    </Sheet>
  );
}
