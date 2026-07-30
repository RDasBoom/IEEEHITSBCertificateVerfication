// ── SIGNAL BROADCAST CANVAS (hero signature animation) ────
// Concentric radiating rings from a central "tower" point, plus
// a scrolling oscilloscope-style waveform trace along the bottom —
// standing in for the RF signal this talk is actually about.
(function () {
  const canvas = document.getElementById("signal-canvas");
  const ctx    = canvas.getContext("2d");
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // Radiating rings
  const maxRadius = 420;
  let rings = [0, 140, 280].map(offset => ({ r: offset }));

  // Waveform trace
  let waveOffset = 0;

  function drawRings(cx, cy) {
    rings.forEach(ring => {
      ring.r += 0.7;
      if (ring.r > maxRadius) ring.r = 0;
      const alpha = 0.16 * (1 - ring.r / maxRadius);
      if (alpha <= 0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(127,212,255,${alpha})`;
      ctx.setLineDash([6, 10]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawWave() {
    const baseY = H - 70;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,106,61,0.35)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= W; x += 4) {
      const y = baseY + Math.sin((x + waveOffset) * 0.02) * 14 * Math.sin((x + waveOffset) * 0.002);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    waveOffset += 1.4;
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawRings(W / 2, H * 0.42);
    drawWave();
    requestAnimationFrame(animate);
  }
  animate();
})();


// ── NAVBAR SCROLL ────────────────────────────────────
window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 40);
});


// ── SCROLL REVEAL ────────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// Text scramble for section tags
const chars = "!@#$%^&*<>/\\[]{}|=+~ABCDEFabcdef0123456789";

function scramble(el) {
  const original = el.dataset.text || el.textContent;
  el.dataset.text = original;
  let iteration  = 0;
  const total    = original.length * 3;

  const interval = setInterval(() => {
    el.textContent = original.split("").map((char, i) => {
      if (char === " ") return " ";
      if (i < iteration / 3) return original[i];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join("");

    if (iteration >= total) {
      el.textContent = original;
      clearInterval(interval);
    }
    iteration++;
  }, 30);
}

const tagObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      scramble(e.target);
      tagObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll(".section-tag").forEach(el => tagObserver.observe(el));


// ── HERO TYPING ANIMATION ────────────────────────────
const line1 = "FUTURE OF";
const line2 = "WIRELESS COMMS";
const el1   = document.getElementById("typed-line1");
const el2   = document.getElementById("typed-line2");

function typeLine(el, text, callback) {
  let i = 0;
  function t() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(t, 80);
    } else if (callback) {
      setTimeout(callback, 300);
    }
  }
  t();
}

document.getElementById("cursor").style.display = "none";
typeLine(el1, line1, () => {
  document.getElementById("cursor").style.display = "inline";
  typeLine(el2, line2);
});


function toggleTheme() {
  document.body.classList.toggle("light");
  document.getElementById("theme-btn").textContent =
    document.body.classList.contains("light") ? "🌙" : "☀️";
}

// Hamburger menu
function toggleMenu() {
  const menu = document.getElementById("nav-links");
  const btn  = document.getElementById("hamburger");
  const open = menu.classList.toggle("open");
  btn.textContent = open ? "✕" : "☰";
}

function closeMenu() {
  document.getElementById("nav-links").classList.remove("open");
  document.getElementById("hamburger").textContent = "☰";
}

document.addEventListener("click", function (e) {
  const menu = document.getElementById("nav-links");
  const btn  = document.getElementById("hamburger");
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    closeMenu();
  }
});

// ── EVENT STATUS (upcoming countdown / live / concluded) ──
const eventDate = new Date("July 31, 2026 18:30:00");
const now       = new Date();
const diffMs    = eventDate - now;

function statusText(ms) {
  if (ms > 0) {
    const days  = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (days >= 1)  return `Upcoming · in ${days} day${days === 1 ? "" : "s"}`;
    if (hours >= 1) return `Upcoming · in ${hours} hour${hours === 1 ? "" : "s"}`;
    return "Starting Soon";
  }
  if (ms > -3 * 60 * 60 * 1000) return "🔴 Live Now";
  return "Event Concluded";
}

document.getElementById("status-text").textContent = statusText(diffMs);

// ── CERTIFICATE VERIFICATION ─────────────────────────
// 👇 Paste your deployed Apps Script Web App URL here (ends in /exec)
const CERT_API_URL = "https://script.google.com/macros/s/AKfycbwu3_62xGdWXG77YnGTaEdjfWJK0TEUPMYflyLpZI5luPLOykhnGB0lxa9KyfOds__W/exec";

async function verify() {
  const input = document.getElementById("cert-input");
  const id = input.value.trim();
  if (!id) return;

  const btnText   = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");
  const verifyBtn = document.getElementById("verify-btn");

  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");
  verifyBtn.disabled = true;

  try {
    const res  = await fetch(`${CERT_API_URL}?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    showResult(data);
  } catch (err) {
    showResult({ status: "error", message: "Could not reach the verification server. Please try again." });
  } finally {
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
    verifyBtn.disabled = false;
  }
}

function showResult(data) {
  document.getElementById("input-box").classList.add("hidden");
  document.getElementById("result-box").classList.remove("hidden");

  const emoji = document.getElementById("result-emoji");
  const title = document.getElementById("result-title");
  const sub   = document.getElementById("result-sub");
  const rows  = document.getElementById("result-rows");
  rows.innerHTML = "";

  const row = (label, val) =>
    `<div class="reg-row"><span class="r-lbl">${label}</span><span class="r-val">${val}</span></div>`;

  if (data.status === "verified") {
    emoji.textContent = "✅";
    title.textContent = "Certificate Verified";
    sub.textContent   = `Issued to ${data.name} for ${data.event}.`;
    rows.innerHTML =
      row("Certificate ID", `<span class="cert-id">${data.certId}</span>`) +
      row("Name", data.name) +
      row("Roll No", data.roll) +
      row("Department", data.dept) +
      row("Institute", data.institute) +
      row("Date", data.date);
  } else if (data.status === "not_attended") {
    emoji.textContent = "⚠️";
    title.textContent = "Registered, Not Attended";
    sub.textContent   = "This ID belongs to a registered participant who did not attend the session.";
  } else if (data.status === "not_found") {
    emoji.textContent = "❌";
    title.textContent = "Certificate Not Found";
    sub.textContent   = "We couldn't find a certificate with that ID. Please check and try again.";
  } else {
    emoji.textContent = "❌";
    title.textContent = "Something Went Wrong";
    sub.textContent   = data.message || "Please try again later.";
  }
}

function reset() {
  document.getElementById("result-box").classList.add("hidden");
  document.getElementById("input-box").classList.remove("hidden");
  document.getElementById("cert-input").value = "";
}

document.getElementById("cert-input")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") verify();
});

// ── FOOTER TYPING ON SCROLL ──────────────────────────
const footerEl = document.getElementById("footer-typed");
const footerText = "Wireless Talk";
let footerTyped = false;

function typeFooter() {
  let i = 0;
  function type() {
    if (i < footerText.length) {
      footerEl.textContent += footerText[i++];
      setTimeout(type, 80);
    }
  }
  type();
}

const footerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !footerTyped) {
      footerTyped = true;
      typeFooter();
      footerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const footerSection = document.querySelector("footer");
if (footerSection) {
  footerObserver.observe(footerSection);
}