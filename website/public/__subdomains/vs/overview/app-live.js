const svg = document.querySelector('#chart');
const W = 1800, H = 470, left = 72, right = 12, chartTop = 22, bottom = 45;
const allPlayersColor = '#e5ebf3';
// Player colors must stay tell-apart: pick each new player's color from a
// candidate pool by maximizing the minimum OKLab (perceptual) distance to every
// color already handed out. Greedy and incremental, so colors stay put across
// reloads and the palette still grows unbounded without the old collision walk.
const oklchToSrgbHex = (lightness, chroma, hueDegrees) => {
  const hue = (hueDegrees * Math.PI) / 180;
  const a = chroma * Math.cos(hue), b = chroma * Math.sin(hue);
  const l_ = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ ** 3, m3 = m_ ** 3, s3 = s_ ** 3;
  const channel = value => {
    const linear = Math.min(1, Math.max(0, value));
    const srgb = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, srgb)) * 255).toString(16).padStart(2, '0');
  };
  return `#${channel(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3)}${channel(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3)}${channel(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3)}`;
};
const colorCandidates = [];
for (const lightness of [0.82, 0.72, 0.62]) {
  for (const chroma of [0.13, 0.17]) {
    for (let hue = 0; hue < 360; hue += 6) {
      const radians = (hue * Math.PI) / 180;
      colorCandidates.push({
        css: oklchToSrgbHex(lightness, chroma, hue),
        lab: [lightness, chroma * Math.cos(radians), chroma * Math.sin(radians)],
      });
    }
  }
}
const colorDistance2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
const playerColorByName = new Map();
const assignedColorLabs = [];
const assignPlayerColors = () => {
  // Leaderboard (rank) order, not alphabetical: the greedy pick spends the
  // widest-spaced candidates on the top-ranked players, since those are the
  // chips and lines people actually compare. Late arrivals and the long tail
  // of one-off names get whatever remains.
  players.forEach(player => {
    if (playerColorByName.has(player.username)) return;
    let best = colorCandidates[0], bestScore = -1;
    for (const candidate of colorCandidates) {
      let score = Infinity;
      for (const lab of assignedColorLabs) {
        const distance = colorDistance2(candidate.lab, lab);
        if (distance < score) score = distance;
      }
      if (score > bestScore) { bestScore = score; best = candidate; }
    }
    assignedColorLabs.push(best.lab);
    playerColorByName.set(player.username, best.css);
  });
};
const colorForPlayer = name => playerColorByName.get(name) || allPlayersColor;
const metricNames = { Cap: 'cap-default', Turnstile: 'cf-turnstile', BotID: 'vercel-botid-basic', hCaptcha: 'hcaptcha', Total: 'total' };
const history = new Map();
const storageKey = 'vs-overview-state';
let metric = 'Cap';
let view = 'rate';
let players = [];
let profileName = 'izie';

const escapeHtml = text => String(text).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const number = value => Math.round(Number(value) || 0).toLocaleString();
const compact = value => {
  const v = Number(value) || 0;
  if (v >= 1e6) return `${Math.round(v / 1e6)}M`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}k`;
  return String(Math.round(v));
};
const rateCompact = value => {
  const v = Number(value) || 0;
  if (v < 10) return v.toFixed(2);
  if (v < 100) return v.toFixed(1);
  return String(Math.round(v));
};
const valueFor = (player, key) => key === 'total' ? player.total : player.by_type?.[key] || 0;
const rateText = value => Number.isFinite(value) && value >= 0 ? `${value.toFixed(2)}/s` : '—/s';
const etaMinutes = seconds => Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds / 60) : null;
const etaText = minutes => {
  if (minutes == null) return '—';
  const d = Math.floor(minutes / 1440), h = Math.floor((minutes % 1440) / 60), m = minutes % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
const setEta = (selector, seconds) => {
  const el = document.querySelector(selector);
  const minutes = etaMinutes(seconds);
  el.textContent = etaText(minutes);
  el.title = minutes == null ? '' : `${number(minutes)} minute${minutes === 1 ? '' : 's'}`;
};
function restoreClientState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (typeof saved.name === 'string' && saved.name.trim()) profileName = saved.name.trim();
    if (saved.view === 'rate' || saved.view === 'cumulative') view = saved.view;
    for (const [name, samples] of Object.entries(saved.history || {})) {
      if (!Array.isArray(samples)) continue;
      const valid = samples.filter(sample => Number.isFinite(sample?._time)).slice(-60);
      if (valid.length) history.set(name, valid);
    }
  } catch {
    // Local storage can be unavailable in private or restricted browsing modes.
  }
}
function saveClientState() {
  try {
    const savedHistory = Object.fromEntries([...history].map(([name, samples]) => [name, samples.slice(-60)]));
    localStorage.setItem(storageKey, JSON.stringify({ name: profileName, view, history: savedHistory }));
  } catch {
    // Persistence is an enhancement; the live dashboard still works without it.
  }
}
function speedFor(name, key) {
  const samples = history.get(name) || [];
  if (samples.length < 2) return 0;
  const current = samples[samples.length - 1];
  const previous = samples[samples.length - 2];
  const seconds = (current._time - previous._time) / 1000;
  return seconds > 0 ? Math.max(0, valueFor(current, key) - valueFor(previous, key)) / seconds : 0;
}
function renderChart() {
  const selected = [...document.querySelectorAll('.chip.selected')].map(button => button.dataset.player);
  const key = metricNames[metric];
  const aggregate = selected.includes('all');
  const names = aggregate ? players : players.filter(player => selected.includes(player.username));
  const sampleCount = Math.max(1, ...players.map(player => history.get(player.username)?.length || 0));
  const shown = aggregate ? [] : (names.length ? names : players).slice(0, 4);
  // Botting speed between each pair of consecutive samples; dt<=0 pairs are skipped
  // and negative deltas clamp to 0 so a reset counter never dips the line.
  const ratesFor = name => {
    const samples = history.get(name) || [];
    const rates = [];
    for (let i = 1; i < samples.length; i++) {
      const seconds = (samples[i]._time - samples[i - 1]._time) / 1000;
      if (seconds <= 0) continue;
      rates.push(Math.max(0, valueFor(samples[i], key) - valueFor(samples[i - 1], key)) / seconds);
    }
    return rates;
  };
  const series = view === 'rate'
    ? (aggregate
      ? [Array.from({ length: Math.max(1, sampleCount - 1) }, (_, index) => players.reduce((sum, player) => sum + (ratesFor(player.username)[index] || 0), 0))]
      : shown.map(player => ratesFor(player.username)))
    : (aggregate
      ? [Array.from({ length: sampleCount }, (_, index) => players.reduce((sum, player) => sum + valueFor(history.get(player.username)?.[index] || player, key), 0))]
      : shown.map(player => history.get(player.username)?.map(sample => valueFor(sample, key)) || []));
  const max = Math.max(1, ...series.flat());
  const n = Math.max(2, ...series.map(values => values.length));
  const x = i => left + (i / (n - 1)) * (W - left - right);
  const y = value => chartTop + H - chartTop - bottom - (value / max) * (H - chartTop - bottom);
  let markup = '';
  const axisValue = view === 'rate' ? rateCompact : compact;
  [0, .333, .666, 1].forEach(fraction => { const yy = y(max * fraction); markup += `<line class="grid" x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}"/><text class="axis" x="0" y="${yy+7}">${axisValue(max * fraction)}</text>`; });
  series.forEach((values, index) => {
    const path = values.map((value, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(value).toFixed(1)}`).join(' ');
    if (path) {
      const color = aggregate ? allPlayersColor : colorForPlayer(shown[index].username);
      const label = aggregate ? 'All players (sum)' : shown[index].username;
      markup += `<path class="line" d="${path}" stroke="${color}" stroke-width="${index ? 4 : 3}"/><circle class="dot" fill="${color}" cx="${x(values.length - 1)}" cy="${y(values[values.length - 1])}" r="6"/>`;
      markup += `<path class="hit" d="${path}" data-name="${escapeHtml(label)}"/>`;
    }
  });
  svg.innerHTML = markup;
  document.querySelectorAll('.chips .chip').forEach(chip => {
    const swatch = chip.querySelector('i');
    if (!swatch) return;
    swatch.style.background = chip.dataset.player === 'all'
      ? allPlayersColor
      : colorForPlayer(chip.dataset.player);
  });
  hideTooltip();
}
const tooltip = document.querySelector('#chart-tooltip');
function hideTooltip() {
  if (tooltip) tooltip.hidden = true;
}
svg.addEventListener('mousemove', event => {
  const hit = event.target.closest('path.hit');
  if (!hit || !tooltip) { hideTooltip(); return; }
  tooltip.textContent = hit.dataset.name;
  const wrap = svg.closest('.chart-wrap').getBoundingClientRect();
  tooltip.style.left = `${event.clientX - wrap.left}px`;
  tooltip.style.top = `${event.clientY - wrap.top}px`;
  tooltip.hidden = false;
});
svg.addEventListener('mouseleave', hideTooltip);
function renderPlayers() {
  const container = document.querySelector('.chips');
  const all = document.createElement('button');
  all.className = 'chip';
  all.dataset.player = 'all';
  all.innerHTML = `<i></i>All players (sum)<b>${number(players.reduce((sum, player) => sum + valueFor(player, metricNames[metric]), 0))}</b>`;
  container.replaceChildren(all, ...players.slice(0, 11).map((player) => {
    const button = document.createElement('button');
    button.className = 'chip selected';
    button.dataset.player = player.username;
    button.innerHTML = '<i></i>';
    const label = document.createTextNode(`${player.username} `);
    const total = document.createElement('b');
    total.textContent = number(valueFor(player, metricNames[metric]));
    button.title = `${player.username}: ${rateText(speedFor(player.username, metricNames[metric]))} ${metric} per second`;
    button.prepend(label);
    button.append(total);
    return button;
  }));
}
function renderStats() {
  const key = metricNames[metric];
  const index = players.findIndex(player => player.username.toLowerCase() === profileName.toLowerCase());
  const izie = players[index];
  const speed = izie ? speedFor(izie.username, key) : 0;
  const above = index > 0 ? players[index - 1] : null;
  const nextGap = above && izie ? Math.max(0, above.total - izie.total + 1) : null;
  const firstGap = izie ? Math.max(0, players[0].total - izie.total + (index > 0 ? 1 : 0)) : null;
  document.querySelector('#your-rank').textContent = izie ? `Rank #${index + 1}` : 'Rank unranked';
  document.querySelector('#your-total').textContent = izie ? `${number(izie.total)} total` : 'not on leaderboard';
  document.querySelector('#your-speed').textContent = rateText(speed);
  document.querySelector('#your-speed-note').textContent = `${metric} counted between updates`;
  document.querySelector('#next-name').textContent = above?.username || 'Already #1';
  document.querySelector('#next-gap').textContent = above ? `${number(above.total)} total • ${rateText(speedFor(above.username, key))}` : '—';
  setEta('#next-eta', nextGap != null && speed > 0 ? nextGap / speed : NaN);
  setEta('#first-eta', firstGap != null && speed > 0 ? firstGap / speed : NaN);
  document.querySelector('#next-eta-gap').textContent = nextGap == null ? '—' : `${number(nextGap)} ahead`;
  document.querySelector('#first-gap').textContent = firstGap == null ? '—' : `${number(firstGap)} ahead`;
  const body = document.querySelector('#leaderboard');
  body.replaceChildren(...players.slice(0, 15).map((player, rowIndex) => {
    const rate = speedFor(player.username, key);
    const row = document.createElement('tr');
    const values = [
      rowIndex + 1,
      player.username,
      number(player.total),
      rateText(rate),
      number(valueFor(player, 'cap-default')),
      number(valueFor(player, 'cf-turnstile')),
      number(valueFor(player, 'vercel-botid-basic')),
      number(valueFor(player, 'hcaptcha')),
    ];
    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    Object.entries({ 2: 'total', 4: 'cap-default', 5: 'cf-turnstile', 6: 'vercel-botid-basic', 7: 'hcaptcha' }).forEach(([index, key]) => { row.children[index].title = `${rateText(speedFor(player.username, key))} per second`; });
    row.children[3].title = `${rateText(rate)} ${metric} per second`;
    return row;
  }));
  document.querySelector('#leaderboard-updated').textContent = `updated ${new Date().toLocaleTimeString()}`;
}
function matchingNames(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return players.slice(0, 8);
  return players
    .filter(player => player.username.toLowerCase().includes(needle))
    .sort((a, b) => {
      const aStarts = a.username.toLowerCase().startsWith(needle);
      const bStarts = b.username.toLowerCase().startsWith(needle);
      return Number(bStarts) - Number(aStarts) || b.total - a.total;
    })
    .slice(0, 8);
}
function renderSuggestions(query) {
  const box = document.querySelector('#name-suggestions');
  const matches = matchingNames(query);
  box.replaceChildren(...matches.map(player => {
    const option = document.createElement('button');
    option.type = 'button';
    option.role = 'option';
    option.dataset.name = player.username;
    option.textContent = player.username;
    return option;
  }));
  box.hidden = !matches.length || document.activeElement !== document.querySelector('#name-input');
}
function chooseName(name) {
  profileName = name;
  const input = document.querySelector('#name-input');
  input.value = name;
  document.querySelector('#name-suggestions').hidden = true;
  saveClientState();
  if (players.length) renderStats();
}
async function load() {
  const response = await fetch('/api/leaderboard', { cache: 'no-store' });
  if (!response.ok) throw new Error(`leaderboard returned HTTP ${response.status}`);
  const body = await response.json();
  if (!Array.isArray(body.data)) throw new Error('invalid leaderboard response');
  players = body.data;
  assignPlayerColors();
  // The upstream leaderboard is cached for ~30s, so 15s polls often return the same
  // snapshot twice. Key samples to the server's snapshot time (body.ts) and skip
  // repeat snapshots; otherwise rates flicker between a real value and 0/s, and the
  // nonzero readings come out doubled because the increment covers two intervals.
  const sampleTime = Number.isFinite(body.ts) ? Math.round(body.ts * 1000) : Date.now();
  players.forEach(player => {
    const samples = history.get(player.username) || Array.from({ length: 4 }, (_, index) => ({ ...player, _time: sampleTime - (4 - index) * 15_000 }));
    if (samples[samples.length - 1]?._time < sampleTime) {
      samples.push({ ...player, _time: sampleTime });
      history.set(player.username, samples.slice(-60));
    }
  });
  saveClientState();
  renderPlayers();
  renderChart();
  renderStats();
  renderSubtitle();
}
function renderSubtitle() {
  document.querySelector('#subtitle').textContent = `${metric} ${view === 'rate' ? 'per second' : 'totals'} · updated ${new Date().toLocaleTimeString()}`;
}
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || !button.closest('.controls')) return;
  const group = button.closest('.segmented');
  if (!group) return;
  group.querySelectorAll('button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  if (group.classList.contains('metrics')) {
    metric = button.dataset.metric;
    renderPlayers();
    renderChart();
    if (players.length) renderSubtitle();
  }
  if (group.classList.contains('views')) {
    view = button.dataset.view;
    saveClientState();
    renderChart();
    if (players.length) renderSubtitle();
  }
});
document.querySelector('.chips').addEventListener('click', event => {
  const button = event.target.closest('.chip');
  if (!button) return;
  const all = document.querySelector('[data-player="all"]');
  if (button.dataset.player === 'all') {
    document.querySelectorAll('.chips .chip').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
  } else {
    all.classList.remove('selected');
    button.classList.toggle('selected');
    if (!document.querySelector('.chips .chip.selected')) all.classList.add('selected');
  }
  renderChart();
});
load().catch(error => { document.querySelector('#subtitle').textContent = `Unable to load leaderboard: ${error.message}`; });
setInterval(() => load().catch(error => { document.querySelector('#subtitle').textContent = `Unable to load leaderboard: ${error.message}`; }), 15000);
window.addEventListener('error', event => { document.querySelector('#subtitle').textContent = `Dashboard error: ${event.message}`; });
restoreClientState();
document.querySelectorAll('.views button').forEach(button => button.classList.toggle('active', button.dataset.view === view));
document.querySelector('#name-input').value = profileName;
document.querySelector('#name-input').addEventListener('input', event => {
  profileName = event.target.value.trim() || 'izie';
  saveClientState();
  renderSuggestions(event.target.value);
  if (players.length) renderStats();
});
document.querySelector('#name-input').addEventListener('focus', event => renderSuggestions(event.target.value));
document.querySelector('#name-input').addEventListener('keydown', event => {
  const options = [...document.querySelectorAll('#name-suggestions button')];
  if (!options.length) return;
  const current = options.indexOf(document.activeElement);
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    options[(current + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length].focus();
  } else if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault();
    chooseName(options[0].dataset.name);
  }
});
document.querySelector('#name-suggestions').addEventListener('click', event => {
  const option = event.target.closest('button[data-name]');
  if (option) chooseName(option.dataset.name);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.name-picker')) document.querySelector('#name-suggestions').hidden = true;
});
const clearDialog = document.querySelector('#clear-dialog');
document.querySelector('#clear-data').addEventListener('click', () => clearDialog.showModal());
document.querySelector('#cancel-clear').addEventListener('click', () => clearDialog.close());
document.querySelector('#confirm-clear').addEventListener('click', () => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
  clearDialog.close();
  window.location.reload();
});
