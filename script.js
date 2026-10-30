document.documentElement.classList.remove("no-js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------- Open / closed badge (Thailand time, open daily 08:00–15:00) ----------
const OPEN_MIN = 8 * 60;
const CLOSE_MIN = 15 * 60;

function updateOpenStatus() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);
  const now = hour * 60 + minute;
  const isOpen = now >= OPEN_MIN && now < CLOSE_MIN;
  for (const el of $$("#open-status, #open-status-2")) {
    el.textContent = isOpen ? "Open now · เปิดอยู่" : "Closed · ปิดแล้ว";
    el.classList.toggle("is-open", isOpen);
  }
}
updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000);

// ---------- Sound: synthesised temple bell + crunch (off until the visitor turns it on) ----------
let audio = null;
let soundOn = false;
let bellTimer = null;

function ctx() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  return audio;
}

function bell() {
  const ac = ctx();
  const t = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = 0.18;
  master.connect(ac.destination);
  // inharmonic partials give a bronze-bell colour
  for (const [ratio, level, decay] of [[1, 1, 4.5], [2.01, 0.5, 3.2], [2.76, 0.35, 2.4], [5.4, 0.18, 1.4], [8.9, 0.08, 0.8]]) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.frequency.value = 196 * ratio;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + decay + 0.1);
  }
}

function crunch() {
  if (!soundOn) return;
  const ac = ctx();
  const t = ac.currentTime;
  const len = Math.floor(ac.sampleRate * 0.16);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    // bursts of noise read as a crisp bite
    const burst = Math.random() < 0.08 ? 1 : 0.25;
    data[i] = (Math.random() * 2 - 1) * burst * (1 - i / len);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2400;
  filter.Q.value = 0.8;
  const g = ac.createGain();
  g.gain.value = 0.6;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(t);
}

function setSound(on) {
  soundOn = on;
  for (const b of $$("#sound-toggle, [data-sound-toggle]")) b.setAttribute("aria-pressed", String(on));
  $("#sound-toggle").setAttribute("aria-label", on ? "Turn off sound" : "Turn on temple-bell sound");
  const chipLabel = $("[data-sound-toggle] span");
  if (chipLabel) chipLabel.textContent = on ? "Sound on · tap to mute" : "Play the temple bell";
  clearInterval(bellTimer);
  if (on) {
    ctx().resume();
    bell();
    bellTimer = setInterval(bell, 9000);
  }
}
for (const b of $$("#sound-toggle, [data-sound-toggle]")) b.addEventListener("click", () => setSound(!soundOn));

// ---------- Scroll: progress bar, parallax, walking pin ----------
const bar = $("#progress-bar");
const farLayer = $(".city__layer--far");
const city = $("#city");
const route = $("#route");
const routePath = $("#route-path");
const walker = $("#walker");
const walkMins = $("#walk-mins");
const routeLen = routePath.getTotalLength();
let ticking = false;

function onScroll() {
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;

  if (!reduceMotion) {
    const r = city.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) farLayer.style.transform = `translate3d(0, ${r.top * -0.25}px, 0)`;
  }

  const rr = route.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (vh * 0.9 - rr.top) / (rr.height + vh * 0.35)));
  const pt = routePath.getPointAtLength(p * routeLen);
  walker.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
  walkMins.textContent = Math.round(p * 10);
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

// ---------- Highlight the nav link for the section in view ----------
const links = $$(".nav__links a");
const sections = links.map((a) => $(a.getAttribute("href")));
const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const i = sections.indexOf(entry.target);
    links.forEach((a, j) => a.classList.toggle("is-active", i === j));
  }
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((s) => s && sectionObserver.observe(s));

// ---------- Mobile menu ----------
const nav = $("#top-nav");
const toggle = $("#nav-toggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
links.forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ---------- Timeline scrubber ----------
const range = $("#timeline-range");
const frames = $$(".timeline__frame");
const stepLabels = ["1977", "Generation to generation", "Today"];
range.addEventListener("input", () => {
  const step = Number(range.value);
  frames.forEach((f) => f.classList.toggle("is-active", Number(f.dataset.step) === step));
  range.setAttribute("aria-valuetext", stepLabels[step]);
});

// ---------- Five pots infographic ----------
const POTS = [
  { th: "น้ำยากะทิ", en: "Coconut milk", color: "#e3c065", heat: 1, rich: 4, tag: "Good for first-timers", desc: "Mellow and creamy, the gentle way in." },
  { th: "น้ำยาป่า", en: "Jungle", color: "#c8772f", heat: 5, rich: 1, tag: "", desc: "Bright and fiery, made without coconut milk." },
  { th: "น้ำพริก", en: "Chili", color: "#b8442a", heat: 3, rich: 3, tag: "", desc: "Sweet, nutty and heat-forward." },
  { th: "แกงไตปลา", en: "Fish innards", color: "#9a6a2e", heat: 4, rich: 5, tag: "Southern classic", desc: "The bold, unapologetic Southern classic." },
  { th: "น้ำยาปู", en: "Crab", color: "#d9893c", heat: 2, rich: 4, tag: "", desc: "Rich and sweet from the sea." },
];
const potButtons = $$(".pot");
const buildBowl = $("#build-bowl");
const saveBtn = $("#pot-save");
let currentPot = 0;

function selectPot(i, { focus = false } = {}) {
  currentPot = i;
  const pot = POTS[i];
  potButtons.forEach((b, j) => {
    b.setAttribute("aria-selected", String(i === j));
    b.tabIndex = i === j ? 0 : -1;
  });
  if (focus) potButtons[i].focus();
  $("#pot-th").textContent = pot.th;
  $("#pot-en").textContent = `${pot.en} nam ya`;
  $("#pot-desc").textContent = pot.desc;
  const tag = $("#pot-tag");
  tag.textContent = pot.tag;
  tag.hidden = !pot.tag;
  $("#pot-heat").style.setProperty("--v", pot.heat);
  $("#pot-rich").style.setProperty("--v", pot.rich);
  buildBowl.style.setProperty("--curry", pot.color);
  syncSaveButton();
}

potButtons.forEach((b, i) => {
  b.addEventListener("click", () => selectPot(i));
  b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") selectPot(i); });
  b.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    selectPot((i + (e.key === "ArrowRight" ? 1 : POTS.length - 1)) % POTS.length, { focus: true });
  });
});

$("#build-toggle").addEventListener("change", (e) => {
  buildBowl.classList.toggle("is-built", e.target.checked);
  buildBowl.setAttribute("aria-hidden", String(!e.target.checked));
});

// ---------- Favorites (saved in this browser) ----------
const FAV_KEY = "kjmk-favorites";
function loadFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
}
function storeFavs(list) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch { /* storage unavailable: keep in memory */ }
}
let favs = loadFavs().filter((i) => POTS[i]);

const toastEl = $("#toast");
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-shown");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-shown"), 2200);
}

function syncSaveButton() {
  const saved = favs.includes(currentPot);
  saveBtn.setAttribute("aria-pressed", String(saved));
  $("span", saveBtn).textContent = saved ? "Saved" : "Save";
}

function renderFavs() {
  const count = $("#fav-count");
  count.textContent = favs.length;
  count.hidden = favs.length === 0;
  $("#fav-open").classList.toggle("has-favs", favs.length > 0);
  $("#fav-title-count").textContent = favs.length ? `(${favs.length} saved)` : "";
  const list = $("#fav-list");
  list.innerHTML = "";
  for (const i of favs) {
    const pot = POTS[i];
    const li = document.createElement("li");
    li.innerHTML = `<span class="dot" style="--c:${pot.color}"></span>
      <span class="favname"><b>${pot.th}</b><small>${pot.en} nam ya</small><a href="#nam-ya" data-jump="${i}">Jump to this bowl →</a></span>
      <button aria-label="Remove ${pot.en} from favorites" data-remove="${i}">♥</button>`;
    list.appendChild(li);
  }
  $("#fav-empty").hidden = favs.length > 0;
  syncSaveButton();
}

saveBtn.addEventListener("click", () => {
  if (favs.includes(currentPot)) {
    favs = favs.filter((i) => i !== currentPot);
    toast(`Removed ${POTS[currentPot].th} from favorites`);
  } else {
    favs = [...favs, currentPot];
    toast(`♥ Saved ${POTS[currentPot].th} to favorites`);
    const c = $("#fav-count");
    c.classList.remove("bump");
    void c.offsetWidth;
    c.classList.add("bump");
  }
  storeFavs(favs);
  renderFavs();
});

const drawer = $("#fav-drawer");
let lastFocus = null;
function openDrawer() {
  lastFocus = document.activeElement;
  drawer.hidden = false;
  $(".drawer__panel [data-close]", drawer).focus();
}
function closeDrawer() {
  drawer.hidden = true;
  if (lastFocus) lastFocus.focus();
}
$("#fav-open").addEventListener("click", openDrawer);
drawer.addEventListener("click", (e) => {
  const remove = e.target.closest("[data-remove]");
  if (remove) {
    favs = favs.filter((i) => i !== Number(remove.dataset.remove));
    storeFavs(favs);
    renderFavs();
    return;
  }
  const jump = e.target.closest("[data-jump]");
  if (jump) {
    selectPot(Number(jump.dataset.jump));
    closeDrawer();
    return;
  }
  if (e.target.closest("[data-close]")) closeDrawer();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !drawer.hidden) closeDrawer();
});
renderFavs();
selectPot(0);

// ---------- Tap-to-taste pairing guide ----------
const PAIRS = [[3, 2], [1, 3], [0], [0, 4]];
const SIDE_NAMES = ["ไก่ทอด", "หมูกรอบ", "หนังไก่กรอบ", "ทอดมันกุ้ง"];
const sideButtons = $$(".side");
const matches = $("#matches");
sideButtons.forEach((b, i) => b.addEventListener("click", () => {
  sideButtons.forEach((s, j) => s.setAttribute("aria-pressed", String(i === j)));
  matches.classList.add("has-pick");
  $$("li", matches).forEach((li) => li.classList.toggle("is-match", PAIRS[i].includes(Number(li.dataset.m))));
  $("#pair-hint").textContent = `${SIDE_NAMES[i]} goes best with ${PAIRS[i].map((m) => POTS[m].th).join(" and ")}.`;
  b.classList.remove("crunch");
  void b.offsetWidth;
  b.classList.add("crunch");
  crunch();
}));

// ---------- Menu tabs ----------
const tabs = $$('.tabs [role="tab"]');
function selectTab(tab) {
  for (const t of tabs) {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
  }
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// ---------- Fade sections in as they scroll into view ----------
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.15 });
$$(".reveal, .slow-reveal").forEach((el) => revealObserver.observe(el));

$("#year").textContent = new Date().getFullYear();
