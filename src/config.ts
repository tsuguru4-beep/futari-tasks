// Supabase の接続情報。anon（publishable）キーはブラウザに配る前提のキーなので、ここに書いてよい（データは RLS で守る）
export const CONFIG = {
  supabaseUrl: '',
  supabaseKey: '',
  // 2人で共有するログイン用アカウント。合言葉はこのアカウントのパスワード
  loginEmail: '',
};

// 接続情報が未設定のあいだは、この端末の中だけで動くお試しモードにする
export const isDemo = !CONFIG.supabaseUrl || !CONFIG.supabaseKey || !CONFIG.loginEmail;
