const svg = document.querySelector('#chart');
const W = 1800, H = 470, left = 72, right = 12, top = 22, bottom = 45;
const colors = ['#e5ebf3','#4d8ce4','#ce6332','#4da574'];
const metricNames = { Cap: 'cap-default', Turnstile: 'cf-turnstile', BotID: 'vercel-botid-basic', hCaptcha: 'hcaptcha', Total: 'total' };
const history = new Map();
let metric = 'Cap';
let players = [];

const number = value => Math.round(Number(value) || 0).toLocaleString();
const valueFor = (player, key) => key === 'total' ? player.total : player.by_type?.[key] || 0;
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
  const y = value => top + H - top - bottom - (value / max) * (H - top - bottom);
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
  all.className = 'chip selected';
  all.dataset.player = 'all';
  all.innerHTML = `<i></i>All players (sum)<b>${number(players.reduce((sum, player) => sum + valueFor(player, metricNames[metric]), 0))}</b>`;
  container.replaceChildren(all, ...players.slice(0, 11).map((player) => {
    const button = document.createElement('button');
    button.className = 'chip';
    button.dataset.player = player.username;
    button.innerHTML = '<i></i>';
    const label = document.createTextNode(`${player.username} `);
    const total = document.createElement('b');
    total.textContent = number(valueFor(player, metricNames[metric]));
    button.prepend(label);
    button.append(total);
    return button;
  }));
}
async function load() {
  const response = await fetch('/api/leaderboard', { cache: 'no-store' });
  if (!response.ok) throw new Error(`leaderboard returned HTTP ${response.status}`);
  const body = await response.json();
  if (!Array.isArray(body.data)) throw new Error('invalid leaderboard response');
  players = body.data;
  players.forEach(player => { const samples = history.get(player.username) || []; samples.push(player); history.set(player.username, samples.slice(-60)); });
  renderPlayers();
  renderChart();
  document.querySelector('#subtitle').textContent = `${metric} totals · updated ${new Date().toLocaleTimeString()}`;
}
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || !button.closest('.controls')) return;
  const group = button.closest('.segmented');
  group.querySelectorAll('button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  if (group.classList.contains('metrics')) {
    metric = button.dataset.metric;
    renderPlayers();
    renderChart();
  } else if (button.dataset.source === 'code') {
    document.querySelector('#subtitle').textContent = 'Mine: my code is not available yet';
  } else {
    document.querySelector('#subtitle').textContent = `${metric} totals · live leaderboard`;
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
