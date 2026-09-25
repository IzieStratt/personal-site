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
      { label: "huddles, RTM & Chime", path: "docs/methods/huddles-and-chime.md" },
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
      { label: "Web client internals: emoji UI, menus", path: "docs/methods/web-client-internals-2026-09.md" },
      { label: "Grid sandbox: admin.apps + canvas tabs", path: "docs/methods/grid-admin-sandbox-2026-09.md" },
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
  document.getElementById("content").scrollTo(0, 0);
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
    for (const table of docEl.querySelectorAll("table")) {
      const wrap = document.createElement("div");
      wrap.className = "table-scroll";
      table.replaceWith(wrap);
      wrap.appendChild(table);
    }
    // large tables (the master index, the internal-canvas namespace list) get a filter box
    const rowCount = docEl.querySelectorAll("table tbody tr").length;
    if (rowCount > 40) {
      searchBar.hidden = false;
      setupTableFilter();
    }
    document.getElementById("content").scrollTo(0, 0);
  } catch (err) {
    docEl.replaceChildren();
    const error = document.createElement("p");
    error.className = "error";
    error.textContent = `Couldn't load ${path}: ${err.message}`;
    docEl.appendChild(error);
  }
}

const TABLE_PAGE = 100;

// Big tables keep every row detached in memory and only put a page of matches in
// the DOM, so filtering and layout cost stays flat no matter how long the table is.
function setupTableFilter() {
  const tables = Array.from(docEl.querySelectorAll("table"))
    .filter((t) => t.tBodies[0] && t.tBodies[0].rows.length > 40)
    .map((table) => {
      const tbody = table.tBodies[0];
      const rows = Array.from(tbody.rows);
      const hay = rows.map((r) => r.textContent.toLowerCase());
      const more = document.createElement("button");
      more.className = "show-more table-more";
      more.hidden = true;
      table.parentElement.after(more);
      const t = { tbody, rows, hay, more, matches: rows, limit: TABLE_PAGE };
      more.addEventListener("click", () => { t.limit += TABLE_PAGE * 2; draw(t); });
      return t;
    });
  const total = tables.reduce((n, t) => n + t.rows.length, 0);

  function draw(t) {
    const shown = t.matches.slice(0, t.limit);
    t.tbody.replaceChildren(...shown);
    t.more.hidden = shown.length >= t.matches.length;
    t.more.textContent = `Show more (${t.matches.length - shown.length} left)`;
  }

  function apply() {
    const q = searchInput.value.trim().toLowerCase();
    let matched = 0;
    for (const t of tables) {
      t.matches = q ? t.rows.filter((_, i) => t.hay[i].includes(q)) : t.rows;
      t.limit = TABLE_PAGE;
      matched += t.matches.length;
      draw(t);
    }
    searchCount.textContent = q ? `${matched} / ${total} rows` : `${total} rows`;
  }

  let timer;
  searchInput.oninput = () => { clearTimeout(timer); timer = setTimeout(apply, 150); };
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

const shellEl = document.querySelector(".shell");
const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

function setSidebar(show) {
  if (isMobile()) {
    sidebarEl.classList.toggle("open", show);
  } else {
    shellEl.classList.toggle("collapsed", !show);
    try { localStorage.setItem("redoc-nav", show ? "open" : "closed"); } catch {}
  }
  navToggle.setAttribute("aria-expanded", String(show));
}

navToggle.addEventListener("click", () => setSidebar(true));
document.getElementById("nav-collapse").addEventListener("click", () => setSidebar(false));

try {
  if (!isMobile() && localStorage.getItem("redoc-nav") === "closed") setSidebar(false);
} catch {}

buildNav();
route(pathFromHash());
