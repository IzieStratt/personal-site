// Interactive method explorer: fetches docs/data/methods.json directly (the
// same file agents are told to fetch in llms.txt) and renders a searchable,
// filterable, expandable table. No server, no build step.

const state = {
  data: null,
  filtered: [],
  query: "",
  status: "all", // all | documented | undocumented
  paramsFilter: "all", // all | known | unknown
  sortKey: "name",
  sortDir: 1,
};

const els = {
  root: document.getElementById("explorer-root"),
};

function fmtPct(n, d) {
  return d ? `${((n / d) * 100).toFixed(1)}%` : "0%";
}

function paramsSummary(m) {
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
  const total = state.data.methods.length;
  const paramsKnown = state.data.methods.filter((m) => m.params_known).length;
  const respKnown = state.data.methods.filter((m) => m.response_known).length;
  const documented = state.data.methods.filter((m) => m.status === "documented").length;
  return `
    <div class="stats-row">
      <div class="stat"><b>${total}</b><span>total methods</span></div>
      <div class="stat"><b>${documented}</b><span>documented</span></div>
      <div class="stat"><b>${total - documented}</b><span>undocumented</span></div>
      <div class="stat"><b>${paramsKnown}</b><span>params known (${fmtPct(paramsKnown, total)})</span></div>
      <div class="stat"><b>${respKnown}</b><span>response known (${fmtPct(respKnown, total)})</span></div>
    </div>`;
}

function applyFilters() {
  const q = state.query.trim().toLowerCase();
  state.filtered = state.data.methods.filter((m) => {
    if (state.status !== "all" && m.status !== state.status) return false;
    if (state.paramsFilter === "known" && !m.params_known) return false;
    if (state.paramsFilter === "unknown" && m.params_known) return false;
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      (m.purpose || "").toLowerCase().includes(q) ||
      (m.source || "").toLowerCase().includes(q)
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

function renderTable() {
  const rows = state.filtered
    .slice(0, 500)
    .map((m, i) => {
      const p = paramsSummary(m);
      const r = responseSummary(m);
      return `
      <tr class="method-row" data-idx="${state.data.methods.indexOf(m)}">
        <td><code>${escapeHtml(m.name)}</code></td>
        <td><span class="tag tag-${m.status}">${m.status}</span></td>
        <td><span class="tag tag-verified">${escapeHtml(m.verified)}</span></td>
        <td><span class="tag ${p.cls}">${p.text}</span></td>
        <td><span class="tag ${r.cls}">${r.text}</span></td>
        <td class="src-cell">${escapeHtml(m.source || "")}</td>
      </tr>
      <tr class="detail-row" data-detail-for="${state.data.methods.indexOf(m)}" hidden><td colspan="6"></td></tr>`;
    })
    .join("");
  const truncated = state.filtered.length > 500;
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
    <p class="result-count">${state.filtered.length} method${state.filtered.length === 1 ? "" : "s"} matched${truncated ? " (showing first 500 — narrow your filter)" : ""}.</p>`;
}

function renderDetail(m) {
  const paramsHtml = m.params_known
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
        <p><b>Call:</b> <code>POST https://slack.com/api/${escapeHtml(m.name)}</code></p>
      </div>
    </div>`;
}

function attachRowHandlers() {
  for (const row of els.root.querySelectorAll(".method-row")) {
    row.addEventListener("click", () => {
      const idx = row.dataset.idx;
      const detailRow = els.root.querySelector(`.detail-row[data-detail-for="${idx}"]`);
      const isOpen = !detailRow.hidden;
      // close any other open detail rows
      for (const dr of els.root.querySelectorAll(".detail-row")) dr.hidden = true;
      for (const r of els.root.querySelectorAll(".method-row")) r.classList.remove("row-open");
      if (!isOpen) {
        const m = state.data.methods[idx];
        detailRow.querySelector("td").innerHTML = renderDetail(m);
        detailRow.hidden = false;
        row.classList.add("row-open");
      }
    });
  }
  for (const th of els.root.querySelectorAll("th[data-sort]")) {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) state.sortDir *= -1;
      else { state.sortKey = key; state.sortDir = 1; }
      applyFilters();
      renderAll();
    });
  }
}

function renderAll() {
  els.root.querySelector("#explorer-table-wrap").innerHTML = renderTable();
  attachRowHandlers();
}

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
    ${renderStats()}
    <p class="safety-note"><b>Safety note (from the catalog's own metadata):</b> ${escapeHtml(state.data.schema?.safety_note_for_agents || "")}</p>
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
        <option value="unknown">Params unknown only</option>
      </select>
    </div>
    <div id="explorer-table-wrap"></div>`;
  document.getElementById("explorer-search").addEventListener("input", (e) => {
    state.query = e.target.value;
    applyFilters();
    renderAll();
  });
  document.getElementById("explorer-status").addEventListener("change", (e) => {
    state.status = e.target.value;
    applyFilters();
    renderAll();
  });
  document.getElementById("explorer-params").addEventListener("change", (e) => {
    state.paramsFilter = e.target.value;
    applyFilters();
    renderAll();
  });
  renderAll();
}

init();
