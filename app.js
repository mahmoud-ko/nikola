/* AURUM — app.js (رد محلي ذكي مع Worker احتياطي يحمل GROQ_API_KEY) */

/* ═══════════════════════════════════════════════
   🔐 التغيير الأساسي: يجب أن يشير هذا الرابط إلى الـ Worker الخاص بك 
   والذي يحوي GROQ_API_KEY كمتغير بيئة آمن.
   يمكنك نشره مجاناً على Cloudflare Workers أو أي خدمة حوسبة边缘.
═══════════════════════════════════════════════ */
const AI_API_BASE = 'https://aurum-ai.wallamahmoud96.workers.dev';الحقيقي

/* باقي الإعدادات كما هي مع الحفاظ على الرد المحلي الذكي (fallback) */
const API_BASE = '/api.php?route=';

/* ═══════════════════════════════════════════════
   THEME & SESSION & NAV (بدون تغيير)
═══════════════════════════════════════════════ */
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

const savedTheme = localStorage.getItem('aurum-theme') || 'dark-mode';
body.className = savedTheme;
setThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-mode');
  const next = isDark ? 'light-mode' : 'dark-mode';
  body.className = next;
  localStorage.setItem('aurum-theme', next);
  setThemeIcon(next);
});

function setThemeIcon(mode) {
  themeIcon.textContent = mode === 'dark-mode' ? '☀' : '☾';
}

const navUser       = document.getElementById('navUser');
const navUserLogged = document.getElementById('navUserLogged');
const navAvatar     = document.getElementById('navAvatar');
const navUsername   = document.getElementById('navUsername');

const savedUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
if (savedUser) {
  navUser.style.display = 'none';
  navUserLogged.classList.remove('hidden');
  navAvatar.textContent   = savedUser.initials || '??';
  navUsername.textContent = savedUser.name.split(' ')[0];
}

document.getElementById("navSignout")?.addEventListener("click", () => {
  localStorage.removeItem('aurum-user');
  localStorage.removeItem('aurum-token');
  navUserLogged.classList.add('hidden');
  navUser.style.display = '';
  showToast('You have been signed out.');
});

const navbar   = document.getElementById('navbar');
const pages    = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));

function showPage(id) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    const offset = (navbar && navbar.offsetHeight) ? navbar.offsetHeight + 8 : 0;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
  navLinks.forEach(l => { if (l.dataset.page === id) l.classList.add('active'); });
  document.querySelector('.nav-links')?.classList.remove('mobile-open');
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    if (link.dataset.page) { e.preventDefault(); showPage(link.dataset.page); return; }
    if (link.getAttribute('href') === 'owner.html') {
      e.preventDefault();
      const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
      if (!curUser || curUser.role !== 'owner') {
        showSideSigninTip(link, null, 'You need to sign in as an owner to list your property');
      } else {
        window.location.href = 'owner.html';
      }
    }
  });
});

/* ═══════════════════════════════════════════════
   HOTEL DATABASE (محلي لـ GitHub Pages) — بدون تغيير
═══════════════════════════════════════════════ */
let hotelDatabase = [];

async function loadHotelsFromAPI() {
    if (window.location.hostname === 'mahmoud-ko.github.io') {
        useLocalHotelDatabase();
        return;
    }
    try {
        const res = await fetch(`${API_BASE}hotels`);
        const data = await res.json();
        if (data.success) {
            hotelDatabase = data.data;
            renderResults(filterHotels('Paris', 1, 0, 'any'), 'Paris', 1, 0, 'any');
        } else {
            useLocalHotelDatabase();
        }
    } catch(e) {
        useLocalHotelDatabase();
    }
}

function useLocalHotelDatabase() {
    hotelDatabase = [
        { id:1, name:'Le Grand Hôtel', city:'Paris', country:'France', stars:5, price:450, rating:4.9, reviews:1284, desc:'Belle Époque grandeur', amenities:['Wi-Fi','Spa','Restaurant','Concierge','Bar'], initial:'LG', color:'#1a1208', maxChildren:4, rooms:3, photos: makePhotos('LG','#1a1208','#2a1f0a','#180e04') },
        { id:2, name:'Hôtel de Crillon', city:'Paris', country:'France', stars:5, price:980, rating:4.95, reviews:876, desc:'Palatial 18th-century', amenities:['Wi-Fi','Pool','Spa','Restaurant','Concierge'], initial:'HC', color:'#14100a', maxChildren:2, rooms:5, photos: makePhotos('HC','#14100a','#201808','#0e0c06') },
        { id:3, name:'Burj Al Arab', city:'Dubai', country:'UAE', stars:5, price:1800, rating:4.85, reviews:2341, desc:'Iconic sail-shaped', amenities:['Pool','Spa','Restaurant','Bar','Transfer'], initial:'BA', color:'#0a1218', maxChildren:3, rooms:2, photos: makePhotos('BA','#0a1218','#0d1e2e','#06101a') },
        { id:4, name:'Atlantis The Palm', city:'Dubai', country:'UAE', stars:5, price:620, rating:4.7, reviews:5612, desc:'Waterpark paradise', amenities:['Pool','Wi-Fi','Restaurant','Bar','Gym','Beach'], initial:'AT', color:'#0a1015', maxChildren:6, rooms:5, photos: makePhotos('AT','#0a1015','#0e1a22','#081218') },
        { id:5, name:'Sofitel Algiers', city:'Algiers', country:'Algeria', stars:5, price:220, rating:4.72, reviews:642, desc:'French elegance overlooking the bay', amenities:['Pool','Spa','Restaurant','Bar','Wi-Fi'], initial:'SA', color:'#0a1a0e', maxChildren:3, rooms:4, photos: makePhotos('SA','#0a1a0e','#102414','#06100a') },
        { id:6, name:'El Djazair Hotel', city:'Algiers', country:'Algeria', stars:5, price:180, rating:4.65, reviews:430, desc:'Colonial-era landmark', amenities:['Pool','Restaurant','Bar','Concierge','Wi-Fi'], initial:'EJ', color:'#0e1a0a', maxChildren:4, rooms:3, photos: makePhotos('EJ','#0e1a0a','#152210','#0a1808') }
    ];
    renderResults(filterHotels('Paris', 1, 0, 'any'), 'Paris', 1, 0, 'any');
}

function makePhotos(initial, c1, c2, c3) {
  return {
    hotel: [
      { gradient:`linear-gradient(135deg,${c1},${c2})`, label:'Exterior', initial },
      { gradient:`linear-gradient(160deg,${c2},${c3})`, label:'Lobby',    initial },
      { gradient:`linear-gradient(120deg,${c1},${c3})`, label:'Terrace',  initial },
      { gradient:`linear-gradient(180deg,${c3},${c2})`, label:'Garden / Courtyard', initial },
    ],
    rooms: [
      { gradient:`linear-gradient(140deg,${c1},${c3})`, label:'Deluxe Room',     initial },
      { gradient:`linear-gradient(160deg,${c2},${c1})`, label:'Suite',           initial },
      { gradient:`linear-gradient(120deg,${c3},${c2})`, label:'Grand Suite',     initial },
      { gradient:`linear-gradient(180deg,${c1},${c2})`, label:'Presidential Suite', initial },
    ],
    amenities: [
      { gradient:`linear-gradient(135deg,${c2},${c3})`, label:'Swimming Pool',   initial },
      { gradient:`linear-gradient(150deg,${c1},${c2})`, label:'Spa & Wellness',  initial },
      { gradient:`linear-gradient(125deg,${c3},${c1})`, label:'Restaurant',      initial },
      { gradient:`linear-gradient(165deg,${c2},${c1})`, label:'Bar & Lounge',    initial },
    ],
  };
}

/* ═══════════════════════════════════════════════
   CUSTOM SEARCH DROPDOWNS (بدون تغيير)
═══════════════════════════════════════════════ */
function initCustomSelect(id, hiddenSelectId) {
  const container = document.getElementById(id);
  const hiddenSel = document.getElementById(hiddenSelectId);
  if (!container || !hiddenSel) return;
  const trigger = container.querySelector('.custom-select-trigger');
  const valueSpan = container.querySelector('.custom-select-value');
  const options = container.querySelectorAll('.custom-select-option');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.custom-select.open').forEach(el => {
      if (el !== container) el.classList.remove('open');
    });
    container.classList.toggle('open');
  });
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const val = opt.dataset.value;
      const text = opt.textContent;
      hiddenSel.value = val;
      valueSpan.textContent = text;
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      container.classList.remove('open');
    });
  });
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) container.classList.remove('open');
  });
  hiddenSel.addEventListener('change', () => syncCustomSelect(container, hiddenSel, options, valueSpan));
}
function syncCustomSelect(container, hiddenSel, options, valueSpan) {
  const val = hiddenSel.value;
  options.forEach(opt => {
    if (opt.dataset.value === val) opt.classList.add('selected');
    else opt.classList.remove('selected');
  });
}
initCustomSelect('roomsSelect', 's-rooms');
initCustomSelect('childrenSelect', 's-children');
initCustomSelect('budgetSelect', 's-price');

/* ═══════════════════════════════════════════════
   SEARCH & RESULTS (بدون تغيير)
═══════════════════════════════════════════════ */
document.getElementById('searchBtn').addEventListener('click', () => {
  const location = document.getElementById('s-location').value.trim();
  const rooms    = parseInt(document.getElementById('s-rooms').value);
  const children = parseInt(document.getElementById('s-children').value);
  const price    = document.getElementById('s-price').value;
  if (!location) { showToast('Please enter a destination.', 'error'); return; }
  renderResults(filterHotels(location, rooms, children, price), location, rooms, children, price);
  showPage('results');
});
function filterHotels(loc, rooms, children, price) {
  return hotelDatabase.filter(h => {
    const lm = !loc || h.city.toLowerCase().includes(loc.toLowerCase()) || h.country.toLowerCase().includes(loc.toLowerCase());
    const rm = h.rooms >= rooms;
    const cm = h.maxChildren >= children;
    let pm = true;
    if (price !== 'any') {
      const max = parseInt(price);
      pm = price === '1001' ? h.price > 1000 : h.price <= max;
    }
    return lm && rm && cm && pm;
  });
}
function renderResults(hotels, loc, rooms, children, price) {
  const grid  = document.getElementById('resultsGrid');
  const title = document.getElementById('resultsTitle');
  const meta  = document.getElementById('resultsMeta');
  const pl    = price === 'any' ? 'Any budget' : price === '1001' ? 'Over $1,000/night' : `Up to $${price}/night`;
  title.innerHTML = `Hotels in <em>${loc || 'All Destinations'}</em>`;
  meta.textContent = `Showing ${hotels.length} propert${hotels.length===1?'y':'ies'} · ${rooms} room${rooms>1?'s':''} · ${children} child${children!==1?'ren':''} · ${pl}`;
  grid.innerHTML = '';
  if (!hotels.length) {
    grid.innerHTML = `<div class="no-results">No properties found.<br/><small style="font-size:16px;color:var(--text-m)">Try adjusting your filters.</small></div>`;
    return;
  }
  hotels.forEach((h, i) => grid.appendChild(createHotelCard(h, i)));
  document.getElementById('sortFilter').onchange = function() {
    const s = [...hotels];
    if (this.value === 'price-asc')  s.sort((a,b)=>a.price-b.price);
    if (this.value === 'price-desc') s.sort((a,b)=>b.price-a.price);
    if (this.value === 'rating')     s.sort((a,b)=>b.rating-a.rating);
    grid.innerHTML = '';
    s.forEach((h,i) => grid.appendChild(createHotelCard(h,i)));
  };
}
function createHotelCard(hotel, delay=0) {
  const card = document.createElement('div');
  card.className = 'hotel-card';
  card.style.cssText = `animation:fadeUp 0.5s ease ${delay*0.07}s both`;
  const stars = '★'.repeat(hotel.stars)+'☆'.repeat(5-hotel.stars);
  card.innerHTML = `
    <div class="hotel-card-img" style="background:linear-gradient(135deg,${hotel.color},#1a1a10)">
      <div class="hotel-card-img-inner">${hotel.initial}</div>
      <div class="hotel-badge">${hotel.stars} ★</div>
      <button class="hotel-view-photos">📷 View Photos</button>
    </div>
    <div class="hotel-card-body">
      <div class="hotel-card-name">${hotel.name}</div>
      <div class="hotel-card-location">📍 ${hotel.city}, ${hotel.country}</div>
      <div class="hotel-card-desc">${hotel.desc}</div>
      <div class="hotel-card-amenities">${hotel.amenities.slice(0,4).map(a=>`<span class="amenity-tag">${a}</span>`).join('')}</div>
      <div class="hotel-card-footer">
        <div><span class="price-num">$${hotel.price}</span><span class="price-per">/night</span></div>
        <div>⭐ ${hotel.rating} (${hotel.reviews.toLocaleString()})</div>
      </div>
      <button class="hotel-book-btn">Reserve Now</button>
    </div>`;
  card.querySelector('.hotel-view-photos').addEventListener('click', e => { e.stopPropagation(); openGallery(hotel); });
  card.querySelector('.hotel-card-img-inner').addEventListener('click', () => openGallery(hotel));
  const bookBtn = card.querySelector('.hotel-book-btn');
  bookBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
    if (curUser) openBookingModal(hotel);
    else showSideSigninTip(bookBtn, hotel);
  });
  return card;
}
document.querySelectorAll('.featured-card').forEach(card => {
  card.addEventListener('click', () => {
    const dest = card.dataset.dest;
    document.getElementById('s-location').value = dest;
    renderResults(filterHotels(dest,1,0,'any'), dest, 1, 0, 'any');
    showPage('results');
  });
});

/* ═══════════════════════════════════════════════
   GALLERY MODAL (بدون تغيير)
═══════════════════════════════════════════════ */
let galHotel = null, galTab = 'hotel', galIndex = 0;
const galleryModal = document.getElementById('galleryModal');
const galleryBackdrop = document.getElementById('galleryBackdrop');
const galleryClose = document.getElementById('galleryClose');
const galImgInner = document.getElementById('galImgInner');
const galImgLabel = document.getElementById('galImgLabel');
const galleryThumbs = document.getElementById('galleryThumbs');
const galPrev = document.getElementById('galPrev');
const galNext = document.getElementById('galNext');

function openGallery(hotel) {
  galHotel = hotel; galTab = 'hotel'; galIndex = 0;
  document.getElementById('galleryHotelName').textContent = hotel.name;
  document.getElementById('galleryHotelLoc').textContent = `${hotel.city}, ${hotel.country}`;
  document.getElementById('galPrice').textContent = `$${hotel.price}`;
  document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
  document.querySelector('.gtab[data-tab="hotel"]').classList.add('active');
  renderGallery();
  galleryModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('galBookBtn').onclick = () => {
    const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
    if (curUser) { closeGallery(); setTimeout(() => openBookingModal(hotel), 200); }
    else showSideSigninTip(document.getElementById('galBookBtn'), hotel);
  };
}
function renderGallery() { const photos = galHotel.photos[galTab]; renderMainPhoto(photos[galIndex]); renderThumbs(photos); }
function renderMainPhoto(photo) {
  galImgInner.style.background = photo.gradient;
  galImgInner.style.backgroundSize = 'cover';
  galImgInner.textContent = photo.initial || galHotel.initial;
  galImgInner.style.color = 'rgba(201,169,110,0.18)';
  galImgInner.style.fontSize = '72px';
  galImgInner.style.fontFamily = "'Cormorant Garamond',serif";
  galImgInner.style.letterSpacing = '6px';
  galImgLabel.textContent = photo.label;
  galImgInner.style.opacity = '0';
  requestAnimationFrame(() => { galImgInner.style.transition='opacity 0.3s'; galImgInner.style.opacity='1'; });
}
function renderThumbs(photos) {
  galleryThumbs.innerHTML = '';
  photos.forEach((p,i) => {
    const t = document.createElement('div');
    t.className = 'gallery-thumb' + (i===galIndex ? ' active' : '');
    t.style.background = p.gradient;
    t.title = p.label;
    t.textContent = p.label.slice(0,2);
    t.style.cssText += `;background:${p.gradient};font-size:10px;color:rgba(201,169,110,0.4);letter-spacing:1px;text-transform:uppercase;`;
    t.addEventListener('click', () => { galIndex = i; renderGallery(); });
    galleryThumbs.appendChild(t);
  });
}
galPrev.addEventListener('click', () => { const photos = galHotel.photos[galTab]; galIndex = (galIndex-1+photos.length)%photos.length; renderGallery(); });
galNext.addEventListener('click', () => { const photos = galHotel.photos[galTab]; galIndex = (galIndex+1)%photos.length; renderGallery(); });
document.addEventListener('keydown', e => { if (!galleryModal.classList.contains('open')) return; if (e.key === 'ArrowRight') galNext.click(); if (e.key === 'ArrowLeft') galPrev.click(); if (e.key === 'Escape') closeGallery(); });
document.querySelectorAll('.gtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    galTab = btn.dataset.tab;
    galIndex = 0;
    renderGallery();
  });
});
galleryClose.addEventListener('click', closeGallery);
galleryBackdrop.addEventListener('click', closeGallery);
function closeGallery() { galleryModal.classList.remove('open'); document.body.style.overflow = ''; const existing = document.getElementById('signinTip'); if (existing) { existing.classList.remove('show'); setTimeout(() => existing.remove(), 220); } }

/* ═══════════════════════════════════════════════
   BOOKING MODAL (بدون تغيير)
═══════════════════════════════════════════════ */
const bookingModal = document.getElementById('bookingModal');
const bookingBackdrop = document.getElementById('bookingBackdrop');
function openBookingModal(hotel) {
  const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
  if (!curUser) { showSideSigninTip(document.querySelector('.gallery-window .btn-gold') || document.body, hotel); return; }
  document.getElementById('modalHotelName').textContent = hotel.name;
  document.getElementById('modalHotelLoc').textContent = `${hotel.city}, ${hotel.country}`;
  document.getElementById('summaryRate').textContent = `$${hotel.price}/night`;
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate()+7);
  document.getElementById('bookingCheckin').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('bookingCheckout').value = nextWeek.toISOString().split('T')[0];
  updateSummary(hotel.price);
  bookingModal.dataset.hotelId = hotel.hotel_id || hotel.id || '';
  bookingModal.dataset.hotelPrice = hotel.price || 0;
  const paySection = document.getElementById('paymentSection'); if (paySection) paySection.classList.add('hidden');
  bookingModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function showSideSigninTip(button, hotel, msg) {
  const existing = document.getElementById('signinTip');
  if (existing) existing.remove();
  const tip = document.createElement('div');
  tip.id = 'signinTip';
  tip.className = 'signin-tip signin-tip--alert';
  tip.innerHTML = `<div class="signin-tip-body"><div class="signin-tip-msg">${msg || 'Please sign in to continue your reservation'}</div></div>`;
  document.body.appendChild(tip);
  const rect = button.getBoundingClientRect();
  tip.style.position = 'absolute';
  tip.style.zIndex = 9999;
  const tipRect = tip.getBoundingClientRect();
  const spaceRight = window.innerWidth - rect.right;
  let left = (spaceRight > tipRect.width+20) ? window.scrollX+rect.right+20 : Math.max(12, window.scrollX+rect.left-tipRect.width-20);
  let top = Math.min(window.scrollY+window.innerHeight-tipRect.height-12, Math.max(window.scrollY+12, window.scrollY+rect.top+(rect.height-tipRect.height)/2));
  tip.style.left = left+'px'; tip.style.top = top+'px';
  requestAnimationFrame(() => tip.classList.add('show'));
  tip.style.cursor = 'pointer';
  tip.onclick = () => window.location.href = 'auth.html';
  setTimeout(() => tip.remove(), 1500);
}
function openInlineSignin(onSuccess) {
  if (document.getElementById('inlineSignin')) return;
  const overlay = document.createElement('div');
  overlay.id = 'inlineSignin';
  overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:10000;background:rgba(0,0,0,0.45)';
  overlay.innerHTML = `<div style="width:360px;max-width:92%;padding:20px;background:var(--bg2);border:1px solid var(--border);box-shadow:var(--shadow);"><h3 style="margin:0 0 8px;color:var(--white);font-family:'Cormorant Garamond',serif;">Sign In</h3><p style="margin:0 0 12px;color:var(--text-m);font-size:13px;">Enter your name to sign in and continue.</p><input id="inlineName" placeholder="Full name" style="width:100%;padding:10px;margin-bottom:8px;background:var(--bg3);color:var(--text);outline:none;" /><div style="display:flex;gap:8px;justify-content:flex-end;"><button id="inlineCancel" class="btn-outline">Cancel</button><button id="inlineSubmit" class="btn-gold">Sign In</button></div></div>`;
  document.body.appendChild(overlay);
  document.getElementById('inlineCancel').onclick = () => overlay.remove();
  document.getElementById('inlineSubmit').onclick = () => {
    const name = document.getElementById('inlineName').value.trim();
    if (!name) { showToast('Please enter your name to sign in.', 'error'); return; }
    const initials = name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'AU';
    localStorage.setItem('aurum-user', JSON.stringify({ name, initials }));
    navUser.style.display = 'none'; navUserLogged.classList.remove('hidden'); navAvatar.textContent = initials; navUsername.textContent = name.split(' ')[0];
    overlay.remove();
    showToast('Signed in — continuing reservation.');
    if (typeof onSuccess === 'function') onSuccess();
  };
}
function updateSummary(rate) {
  const cin = new Date(document.getElementById('bookingCheckin').value);
  const cout = new Date(document.getElementById('bookingCheckout').value);
  const rooms = parseInt(document.getElementById('bookingRooms').value) || 1;
  if (cin && cout && cout > cin) {
    const nights = Math.round((cout-cin)/(1000*60*60*24));
    document.getElementById('summaryNights').textContent = nights;
    document.getElementById('summaryTotal').textContent = '$' + (nights*rate*rooms).toLocaleString();
  }
}
document.getElementById('bookingClose').addEventListener('click', closeBooking);
bookingBackdrop.addEventListener('click', closeBooking);
function closeBooking() { bookingModal.classList.remove('open'); document.body.style.overflow = ''; }
['bookingCheckin','bookingCheckout','bookingRooms'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    const r = parseFloat(document.getElementById('summaryRate').textContent.replace(/[^0-9.]/g,''));
    updateSummary(r);
  });
});
document.getElementById('confirmBooking').addEventListener('click', async () => {
  const cin = document.getElementById('bookingCheckin').value;
  const cout = document.getElementById('bookingCheckout').value;
  if (!cin || !cout) { showToast('Please select dates.','error'); return; }
  const paySection = document.getElementById('paymentSection');
  if (paySection && paySection.classList.contains('hidden')) {
    paySection.classList.remove('hidden');
    setTimeout(() => document.getElementById('payName')?.focus(), 120);
    return;
  }
  const token = localStorage.getItem('aurum-token');
  const hotelId = bookingModal.dataset.hotelId;
  const rooms = parseInt(document.getElementById('bookingRooms').value) || 1;
  const rate = parseFloat((bookingModal.dataset.hotelPrice || document.getElementById('summaryRate').textContent).toString().replace(/[^0-9.]/g,''));
  const nights = Math.round((new Date(cout)-new Date(cin))/86400000);
  const total = Math.round(nights*rate*rooms);
  if (token && hotelId) {
    try {
      const res = await fetch(`${API_BASE}bookings`, {
        method:'POST', headers: {'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({ hotel_id: parseInt(hotelId), check_in: cin, check_out: cout, rooms, guests: rooms*2, total_price: total })
      });
      const data = await res.json();
      if (data.success) { closeBooking(); showToast(`✔ Booking #${data.data.booking_id} confirmed!`,'success'); return; }
    } catch(e) { console.warn('Booking API failed'); }
  }
  closeBooking();
  showToast('✦ Reservation confirmed! Check your email for details.','success');
});
const payConfirm = document.getElementById('payConfirmBtn');
if (payConfirm) {
  payConfirm.addEventListener('click', () => {
    const name = document.getElementById('payName').value.trim();
    const number = document.getElementById('payNumber').value.replace(/\s+/g,'');
    const exp = document.getElementById('payExp').value.trim();
    const cvc = document.getElementById('payCvc').value.trim();
    if (!name || !number || !exp || !cvc) { showToast('Please complete payment details.','error'); return; }
    payConfirm.disabled = true; payConfirm.textContent = 'Processing…';
    setTimeout(() => { payConfirm.disabled = false; payConfirm.textContent = 'Pay & Confirm'; closeBooking(); showToast('✔ Payment accepted — Reservation confirmed!','success'); }, 1200);
  });
}

/* ═══════════════════════════════════════════════
   🧠 AI CONCIERGE — معتمدة على Worker يحتوي GROQ_API_KEY
   (مع رد محلي ذكي كنسخة احتياطية)
═══════════════════════════════════════════════ */
const aiModal = document.getElementById('aiModal');
const aiMessages = document.getElementById('aiMessages');
const aiInput = document.getElementById('aiInput');
document.getElementById('openAiChat').addEventListener('click', () => { aiModal.classList.add('open'); document.body.style.overflow='hidden'; aiInput.focus(); });
document.getElementById('aiBackdrop').addEventListener('click', () => { aiModal.classList.remove('open'); document.body.style.overflow=''; });
document.getElementById('aiClose').addEventListener('click', () => { aiModal.classList.remove('open'); document.body.style.overflow=''; });
document.getElementById('aiSend').addEventListener('click', sendAI);
aiInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendAI(); });
function appendMsg(text, role) {
  const div = document.createElement('div');
  div.className = `ai-msg ai-msg--${role}`;
  div.innerHTML = `<div class="ai-msg-bubble">${text}</div>`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return div;
}

// متغيرات السياق للمحادثة (للاستخدام في الرد المحلي الاحتياطي)
let conversationHistory = [];
let lastExtracted = { city: null, budget: null, rooms: 1, children: 0 };
let lastUserMessage = '';

// قاعدة بيانات الفنادق المحلية (للاستخدام الاحتياطي)
const localHotelsData = {
  paris: [{ name:'Le Grand Hôtel', price:450, stars:5, desc:'Belle Époque grandeur' },
          { name:'Hôtel de Crillon', price:980, stars:5, desc:'Palatial 18th-century landmark' }],
  dubai: [{ name:'Burj Al Arab', price:1800, stars:5, desc:'Iconic sail-shaped' },
          { name:'Atlantis The Palm', price:620, stars:5, desc:'Waterpark paradise' }],
  tokyo: [{ name:'The Peninsula', price:720, stars:5, desc:'Eastern refinement' }],
  algiers: [{ name:'Sofitel Algiers', price:220, stars:5, desc:'French elegance' },
            { name:'El Djazair Hotel', price:180, stars:5, desc:'Colonial-era landmark' }],
  istanbul: [{ name:'Four Seasons Bosphorus', price:680, stars:5, desc:'Ottoman palace' }],
  marrakech: [{ name:'La Mamounia', price:750, stars:5, desc:'Moorish splendour' }],
  barcelona: [{ name:'Hotel Arts Barcelona', price:480, stars:5, desc:'Beachfront masterpiece' }]
};

function extractContext(message, previousContext) {
  const msg = message.toLowerCase();
  let city = previousContext.city;
  let budget = previousContext.budget;
  let rooms = previousContext.rooms;
  let children = previousContext.children;
  const cities = ['paris','dubai','tokyo','algiers','marrakech','istanbul','barcelona','london','new york'];
  for (let c of cities) if (msg.includes(c)) { city = c; break; }
  const budgetMatch = msg.match(/(?:budget|under|below|less than|max|up to|around|about|for)?\s*\$?(\d{2,4})/i);
  if (budgetMatch) budget = parseInt(budgetMatch[1]);
  const roomMatch = msg.match(/(\d+)\s*rooms?/i);
  if (roomMatch) rooms = parseInt(roomMatch[1]);
  const childMatch = msg.match(/(\d+)\s*(?:child|kid|children)/i);
  if (childMatch) children = parseInt(childMatch[1]);
  return { city, budget, rooms, children };
}

function generateContextualResponse(userMessage, previousContext, history) {
  const isArabic = /[\u0600-\u06FF]/.test(userMessage);
  const context = extractContext(userMessage, previousContext);
  const city = context.city;
  const budget = context.budget;
  const rooms = context.rooms;
  const children = context.children;
  if (!city && !budget) {
    const greetings = ['Hello', 'Hi', 'Hey', 'Greetings', 'مرحباً', 'أهلاً', 'السلام'];
    const firstWord = userMessage.trim().split(' ')[0];
    const isGreeting = greetings.some(g => firstWord.toLowerCase().includes(g.toLowerCase()));
    if (isGreeting && history.length <= 2) {
      return isArabic ? "أهلاً بك في AURUM! 🌟 أنا مساعدك الشخصي لحجز الفنادق الفاخرة. أخبرني عن وجهة أحلامك والميزانية التقريبية (مثال: 'باريس تحت 500 دولار')." 
                      : "Welcome to AURUM! 🌟 I'm your personal concierge. Tell me your dream destination and approximate budget (e.g., 'Paris under $500').";
    }
    return isArabic ? "أين تحب أن تسافر؟ وما هي ميزانيتك التقريبية لليلة؟ يمكنك مثلاً: 'باريس بـ 300 دولار'." 
                    : "Where would you like to travel? And what's your approximate nightly budget? Example: 'Paris under $300'.";
  }
  if (city && !budget) {
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);
    return isArabic ? `فنادق ${cityName} الرائعة تبدأ من $${localHotelsData[city]?.[0]?.price || 'مختلفة'}/ليلة. ما هي ميزانيتك التقريبية؟` 
                    : `Wonderful choice! Hotels in ${cityName} start from $${localHotelsData[city]?.[0]?.price || 'various'}/night. What's your budget?`;
  }
  if (!city && budget) {
    return isArabic ? `بميزانية $${budget}/ليلة، يمكنك الإقامة في فنادق فاخرة في باريس، دبي، الجزائر، مراكش، إسطنبول، أو برشلونة. أي مدينة تفضلها؟`
                    : `With a budget of $${budget}/night, you can enjoy luxury hotels in Paris, Dubai, Algiers, Marrakech, Istanbul, or Barcelona. Which city interests you?`;
  }
  if (city && budget) {
    const available = localHotelsData[city]?.filter(h => h.price <= budget) || [];
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);
    if (available.length === 0) {
      const minPrice = localHotelsData[city]?.[0]?.price || 'غير معروف';
      return isArabic ? `عذراً، لا توجد فنادق في ${cityName} ضمن ميزانية $${budget}/ليلة. أقل سعر يبدأ من $${minPrice}. هل ترغب في رفع الميزانية أو اختيار مدينة أخرى؟`
                      : `Sorry, no hotels in ${cityName} within $${budget}/night. The lowest rate starts at $${minPrice}. Would you like to increase your budget or choose another destination?`;
    }
    const top = available[0];
    let reply = isArabic ? `بناءً على طلبك، أوصي بـ ${top.name} في ${cityName}. ${top.stars} نجوم من $${top.price}/ليلة. ${top.desc}.` 
                         : `Based on your request, I recommend ${top.name} in ${cityName}. ${top.stars} stars from $${top.price}/night. ${top.desc}.`;
    if (available.length > 1) {
      reply += isArabic ? ` خيار آخر ممتاز: ${available[1].name} بسعر $${available[1].price}.` 
                        : ` Another great option: ${available[1].name} for $${available[1].price}.`;
    }
    if (rooms > 1) reply += isArabic ? ` (تم أخذ ${rooms} غرف في الاعتبار).` : ` (taking ${rooms} room(s) into account).`;
    if (children > 0) reply += isArabic ? ` مناسبة لـ ${children} طفل.` : ` suitable for ${children} child(ren).`;
    reply += isArabic ? ` هل تريد الحجز؟` : ` Shall I check availability?`;
    return reply;
  }
  return isArabic ? "أخبرني أكثر عن رحلتك المثالية (المدينة والميزانية)." : "Tell me more about your ideal trip (city and budget).";
}

function smartLocalResponse(userMessage) {
  lastUserMessage = userMessage;
  let ctx = { city: lastExtracted.city, budget: lastExtracted.budget, rooms: lastExtracted.rooms, children: lastExtracted.children };
  const newCtx = extractContext(userMessage, ctx);
  lastExtracted = { city: newCtx.city || lastExtracted.city, budget: newCtx.budget || lastExtracted.budget, rooms: newCtx.rooms || lastExtracted.rooms, children: newCtx.children || lastExtracted.children };
  const response = generateContextualResponse(userMessage, lastExtracted, conversationHistory);
  conversationHistory.push({ role: 'user', content: userMessage, timestamp: Date.now() });
  conversationHistory.push({ role: 'assistant', content: response, timestamp: Date.now() });
  if (conversationHistory.length > 10) conversationHistory = conversationHistory.slice(-10);
  return response;
}

// دالة الإرسال الرئيسية: تحاول الـ Worker أولاً، ثم تستخدم الرد المحلي الذكي
async function sendAI() {
  const text = aiInput.value.trim();
  if (!text) return;
  appendMsg(text, 'user');
  aiInput.value = '';
  const typing = appendMsg('', 'bot');
  typing.classList.add('ai-typing');

  let responseText = null;
  try {
    const res = await fetch(AI_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: conversationHistory.slice(-4) })
    });
    const data = await res.json();
    if (data.success && data.response) {
      responseText = data.response;
      conversationHistory.push({ role: 'user', content: text, timestamp: Date.now() });
      conversationHistory.push({ role: 'assistant', content: responseText, timestamp: Date.now() });
      if (conversationHistory.length > 10) conversationHistory = conversationHistory.slice(-10);
    } else {
      throw new Error('Worker response invalid');
    }
  } catch(err) {
    console.warn('Worker failed, using smart local fallback:', err);
    responseText = smartLocalResponse(text);
  }
  typing.classList.remove('ai-typing');
  typing.querySelector('.ai-msg-bubble').innerHTML = responseText;
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// دوال وهمية (لم تعد مستخدمة)
function parseUserFilters() { return {}; }
function parseReplyFilters() { return {}; }

/* ═══════════════════════════════════════════════
   TOAST & SCROLL ANIMATIONS
═══════════════════════════════════════════════ */
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('show'), 4000);
}
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.animation = 'fadeUp 0.6s ease forwards'; obs.unobserve(e.target); } });
}, { threshold:0.1 });
document.querySelectorAll('.featured-card, .why-feat').forEach(el => { el.style.opacity = '0'; obs.observe(el); });

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  loadHotelsFromAPI();
  try {
    const params = new URLSearchParams(window.location.search);
    const openBooking = params.get('openBooking');
    if (openBooking) {
      const hid = parseInt(openBooking,10);
      const h = hotelDatabase.find(x => x.id === hid);
      if (h) openBookingModal(h);
      history.replaceState(null, '', window.location.pathname);
    }
  } catch(e) {}
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      document.querySelector('.nav-links')?.classList.toggle('mobile-open');
    });
  }
});

/* ═══════════════════════════════════════════════
   OWNER ROLE NAV (بدون تغيير)
═══════════════════════════════════════════════ */
(function() {
  const u = JSON.parse(localStorage.getItem('aurum-user') || 'null');
  if (u && u.role === 'owner') {
    const loggedDiv = document.getElementById('navUserLogged');
    if (loggedDiv) {
      const dashLink = document.createElement('a');
      dashLink.href = 'owner-dashboard.html';
      dashLink.className = 'nav-btn nav-btn-dash';
      dashLink.style.cssText = 'margin-right:8px;';
      dashLink.textContent = 'Dashboard';
      loggedDiv.insertBefore(dashLink, loggedDiv.firstChild);
    }
  }
})();
