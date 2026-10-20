// Supabase: paste your values after creating the project (publishable key only, never the secret key)
const SUPABASE_URL = "YOUR_PROJECT_URL";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";
const db = SUPABASE_URL.startsWith("https://") && typeof supabase !== "undefined"
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Project index: the large photo follows the project you point at
const rows = [...document.querySelectorAll(".rows button")];
const preview = document.querySelector(".preview img");
function showRow(btn) {
  rows.forEach(r => r.classList.toggle("on", r === btn));
  if (preview.getAttribute("src") === btn.dataset.src) return;
  preview.classList.add("fade");
  setTimeout(() => { preview.src = btn.dataset.src; preview.classList.remove("fade"); }, 180);
}
rows.forEach(r => {
  r.addEventListener("mouseenter", () => showRow(r));
  r.addEventListener("focus", () => showRow(r));
});
showRow(rows[0]);

// Lightbox: project photos first, then interiors
const photos = [
  ...rows.map(r => ({ src: r.dataset.src, alt: r.dataset.alt })),
  ...[...document.querySelectorAll(".grid img")].map(i => ({ src: i.getAttribute("src"), alt: i.alt })),
];
const box = document.getElementById("lightbox");
const boxImg = box.querySelector("img");
let current = 0;
function openAt(i) {
  current = (i + photos.length) % photos.length;
  boxImg.src = photos[current].src; boxImg.alt = photos[current].alt;
  box.hidden = false;
}
rows.forEach((r, i) => r.addEventListener("click", () => openAt(i)));
document.querySelectorAll(".grid img").forEach((img, i) => img.addEventListener("click", () => openAt(rows.length + i)));
document.querySelectorAll(".trio img").forEach(img => img.addEventListener("click", () => {
  const i = photos.findIndex(p => p.src === img.getAttribute("src")); openAt(i < 0 ? 0 : i);
}));
box.querySelector(".lb-prev").addEventListener("click", e => { e.stopPropagation(); openAt(current - 1); });
box.querySelector(".lb-next").addEventListener("click", e => { e.stopPropagation(); openAt(current + 1); });
box.querySelector(".lb-close").addEventListener("click", () => box.hidden = true);
box.addEventListener("click", e => { if (e.target === box) box.hidden = true; });
document.addEventListener("keydown", e => {
  if (box.hidden) return;
  if (e.key === "Escape") box.hidden = true;
  if (e.key === "ArrowLeft") openAt(current - 1);
  if (e.key === "ArrowRight") openAt(current + 1);
});

// Enquiry form
const form = document.getElementById("enquiryForm");
const msg = document.getElementById("formMessage");
const show = (t, c) => { msg.textContent = t; msg.style.color = c; };
const BAD = "#ff9d96", GOOD = "#86e3ab";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const enquiry = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    service: form.service.value,
    plot: form.plot.value.trim(),
    location: form.location.value.trim(),
    details: form.details.value.trim(),
  };
  if (enquiry.name.length < 2) return show("Enter your full name.", BAD);
  if (!/^[6-9][0-9]{9}$/.test(enquiry.phone)) return show("Enter a 10-digit mobile number starting with 6, 7, 8 or 9.", BAD);
  if (!enquiry.service) return show("Choose what you need.", BAD);

  if (!db) { show("Enquiry sent. We will call you shortly.", GOOD); form.reset(); return; }

  show("Sending...", "#b5bbc1");
  const { error } = await db.from("enquiries").insert(enquiry);
  if (error) { console.error(error); show("Could not send. Call 98451 67320 or use WhatsApp.", BAD); }
  else { show("Enquiry sent. We will call you shortly.", GOOD); form.reset(); }
});
