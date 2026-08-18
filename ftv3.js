// FAMILY TREE V3 — ftv3.js (module final)
const loginOverlay = document.getElementById('login-overlay');
const loginForm    = document.getElementById('login-form');
const loginBtn     = document.getElementById('login-btn');
const loginError   = document.getElementById('login-error');
const emailInput   = document.getElementById('login-email');
const passInput    = document.getElementById('login-password');

let supabase = null;
let currentUser = null;
let currentRole = 'member';

async function loadSupabaseLib() {
  const sources = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',
    'https://esm.sh/@supabase/supabase-js@2'
  ];
  for (const url of sources) {
    try {
      const mod = await import(url);
      if (mod && mod.createClient) return mod;
    } catch (e) { console.warn('CDN gagal: ' + url); }
  }
  return null;
}

async function initSupabase() {
  if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_PUBLISHABLE_KEY === 'undefined') {
    return { ok: false, msg: 'File supabase-config.js tidak termuat.' };
  }
  const mod = await loadSupabaseLib();
  if (!mod) return { ok: false, msg: 'Library Supabase tidak bisa dimuat. Periksa internet, lalu refresh.' };
  try {
    supabase = mod.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    return { ok: true };
  } catch (e) {
    return { ok: false, msg: 'Gagal inisialisasi: ' + e.message };
  }
}

// Listener dipasang PALING AWAL — form tidak akan pernah submit native lagi
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Memuat...';

  if (!supabase) {
    const r = await initSupabase();
    if (!r.ok) {
      loginError.textContent = r.msg;
      loginBtn.disabled = false;
      loginBtn.textContent = 'Masuk';
      return;
    }
  }

  loginBtn.textContent = 'Memproses...';
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passInput.value
    });
    if (error) {
      loginError.textContent = translateAuthError(error.message);
      loginBtn.disabled = false;
      loginBtn.textContent = 'Masuk';
      return;
    }
    const { data: profile, error: pErr } = await supabase
      .from('profiles').select('role, full_name').eq('id', data.user.id).single();
    if (pErr || !profile) {
      loginError.textContent = 'Profil tidak ditemukan. Hubungi admin.';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Masuk';
      return;
    }
    currentUser = data.user;
    currentRole = profile.role;
    loginOverlay.classList.add('hidden');
    showWelcomeBanner(profile.full_name, currentRole);
  } catch (err) {
    loginError.textContent = 'Kesalahan: ' + (err.message || err);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Masuk';
  }
});

// Auto-login kalau session masih aktif
(async () => {
  const r = await initSupabase();
  if (!r.ok || !supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const { data: profile } = await supabase.from('profiles')
        .select('role, full_name').eq('id', session.user.id).single();
      if (profile) {
        currentUser = session.user;
        currentRole = profile.role;
        loginOverlay.classList.add('hidden');
        showWelcomeBanner(profile.full_name, currentRole);
      }
    }
  } catch (e) {}
})();

function translateAuthError(msg) {
  const map = {
    'Invalid login credentials': 'Email atau password salah.',
    'Email not confirmed': 'Email belum dikonfirmasi.',
    'Rate limit exceeded': 'Terlalu banyak percobaan. Coba lagi sebentar.'
  };
  return map[msg] || msg;
}

function showWelcomeBanner(name, role) {
  const b = document.createElement('div');
  b.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:12px 20px;border-radius:8px;font-family:sans-serif;font-size:14px;z-index:1000;';
  b.innerHTML = 'Halo, <b>' + (name || 'Anggota Keluarga') + '</b> — Login sebagai ' + (role === 'admin' ? '👑 Admin' : '👁 Viewer');
  document.body.appendChild(b);
}

window.familyTreeLogout = async () => {
  if (supabase) await supabase.auth.signOut();
  location.reload();
};
