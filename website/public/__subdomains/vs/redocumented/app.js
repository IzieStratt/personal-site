// ReDocumented docs viewer -- fetches markdown from docs/ and renders it
// client-side, plus routes to the interactive method explorer (explorer.js).
// No build step; this is meant to stay a plain static folder.

const EXPLORER_ROUTE = "explorer";

const NAV = [
  {
    title: "Start here",
    items: [
      { label: "★ Method explorer (interactive)", path: EXPLORER_ROUTE },
      { label: "Overview / README", path: "docs/README.md" },
      { label: "Auth & tokens", path: "docs/auth-and-tokens.md" },
      { label: "Errors glossary", path: "docs/errors.md" },
      { label: "Rate limits", path: "docs/rate-limits.md" },
    ],
  },
  {
    title: "Methods (prose write-ups)",
    items: [
      { label: "Master index (all methods, as a table)", path: "docs/methods/INDEX.md" },
      { label: "chat.*", path: "docs/methods/chat.md" },
      { label: "client.*", path: "docs/methods/client.md" },
      { label: "conversations.*", path: "docs/methods/conversations.md" },
      { label: "drafts.*", path: "docs/methods/drafts.md" },
      { label: "files.*", path: "docs/methods/files.md" },
      { label: "search.*", path: "docs/methods/search.md" },
      { label: "team.*", path: "docs/methods/team.md" },
      { label: "users.*", path: "docs/methods/users.md" },
      { label: "misc undocumented", path: "docs/methods/misc-undocumented.md" },
      { label: "Edge API", path: "docs/methods/edge-api.md" },
    ],
  },
  {
    title: "Source-mining passes",
    items: [
      { label: "slack-datamine (webpack mining)", path: "docs/methods/datamine-2026-09.md" },
      { label: "Internal Canvas cross-ref", path: "docs/methods/internal-canvas-2026.md" },
      { label: "slack-undoc-client cross-ref", path: "docs/methods/slack-undoc-client-2026.md" },
      { label: "Taut client internals (dead end)", path: "docs/methods/taut-client-internals.md" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "Undocumented methods index", path: "docs/undocumented/INDEX.md" },
      { label: "Guide: schedule send + attachments", path: "docs/guides/schedule-send-with-attachments.md" },
    ],
  },
];

const DEFAULT_PATH = EXPLORER_ROUTE;

const navListEl = document.getElementById("nav-list");
const docEl = document.getElementById("doc");
const explorerEl = document.getElementById("explorer-root");
const searchBar = document.getElementById("doc-search-bar");
const searchInput = document.getElementById("doc-search");
const searchCount = document.getElementById("doc-search-count");
const sidebarEl = document.getElementById("sidebar");
const navToggle = document.getElementById("nav-toggle");

function buildNav() {
  for (const group of NAV) {
    const groupEl = document.createElement("div");
    groupEl.className = "nav-group";
    const h3 = document.createElement("h3");
    h3.textContent = group.title;
    groupEl.appendChild(h3);
    const ul = document.createElement("ul");
    for (const item of group.items) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${item.path}`;
      a.textContent = item.label;
      a.dataset.path = item.path;
      li.appendChild(a);
      ul.appendChild(li);
    }
    groupEl.appendChild(ul);
    navListEl.appendChild(groupEl);
  }
}

function setActive(path) {
  for (const a of navListEl.querySelectorAll("a[data-path]")) {
    a.classList.toggle("active", a.dataset.path === path);
  }
}

const cache = new Map();
let explorerScriptLoaded = false;

function showExplorer() {
  docEl.hidden = true;
  searchBar.hidden = true;
  explorerEl.hidden = false;
  if (!explorerScriptLoaded) {
    explorerScriptLoaded = true;
    const s = document.createElement("script");
    s.src = "explorer.js";
    document.body.appendChild(s);
  }
  window.scrollTo(0, 0);
}

async function loadDoc(path) {
  explorerEl.hidden = true;
  docEl.hidden = false;
  docEl.innerHTML = '<p class="loading">Loading…</p>';
  searchBar.hidden = true;
  searchInput.value = "";
  try {
    let text = cache.get(path);
    if (text === undefined) {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      text = await res.text();
      cache.set(path, text);
    }
    marked.setOptions({ gfm: true, breaks: false });
    docEl.innerHTML = marked.parse(text);
    // large tables (the master index, the internal-canvas namespace list) get a filter box
    const rowCount = docEl.querySelectorAll("table tbody tr, table tr").length;
    if (rowCount > 40) {
      searchBar.hidden = false;
      setupTableFilter();
    }
    window.scrollTo(0, 0);
  } catch (err) {
    docEl.replaceChildren();
    const error = document.createElement("p");
    error.className = "error";
    error.textContent = `Couldn't load ${path}: ${err.message}`;
    docEl.appendChild(error);
  }
}

function setupTableFilter() {
  const rows = Array.from(docEl.querySelectorAll("table tbody tr"));
  function apply() {
    const q = searchInput.value.trim().toLowerCase();
    let shown = 0;
    for (const row of rows) {
      const match = !q || row.textContent.toLowerCase().includes(q);
      row.classList.toggle("filtered-out", !match);
      if (match) shown++;
    }
    searchCount.textContent = q ? `${shown} / ${rows.length} rows` : `${rows.length} rows`;
  }
  searchInput.oninput = apply;
  apply();
}

function pathFromHash() {
  const raw = decodeURIComponent(window.location.hash.slice(1));
  return raw || DEFAULT_PATH;
}

function route(path) {
  setActive(path);
  if (path === EXPLORER_ROUTE) showExplorer();
  else loadDoc(path);
  sidebarEl.classList.remove("open");
}

window.addEventListener("hashchange", () => route(pathFromHash()));

navToggle.addEventListener("click", () => {
  const open = sidebarEl.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

buildNav();
route(pathFromHash());
