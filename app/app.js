// Leonida Tracker — offline GTA VI trophy guide + checklist.
// Loads only its own files (data/trophies.json, data/roadmap.json), keeps
// progress in localStorage, and never makes a network request.

const STORE_KEY = "leonida-tracker-v1";
const KIND_LABELS = {
  story: "Story",
  side: "Side stories",
  collectibles: "Collectibles",
  activities: "Activities",
  robbery: "Robbery",
  world: "World",
  platinum: "Platinum",
  completion: "100%",
};
const GRADE_LETTER = { platinum: "P", gold: "G", silver: "S", bronze: "B" };

const state = {
  earned: {},
  spoiler: false,
  hideEarned: false,
  kind: "all",
  grade: "all",
  query: "",
};

let trophies = [];
let roadmap = [];

const $ = (sel) => document.querySelector(sel);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    if (saved.earned) state.earned = saved.earned;
    if (typeof saved.spoiler === "boolean") state.spoiler = saved.spoiler;
    if (typeof saved.hideEarned === "boolean") state.hideEarned = saved.hideEarned;
  } catch (_) { /* a corrupt save just starts fresh */ }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    earned: state.earned,
    spoiler: state.spoiler,
    hideEarned: state.hideEarned,
  }));
  const note = $("#saved-note");
  if (note) note.textContent = "Progress saved in this browser.";
}

function countLabel(t) {
  if (t.count == null) return null;
  if (t.id === 52) return "$250,000";
  if (t.id === 53) return "$100,000";
  if (t.id === 14) return "100%";
  return String(t.count);
}

function isHidden(t) {
  return state.spoiler && t.hidden && !state.earned[t.id];
}

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === "missable") {
      if (!t.missable) return false;
    } else if (state.kind !== "all" && t.kind !== state.kind) {
      return false;
    }
    if (state.grade !== "all" && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned[t.id]) return false;
    if (q) {
      const hay = (t.name + " " + t.description + " " + (KIND_LABELS[t.kind] || "")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const earnedIds = trophies.filter((t) => state.earned[t.id]);
  const total = trophies.length || 55;
  const pct = Math.round((earnedIds.length / total) * 100);
  $("#earned-count").textContent = earnedIds.length + " / " + total;
  $("#progress-pct").textContent = pct + "% to the Platinum";
  $("#progress-fill").style.width = pct + "%";
  const byGrade = {};
  for (const g of ["platinum", "gold", "silver", "bronze"]) {
    const got = earnedIds.filter((t) => t.grade === g).length;
    const all = trophies.filter((t) => t.grade === g).length;
    byGrade[g] = got + "/" + all;
  }
  $("#progress-grades").innerHTML =
    "<span>Platinum <b>" + byGrade.platinum + "</b></span>" +
    "<span>Gold <b>" + byGrade.gold + "</b></span>" +
    "<span>Silver <b>" + byGrade.silver + "</b></span>" +
    "<span>Bronze <b>" + byGrade.bronze + "</b></span>";
}

function sourceList(t) {
  return t.sources.map((s) => {
    const label = s.name.replace(/</g, "&lt;");
    if (s.url) return '<a href="' + s.url + '" target="_blank" rel="noopener">' + label + "</a>";
    return label;
  }).join(" · ");
}

function trophyCard(t) {
  const hidden = isHidden(t);
  const earned = !!state.earned[t.id];
  const el = document.createElement("article");
  el.className = "trophy" + (earned ? " earned" : "");
  el.dataset.id = t.id;
  const label = countLabel(t);
  const name = hidden ? "Hidden trophy" : t.name;
  const desc = hidden
    ? "Hidden on PlayStation until earned — tick it off to reveal it."
    : t.description;
  const tags = [];
  tags.push('<span class="tag">' + (KIND_LABELS[t.kind] || t.kind) + "</span>");
  if (t.hidden) tags.push('<span class="tag hidden-tag">Hidden</span>');
  if (t.missable) tags.push('<span class="tag missable">⚠ Missable</span>');
  if (label) tags.push('<span class="tag count">× ' + label + "</span>");
  const guideHtml = hidden ? "" :
    '<button class="guide-toggle" type="button" aria-expanded="false">Guide</button>';
  el.innerHTML =
    '<div class="trophy-top">' +
      '<span class="grade-badge grade-' + t.grade + '" title="' + t.grade + '">' + GRADE_LETTER[t.grade] + "</span>" +
      "<h3>" + name.replace(/</g, "&lt;") + "</h3>" +
    "</div>" +
    '<p class="desc">' + desc.replace(/</g, "&lt;") + "</p>" +
    '<div class="tags">' + tags.join("") + "</div>" +
    '<div class="earn-row">' +
      '<input type="checkbox" id="earn-' + t.id + '"' + (earned ? " checked" : "") + ">" +
      '<label for="earn-' + t.id + '">Earned</label>' +
      guideHtml +
    "</div>" +
    (hidden ? "" :
      '<div class="guide" hidden><p>' + t.guide.replace(/</g, "&lt;") + "</p>" +
      '<p class="sources"><b>Sources:</b> ' + sourceList(t) + "</p></div>");
  el.querySelector("input").addEventListener("change", (e) => {
    if (e.target.checked) state.earned[t.id] = true;
    else delete state.earned[t.id];
    saveState();
    renderAll();
  });
  const toggle = el.querySelector(".guide-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const guide = el.querySelector(".guide");
      const open = guide.hidden;
      guide.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Hide guide" : "Guide";
    });
  }
  return el;
}

function renderGrid() {
  const grid = $("#trophy-grid");
  grid.innerHTML = "";
  const list = visibleTrophies();
  for (const t of list) grid.appendChild(trophyCard(t));
  const shown = list.length;
  const total = trophies.length;
  $("#count-line").textContent =
    shown === total
      ? "Showing all " + total + " trophies."
      : "Showing " + shown + " of " + total + " trophies.";
  $("#empty-state").hidden = shown !== 0;
}

function renderRoadmap() {
  const wrap = $("#roadmap");
  wrap.innerHTML = "";
  for (const stage of roadmap) {
    const el = document.createElement("article");
    el.className = "stage";
    const minis = stage.ids.map((id) => {
      const t = trophies.find((x) => x.id === id);
      const label = t ? t.name : ("#" + id);
      return '<span class="mini' + (state.earned[id] ? " done" : "") + '">' +
        label.replace(/</g, "&lt;") + "</span>";
    }).join("");
    el.innerHTML =
      "<h3>" + stage.title.replace(/</g, "&lt;") + "</h3>" +
      '<p class="goal">' + stage.goal.replace(/</g, "&lt;") + "</p>" +
      "<ul>" + stage.notes.map((n) => "<li>" + n.replace(/</g, "&lt;") + "</li>").join("") + "</ul>" +
      '<div class="stage-trophies">' + minis + "</div>";
    wrap.appendChild(el);
  }
}

function renderAll() {
  renderProgress();
  renderGrid();
  renderRoadmap();
}

function showTab(which) {
  const checklist = which === "checklist";
  $("#view-checklist").hidden = !checklist;
  $("#view-roadmap").hidden = checklist;
  $("#tab-checklist").classList.toggle("active", checklist);
  $("#tab-roadmap").classList.toggle("active", !checklist);
}

function applyHash() {
  const h = (location.hash || "").replace("#", "");
  if (h === "roadmap") {
    showTab("roadmap");
  } else if (h === "missable") {
    showTab("checklist");
    state.kind = "missable";
    document.querySelectorAll("#kind-filters .chip").forEach((c) =>
      c.classList.toggle("active", c.dataset.kind === "missable"));
  } else if (h === "spoiler") {
    showTab("checklist");
    state.spoiler = true;
    $("#spoiler-toggle").checked = true;
  }
}

function exportProgress() {
  const earnedIds = Object.keys(state.earned).map(Number).sort((a, b) => a - b);
  const blob = new Blob([JSON.stringify({ app: "leonida-tracker", earned: earnedIds, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-tracker-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data.earned)
        ? data.earned
        : Object.keys(data.earned || {}).filter((k) => data.earned[k]).map(Number);
      const next = {};
      for (const id of ids) {
        if (trophies.some((t) => t.id === id)) next[id] = true;
      }
      state.earned = next;
      saveState();
      renderAll();
      $("#saved-note").textContent = "Imported " + Object.keys(next).length + " earned trophies.";
    } catch (_) {
      $("#saved-note").textContent = "That file could not be read as progress — no changes made.";
    }
  };
  reader.readAsText(file);
}

async function init() {
  loadState();
  const [tRes, rRes] = await Promise.all([
    fetch("data/trophies.json"),
    fetch("data/roadmap.json"),
  ]);
  const tData = await tRes.json();
  const rData = await rRes.json();
  trophies = tData.trophies;
  roadmap = rData.stages;

  $("#tab-checklist").addEventListener("click", () => showTab("checklist"));
  $("#tab-roadmap").addEventListener("click", () => showTab("roadmap"));
  $("#search").addEventListener("input", (e) => { state.query = e.target.value; renderGrid(); });
  $("#kind-filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.kind = chip.dataset.kind;
    document.querySelectorAll("#kind-filters .chip").forEach((c) =>
      c.classList.toggle("active", c === chip));
    renderGrid();
  });
  $("#grade-filter").addEventListener("change", (e) => { state.grade = e.target.value; renderGrid(); });
  $("#hide-earned").addEventListener("change", (e) => { state.hideEarned = e.target.checked; renderGrid(); });
  $("#spoiler-toggle").addEventListener("change", (e) => {
    state.spoiler = e.target.checked;
    saveState();
    renderGrid();
  });
  $("#export-btn").addEventListener("click", exportProgress);
  $("#import-file").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  $("#reset-btn").addEventListener("click", () => {
    if (window.confirm("Reset the whole checklist? Your earned trophies will be cleared.")) {
      state.earned = {};
      saveState();
      renderAll();
    }
  });

  if (state.spoiler) $("#spoiler-toggle").checked = true;
  renderAll();
  applyHash();
  if (location.hash) renderAll();
  // Back/forward and in-page hash links re-apply the view without a reload.
  window.addEventListener("hashchange", () => {
    applyHash();
    renderAll();
  });
  window.__leonida = { trophies, get state() { return state; } };
}

init();
