const svg = document.querySelector('#chart');
const W = 1800, H = 470, left = 72, right = 12, chartTop = 22, bottom = 45;
const colors = ['#e5ebf3','#4d8ce4','#ce6332','#4da574'];
const metricNames = { Cap: 'cap-default', Turnstile: 'cf-turnstile', BotID: 'vercel-botid-basic', hCaptcha: 'hcaptcha', Total: 'total' };
const history = new Map();
const storageKey = 'vs-overview-state';
let metric = 'Cap';
let players = [];
let profileName = 'izie';

const number = value => Math.round(Number(value) || 0).toLocaleString();
const valueFor = (player, key) => key === 'total' ? player.total : player.by_type?.[key] || 0;
const rateText = value => Number.isFinite(value) && value >= 0 ? `${value.toFixed(2)}/s` : '—/s';
const etaText = seconds => Number.isFinite(seconds) && seconds >= 0 ? `${Math.ceil(seconds / 60)}m` : '—';
function restoreClientState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (typeof saved.name === 'string' && saved.name.trim()) profileName = saved.name.trim();
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
    localStorage.setItem(storageKey, JSON.stringify({ name: profileName, history: savedHistory }));
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
  const series = aggregate
    ? [Array.from({ length: sampleCount }, (_, index) => players.reduce((sum, player) => sum + valueFor(history.get(player.username)?.[index] || player, key), 0))]
    : (names.length ? names : players).slice(0, 4).map(player => history.get(player.username)?.map(sample => valueFor(sample, key)) || []);
  const max = Math.max(1, ...series.flat());
  const n = Math.max(2, ...series.map(values => values.length));
  const x = i => left + (i / (n - 1)) * (W - left - right);
  const y = value => chartTop + H - chartTop - bottom - (value / max) * (H - chartTop - bottom);
  let markup = '';
  [0, .333, .666, 1].forEach(fraction => { const yy = y(max * fraction); markup += `<line class="grid" x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}"/><text class="axis" x="0" y="${yy+7}">${number(max * fraction)}</text>`; });
  series.forEach((values, index) => {
    const path = values.map((value, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(value).toFixed(1)}`).join(' ');
    if (path) markup += `<path class="line" d="${path}" stroke="${colors[index]}" stroke-width="${index ? 4 : 3}"/><circle class="dot" fill="${colors[index]}" cx="${x(values.length - 1)}" cy="${y(values[values.length - 1])}" r="6"/>`;
  });
  svg.innerHTML = markup;
}
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
  document.querySelector('#next-gap').textContent = nextGap == null ? '—' : `${number(nextGap)} ahead`;
  document.querySelector('#next-eta').textContent = nextGap != null && speed > 0 ? etaText(nextGap / speed) : '—';
  document.querySelector('#first-eta').textContent = firstGap != null && speed > 0 ? etaText(firstGap / speed) : '—';
  document.querySelector('#first-gap').textContent = firstGap == null ? '—' : `${number(firstGap)} ahead`;
  const body = document.querySelector('#leaderboard');
  body.replaceChildren(...players.slice(0, 15).map((player, rowIndex) => {
    const rate = speedFor(player.username, key);
    const row = document.createElement('tr');
    const values = [
      rowIndex + 1,
      player.username,
      number(valueFor(player, 'cap-default')),
      number(valueFor(player, 'cf-turnstile')),
      number(valueFor(player, 'vercel-botid-basic')),
      number(valueFor(player, 'hcaptcha')),
      number(player.total),
      rateText(rate),
    ];
    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    [2, 3, 4, 5, 6].forEach(index => { row.children[index].title = `${rateText(speedFor(player.username, ['cap-default', 'cf-turnstile', 'vercel-botid-basic', 'hcaptcha', 'total'][index - 2]))} per second`; });
    row.children[7].title = `${rateText(rate)} ${metric} per second`;
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
  players.forEach(player => {
    const samples = history.get(player.username) || Array.from({ length: 4 }, (_, index) => ({ ...player, _time: Date.now() - (4 - index) * 15_000 }));
    samples.push({ ...player, _time: Date.now() });
    history.set(player.username, samples.slice(-60));
  });
  saveClientState();
  renderPlayers();
  renderChart();
  renderStats();
  document.querySelector('#subtitle').textContent = `${metric} totals · updated ${new Date().toLocaleTimeString()}`;
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
