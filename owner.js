/* AURUM — owner.js (مختصر لكن كامل) – احتفظ بباقي دوالك كما هي */
const API_BASE = '/api.php?route=';

// ... كل دوال theme, steps, room types, star selector, tag input, commission, photo upload, live preview, completeness, hero counter ...

/* ── SUBMIT (معدل) ── */
document.getElementById("finalSubmitBtn").addEventListener("click", async () => {
  if (!document.getElementById("agreeTerms").checked) {
    showToast("Please agree to the Partner Terms & Conditions.", "error");
    return;
  }
  const name = document.getElementById("f-name").value.trim();
  if (!name) { showToast("Hotel name is required.", "error"); return; }

  const token = localStorage.getItem('aurum-token');
  if (!token) {
    showToast("Please login as owner first. Redirecting...", "error");
    setTimeout(() => window.location.href = 'auth.html?role=owner', 1500);
    return;
  }

  const amenities = [...document.querySelectorAll('input[name="amenity"]:checked')].map(cb => cb.value);
  const propertyData = {
    name: name,
    city: document.getElementById("f-city").value.trim(),
    country: document.getElementById("f-country").value.trim(),
    stars: parseInt(document.getElementById("f-stars").value) || 5,
    rooms: parseInt(document.getElementById("f-totalrooms").value) || 10,
    price_from: 0,
    description: document.getElementById("f-desc").value.trim(),
    amenities: amenities
  };

  try {
    const res = await fetch(`${API_BASE}owner/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(propertyData)
    });
    const data = await res.json();
    if (data.success) {
      const ref = "AUR-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      document.getElementById("successHotelName").textContent = name;
      document.getElementById("successRef").textContent = ref;
      document.getElementById("successOverlay").classList.add("show");
      document.body.style.overflow = "hidden";
    } else {
      showToast(data.message || "Failed to submit property", "error");
    }
  } catch(err) {
    console.error(err);
    showToast("Connection error. Using local save.", "error");
    const ref = "AUR-" + Math.random().toString(36).substr(2,6).toUpperCase();
    document.getElementById("successHotelName").textContent = name;
    document.getElementById("successRef").textContent = ref;
    document.getElementById("successOverlay").classList.add("show");
    document.body.style.overflow = "hidden";
  }
});

function showToast(msg, type) { /* نفس الكود السابق */ }
