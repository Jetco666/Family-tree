// ============================================
// FAMILY TREE V3 — app.js
// Tahap 4: Login + koneksi Supabase
// ============================================

// Inisialisasi Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Memproses...';

  const email = emailInput.value.trim();
  const password = passInput.value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = translateAuthError(error.message);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Masuk';
    return;
  }

  // Ambil role dari profiles
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

  // Sembunyikan overlay login
  loginOverlay.classList.add('hidden');

  // Placeholder: tampilkan info sementara di body
  showWelcomeBanner(profile.full_name, currentRole);

  // TODO Tahap 5: render family tree dari Supabase
});

// ---------- AUTO-LOGIN (session masih aktif) ----------
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
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
  // Banner sementara — akan diganti UI family tree di Tahap 5
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

// Expose logout untuk dipakai nanti
window.familyTreeLogout = async () => {
  await supabase.auth.signOut();
  location.reload();
};
