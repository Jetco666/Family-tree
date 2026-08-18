// ============================================
// FAMILY TREE V3 — app.js (v3.1 anti silent-fail)
// ============================================

// ---------- Supabase client (aman, tidak akan crash) ----------
let supabase = null;
try {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  } else {
    console.error('Library Supabase tidak termuat (CDN).');
  }
} catch (err) {
  console.error('Gagal inisialisasi Supabase:', err);
}

// Elemen DOM
const loginOverlay = document.getElementById('login-overlay');
const loginForm    = document.getElementById('login-form');
const loginBtn     = document.getElementById('login-btn');
const loginError   = document.getElementById('login-error');
const emailInput   = document.getElementById('login-email');
const passInput    = document.getElementById('login-password');

// State global
let currentUser = null;
let currentRole = 'member';

// ---------- LOGIN ----------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // SELALU — biar alamat tidak jadi "?"

  loginError.textContent = '';

  if (!supabase) {
    loginError.textContent = 'Koneksi Supabase tidak termuat. Tekan Ctrl+F5 lalu coba lagi.';
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Memproses...';

  const email = emailInput.value.trim();
  const password = passInput.value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      loginError.textContent = translateAuthError(error.message);
      loginBtn.disabled = false;
      loginBtn.textContent = 'Masuk';
      return;
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    if (profileErr || !profile) {
      loginError.textContent = 'Profil tidak ditemukan. Hubungi admin.';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Masuk';
      await supabase.auth.signOut();
      return;
    }

    currentUser = data.user;
    currentRole = profile.role;

    console.log('✅ Login sukses:', {
      email: currentUser.email,
      role: currentRole,
      fullName: profile.full_name
    });

    loginOverlay.classList.add('hidden');
    showWelcomeBanner(profile.full_name, currentRole);
  } catch (err) {
    console.error(err);
    loginError.textContent = 'Terjadi kesalahan: ' + (err.message || err);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Masuk';
  }
});

// ---------- AUTO-LOGIN (session masih aktif) ----------
(async () => {
  if (!supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        currentUser = session.user;
        currentRole = profile.role;
        loginOverlay.classList.add('hidden');
        showWelcomeBanner(profile.full_name, currentRole);
      }
    }
  } catch (err) {
    console.error('Auto-login gagal:', err);
  }
})();

// ---------- HELPERS ----------
function translateAuthError(msg) {
  const map = {
    'Invalid login credentials': 'Email atau password salah.',
    'Email not confirmed': 'Email belum dikonfirmasi.',
    'User already registered': 'Email sudah terdaftar.',
    'Signup disabled': 'Pendaftaran dinonaktifkan.',
    'Rate limit exceeded': 'Terlalu banyak percobaan. Coba lagi sebentar.'
  };
  return map[msg] || msg;
}

function showWelcomeBanner(name, role) {
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
    background: #10b981; color: white; padding: 12px 20px; border-radius: 8px;
    font-family: sans-serif; font-size: 14px; z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  const roleLabel = role === 'admin' ? '👑 Admin' : '👁 Viewer';
  banner.innerHTML = `Halo, <b>${name || 'Anggota Keluarga'}</b> — Login sebagai ${roleLabel}`;
  document.body.appendChild(banner);
}

window.familyTreeLogout = async () => {
  if (supabase) await supabase.auth.signOut();
  location.reload();
};
