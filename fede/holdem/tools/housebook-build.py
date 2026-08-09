import json
E = json.load(open('/tmp/_holdem_extract.json'))
tables, defs, helpers = E['tables'], E['defs'], E['helpers']

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hold'Em — The House Book</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --gold: #e8b64c; --cream: #f5ead1; --ink: #0b0906;
    --warm: #e8722c; --cool: #7fa8c4;
  }
  body {
    background: #0b3d2e;
    background-image: radial-gradient(circle at 20% 0%, #12503c, #08281e 70%);
    color: var(--cream);
    font-family: 'Avenir Next', 'Segoe UI', system-ui, sans-serif;
    padding: 26px 14px 90px;
  }
  .wrap { max-width: 1080px; margin: 0 auto; }
  h1 {
    font-family: Georgia, serif; color: var(--gold); text-align: center;
    letter-spacing: 3px; font-size: clamp(24px, 6vw, 40px);
    text-shadow: 0 0 20px rgba(232,182,76,.45);
  }
  .sub { text-align: center; color: #9fc4b2; font-size: 13px; margin: 8px 0 6px; }
  .built { text-align: center; color: #6d8f80; font-size: 11px; margin-bottom: 20px; }
  nav {
    position: sticky; top: 0; z-index: 5; display: flex; gap: 8px; flex-wrap: wrap;
    justify-content: center; padding: 9px 0; margin-bottom: 18px;
    background: rgba(8,40,30,.92); backdrop-filter: blur(6px);
    border-bottom: 1px solid #23392e;
  }
  nav a {
    color: var(--gold); text-decoration: none; font-size: 11px; letter-spacing: 1.4px;
    border: 1px solid #5a4626; border-radius: 20px; padding: 5px 12px;
  }
  nav a:hover { background: rgba(232,182,76,.14); }
  h2 {
    font-family: Georgia, serif; color: var(--gold); font-size: 20px;
    letter-spacing: 2px; margin: 30px 0 4px; padding-bottom: 6px;
    border-bottom: 2px solid #5a4626;
  }
  .lede { color: #9fc4b2; font-size: 13px; line-height: 1.55; margin-bottom: 14px; }
  .lede b { color: var(--cream); }

  /* ── tower card ── */
  .tw {
    background: linear-gradient(180deg, rgba(20,26,20,.92), rgba(10,14,10,.94));
    border: 2px solid #2c4436; border-radius: 16px;
    margin: 16px 0; overflow: hidden;
  }
  .twTop { display: flex; align-items: center; gap: 14px; padding: 14px 16px; }
  .twTop svg { width: 78px; height: 78px; flex: 0 0 auto; }
  .twId { flex: 1 1 auto; min-width: 0; }
  .twId h3 { font-family: Georgia, serif; color: var(--gold); font-size: 21px; }
  .role {
    display: inline-block; font-size: 10px; letter-spacing: 1.5px; color: #79e0d2;
    border: 1px solid #2f6b62; border-radius: 5px; padding: 2px 7px; margin: 5px 0 4px;
  }
  .twBase { font-size: 12px; color: #b7a98a; }
  .twBase b { color: var(--cream); }
  .price { text-align: right; font-size: 12px; color: #9c8757; line-height: 1.7; white-space: nowrap; }
  .price b { color: var(--gold); font-size: 15px; }
  .benched {
    background: #4a1d1d; color: #ffb3b3; font-size: 10px; letter-spacing: 1px;
    padding: 3px 8px; border-radius: 5px; display: inline-block; margin-top: 5px;
  }

  .branches { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-top: 2px solid #2c4436; }
  @media (max-width: 700px) { .branches { grid-template-columns: 1fr; } }
  .br { padding: 12px 14px 16px; }
  .br.a { background: linear-gradient(180deg, rgba(90,40,10,.30), rgba(40,20,8,.14)); }
  .br.b { background: linear-gradient(180deg, rgba(20,50,80,.30), rgba(10,25,40,.14)); border-left: 2px solid #2c4436; }
  @media (max-width: 700px) { .br.b { border-left: 0; border-top: 2px solid #2c4436; } }
  .brHead { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .brHead svg { width: 54px; height: 54px; flex: 0 0 auto; }
  .brName { font-family: Georgia, serif; font-size: 17px; }
  .br.a .brName { color: #ffab63; }
  .br.b .brName { color: #a8d4ee; }
  .brWhat { font-size: 12px; color: var(--cream); }
  .brTag {
    font-size: 9px; letter-spacing: 1.4px; display: inline-block;
    padding: 2px 6px; border-radius: 4px; margin-bottom: 3px;
  }
  .br.a .brTag { background: rgba(232,114,44,.22); color: #ffab63; }
  .br.b .brTag { background: rgba(127,168,196,.22); color: #a8d4ee; }
  .tier {
    display: flex; gap: 9px; align-items: flex-start;
    padding: 7px 8px; border-radius: 8px; margin-top: 6px;
    background: rgba(8,10,8,.5); border: 1px solid #2b3a2f;
  }
  .tier.cap { border-color: var(--gold); box-shadow: 0 0 12px rgba(232,182,76,.18); }
  .num {
    flex: 0 0 auto; width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; border: 1.5px solid;
  }
  .br.a .num { color: #ffab63; border-color: #8c4a1b; background: rgba(232,114,44,.15); }
  .br.b .num { color: #a8d4ee; border-color: #35617f; background: rgba(127,168,196,.15); }
  .tier.cap .num { color: var(--gold); border-color: var(--gold); background: rgba(232,182,76,.2); }
  .tBody { flex: 1 1 auto; min-width: 0; }
  .tName { font-size: 13px; font-weight: 700; color: var(--cream); line-height: 1.2; }
  .tier.cap .tName { color: var(--gold); }
  .tWhat { font-size: 11.5px; color: #cfe0d6; font-style: italic; margin: 1px 0 2px; }
  .tStats { font-size: 10.5px; color: #93a89b; line-height: 1.4; }
  .tCost { flex: 0 0 auto; text-align: right; font-size: 11px; font-weight: 800; color: var(--gold); }
  .tCost small { display: block; font-size: 8px; color: #6d8f80; font-weight: 400; }

  /* ── guests ── */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(232px, 1fr)); gap: 11px; }
  .npc {
    background: linear-gradient(180deg, rgba(20,26,20,.92), rgba(10,14,10,.94));
    border: 2px solid #2c4436; border-radius: 13px; padding: 11px 12px;
    display: flex; gap: 10px;
  }
  .npc.boss { border-color: #8f1e2e; background: linear-gradient(180deg, rgba(50,16,22,.7), rgba(16,8,10,.94)); }
  .npc svg { width: 56px; height: 62px; flex: 0 0 auto; }
  .npcB { flex: 1 1 auto; min-width: 0; }
  .npcB h4 { font-family: Georgia, serif; color: var(--gold); font-size: 14.5px; line-height: 1.15; }
  .npc.boss .npcB h4 { color: #ff9aa6; }
  .badge {
    display: inline-block; font-size: 8.5px; letter-spacing: 1px; padding: 1.5px 5px;
    border-radius: 4px; background: #8f1e2e; color: #ffe0e4; margin-left: 4px; vertical-align: 2px;
  }
  .npcStat { font-size: 10px; color: #79e0d2; letter-spacing: .4px; margin: 3px 0; }
  .npcNums { font-size: 10px; color: #93a89b; }
  .npcNums b { color: var(--cream); }
  .npcDesc { font-size: 11px; color: #cfe0d6; line-height: 1.4; margin-top: 4px; }
  .legend {
    display: flex; gap: 14px; flex-wrap: wrap; font-size: 11.5px;
    color: #9fc4b2; margin: 6px 0 14px;
  }
  .swatch { display: inline-block; width: 11px; height: 11px; border-radius: 3px; vertical-align: -1px; margin-right: 5px; }
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">DEFS_HERE</svg>
<div class="wrap">
  <h1>THE HOUSE BOOK</h1>
  <div class="sub">every table, every branch, every guest — generated from the game's own data</div>
  <div class="built" id="built"></div>
  <nav><a href="#sec-tables">TABLES</a><a href="#sec-guests">GUESTS</a><a href="#sec-bosses">BOSSES</a></nav>

  <h2 id="sec-tables">THE TABLES</h2>
  <div class="lede">
    Every table forks into <b>two branches</b>. A branch is unlocked once with <b>comps</b> between
    floors; inside a floor you pay <b>chips</b> to climb it. Tier I is open from the start.
  </div>
  <div class="legend">
    <span><span class="swatch" style="background:#e8722c"></span>Branch A</span>
    <span><span class="swatch" style="background:#7fa8c4"></span>Branch B</span>
    <span><span class="swatch" style="background:#e8b64c"></span>Top tier</span>
  </div>
  <div id="towers"></div>

  <h2 id="sec-guests">THE GUESTS</h2>
  <div class="lede">Fodder and specials, with the floor each first walks in on.</div>
  <div class="grid" id="npcs"></div>

  <h2 id="sec-bosses">THE BOSSES</h2>
  <div class="lede">Every one changes a rule while they're on the floor.</div>
  <div class="grid" id="bosses"></div>
</div>
<script>
"""

TAIL = """
const ROMAN = ['I','II','III','IV','V'];
const svgNS = 'http://www.w3.org/2000/svg';
function svgEl(t, a, p) {
  const e = document.createElementNS(svgNS, t);
  for (const k in a) e.setAttribute(k, a[k]);
  if (p) p.appendChild(e);
  return e;
}
/* the wheel pockets are built at runtime in-game; do the same here or the
   roulette renders hollow */
(function(){
  const WHEELS = [
    ['#twRoulette .pockets',   ['#2e7d4f', '#c9473b', '#2e2622']],
    ['#twRoulette_a .pockets', ['#e8722c', '#8c2f1b', '#262b31']],
    ['#twRoulette_b .pockets', ['#c9a44a', '#b85450', '#f0e6cc']]
  ];
  const N = 17, r1 = 13, r2 = 31;
  for (const [sel, [c0, c1, c2]] of WHEELS) {
    const g = document.querySelector(sel);
    if (!g) continue;
    for (let i = 0; i < N; i++) {
      const a1 = (i / N) * Math.PI * 2, a2 = ((i + 1) / N) * Math.PI * 2;
      const x1 = Math.cos(a1), y1 = Math.sin(a1), x2 = Math.cos(a2), y2 = Math.sin(a2);
      svgEl('path', {
        d: `M ${x1*r1} ${y1*r1} L ${x1*r2} ${y1*r2} A ${r2} ${r2} 0 0 1 ${x2*r2} ${y2*r2} L ${x2*r1} ${y2*r1} A ${r1} ${r1} 0 0 0 ${x1*r1} ${y1*r1} Z`,
        fill: i === 0 ? c0 : (i % 2 ? c1 : c2), stroke: '#3b2415', 'stroke-width': 1.2
      }, g);
    }
  }
})();

/* which floor each guest debuts on, straight from the wave tables */
const DEBUT = {};
ROOMS.forEach((r, i) => (r.waves || []).forEach(w => w.forEach(([t]) => {
  if (DEBUT[t] === undefined) DEBUT[t] = i + 1;
})));

const sprite = (id, box) =>
  `<svg viewBox="${box}"><use href="#${id}"/></svg>`;

/* ── tables ── */
const towerBox = '-62 -58 124 112';
let html = '';
for (const key in TTYPES) {
  const T = TTYPES[key], spec = TSPEC[key];
  if (!spec) continue;
  const off = DISABLED.includes(key);
  const hire = HIRECOST[key];
  html += `<div class="tw" id="tw-${key}">
    <div class="twTop">
      ${sprite(T.sprite, towerBox)}
      <div class="twId">
        <h3>${T.name}</h3>
        <div class="role">${TROLE[key] || ''}</div>
        <div class="twBase"><b>Base:</b> ${statLine(key, null, 1)}</div>
        ${off ? '<div class="benched">BENCHED — not in the game right now</div>' : ''}
      </div>
      <div class="price">
        <b>${T.cost}</b> chips<br>
        ${hire ? hire + ' comps to hire<br>' : 'available from the start<br>'}
        ${PATHCOST[key]} comps per branch
      </div>
    </div>
    <div class="branches">`;
  for (const pk of ['a', 'b']) {
    const P = spec[pk];
    html += `<div class="br ${pk}">
      <div class="brHead">
        ${sprite(T.sprite + '_' + pk, towerBox)}
        <div>
          <div class="brTag">BRANCH ${pk.toUpperCase()}</div>
          <div class="brName">${P.label}</div>
          <div class="brWhat">${(BRANCHINFO[key] || {})[pk] || ''}</div>
        </div>
      </div>`;
    P.tiers.forEach((tr, i) => {
      const lvl = i + 2, cap = i === P.tiers.length - 1;
      html += `<div class="tier ${cap ? 'cap' : ''}">
        <div class="num">${ROMAN[i + 1]}</div>
        <div class="tBody">
          <div class="tName">${tr.name}</div>
          <div class="tWhat">${(FLAVOR[key] || {})[pk] ? FLAVOR[key][pk][i] : ''}</div>
          <div class="tStats">${statLine(key, pk, lvl)}</div>
        </div>
        <div class="tCost">${tr.cost}<small>chips</small></div>
      </div>`;
    });
    html += '</div>';
  }
  html += '</div></div>';
}
document.getElementById('towers').innerHTML = html;

/* draw each branch's tier-accent art on top of its variant sprite */
document.querySelectorAll('.br').forEach(br => {
  const key = br.closest('.tw').id.replace('tw-', '');
  const pk = br.classList.contains('a') ? 'a' : 'b';
  const svg = br.querySelector('svg');
  if (svg && typeof artFor === 'function') {
    const g = svgEl('g', {}, svg);
    artFor(g, key, pk, 5);
  }
});

/* ── guests ── */
const npcBox = '-40 -70 80 106';
const NOTE = { whalewife: "Arrives on The Whale's arm - they heal each other." };
const card = (k, E) => `<div class="npc ${E.boss ? 'boss' : ''}">
  ${sprite(E.sprite, npcBox)}
  <div class="npcB">
    <h4>${E.name}${E.boss ? '<span class="badge">BOSS</span>' : ''}</h4>
    <div class="npcStat">${E.stats || ''}</div>
    <div class="npcNums">
      <b>${E.hp}</b> hp · speed <b>${E.speed}</b> · pays <b>${E.reward}</b> ·
      costs <b>${E.star}</b> rep${DEBUT[k] ? ' · debuts floor <b>' + DEBUT[k] + '</b>' : ''}
    </div>
    <div class="npcDesc">${E.desc || ''}${NOTE[k] ? ' <b style="color:#79e0d2">' + NOTE[k] + '</b>' : ''}</div>
  </div>
</div>`;
/* groom + bride + honey are one guest wearing three keys — show them once, as a pair */
const PAIRED = { groom: 1, bride: 1, honey: 1 };
let g1 = '', g2 = '';
for (const k in ETYPES) {
  if (PAIRED[k]) continue;
  const E = ETYPES[k];
  (E.boss ? (g2 += card(k, E)) : (g1 += card(k, E)));
}
const G = ETYPES.groom, B = ETYPES.bride;
if (G && B) {
  g1 += `<div class="npc">
    <div style="display:flex;flex:0 0 auto">
      ${sprite(G.sprite, npcBox)}<div style="margin-left:-22px">${sprite(B.sprite, npcBox)}</div>
    </div>
    <div class="npcB">
      <h4>The Honeymooners<span class="badge" style="background:#2f6b62;color:#bff3ea">PAIR</span></h4>
      <div class="npcStat">${G.stats || ''}</div>
      <div class="npcNums">
        <b>${G.hp}</b> hp each · speed <b>${G.speed}</b> · pays <b>${G.reward}</b> ·
        costs <b>${G.star}</b> rep each${DEBUT.honey ? ' · debuts floor <b>' + DEBUT.honey + '</b>' : ''}
      </div>
      <div class="npcDesc">${G.desc || ''}</div>
    </div>
  </div>`;
}
document.getElementById('npcs').innerHTML = g1;
document.getElementById('bosses').innerHTML = g2;

document.getElementById('built').textContent =
  `${Object.keys(TSPEC).length} tables · ${Object.keys(TSPEC).length * 2} branches · ` +
  `${Object.keys(ETYPES).length} guests · generated from index.html`;
</script>
</body>
</html>
"""

data_js = '\n'.join(f'const {n} = {v};' for n, v in tables.items())
helpers_js = '\n'.join(helpers.values())
out = HEAD.replace('DEFS_HERE', defs) + data_js + '\n' + helpers_js + TAIL
open('housebook.html', 'w').write(out)
print('housebook.html written:', len(out) // 1024, 'KB')
