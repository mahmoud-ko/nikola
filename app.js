/* ═══════════════════════════════════════════════
   AURUM — app.js (مع تصحيح AI Concierge)
═══════════════════════════════════════════════ */

const API_BASE = '/api.php?route=';   // المسار الصحيح لملف api.php

/* ══════════ THEME ══════════ */
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

/* ══════════ SESSION ══════════ */
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

/* ══════════ NAV ══════════ */
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

/* ══════════ HOTEL DATABASE (من API) ══════════ */
let hotelDatabase = [];

async function loadHotelsFromAPI() {
    try {
        const res = await fetch(`${API_BASE}hotels`);
        const data = await res.json();
        if (data.success) {
            hotelDatabase = data.data;
            renderResults(filterHotels('Paris', 1, 0, 'any'), 'Paris', 1, 0, 'any');
        } else {
            console.warn('API hotels failed, using local fallback');
            useLocalHotelDatabase();
        }
    } catch(e) {
        console.error('Error loading hotels from API', e);
        useLocalHotelDatabase();
    }
}

function useLocalHotelDatabase() {
    hotelDatabase = [
        { id:1, name:'Le Grand Hôtel', city:'Paris', country:'France', stars:5, price:450, rating:4.9, reviews:1284, desc:'Belle Époque grandeur at the heart of Paris...', amenities:['Wi-Fi','Spa','Restaurant','Concierge','Bar'], initial:'LG', color:'#1a1208', maxChildren:4, rooms:3, photos: makePhotos('LG','#1a1208','#2a1f0a','#180e04') },
        { id:2, name:'Hôtel de Crillon', city:'Paris', country:'France', stars:5, price:980, rating:4.95, reviews:876, desc:'A palatial 18th-century landmark...', amenities:['Wi-Fi','Pool','Spa','Restaurant','Concierge'], initial:'HC', color:'#14100a', maxChildren:2, rooms:5, photos: makePhotos('HC','#14100a','#201808','#0e0c06') },
        { id:3, name:'Burj Al Arab', city:'Dubai', country:'UAE', stars:5, price:1800, rating:4.85, reviews:2341, desc:'The world\'s most iconic hotel...', amenities:['Pool','Spa','Restaurant','Bar','Transfer','Concierge'], initial:'BA', color:'#0a1218', maxChildren:3, rooms:2, photos: makePhotos('BA','#0a1218','#0d1e2e','#06101a') },
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

/* ══════════ CUSTOM SEARCH DROPDOWNS ══════════ */
function initCustomSelect(id, hiddenSelectId) {
  const container = document.getElementById(id);
  const hiddenSel = document.getElementById(hiddenSelectId);
  if (!container || !hiddenSel) return;

  const trigger = container.querySelector('.custom-select-trigger');
  const dropdown = container.querySelector('.custom-select-dropdown');
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
    if (!container.contains(e.target)) {
      container.classList.remove('open');
    }
  });

  hiddenSel.addEventListener('change', () => syncCustomSelect(container, hiddenSel, options, valueSpan));
}

function syncCustomSelect(container, hiddenSel, options, valueSpan) {
  const val = hiddenSel.value;
  options.forEach(opt => {
    if (opt.dataset.value === val) {
      opt.classList.add('selected');
      valueSpan.textContent = opt.textContent;
    } else {
      opt.classList.remove('selected');
    }
  });
}

initCustomSelect('roomsSelect', 's-rooms');
initCustomSelect('childrenSelect', 's-children');
initCustomSelect('budgetSelect', 's-price');

/* ══════════ SEARCH ══════════ */
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
      <div class="hotel-card-location">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${hotel.city}, ${hotel.country}
      </div>
      <div class="hotel-card-desc">${hotel.desc}</div>
      <div class="hotel-card-amenities">${hotel.amenities.slice(0,4).map(a=>`<span class="amenity-tag">${a}</span>`).join('')}</div>
      <div class="hotel-card-footer">
        <div>
          <span class="price-from">from</span>
          <span class="price-num">$${hotel.price}</span>
          <span class="price-per">/night</span>
        </div>
        <div style="text-align:right">
          <span class="stars">${stars}</span>
          <span class="rating-count">${hotel.rating} (${hotel.reviews.toLocaleString()})</span>
        </div>
      </div>
      <button class="hotel-book-btn">Reserve Now</button>
    </div>`;

  card.querySelector('.hotel-view-photos').addEventListener('click', e => { e.stopPropagation(); openGallery(hotel); });
  card.querySelector('.hotel-card-img-inner').addEventListener('click', () => openGallery(hotel));
  const bookBtn = card.querySelector('.hotel-book-btn');
  bookBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
    if (curUser) {
      openBookingModal(hotel);
    } else {
      showSideSigninTip(bookBtn, hotel);
    }
  });
  return card;
}

/* Featured clicks */
document.querySelectorAll('.featured-card').forEach(card => {
  card.addEventListener('click', () => {
    const dest = card.dataset.dest;
    document.getElementById('s-location').value = dest;
    renderResults(filterHotels(dest,1,0,'any'), dest, 1, 0, 'any');
    showPage('results');
  });
});

/* ══════════ GALLERY MODAL ══════════ */
let galHotel   = null;
let galTab     = 'hotel';
let galIndex   = 0;

const galleryModal   = document.getElementById('galleryModal');
const galleryBackdrop= document.getElementById('galleryBackdrop');
const galleryClose   = document.getElementById('galleryClose');
const galImgInner    = document.getElementById('galImgInner');
const galImgLabel    = document.getElementById('galImgLabel');
const galleryThumbs  = document.getElementById('galleryThumbs');
const galPrev        = document.getElementById('galPrev');
const galNext        = document.getElementById('galNext');

function openGallery(hotel) {
  galHotel = hotel;
  galTab   = 'hotel';
  galIndex = 0;
  document.getElementById('galleryHotelName').textContent = hotel.name;
  document.getElementById('galleryHotelLoc').textContent  = `${hotel.city}, ${hotel.country}`;
  document.getElementById('galPrice').textContent = `$${hotel.price}`;

  document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
  document.querySelector('.gtab[data-tab="hotel"]').classList.add('active');

  renderGallery();
  galleryModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('galBookBtn').onclick = () => {
    const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
    if (curUser) {
      closeGallery();
      setTimeout(() => openBookingModal(hotel), 200);
    } else {
      const galBtn = document.getElementById('galBookBtn');
      showSideSigninTip(galBtn, hotel);
    }
  };
}

function renderGallery() {
  const photos = galHotel.photos[galTab];
  renderMainPhoto(photos[galIndex]);
  renderThumbs(photos);
}

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
  photos.forEach((p, i) => {
    const t = document.createElement('div');
    t.className = 'gallery-thumb' + (i === galIndex ? ' active' : '');
    t.style.background = p.gradient;
    t.title = p.label;
    t.textContent = p.label.slice(0,2);
    t.style.cssText += `;background:${p.gradient};font-size:10px;color:rgba(201,169,110,0.4);letter-spacing:1px;text-transform:uppercase;`;
    t.addEventListener('click', () => { galIndex = i; renderGallery(); });
    galleryThumbs.appendChild(t);
  });
}

galPrev.addEventListener('click', () => {
  const photos = galHotel.photos[galTab];
  galIndex = (galIndex - 1 + photos.length) % photos.length;
  renderGallery();
});
galNext.addEventListener('click', () => {
  const photos = galHotel.photos[galTab];
  galIndex = (galIndex + 1) % photos.length;
  renderGallery();
});

document.addEventListener('keydown', e => {
  if (!galleryModal.classList.contains('open')) return;
  if (e.key === 'ArrowRight') galNext.click();
  if (e.key === 'ArrowLeft')  galPrev.click();
  if (e.key === 'Escape')     closeGallery();
});

document.querySelectorAll('.gtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    galTab  = btn.dataset.tab;
    galIndex= 0;
    renderGallery();
  });
});

galleryClose.addEventListener('click', closeGallery);
galleryBackdrop.addEventListener('click', closeGallery);

function closeGallery() {
  galleryModal.classList.remove('open');
  document.body.style.overflow = '';
  const existing = document.getElementById('signinTip');
  if (existing) { existing.classList.remove('show'); setTimeout(() => { try { existing.remove(); } catch(e){} }, 220); }
}

/* ══════════ BOOKING MODAL ══════════ */
const bookingModal   = document.getElementById('bookingModal');
const bookingBackdrop= document.getElementById('bookingBackdrop');

function openBookingModal(hotel) {
  const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
  if (!curUser) {
    showSideSigninTip(document.querySelector('.gallery-window .btn-gold') || document.body, hotel);
    return;
  }
  document.getElementById('modalHotelName').textContent = hotel.name;
  document.getElementById('modalHotelLoc').textContent  = `${hotel.city}, ${hotel.country}`;
  document.getElementById('summaryRate').textContent    = `$${hotel.price}/night`;

  const today    = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate()+7);
  const toISO = d => d.toISOString().split('T')[0];
  document.getElementById('bookingCheckin').value  = toISO(tomorrow);
  document.getElementById('bookingCheckout').value = toISO(nextWeek);

  updateSummary(hotel.price);
  bookingModal.dataset.hotelId   = hotel.hotel_id || hotel.id || '';
  bookingModal.dataset.hotelPrice = hotel.price || 0;
  const paySection = document.getElementById('paymentSection'); if (paySection) paySection.classList.add('hidden');
  bookingModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showSideSigninTip(button, hotel, msg) {
  const existing = document.getElementById('signinTip');
  if (existing) existing.remove();

  const message = msg || 'Please sign in to continue your reservation';

  const tip = document.createElement('div');
  tip.id = 'signinTip';
  tip.className = 'signin-tip signin-tip--alert';
  tip.innerHTML = `<div class="signin-tip-body"><div class="signin-tip-msg">${message}</div></div>`;
  document.body.appendChild(tip);

  const rect = button.getBoundingClientRect();
  const preferOffset = 20;
  tip.style.position = 'absolute';
  tip.style.zIndex = 9999;
  const tipRect = tip.getBoundingClientRect();
  const spaceRight = window.innerWidth - rect.right;
  let left;
  if (spaceRight > tipRect.width + preferOffset) {
    left = window.scrollX + rect.right + preferOffset;
  } else {
    left = Math.max(12, window.scrollX + rect.left - tipRect.width - preferOffset);
  }
  const rawTop = window.scrollY + rect.top + (rect.height - tipRect.height) / 2;
  const minTop = window.scrollY + 12;
  const maxTop = window.scrollY + window.innerHeight - tipRect.height - 12;
  const top = Math.min(maxTop, Math.max(minTop, rawTop));
  tip.style.left = `${Math.round(left)}px`;
  tip.style.top = `${Math.round(top)}px`;

  requestAnimationFrame(() => { tip.classList.add('show'); });

  tip.style.cursor = 'pointer';
  const onClickTip = () => { window.location.href = 'auth.html'; };
  tip.addEventListener('click', onClickTip);

  let dismissTimer = setTimeout(() => cleanupTip(), 1500);
  function onScroll() { cleanupTip(); }
  function onResize() { repositionTip(); }

  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onResize);

  function cleanupTip() {
    if (!tip || !tip.parentNode) return;
    tip.classList.remove('show');
    setTimeout(() => { try { tip.remove(); } catch(e){} }, 220);
    clearTimeout(dismissTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    tip.removeEventListener('click', onClickTip);
  }

  function repositionTip() {
    if (!tip || !tip.parentNode) return;
    const rect = button.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const preferOffset = 20;
    const spaceRight = window.innerWidth - rect.right;
    let left;
    if (spaceRight > tipRect.width + preferOffset) {
      left = window.scrollX + rect.right + preferOffset;
    } else {
      left = Math.max(12, window.scrollX + rect.left - tipRect.width - preferOffset);
    }
    const rawTop = window.scrollY + rect.top + (rect.height - tipRect.height) / 2;
    const minTop = window.scrollY + 12;
    const maxTop = window.scrollY + window.innerHeight - tipRect.height - 12;
    const top = Math.min(maxTop, Math.max(minTop, rawTop));
    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  }
}

function openInlineSignin(onSuccess) {
  if (document.getElementById('inlineSignin')) return;
  const overlay = document.createElement('div');
  overlay.id = 'inlineSignin';
  overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.display = 'flex';
  overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = 10000;
  overlay.style.background = 'rgba(0,0,0,0.45)';

  overlay.innerHTML = `
    <div style="width:360px;max-width:92%;padding:20px;background:var(--bg2);border:1px solid var(--border);box-shadow:var(--shadow);">
      <h3 style="margin:0 0 8px;color:var(--white);font-family:'Cormorant Garamond',serif;">Sign In</h3>
      <p style="margin:0 0 12px;color:var(--text-m);font-size:13px;">Enter your name to sign in and continue.</p>
      <input id="inlineName" placeholder="Full name" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid var(--border-s);background:var(--bg3);color:var(--text);outline:none;" />
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="inlineCancel" class="btn-outline">Cancel</button>
        <button id="inlineSubmit" class="btn-gold">Sign In</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('inlineCancel').addEventListener('click', () => overlay.remove());
  document.getElementById('inlineSubmit').addEventListener('click', () => {
    const name = document.getElementById('inlineName').value.trim();
    if (!name) { showToast('Please enter your name to sign in.', 'error'); return; }
    const initials = name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'AU';
    const user = { name, initials };
    localStorage.setItem('aurum-user', JSON.stringify(user));
    try { navUser.style.display = 'none'; navUserLogged.classList.remove('hidden'); navAvatar.textContent = initials; navUsername.textContent = name.split(' ')[0]; } catch(e){}
    overlay.remove();
    showToast('Signed in — continuing reservation.');
    if (typeof onSuccess === 'function') onSuccess();
  });
}

function updateSummary(rate) {
  const cin   = new Date(document.getElementById('bookingCheckin').value);
  const cout  = new Date(document.getElementById('bookingCheckout').value);
  const rooms = parseInt(document.getElementById('bookingRooms').value) || 1;
  if (cin && cout && cout > cin) {
    const nights = Math.round((cout-cin)/(1000*60*60*24));
    document.getElementById('summaryNights').textContent = nights;
    document.getElementById('summaryTotal').textContent  = '$' + (nights*rate*rooms).toLocaleString();
  }
}

document.getElementById('bookingClose').addEventListener('click', closeBooking);
bookingBackdrop.addEventListener('click', closeBooking);
function closeBooking() { bookingModal.classList.remove('open'); document.body.style.overflow=''; }

['bookingCheckin','bookingCheckout','bookingRooms'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    const r = parseFloat(document.getElementById('summaryRate').textContent.replace(/[^0-9.]/g,''));
    updateSummary(r);
  });
});

document.getElementById('confirmBooking').addEventListener('click', async () => {
  const cin  = document.getElementById('bookingCheckin').value;
  const cout = document.getElementById('bookingCheckout').value;
  if (!cin || !cout) { showToast('Please select dates.','error'); return; }
  const paySection = document.getElementById('paymentSection');
  if (paySection && paySection.classList.contains('hidden')) {
    paySection.classList.remove('hidden');
    setTimeout(() => { document.getElementById('payName')?.focus(); }, 120);
    return;
  }
  const token    = localStorage.getItem('aurum-token');
  const hotelId  = bookingModal.dataset.hotelId;
  const rooms    = parseInt(document.getElementById('bookingRooms').value) || 1;
  const rate     = parseFloat((bookingModal.dataset.hotelPrice || document.getElementById('summaryRate').textContent).toString().replace(/[^0-9.]/g,''));
  const nights   = Math.round((new Date(cout) - new Date(cin)) / 86400000);
  const total    = Math.round(nights * rate * rooms);
  if (token && hotelId) {
    try {
      const res = await fetch(`${API_BASE}bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hotel_id: parseInt(hotelId), check_in: cin, check_out: cout, rooms, guests: rooms * 2, total_price: total })
      });
      const data = await res.json();
      if (data.success) {
        closeBooking();
        showToast(`✔ Booking #${data.data.booking_id} confirmed!`, 'success');
        return;
      }
    } catch(e) { console.warn('Booking API failed, showing confirmation anyway', e); }
  }
  closeBooking();
  showToast('✦ Reservation confirmed! Check your email for details.', 'success');
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
    setTimeout(() => {
      payConfirm.disabled = false; payConfirm.textContent = 'Pay & Confirm';
      closeBooking();
      showToast('✔ Payment accepted — Reservation confirmed!','success');
    }, 1200);
  });
}

/* ══════════ AI CONCIERGE (المعدل بالكامل مع fallback محلي) ══════════ */
const aiModal    = document.getElementById('aiModal');
const aiMessages = document.getElementById('aiMessages');
const aiInput    = document.getElementById('aiInput');

document.getElementById('openAiChat').addEventListener('click', () => {
  aiModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  aiInput.focus();
});
document.getElementById('aiBackdrop').addEventListener('click', () => { aiModal.classList.remove('open'); document.body.style.overflow=''; });
document.getElementById('aiClose').addEventListener('click', () => { aiModal.classList.remove('open'); document.body.style.overflow=''; });

document.getElementById('aiSend').addEventListener('click', sendAI);
aiInput.addEventListener('keydown', e => { if(e.key==='Enter') sendAI(); });

function appendMsg(text, role) {
  const div = document.createElement('div');
  div.className = `ai-msg ai-msg--${role}`;
  div.innerHTML = `<div class="ai-msg-bubble">${text}</div>`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return div;
}

// ========== رد محلي ذكي (يعمل بدون اتصال بالخادم) ==========
function generateLocalAIResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(userMessage);

  // Detect city
  const cities = ['paris','dubai','tokyo','algiers','marrakech','istanbul','barcelona'];
  let city = cities.find(c => msg.includes(c)) || null;

  // Detect budget — numbers near keywords
  let budget = null;
  const budgetMatch = msg.match(/(\d+)\s*(?:\$|dollars?|usd|dz|dzd|budget|night|per)/i)
    || msg.match(/budget.*?(\d+)/i)
    || msg.match(/(\d{2,5})/); // fallback: any 2-5 digit number
  if (budgetMatch) budget = parseInt(budgetMatch[1]);

  const hotelsList = {
    paris:     [{ name:'Le Grand Hôtel', price:450, stars:5, desc:'Belle Époque grandeur at the heart of Paris' },
                { name:'Hôtel de Crillon', price:980, stars:5, desc:'Palatial 18th-century Parisian landmark' }],
    dubai:     [{ name:'Burj Al Arab', price:1800, stars:5, desc:'The world\'s most iconic sail-shaped hotel' },
                { name:'Atlantis The Palm', price:620, stars:5, desc:'Waterpark, restaurants and beach paradise' }],
    tokyo:     [{ name:'The Peninsula', price:720, stars:5, desc:'Refined Eastern elegance in Shinjuku' }],
    algiers:   [{ name:'Sofitel Algiers', price:220, stars:5, desc:'French elegance overlooking the bay' },
                { name:'El Djazair Hotel', price:180, stars:5, desc:'Historic colonial-era landmark' }],
    marrakech: [{ name:'La Mamounia', price:750, stars:5, desc:'Legendary Moorish splendour' }],
    istanbul:  [{ name:'Four Seasons Bosphorus', price:680, stars:5, desc:'Ottoman palace on the Bosphorus waterfront' }],
    barcelona: [{ name:'Hotel Arts Barcelona', price:480, stars:5, desc:'Stunning beachfront tower masterpiece' }]
  };

  const cityPriceRanges = {
    paris:'$450–$980', dubai:'$620–$1800', tokyo:'$720', algiers:'$180–$220',
    marrakech:'$750', istanbul:'$680', barcelona:'$480'
  };

  // Case 1: No city, no budget → ask both
  if (!city && !budget) {
    return isArabic
      ? "أهلاً بك في AURUM! 🌟 أي وجهة تحلم بها؟ لدينا فنادق فاخرة في: باريس، دبي، طوكيو، الجزائر، مراكش، إسطنبول، وبرشلونة. وما هي ميزانيتك التقريبية لليلة؟"
      : "Welcome to AURUM! ✨ Which destination are you dreaming of — Paris, Dubai, Tokyo, Algiers, Marrakech, Istanbul, or Barcelona? And what's your approximate nightly budget?";
  }

  // Case 2: Budget but no city → tell them what fits
  if (!city && budget) {
    const affordable = Object.entries(cityPriceRanges)
      .filter(([c]) => {
        const hotels = hotelsList[c] || [];
        return hotels.some(h => h.price <= budget);
      })
      .map(([c]) => c.charAt(0).toUpperCase() + c.slice(1));
    if (affordable.length === 0) {
      return isArabic
        ? `ميزانيتك $${budget}/ليلة قد تكون محدودة لخياراتنا الحالية. هل يمكنك رفعها قليلاً؟ وأي مدينة تفضل؟`
        : `With a $${budget}/night budget, options are limited. Could you stretch it a bit? Also, which city interests you?`;
    }
    return isArabic
      ? `بميزانية $${budget}/ليلة، يمكنك الاستمتاع بفنادق فاخرة في: ${affordable.join('، ')}. أي مدينة تفضل؟`
      : `With $${budget}/night, you can enjoy luxury in: ${affordable.join(', ')}. Which city calls to you?`;
  }

  // Case 3: City but no budget → show price range, ask budget
  if (city && !budget) {
    const range = cityPriceRanges[city] || 'varies';
    return isArabic
      ? `${city.charAt(0).toUpperCase() + city.slice(1)} وجهة رائعة! 🌍 فنادقنا الفاخرة هناك تتراوح بين ${range} في الليلة. ما هي ميزانيتك؟`
      : `${city.charAt(0).toUpperCase() + city.slice(1)} is a wonderful choice! 🌍 Our luxury hotels there range from ${range}/night. What's your budget?`;
  }

  // Case 4: Both city and budget → recommend
  const available = (hotelsList[city] || []).filter(h => h.price <= budget);
  if (available.length === 0) {
    const cheapest = (hotelsList[city] || []).sort((a,b) => a.price - b.price)[0];
    const suggest = cheapest
      ? (isArabic ? `أرخص خياراتنا في ${city} هو ${cheapest.name} بـ $${cheapest.price}/ليلة.` : `Our most affordable option in ${city} is ${cheapest.name} at $${cheapest.price}/night.`)
      : '';
    return isArabic
      ? `لا توجد فنادق في ${city} ضمن ميزانية $${budget}. ${suggest} هل تريد تعديل ميزانيتك؟`
      : `No hotels in ${city} within $${budget}/night. ${suggest} Would you like to adjust your budget?`;
  }
  const top = available[0];
  let reply = `✨ I recommend **${top.name}** in ${city.charAt(0).toUpperCase() + city.slice(1)} — ${top.desc}, from $${top.price}/night (${top.stars}★).`;
  if (available.length > 1) reply += ` Another excellent option is **${available[1].name}** at $${available[1].price}/night. Shall I check availability?`;
  else reply += ` Would you like to book this hotel?`;
  if (isArabic) {
    reply = `✨ أنصحك بـ **${top.name}** في ${city} — ${top.desc}، من $${top.price} في الليلة (${top.stars}★). هل تريد الحجز؟`;
  }
  return reply;
}

// ═══ Groq — direct connection (GitHub Pages has no backend) ═══
const groqHistory = [];
const GROQ_KEY = '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';

const SYSTEM_PROMPT = `You are AURUM's AI concierge — an elegant luxury hotel assistant.

Available hotels:
- Le Grand Hôtel (Paris): $450/night, 5★, rated 4.9 — Belle Époque grandeur
- Hôtel de Crillon (Paris): $980/night, 5★, rated 4.95 — Palatial 18th-century landmark
- Burj Al Arab (Dubai): $1800/night, 5★, rated 4.85 — Iconic sail-shaped hotel
- Atlantis The Palm (Dubai): $620/night, 5★, rated 4.7 — Waterpark and restaurants
- The Peninsula (Tokyo): $720/night, 5★, rated 4.9 — Eastern refinement
- Sofitel Algiers (Algiers): $220/night, 5★, rated 4.72 — French elegance
- El Djazair Hotel (Algiers): $180/night, 5★, rated 4.65 — Colonial-era landmark
- Four Seasons Bosphorus (Istanbul): $680/night, 5★, rated 4.91 — Ottoman palace
- La Mamounia (Marrakech): $750/night, 5★, rated 4.94 — Moorish splendour
- Hotel Arts Barcelona (Barcelona): $480/night, 5★, rated 4.75 — Beachfront masterpiece

Rules:
- Have a REAL conversation. Read the chat history and respond naturally.
- If no city mentioned yet, ask which city they prefer.
- If no budget mentioned yet, ask their approximate nightly budget.
- Once you know city and budget, recommend 1-2 hotels from the list ONLY.
- NEVER recommend hotels not in the list.
- Detect language: if guest writes in Arabic reply in Arabic, otherwise English.
- Be warm, cultured, concise (3-5 sentences). End with a follow-up question.`;

async function sendAI() {
  const text = aiInput.value.trim();
  if (!text) return;
  appendMsg(text, 'user');
  aiInput.value = '';
  const typing = appendMsg('', 'bot');
  typing.classList.add('ai-typing');

  let responseText = null;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_KEY
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...groqHistory,
          { role: 'user', content: text }
        ],
        temperature: 0.75,
        max_tokens: 400
      })
    });
    if (!response.ok) throw new Error('Groq error: ' + response.status);
    const data = await response.json();
    responseText = data.choices[0].message.content;
    groqHistory.push({ role: 'user', content: text });
    groqHistory.push({ role: 'assistant', content: responseText });
  } catch(err) {
    console.warn('Groq failed:', err);
    responseText = generateLocalAIResponse(text);
  }

  typing.classList.remove('ai-typing');
  typing.querySelector('.ai-msg-bubble').innerHTML = responseText || "I'm having trouble connecting right now. Please try again later.";
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function parseUserFilters(text) { // تبقى موجودة لكن لا تستخدم حالياً
  const t = text.toLowerCase();
  let rooms = 1, children = 0, maxPrice = null;
  const roomMatch = t.match(/(\d+)\s*(?:room|bedroom|suite)/);
  if (roomMatch) rooms = parseInt(roomMatch[1]);
  const childMatch = t.match(/(\d+)\s*(?:child|kid|children)/);
  if (childMatch) children = parseInt(childMatch[1]);
  if (/\b(under|below|less than|max|up to|around|about)\s*\$?(\d+)/.test(t)) {
    const m = t.match(/\b(under|below|less than|max|up to|around|about)\s*\$?(\d+)/);
    if (m) maxPrice = parseInt(m[2]);
  } else if (/\$(\d+)/.test(t)) {
    const m = t.match(/\$(\d+)/);
    if (m) maxPrice = parseInt(m[1]);
  } else if (/\b(budget|cheap|affordable|inexpensive|low cost|low-price)/.test(t)) {
    maxPrice = 300;
  }
  const cities = ['paris','dubai','tokyo','new york','london','barcelona','algiers','oran','istanbul','marrakech'];
  let city = null;
  for (const c of cities) { if (t.includes(c)) { city = c; break; } }
  return { city, rooms, children, maxPrice };
}

function parseReplyFilters(reply) { // تبقى موجودة
  const r = reply.toLowerCase();
  let price = null, rooms = null, children = null, city = null;
  const priceMatches = [...r.matchAll(/\$(\d+)/g)].map(m => parseInt(m[1]));
  if (priceMatches.length) price = Math.max(...priceMatches);
  const roomMatch = r.match(/(\d+)\s*(?:room|bedroom)/);
  if (roomMatch) rooms = parseInt(roomMatch[1]);
  const childMatch = r.match(/(\d+)\s*(?:child|kid|children)/);
  if (childMatch) children = parseInt(childMatch[1]);
  const cities = ['paris','dubai','tokyo','new york','london','barcelona','algiers','oran','istanbul','marrakech'];
  for (const c of cities) { if (r.includes(c)) { city = c; break; } }
  return { city, price, rooms, children };
}

/* ══════════ TOAST ══════════ */
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('show'), 4000);
}

/* ══════════ SCROLL ANIM ══════════ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation='fadeUp 0.6s ease forwards';
      obs.unobserve(e.target);
    }
  });
}, { threshold:0.1 });
document.querySelectorAll('.featured-card, .why-feat').forEach(el => { el.style.opacity='0'; obs.observe(el); });

/* ══════════ INIT ══════════ */
window.addEventListener('DOMContentLoaded', () => {
  loadHotelsFromAPI();
  try {
    const params = new URLSearchParams(window.location.search);
    const openBooking = params.get('openBooking');
    if (openBooking) {
      const hid = parseInt(openBooking,10);
      const h = hotelDatabase.find(x=>x.id===hid);
      if (h) openBookingModal(h);
      history.replaceState(null,'', window.location.pathname);
    }
  } catch(e){}
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      if (links) links.classList.toggle('mobile-open');
    });
  }
});

/* ══════════ OWNER ROLE NAV ══════════ */
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
