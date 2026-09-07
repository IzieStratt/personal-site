const svg = document.querySelector('#chart');
const W = 1800, H = 470, left = 72, right = 12, top = 22, bottom = 45;
const plotW = W - left - right, plotH = H - top - bottom;
const colors = ['#e5ebf3','#4d8ce4','#ce6332','#4da574'];
const n = 58;
const seeded = (seed, i) => { const x = Math.sin(seed * 31 + i * 8.13) * 43758.5453; return x - Math.floor(x); };
const series = [
  Array.from({length:n},(_,i)=>5200 + (seeded(1,i)-.5)*700 + (i>34 ? -i*8 : 0)),
  Array.from({length:n},(_,i)=> i<12 ? 2500+(seeded(2,i)-.5)*500 : i>50 ? 2600+(i-50)*230 : 190+(seeded(2,i)-.5)*40),
  Array.from({length:n},(_,i)=>1450+(seeded(3,i)-.5)*480+(i>12&&i<47?900:0)+(i>47?-i*32:0)),
  Array.from({length:n},(_,i)=>2200+(seeded(4,i)-.5)*500+(i>12&&i<48?900:0)+(i>49?-i*45:0))
];
const x = i => left + (i/(n-1))*plotW;
const y = v => top + plotH - (v/6800)*plotH;
const path = values => values.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
let markup='';
[0,2000,4000,6000].forEach(v=>{const yy=y(v);markup+=`<line class="grid" x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}"/> <text class="axis" x="0" y="${yy+7}">${v.toLocaleString()}</text>`});
[10,23,36,49].forEach(i=>{markup+=`<line class="grid" x1="${x(i)}" x2="${x(i)}" y1="${top}" y2="${top+plotH}"/>`});
['07:30','07:50','08:10','08:30'].forEach((t,i)=>markup+=`<text class="axis" text-anchor="middle" x="${x([10,23,36,49][i])}" y="${H-8}">${t}</text>`);
series.forEach((s,i)=>{markup+=`<path class="line" d="${path(s)}" stroke="${colors[i]}" stroke-width="${i===0?3:4}" ${i===0?'stroke-dasharray="13 10"':''}/><circle class="dot" fill="${colors[i]}" cx="${x(n-1)}" cy="${y(s[n-1])}" r="6"/>`});
svg.innerHTML=markup;
document.querySelectorAll('.segmented button,.chip').forEach(button=>button.addEventListener('click',()=>{if(button.closest('.segmented')){button.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));button.classList.add('active')}else{button.classList.toggle('selected')}}));
