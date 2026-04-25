/* AURUM — auth.js (ديمو – حسابات محددة فقط) */
const API_BASE = '/api.php?route=';

/* ── Theme (نفس الكود السابق) ── */
const body = document.body;
const savedTheme = localStorage.getItem('aurum-theme') || 'dark-mode';
body.className = savedTheme;
const themeIcon = document.getElementById('themeIcon');
if (themeIcon) themeIcon.textContent = savedTheme === 'dark-mode' ? '☀' : '☾';
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light-mode' : 'dark-mode';
    body.className = newTheme;
    localStorage.setItem('aurum-theme', newTheme);
    if (themeIcon) themeIcon.textContent = isDark ? '☾' : '☀';
    themeToggle.style.animation = 'none';
    setTimeout(() => { if (themeToggle) themeToggle.style.animation = ''; }, 10);
  });
}

/* ── Role Switcher (نفس الكود السابق) ── */
const roleGuest = document.getElementById('roleGuest');
const roleOwner = document.getElementById('roleOwner');
const guestSection = document.getElementById('guestSection');
const ownerSection = document.getElementById('ownerSection');
function switchRole(role) {
  if (!roleGuest || !roleOwner || !guestSection || !ownerSection) return;
  if (role === 'guest') {
    roleGuest.classList.add('active');
    roleOwner.classList.remove('active');
    guestSection.classList.remove('hidden');
    ownerSection.classList.add('hidden');
  } else {
    roleOwner.classList.add('active');
    roleGuest.classList.remove('active');
    ownerSection.classList.remove('hidden');
    guestSection.classList.add('hidden');
  }
}
if (roleGuest && roleOwner) {
  roleGuest.addEventListener('click', () => switchRole('guest'));
  roleOwner.addEventListener('click', () => switchRole('owner'));
}
(function() {
  const p = new URLSearchParams(window.location.search);
  if (p.get('role') === 'owner') switchRole('owner');
})();

/* ── Guest Tabs (كما هو) ── */
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginWrap = document.getElementById('loginWrap');
const registerWrap = document.getElementById('registerWrap');
if (tabLogin && tabRegister && loginWrap && registerWrap) {
  tabLogin.addEventListener('click', () => switchGuestTab('login'));
  tabRegister.addEventListener('click', () => switchGuestTab('register'));
}
const goRegisterLink = document.getElementById('goRegisterLink');
const goLoginLink = document.getElementById('goLoginLink');
if (goRegisterLink) goRegisterLink.addEventListener('click', e => { e.preventDefault(); switchGuestTab('register'); });
if (goLoginLink) goLoginLink.addEventListener('click', e => { e.preventDefault(); switchGuestTab('login'); });
function switchGuestTab(tab) {
  if (!tabLogin || !tabRegister || !loginWrap || !registerWrap) return;
  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginWrap.classList.remove('hidden');
    registerWrap.classList.add('hidden');
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerWrap.classList.remove('hidden');
    loginWrap.classList.add('hidden');
  }
}

/* ── Owner Tabs (كما هو) ── */
const ownerTabLogin = document.getElementById('ownerTabLogin');
const ownerTabRegister = document.getElementById('ownerTabRegister');
const ownerLoginWrap = document.getElementById('ownerLoginWrap');
const ownerRegWrap = document.getElementById('ownerRegisterWrap');
if (ownerTabLogin && ownerTabRegister && ownerLoginWrap && ownerRegWrap) {
  ownerTabLogin.addEventListener('click', () => switchOwnerTab('login'));
  ownerTabRegister.addEventListener('click', () => switchOwnerTab('register'));
}
const goOwnerRegisterLink = document.getElementById('goOwnerRegisterLink');
const goOwnerLoginLink = document.getElementById('goOwnerLoginLink');
if (goOwnerRegisterLink) goOwnerRegisterLink.addEventListener('click', e => { e.preventDefault(); switchOwnerTab('register'); });
if (goOwnerLoginLink) goOwnerLoginLink.addEventListener('click', e => { e.preventDefault(); switchOwnerTab('login'); });
function switchOwnerTab(tab) {
  if (!ownerTabLogin || !ownerTabRegister || !ownerLoginWrap || !ownerRegWrap) return;
  if (tab === 'login') {
    ownerTabLogin.classList.add('active');
    ownerTabRegister.classList.remove('active');
    ownerLoginWrap.classList.remove('hidden');
    ownerRegWrap.classList.add('hidden');
  } else {
    ownerTabRegister.classList.add('active');
    ownerTabLogin.classList.remove('active');
    ownerRegWrap.classList.remove('hidden');
    ownerLoginWrap.classList.add('hidden');
  }
}

/* ── دوال مساعدة (لن أكررها، استخدم نفس الكود السابق) ── */
function setError(id, msg) { /* ... */ }
function clearError(id) { /* ... */ }
function highlightInvalid(inputId) { /* ... */ }
window.togglePw = function(id, btn) { /* ... */ };
window.checkStrength = function(val) { /* ... */ };
window.checkOwnerStrength = window.checkStrength;
function applyStrength(val, fillId, labelId) { /* ... */ }
function showMsg(text, type) { /* ... */ }
function showSuccessOverlay(title, subtitle) { /* ... */ }

/* ── Guest Login (ديمو فقط) ── */
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail')?.value.trim() || '';
    const pass = document.getElementById('loginPass')?.value || '';
    if (!email || !pass) { showMsg('Please enter email and password', 'error'); return; }
    try {
      const res = await fetch(`${API_BASE}auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('aurum-token', data.data.token);
        localStorage.setItem('aurum-user', JSON.stringify(data.data.user));
        showSuccessOverlay('Welcome back!', 'Redirecting...');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
      }
    } catch(e) { console.warn('API unavailable, demo mode'); }
    // Demo mode: only predefined demo account
    if (email === 'demo@aurum.com' && pass === 'demo123') {
      localStorage.setItem('aurum-user', JSON.stringify({ name: 'Demo User', initials: 'DU', email, role: 'guest' }));
      localStorage.setItem('aurum-token', 'demo-token');
      showSuccessOverlay('Welcome Demo User!', 'Redirecting...');
      setTimeout(() => window.location.href = 'index.html', 1500);
      return;
    }
    showMsg('Invalid credentials. Use demo@aurum.com / demo123 (Demo mode)', 'error');
  });
}

/* ── Guest Register (معطل) ── */
const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
  registerBtn.addEventListener('click', () => {
    showMsg('Registration disabled in demo mode. Use demo@aurum.com / demo123', 'error');
  });
}

/* ── Owner Login (ديمو) ── */
const ownerLoginBtn = document.getElementById('ownerLoginBtn');
if (ownerLoginBtn) {
  ownerLoginBtn.addEventListener('click', async () => {
    const email = document.getElementById('ownerLoginEmail')?.value.trim() || '';
    const pass = document.getElementById('ownerLoginPass')?.value || '';
    if (!email || !pass) { showMsg('Email and password required', 'error'); return; }
    try {
      const res = await fetch(`${API_BASE}auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) });
      const data = await res.json();
      if (data.success && data.data.user.role === 'owner') {
        localStorage.setItem('aurum-token', data.data.token);
        localStorage.setItem('aurum-user', JSON.stringify(data.data.user));
        showSuccessOverlay('Welcome back!', 'Redirecting...');
        setTimeout(() => window.location.href = 'owner-dashboard.html', 1500);
        return;
      }
    } catch(e) { console.warn(e); }
    if (email === 'owner@aurum.com' && pass === 'owner123') {
      localStorage.setItem('aurum-user', JSON.stringify({ name: 'Demo Owner', initials: 'DO', email, role: 'owner', hotelName: 'Demo Hotel' }));
      localStorage.setItem('aurum-token', 'demo-owner-token');
      showSuccessOverlay('Welcome Demo Owner!', 'Redirecting...');
      setTimeout(() => window.location.href = 'owner-dashboard.html', 1500);
      return;
    }
    showMsg('Invalid owner credentials. Demo: owner@aurum.com / owner123', 'error');
  });
}

/* ── Owner Register (معطل) ── */
const ownerRegisterBtn = document.getElementById('ownerRegisterBtn');
if (ownerRegisterBtn) {
  ownerRegisterBtn.addEventListener('click', () => {
    showMsg('Owner registration disabled in demo mode', 'error');
  });
}

/* ── Social Login (معطل) ── */
window.socialLogin = function(provider) {
  showMsg(`Login with ${provider} disabled. Use demo@aurum.com / demo123`, 'error');
};
