/* AURUM — Owner Dashboard JS (متكامل مع api.php) */
const API_BASE = '/api.php?route=';

/* ── Theme ── */
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const savedTheme  = localStorage.getItem('aurum-theme') || 'dark-mode';
body.className = savedTheme;
if (themeIcon) themeIcon.textContent = savedTheme === 'dark-mode' ? '☀' : '☾';
themeToggle?.addEventListener('click', () => {
  const next = body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
  body.className = next;
  localStorage.setItem('aurum-theme', next);
  if (themeIcon) themeIcon.textContent = next === 'dark-mode' ? '☀' : '☾';
});

/* ── Auth Guard ── */
const user = JSON.parse(localStorage.getItem('aurum-user') || 'null');
if (!user || user.role !== 'owner') {
  window.location.href = 'auth.html';
}

/* ── Populate owner info ── */
if (user) {
  document.getElementById('navOwnerInitials').textContent  = user.initials || 'OW';
  document.getElementById('navOwnerName').textContent      = user.name ? user.name.split(' ')[0] : 'Owner';
  document.getElementById('sideOwnerInitials').textContent = user.initials || 'OW';
  document.getElementById('sideOwnerName').textContent     = user.name || 'Owner';
  document.getElementById('sideOwnerHotel').textContent    = user.hotelName || 'Your Property';
  document.getElementById('ownerGreetName').textContent    = user.name ? user.name.split(' ')[0] : 'Partner';
}

/* ── Sign out ── */
document.getElementById('dashSignout')?.addEventListener('click', () => {
  localStorage.removeItem('aurum-user');
  localStorage.removeItem('aurum-token');
  window.location.href = 'index.html';
});

/* ── Tab Navigation ── */
const navBtns = document.querySelectorAll('.snav-btn');
const tabs    = document.querySelectorAll('.dash-tab');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchDashTab(btn.dataset.tab));
});
window.switchDashTab = function(tabId) {
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  tabs.forEach(t   => t.classList.toggle('active', t.id === 'tab-' + tabId));
};

/* ── Mock Data (fallback) ── */
const mockBookings = [
  { guest:'Madeleine L.', room:'Grand Suite 401', checkin:'2025-07-14', checkout:'2025-07-18', nights:4, revenue:3400, status:'confirmed' },
  { guest:'James H.', room:'Deluxe 202', checkin:'2025-07-15', checkout:'2025-07-17', nights:2, revenue:900, status:'confirmed' },
  { guest:'Layla M.', room:'Junior Suite 305', checkin:'2025-07-18', checkout:'2025-07-22', nights:4, revenue:2200, status:'upcoming' },
  { guest:'Thomas R.', room:'Deluxe 108', checkin:'2025-07-10', checkout:'2025-07-13', nights:3, revenue:1350, status:'confirmed' },
  { guest:'Amira K.', room:'Presidential 501', checkin:'2025-07-20', checkout:'2025-07-25', nights:5, revenue:8750, status:'upcoming' },
  { guest:'Carlos V.', room:'Suite 303', checkin:'2025-07-08', checkout:'2025-07-12', nights:4, revenue:3200, status:'confirmed' },
  { guest:'Sophie D.', room:'Deluxe 114', checkin:'2025-07-05', checkout:'2025-07-07', nights:2, revenue:900, status:'confirmed' },
  { guest:'Omar F.', room:'Grand Suite 402', checkin:'2025-07-22', checkout:'2025-07-26', nights:4, revenue:3400, status:'pending' },
];
const monthlyRevenue = [
  { month:'Feb', bookings:102, gross:61200 },
  { month:'Mar', bookings:118, gross:70800 },
  { month:'Apr', bookings:125, gross:75000 },
  { month:'May', bookings:131, gross:78600 },
  { month:'Jun', bookings:139, gross:82100 },
  { month:'Jul', bookings:148, gross:84200 },
];

/* ── Properties (localStorage-backed) ── */
function getProperties() {
  try { const stored = localStorage.getItem('aurum-owner-properties'); if (stored) return JSON.parse(stored); } catch(e) {}
  const defaults = [{ name: user?.hotelName || 'Grand Hotel AURUM', city: 'Paris', country: 'France', stars: 5, rooms: 56, bookings:148, revenue:84200, occ:83, status:'live' }];
  saveProperties(defaults);
  return defaults;
}
function saveProperties(props) { localStorage.setItem('aurum-owner-properties', JSON.stringify(props)); }
function getRooms() { try { const stored = localStorage.getItem('aurum-owner-rooms'); if (stored) return JSON.parse(stored); } catch(e){} return null; }
function saveRooms(rooms) { localStorage.setItem('aurum-owner-rooms', JSON.stringify(rooms)); }
let properties = getProperties();

/* ── Render Recent Bookings (try API first) ── */
async function renderRecentBookings() {
  const el = document.getElementById('recentBookingsList');
  if (!el) return;
  const token = localStorage.getItem('aurum-token');
  if (token) {
    try {
      const res = await fetch(`${API_BASE}analytics/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data.recent_bookings && data.data.recent_bookings.length) {
        el.innerHTML = data.data.recent_bookings.slice(0,5).map(b => `
          <div class="bl-item">
            <div class="bl-avatar">${(b.guest_name || 'G').charAt(0)}</div>
            <div class="bl-info">
              <div class="bl-name">${b.guest_name || 'Guest'}</div>
              <div class="bl-room">${b.hotel_name || 'Hotel'} · ${b.nights || '?'}n</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
              <div class="bl-price">$${(b.total_price || 0).toLocaleString()}</div>
              <div class="bl-status ${b.status}">${b.status || 'confirmed'}</div>
            </div>
          </div>
        `).join('');
        return;
      }
    } catch(e) { console.warn('API fetch failed, using mock', e); }
  }
  el.innerHTML = mockBookings.slice(0,5).map(b => `
    <div class="bl-item">
      <div class="bl-avatar">${b.guest.split(' ').map(n=>n[0]).join('')}</div>
      <div class="bl-info">
        <div class="bl-name">${b.guest}</div>
        <div class="bl-room">${b.room} · ${b.nights}n</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <div class="bl-price">$${b.revenue.toLocaleString()}</div>
        <div class="bl-status ${b.status}">${b.status}</div>
      </div>
    </div>
  `).join('');
}
function renderRevChart() { /* كما هي */ }
function renderBookingsTable(filter = 'all') { /* كما هي مع استخدام mock فقط للبساطة */ }
function renderProperties() { /* كما هي */ }
const ROOM_STATUSES = ['available','occupied','maintenance','reserved'];
const ROOM_TYPE_NAMES = { DX:'Deluxe', SU:'Suite', GS:'Grand S.', PR:'Presid.' };
function renderRoomGrid() { /* كما هي */ }
function updateRoomSummary(roomData) { /* كما هي */ }
function renderRevBreakdown() { /* كما هي */ }

document.getElementById('bookingFilter')?.addEventListener('change', function() { renderBookingsTable(this.value); });
function initDashSelect(containerId, hiddenSelectId, onChange) { /* كما هي */ }
initDashSelect('bookingFilterWrap', 'bookingFilter', (val) => renderBookingsTable(val));
initDashSelect('revPeriodWrap', 'revPeriod', (val) => { /* period change handler */ });

/* ── Edit Property Modal (as before) ── */
const epmModal = document.getElementById('editPropModal');
const epmForm = document.getElementById('epmForm');
const epmDeleteConfirm = document.getElementById('epmDeleteConfirm');
window.openEditProp = function(index) { /* ... */ };
function closeEditProp() { epmModal.classList.remove('open'); }
document.getElementById('epmClose')?.addEventListener('click', closeEditProp);
document.getElementById('epmBackdrop')?.addEventListener('click', closeEditProp);
document.getElementById('epmCancelBtn')?.addEventListener('click', closeEditProp);
document.querySelectorAll('.star-opt').forEach(star => { /* ... */ });
document.getElementById('epmDeleteBtn')?.addEventListener('click', () => { /* ... */ });
document.getElementById('epmBackBtn')?.addEventListener('click', () => { /* ... */ });
document.getElementById('epmConfirmDeleteBtn')?.addEventListener('click', () => { /* ... */ });
epmForm?.addEventListener('submit', (e) => { /* ... */ });

/* ── Init ── */
renderRecentBookings();
renderRevChart();
renderBookingsTable();
renderProperties();
renderRoomGrid();
renderRevBreakdown();

/* ── Toast ── */
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('show'), 4000);
}

/* ── Nav Hide / Reveal ── */
const navHideBtn   = document.getElementById('navHideBtn');
const navRevealBtn = document.getElementById('navRevealBtn');
navHideBtn?.addEventListener('click', () => { document.body.classList.add('nav-hidden'); navRevealBtn.classList.add('visible'); localStorage.setItem('aurum-nav-hidden', '1'); });
navRevealBtn?.addEventListener('click', () => { document.body.classList.remove('nav-hidden'); navRevealBtn.classList.remove('visible'); localStorage.removeItem('aurum-nav-hidden'); });
if(localStorage.getItem('aurum-nav-hidden')) { document.body.classList.add('nav-hidden'); navRevealBtn?.classList.add('visible'); }

/* ── Additional: Update KPIs from API ── */
async function updateKPIsFromAPI() {
  const token = localStorage.getItem('aurum-token');
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}analytics/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (data.success && data.data.stats) {
      document.getElementById('kpiRevenue').textContent = '$' + (data.data.stats.total_revenue || 0).toLocaleString();
      document.getElementById('kpiBookings').textContent = data.data.stats.total_bookings || 0;
    }
  } catch(e) { console.warn('Could not fetch KPIs', e); }
}
updateKPIsFromAPI();
