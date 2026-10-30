document.documentElement.classList.remove("no-js");

// Open / closed badge, using shop time in Thailand (UTC+7), open daily 08:00–15:00
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
  const label = isOpen ? "Open now · เปิดอยู่" : "Closed · ปิดแล้ว";
  for (const el of document.querySelectorAll("#open-status, #open-status-2")) {
    el.textContent = label;
    el.classList.toggle("is-open", isOpen);
  }
}
updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000);

// Scroll progress bar
const bar = document.getElementById("progress-bar");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

// Highlight the nav link for the section in view
const links = [...document.querySelectorAll(".nav__links a")];
const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const i = sections.indexOf(entry.target);
      links.forEach((a, j) => a.classList.toggle("is-active", i === j));
    }
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => s && sectionObserver.observe(s));

// Mobile menu
const nav = document.getElementById("top-nav");
const toggle = document.getElementById("nav-toggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
links.forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// Menu tabs (arrow keys move between tabs)
const tabs = [...document.querySelectorAll('[role="tab"]')];
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

// Fade sections in as they scroll into view
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();
