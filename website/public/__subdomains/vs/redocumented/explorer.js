// Interactive method explorer: fetches docs/data/methods.json directly (the
// same file agents are told to fetch in llms.txt) and renders a searchable,
// filterable, expandable table. No server, no build step.

const state = {
  data: null,
  filtered: [],
  query: "",
  status: "all", // all | documented | undocumented
  paramsFilter: "all", // all | known | unknown
  showAbsent: false, // methods the current web client no longer references
  sortKey: "name",
  sortDir: 1,
  limit: 50,
};

const isAbsent = (m) => !!(m.not_in_client || m.removed); // `removed` is the pre-2026-10-20 field name

const els = {
  root: document.getElementById("explorer-root"),
};

function fmtPct(n, d) {
  return d ? `${((n / d) * 100).toFixed(1)}%` : "0%";
}

function paramsSummary(m) {
  if (!m.params_known && m.params_observed) {
    const n = Object.keys(m.params_observed).length;
    return { text: `observed (${n})`, cls: "tag-observed" };
  }
  if (!m.params_known) return { text: "unknown", cls: "tag-unknown" };
  const p = m.params || {};
  const keys = Object.keys(p);
  if (keys.length === 0) return { text: "none needed", cls: "tag-known" };
  const req = keys.filter((k) => p[k] && p[k].required);
  return {
    text: `${keys.length} field${keys.length === 1 ? "" : "s"} (${req.length} required)`,
    cls: "tag-known",
  };
}

function responseSummary(m) {
  if (!m.response_known) return { text: "unknown", cls: "tag-unknown" };
  if (m.response && typeof m.response === "object") {
    const n = Object.keys(m.response).length;
    return { text: `${n} field${n === 1 ? "" : "s"}`, cls: "tag-known" };
  }
  if (m.response_example) return { text: "example available", cls: "tag-known" };
  return { text: "known", cls: "tag-known" };
}

function renderStats() {
  const all = state.showAbsent ? state.data.methods : state.data.methods.filter((m) => !isAbsent(m));
  const absent = state.data.methods.length - state.data.methods.filter((m) => !isAbsent(m)).length;
  const observed = all.filter((m) => !m.params_known && m.params_observed).length;
  const total = all.length;
  const paramsKnown = all.filter((m) => m.params_known).length;
  const respKnown = all.filter((m) => m.response_known).length;
  const documented = all.filter((m) => m.status === "documented").length;
  return `
    <div class="stats-row">
      <div class="stat"><b>${total}</b><span>total methods</span></div>
      <div class="stat"><b>${documented}</b><span>documented</span></div>
      <div class="stat"><b>${total - documented}</b><span>undocumented</span></div>
      <div class="stat"><b>${paramsKnown}</b><span>params known (${fmtPct(paramsKnown, total)})</span></div>
      <div class="stat"><b>${respKnown}</b><span>response known (${fmtPct(respKnown, total)})</span></div>
      <div class="stat"><b>${observed}</b><span>params observed (not a full schema)</span></div>
      <div class="stat"><b>${absent}</b><span>not in the current client (${state.showAbsent ? "shown" : "hidden"})</span></div>
    </div>`;
}

function applyFilters() {
  if (!state.data.methods._prepped) {
    state.data.methods.forEach((m, i) => {
      m._idx = i;
      m._hay = `${m.name}\n${m.purpose || ""}\n${m.source || ""}`.toLowerCase();
    });
    state.data.methods._prepped = true;
  }
  const q = state.query.trim().toLowerCase();
  state.filtered = state.data.methods.filter((m) => {
    if (isAbsent(m) && !state.showAbsent) return false;
    if (state.status !== "all" && m.status !== state.status) return false;
    if (state.paramsFilter === "known" && !m.params_known) return false;
    if (state.paramsFilter === "unknown" && (m.params_known || m.params_observed)) return false;
    if (state.paramsFilter === "observed" && (m.params_known || !m.params_observed)) return false;
    if (!q) return true;
    return (
      m._hay.includes(q)
    );
  });
  state.filtered.sort((a, b) => {
    const av = (a[state.sortKey] ?? "").toString();
    const bv = (b[state.sortKey] ?? "").toString();
    return av.localeCompare(bv) * state.sortDir;
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Renders one of the callout banners with a dismiss button. Once dismissed,
// the choice sticks in localStorage so the table gets the room back.
function callout(cls, hideKey, inner) {
  let dismissed = false;
  try { dismissed = localStorage.getItem(hideKey) === "1"; } catch {}
  if (dismissed) return "";
  return `
    <div class="${cls}" data-hide="${hideKey}">
      <button type="button" class="callout-dismiss" aria-label="Dismiss" title="Dismiss this note">✕</button>
      <span>${inner}</span>
    </div>`;
}

const PAGE_SIZE = 50;

function renderTable() {
  const rows = state.filtered
    .slice(0, state.limit)
    .map((m, i) => {
      const p = paramsSummary(m);
      const r = responseSummary(m);
      return `
      <tr class="method-row" data-idx="${m._idx}">
        <td><code>${escapeHtml(m.name)}</code>${isAbsent(m) ? ' <span class="tag tag-absent" title="' + escapeHtml(m.not_in_client_note || m.removed_note || "") + '">not in client</span>' : ""}</td>
        <td><span class="tag tag-${m.status}">${m.status}</span></td>
        <td><span class="tag tag-verified">${escapeHtml(m.verified)}</span></td>
        <td><span class="tag ${p.cls}">${p.text}</span></td>
        <td><span class="tag ${r.cls}">${r.text}</span></td>
        <td class="src-cell">${escapeHtml(m.source || "")}</td>
      </tr>`;
    })
    .join("");
  const truncated = state.filtered.length > state.limit;
  return `
    <table class="explorer-table">
      <thead>
        <tr>
          <th data-sort="name">Method</th>
          <th data-sort="status">Status</th>
          <th data-sort="verified">Verified</th>
          <th>Params</th>
          <th>Response</th>
          <th data-sort="source">Source</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="result-count">Showing ${Math.min(state.limit, state.filtered.length)} of ${state.filtered.length} method${state.filtered.length === 1 ? "" : "s"}.
      ${truncated ? `<button id="show-more" class="show-more">Show more</button>` : ""}</p>`;
}

function renderDetail(m) {
  const observedHtml = (!m.params_known && m.params_observed)
    ? `<table class="observed-table"><thead><tr><th>name</th><th>type hint</th><th>call sites</th></tr></thead><tbody>${Object.entries(m.params_observed).map(([k, v]) => `<tr><td><code>${escapeHtml(k)}</code></td><td>${escapeHtml(v.type)}</td><td>${v.sites}</td></tr>`).join("")}</tbody></table><p class="detail-src">${escapeHtml(m.params_observed_source || "")}</p>`
    : "";
  const paramsHtml = observedHtml ? observedHtml : m.params_known
    ? `<pre>${escapeHtml(JSON.stringify(m.params, null, 2))}</pre><p class="detail-src">Source: ${escapeHtml(m.params_source || "")}</p>`
    : `<p class="unknown-note">No known params. Not guessed, not inferred — genuinely undocumented in every source this project checked.</p>`;
  const responseHtml = m.response_known
    ? (m.response
        ? `<pre>${escapeHtml(JSON.stringify(m.response, null, 2))}</pre>`
        : `<pre>${escapeHtml(m.response_example || "")}</pre>`) +
      `<p class="detail-src">Source: ${escapeHtml(m.response_source || "")}</p>`
    : `<p class="unknown-note">No known response shape.</p>`;
  return `
    <div class="detail-panel">
      <div class="detail-col">
        <h4>Params</h4>
        ${paramsHtml}
      </div>
      <div class="detail-col">
        <h4>Response</h4>
        ${responseHtml}
      </div>
      <div class="detail-col detail-meta">
        <h4>Meta</h4>
        <p><b>Purpose:</b> ${escapeHtml(m.purpose || "(none recorded)")}</p>
        <p><b>Tokens:</b> ${escapeHtml(m.tokens || "unknown")}</p>
        ${isAbsent(m) ? `<p><b>Not in the current client:</b> ${escapeHtml(m.not_in_client_note || m.removed_note || "")}</p>` : ""}
        ${m.datamine ? `<p><b>Datamine:</b> first seen build ${escapeHtml(m.datamine.first_build)} (${escapeHtml(m.datamine.first_seen)})${m.datamine.last_build ? `, last seen build ${escapeHtml(m.datamine.last_build)} (${escapeHtml(m.datamine.last_seen)})` : ", still in the client"}</p>` : ""}
        <p><b>Call:</b> <code>POST https://slack.com/api/${escapeHtml(m.name)}</code></p>
      </div>
    </div>`;
}

function attachRowHandlers() {
  const more = els.root.querySelector("#show-more");
  if (more) more.addEventListener("click", () => {
    const wrap = els.root.querySelector("#explorer-table-wrap");
    const top = wrap.scrollTop;
    state.limit += PAGE_SIZE * 2;
    renderAll();
    wrap.scrollTop = top;
  });
  for (const row of els.root.querySelectorAll(".method-row")) {
    row.addEventListener("click", () => {
      const wasOpen = row.classList.contains("row-open");
      for (const dr of els.root.querySelectorAll(".detail-row")) dr.remove();
      for (const r of els.root.querySelectorAll(".method-row")) r.classList.remove("row-open");
      if (wasOpen) return;
      const detailRow = document.createElement("tr");
      detailRow.className = "detail-row";
      const td = document.createElement("td");
      td.colSpan = 6;
      td.innerHTML = renderDetail(state.data.methods[row.dataset.idx]);
      detailRow.appendChild(td);
      row.after(detailRow);
      row.classList.add("row-open");
    });
  }
  for (const th of els.root.querySelectorAll("th[data-sort]")) {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) state.sortDir *= -1;
      else { state.sortKey = key; state.sortDir = 1; }
      state.limit = PAGE_SIZE;
      applyFilters();
      renderAll();
    });
  }
}

function renderAll() {
  els.root.querySelector("#explorer-stats").innerHTML = renderStats();
  els.root.querySelector("#explorer-table-wrap").innerHTML = renderTable();
  attachRowHandlers();
}

let searchTimer;

async function init() {
  els.root.innerHTML = '<p class="loading">Loading method catalog…</p>';
  try {
    const res = await fetch("docs/data/methods.json");
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    state.data = await res.json();
  } catch (err) {
    els.root.innerHTML = `<p class="error">Couldn't load the catalog: ${err.message}</p>`;
    return;
  }
  applyFilters();
  els.root.innerHTML = `
    <div id="explorer-stats">${renderStats()}</div>
    ${callout("safety-note", "redoc.hide.safety", `<b>Safety note (from the catalog's own metadata):</b> ${escapeHtml(state.data.schema?.safety_note_for_agents || "")}`)}
    ${callout("contribute-note", "redoc.hide.contribute", `<b>Know something this catalog doesn't?</b> If you've verified a method marked <i>unknown</i> / <i>existence-only</i> / <i>not-live-tested</i>, found a missing method, or spotted something wrong, please
      <a href="https://github.com/IzieStratt/personal-site/tree/main/website/public/__subdomains/vs/redocumented/docs" target="_blank" rel="noreferrer">open a PR</a>
      or email <a href="mailto:ReDocumented@izie.top">ReDocumented@izie.top</a>. Say how you verified it (live call, source read, which source).`)}
    <div class="explorer-controls">
      <input id="explorer-search" type="search" placeholder="Filter by method name, purpose, or source…" autocomplete="off" />
      <select id="explorer-status">
        <option value="all">All statuses</option>
        <option value="documented">Documented only</option>
        <option value="undocumented">Undocumented only</option>
      </select>
      <select id="explorer-params">
        <option value="all">Any params state</option>
        <option value="known">Params known only</option>
        <option value="observed">Params observed only</option>
        <option value="unknown">Params unknown only</option>
      </select>
      <label class="explorer-toggle" title="Methods whose names were found in Slack's web client earlier but are missing from several recent builds. The client no longer references them; the API may still answer."><input type="checkbox" id="explorer-absent" /> Show methods not in the current client</label>
    </div>
    <div id="explorer-table-wrap"></div>`;
  for (const el of els.root.querySelectorAll("[data-hide]")) {
    el.querySelector(".callout-dismiss").addEventListener("click", () => {
      try { localStorage.setItem(el.dataset.hide, "1"); } catch {}
      el.remove();
    });
  }
  document.getElementById("explorer-search").addEventListener("input", (e) => {
    state.query = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.limit = PAGE_SIZE; applyFilters(); renderAll(); }, 120);
  });
  document.getElementById("explorer-status").addEventListener("change", (e) => {
    state.status = e.target.value;
    state.limit = PAGE_SIZE;
    applyFilters();
    renderAll();
  });
  document.getElementById("explorer-params").addEventListener("change", (e) => {
    state.paramsFilter = e.target.value;
    state.limit = PAGE_SIZE;
    applyFilters();
    renderAll();
  });
  document.getElementById("explorer-absent").addEventListener("change", (e) => {
    state.showAbsent = e.target.checked;
    state.limit = PAGE_SIZE;
    applyFilters();
    renderAll();
  });
  renderAll();
}

init();
