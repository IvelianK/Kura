'use strict';
// Demo de Kura. Todo es local e inventado: no hay ni una petición de red.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const VIEWS = ['panel', 'red', 'copias', 'bitacora'];
// Búsqueda sin distinguir mayúsculas ni tildes
const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// La CSP prohíbe atributos style en el HTML: las variables CSS se aplican por CSSOM
function applyVars(root) {
  for (const el of $$('[data-vars]', root)) {
    for (const pair of el.dataset.vars.split(';')) {
      const [k, v] = pair.split('=');
      el.style.setProperty(k, v);
    }
  }
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ------------------------------------------------------------------ datos */

const PALETTE = {
  amber: ['#f0c98b', '#d9a65f'],
  blue: ['#a9bff7', '#5f80e0'],
  teal: ['#8fe0d5', '#2fa596'],
  violet: ['#d3b5f2', '#9466cc'],
  rose: ['#f5b3b3', '#d66a6a'],
  green: ['#a6efc9', '#33b97c'],
};

const GROUPS = [
  { name: 'Nube', note: 'interfaz única', wide: true, items: [
    { n: 'Nextcloud', d: 'Archivos, calendario, contactos y notas', c: 'blue', m: () => `${Math.round(rnd(110, 170))} ses.` },
    { n: 'OnlyOffice', d: 'Documentos en el navegador', c: 'teal', m: () => `${rnd(1.8, 2.4).toFixed(1)} s` },
    { n: 'SnappyMail', d: 'Varias cuentas, tema Atelier', c: 'amber', m: () => `${Math.round(rnd(0, 4))} nuevos` },
    { n: 'Calendario', d: 'Sincronizado con Google en 2 sentidos', c: 'violet', m: () => `hace ${Math.round(rnd(4, 58))} s` },
    { n: 'Contactos', d: '96 contactos, autocompletado', c: 'green', m: () => '96' },
    { n: 'Imaginary', d: 'Miniaturas de imágenes y PDF', c: 'rose', m: () => `${Math.round(rnd(60, 140))} MB` },
  ] },
  { name: 'Fotos', note: 'todo en local', items: [
    { n: 'Immich', d: '9.840 fotos y 1.120 vídeos', c: 'violet', m: () => '186 GB' },
    { n: 'Immich ML', d: 'Caras y búsqueda por contenido', c: 'blue', m: () => `${Math.round(rnd(2, 18))} % CPU` },
  ] },
  { name: 'Seguridad', note: 'la puerta y la llave', items: [
    { n: 'Vaultwarden', d: 'Gestor de contraseñas', c: 'amber', m: () => `${Math.round(rnd(30, 40))} MB` },
    { n: 'AdGuard Home', d: 'DNS local y bloqueo', c: 'green', m: () => `${rnd(14, 22).toFixed(1)} % bloq.` },
    { n: 'VPN', d: 'Malla privada para administrar', c: 'blue', m: () => '4 nodos' },
  ] },
  { name: 'Automatización', note: 'trabaja de noche', items: [
    { n: 'n8n', d: 'Flujos programados', c: 'rose', m: () => `${Math.round(rnd(8, 11))} flujos` },
    { n: 'Home Assistant', d: 'Domótica', c: 'teal', m: () => `${rnd(20.5, 22.5).toFixed(1)} °C` },
    { n: 'gcal-sync', d: 'vdirsyncer, cada minuto', c: 'violet', m: () => `${(2140 + Math.floor(Date.now() / 60000) % 900).toLocaleString('es-ES')} ciclos` },
  ] },
  { name: 'Plataforma', note: 'lo que no se ve', wide: true, items: [
    { n: 'Caddy', d: 'TLS, zstd y cabeceras', c: 'green', m: () => `${Math.round(rnd(3, 9))} ms` },
    { n: 'Túnel', d: 'Saliente, 0 puertos abiertos', c: 'amber', m: () => '4 conex.' },
    { n: 'Dockge', d: 'Pilas de Compose', c: 'blue', m: () => '17 pilas' },
    { n: 'Arcane', d: 'Inventario de contenedores', c: 'teal', m: () => '31 / 31' },
    { n: 'Homepage', d: 'Este panel, con diseño propio', c: 'rose', m: () => 'v1' },
    { n: 'Syncthing', d: 'Equipos de casa, versionado', c: 'violet', m: () => 'al día' },
  ] },
  { name: 'Copias', note: 'domingo, 04:00', items: [
    { n: 'Zerobyte', d: 'restic cifrado y deduplicado', c: 'amber', m: () => '3 trabajos' },
    { n: 'Volcados', d: '5 bases de datos, 03:30', c: 'teal', m: () => '5 / 5' },
  ] },
];

/* ------------------------------------------------------------------ panel */

const STATS = [
  { k: 'CPU', unit: '%', base: 6, jitter: 3, max: 100, dec: 0, hint: '6 núcleos' },
  { k: 'Memoria', unit: 'GB', base: 21.4, jitter: .4, max: 32, hint: 'casi todo es caché' },
  { k: 'Pool', unit: '%', base: 37.2, jitter: .02, max: 100, hint: 'espejo de 2 discos' },
  { k: 'Red', unit: 'MB/s', base: 2.4, jitter: 2, max: 120, hint: 'entrada' },
  { k: 'Temperatura', unit: '°C', base: 47, jitter: 1.5, max: 90, dec: 0, hint: 'CPU' },
  { k: 'En marcha', unit: 'días', base: 12.6, jitter: 0, max: 30, drift: 1.5 / 86400, hint: 'desde la última actualización' },
];
const series = STATS.map(s => Array.from({ length: 40 }, () => Math.max(0, s.base + rnd(-s.jitter, s.jitter))));

function renderStats() {
  $('#stats').innerHTML = STATS.map((s, i) => `
    <div class="stat glass spot" data-stat="${i}">
      <div class="k"><span>${s.k}</span><span>${s.hint}</span></div>
      <div class="v"><span class="num">0</span><small>${s.unit}</small></div>
      <svg viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true"><path class="area"/><path class="spark"/></svg>
    </div>`).join('');
  tickStats();
}

function tickStats() {
  STATS.forEach((s, i) => {
    const arr = series[i];
    const last = arr[arr.length - 1];
    const next = s.drift ? last + s.drift : clamp(last + rnd(-s.jitter, s.jitter) * .6 + (s.base - last) * .15, 0, s.max);
    arr.push(next);
    arr.shift();
    const box = $(`[data-stat="${i}"]`);
    const dec = s.dec ?? 1;
    box.querySelector('.num').textContent = next.toLocaleString('es-ES', { maximumFractionDigits: dec, minimumFractionDigits: dec });
    const lo = Math.min(...arr), hi = Math.max(...arr), span = Math.max(hi - lo, s.jitter * 2 || 1);
    const pts = arr.map((v, j) => `${(j / (arr.length - 1)) * 200},${32 - ((v - lo) / span) * 28}`);
    box.querySelector('.spark').setAttribute('d', `M${pts.join('L')}`);
    box.querySelector('.area').setAttribute('d', `M0,34L${pts.join('L')}L200,34Z`);
  });
}

function renderGroups() {
  let i = 0;
  $('#groups').innerHTML = GROUPS.map(g => `
    <section class="group glass spot ${g.wide ? 'wide' : ''}">
      <h3>${g.name}<span>${g.note}</span></h3>
      <div class="cards">${g.items.map(s => {
        const [c1, c2] = PALETTE[s.c];
        return `<article class="card" data-name="${fold(`${g.name} ${s.n} ${s.d}`)}" data-vars="--i=${i++};--c1=${c1};--c2=${c2}">
          <span class="ico" aria-hidden="true">${s.n[0]}</span>
          <span><b>${s.n}</b><span class="d">${s.d}</span></span>
          <span class="m"><span class="mv">${s.m()}</span><span class="dot" title="En línea"></span></span>
        </article>`;
      }).join('')}</div>
    </section>`).join('') + '<p class="empty" id="empty" hidden>Ningún servicio coincide.</p>';
  applyVars($('#groups'));
  for (const c of $$('.card')) c.addEventListener('animationend', () => c.classList.add('in'), { once: true });
}

const ITEMS = GROUPS.flatMap(g => g.items);

function tickCards() {
  $$('.card .mv').forEach((el, i) => { el.textContent = ITEMS[i].m(); });
}

function filterCards(q) {
  q = fold(q.trim());
  let shown = 0;
  for (const g of $$('.group')) {
    let any = false;
    for (const c of $$('.card', g)) {
      const hit = !q || c.dataset.name.includes(q);
      c.hidden = !hit;
      any ||= hit;
      shown += hit;
    }
    g.hidden = !any;
  }
  $('#empty').hidden = shown > 0;
}

function greet() {
  const h = new Date().getHours();
  $('.hero .eyebrow').textContent = h < 7 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
}

/* ------------------------------------------------------------------ red */

const NODES = {
  user: { x: 35, y: 252, w: 140, t: 'Cliente', s: 'navegador o móvil' },
  edge: { x: 225, y: 252, w: 140, t: 'Borde', s: 'TLS y filtrado' },
  router: { x: 420, y: 70, w: 150, t: 'Router', s: '0 puertos abiertos' },
  tunnel: { x: 420, y: 252, w: 150, t: 'Túnel', s: 'conexión saliente' },
  lan: { x: 420, y: 392, w: 150, t: 'Equipo en casa', s: 'portátil, móvil' },
  vpn: { x: 420, y: 480, w: 150, t: 'VPN', s: 'malla privada' },
  adguard: { x: 610, y: 392, w: 140, t: 'AdGuard', s: 'reescribe a IP local' },
  caddy: { x: 610, y: 252, w: 140, t: 'Caddy', s: 'TLS y compresión' },
};
const SERVICES = [
  { id: 'nextcloud', t: 'Nube', db: 'Base de datos + caché', net: 'red propia', pub: true },
  { id: 'immich', t: 'Fotos', db: 'Base de datos + ML', net: 'red propia', pub: true },
  { id: 'vault', t: 'Contraseñas', db: 'Base de datos', net: 'solo VPN', pub: false },
  { id: 'n8n', t: 'Automatización', db: 'Base de datos + caché', net: 'solo VPN', pub: false },
  { id: 'web', t: 'Web', db: null, net: 'red propia', pub: true },
  { id: 'dockge', t: 'Administración', db: null, net: 'solo VPN', pub: false },
];
SERVICES.forEach((s, i) => {
  NODES[s.id] = { x: 830, y: 46 + i * 84, w: 150, t: s.t, s: s.net, svc: true };
  if (s.db) NODES[s.id + '-db'] = { x: 1010, y: 46 + i * 84, w: 160, t: s.db, s: 'sin puertos' };
});
const H = 52;

const ORIGINS = {
  fuera: { path: ['user', 'edge', 'tunnel', 'caddy'], title: 'Desde internet',
    text: 'La petición llega al borde, baja por el túnel que el propio NAS abrió hacia fuera y entra en Caddy. El router no tiene ningún puerto abierto: no hay nada que escanear.' },
  casa: { path: ['lan', 'adguard', 'caddy'], title: 'Desde casa',
    text: 'AdGuard responde al dominio con la IP local del NAS. El documento de la habitación de al lado no sale a internet, y el certificado sigue siendo válido.' },
  vpn: { path: ['user', 'vpn', 'caddy'], title: 'Por la VPN',
    text: 'Lo que no debe ser público, como la gestión de contenedores, solo se alcanza por la malla privada. Ningún nombre de host en el túnel apunta a ello.' },
};

const EDGES = [
  ['user', 'edge'], ['edge', 'tunnel'], ['tunnel', 'caddy'], ['lan', 'adguard'], ['adguard', 'caddy'],
  ['user', 'vpn'], ['vpn', 'caddy'],
  ...SERVICES.map(s => ['caddy', s.id]),
  ...SERVICES.flatMap(s => s.db ? [[s.id, s.id + '-db']] : []),
];

let origin = 'fuera';
let selected = 'nextcloud';
let packetRaf = 0;

function edgePath(a, b) {
  const A = NODES[a], B = NODES[b];
  if (Math.abs(A.x - B.x) < 5) { // misma columna: de arriba abajo
    const up = B.y < A.y;
    const x = A.x + A.w / 2;
    const y1 = up ? A.y : A.y + H, y2 = up ? B.y + H : B.y;
    return `M${x},${y1}L${x},${y2}`;
  }
  const x1 = A.x + A.w, y1 = A.y + H / 2, x2 = B.x, y2 = B.y + H / 2, mx = (x1 + x2) / 2;
  return `M${x1},${y1}C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}

function renderNet() {
  const svg = $('#net');
  const zones = [
    { x: 18, y: 26, w: 174, h: 516, l: 'Internet' },
    { x: 208, y: 26, w: 174, h: 516, l: 'Borde' },
    { x: 400, y: 26, w: 782, h: 516, l: 'Casa · NAS' },
  ];
  const nets = SERVICES.map((s, i) => `<rect class="netbox" x="818" y="${34 + i * 84}" width="${s.db ? 364 : 174}" height="78"/><text class="netlabel" x="${s.db ? 1172 : 982}" y="${108 + i * 84}" text-anchor="end">${s.net}</text>`);
  svg.innerHTML = `<title id="net-title">Diagrama de red del servidor</title>
    ${zones.map(z => `<rect class="zone" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}"/><text class="zlabel" x="${z.x + 14}" y="${z.y + 22}">${z.l}</text>`).join('')}
    ${nets.join('')}
    ${EDGES.map(([a, b]) => `<path class="edge" data-e="${a}>${b}" d="${edgePath(a, b)}"/>`).join('')}
    ${Object.entries(NODES).map(([id, n]) => `<g class="node${n.svc ? ' svc' : ''}" data-n="${id}" ${n.svc ? 'tabindex="0" role="button" aria-pressed="false"' : ''}>
      <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${H}"/>
      <text x="${n.x + 14}" y="${n.y + 22}">${n.t}</text>
      <text class="s" x="${n.x + 14}" y="${n.y + 39}">${n.s}</text></g>`).join('')}
    <circle class="packet" r="5" cx="-20" cy="-20"/>`;
  for (const g of $$('.node.svc', svg)) {
    const pick = () => { selected = g.dataset.n; route(); };
    g.addEventListener('click', pick);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  }
  route();
}

function route() {
  const svc = SERVICES.find(s => s.id === selected);
  const allowed = svc.pub || origin === 'vpn';
  const o = ORIGINS[origin];
  const hops = allowed ? [...o.path, svc.id, ...(svc.db ? [svc.id + '-db'] : [])] : base;
  const pairs = new Set(hops.slice(1).map((b, i) => `${hops[i]}>${b}`));
  for (const e of $$('#net .edge')) {
    const on = pairs.has(e.dataset.e);
    e.classList.toggle('on', on);
    e.classList.toggle('off', !on);
  }
  for (const n of $$('#net .node')) {
    const on = hops.includes(n.dataset.n);
    n.classList.toggle('on', on);
    n.classList.toggle('off', !on && n.dataset.n !== 'router');
    if (n.classList.contains('svc')) n.setAttribute('aria-pressed', n.dataset.n === selected);
  }
  $('#net-info').innerHTML = `
    <div class="glass"><h4>${o.title}</h4><p>${o.text}</p></div>
    <div class="glass"><h4>${svc.t}</h4><p>${allowed
      ? `Vive en su propia red. ${svc.db ? `Su ${svc.db.toLowerCase()} solo existe dentro de esa red y no publica puertos.` : 'No tiene base de datos propia.'} Ninguna otra aplicación lo ve.`
      : 'No está publicado en el túnel ni en el DNS local. Desde aquí la petición se queda en Caddy: prueba por la VPN.'}</p></div>
    <div class="glass"><h4>${hops.length} saltos</h4><p>${hops.map(h => NODES[h].t).join(' → ')}</p></div>`;
  animatePacket(hops);
}

function animatePacket(hops) {
  cancelAnimationFrame(packetRaf);
  const dot = $('#net .packet');
  if (reduced) { dot.setAttribute('cx', -20); return; }
  const paths = hops.slice(1).map((b, i) => $(`#net .edge[data-e="${hops[i]}>${b}"]`));
  const lens = paths.map(p => p.getTotalLength());
  const total = lens.reduce((a, b) => a + b, 0);
  const speed = .35; // px por ms
  let t0 = 0;
  const frame = t => {
    t0 ||= t;
    let d = ((t - t0) * speed) % (total + 200);
    if (d > total) { dot.setAttribute('cx', -20); packetRaf = requestAnimationFrame(frame); return; }
    let i = 0;
    while (i < lens.length - 1 && d > lens[i]) d -= lens[i++];
    const p = paths[i].getPointAtLength(d);
    dot.setAttribute('cx', p.x);
    dot.setAttribute('cy', p.y);
    packetRaf = requestAnimationFrame(frame);
  };
  packetRaf = requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ copias */

const FREQ = { w: 'semanal', m: 'mensual' };
const dedup = (mb, gb) => `${(100 - mb / (gb * 10.24)).toFixed(1)} %`;

const JOBS = [
  { id: 'imp', name: 'Importante', when: 'Cada domingo, 04:00', freq: 'w',
    inc: ['Vaultwarden', 'Nextcloud', 'Volcados de BBDD', 'Home Assistant', 'Dockge', 'gcal-sync', 'AdGuard', 'VPN', 'Fotos originales'],
    files: 131275, sizeGB: 190.6, newMB: 640, last: '18 oct · 9 min' },
  { id: 'n8n', name: 'n8n', when: 'Cada domingo, 04:00', freq: 'w',
    inc: ['Datos de n8n', 'Sin Postgres en caliente'], files: 2874, sizeGB: .36, newMB: 11, last: '18 oct · 35 s' },
  { id: 'sec', name: 'Secundario', when: 'Primer domingo del mes, 04:00', freq: 'm',
    inc: ['OnlyOffice', 'Web personal', 'Arcane', 'Syncthing', 'AdGuard workdir'], files: 17302, sizeGB: .81, newMB: 52, last: '4 oct · 2 min' },
];

function renderCal() {
  const d = new Date();
  // Un domingo antes de las 04:00, la próxima copia es la de hoy
  const today = d.getDay() === 0 && d.getHours() < 4;
  d.setDate(d.getDate() + (today ? 0 : 7 - d.getDay()));
  const days = Array.from({ length: 8 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i * 7);
    return x;
  });
  $('#cal').innerHTML = days.map((x, i) => `
    <div class="day ${i === 0 ? 'next' : ''}">
      <div class="n">${x.getDate()}</div>
      <div class="mo">${x.toLocaleDateString('es-ES', { month: 'short' })} · 04:00</div>
      <div class="tags"><span class="tag w">${FREQ.w}</span>${x.getDate() <= 7 ? `<span class="tag m">${FREQ.m}</span>` : ''}</div>
    </div>`).join('');
}

function renderJobs() {
  $('#jobs').innerHTML = JOBS.map(j => `
    <article class="job glass spot" data-job="${j.id}">
      <header><div><h3>${j.name}</h3><div class="when">${j.when}</div></div>
        <span class="tag ${j.freq}">${FREQ[j.freq]}</span></header>
      <ul>${j.inc.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="meter">
        <div><span>Ficheros</span><b class="f">${j.files.toLocaleString('es-ES')}</b></div>
        <div><span>Datos nuevos</span><b class="nw">${j.newMB} MB</b></div>
        <div><span>Deduplicado</span><b class="dd">${dedup(j.newMB, j.sizeGB)}</b></div>
      </div>
      <div class="prog"><i></i></div>
      <div class="last">Última: <b>correcta</b> · ${j.last}</div>
      <button class="btn run">Ejecutar ahora</button>
    </article>`).join('');
  for (const b of $$('.job .run')) b.addEventListener('click', () => runJob(b.closest('.job')));
}

function runJob(card) {
  const j = JOBS.find(x => x.id === card.dataset.job);
  const btn = $('.run', card), bar = $('.prog i', card);
  btn.disabled = true;
  btn.textContent = 'Copiando...';
  const dur = reduced ? 10 : 4200, t0 = performance.now();
  const newMB = Math.round(j.newMB * rnd(.6, 1.3));
  const step = t => {
    const p = clamp((t - t0) / dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    bar.style.transform = `scaleX(${e})`;
    $('.f', card).textContent = Math.round(j.files * e).toLocaleString('es-ES');
    $('.nw', card).textContent = `${Math.round(newMB * e)} MB`;
    $('.dd', card).textContent = dedup(newMB * e, j.sizeGB);
    if (p < 1) return requestAnimationFrame(step);
    btn.disabled = false;
    btn.textContent = 'Ejecutar ahora';
    $('.last', card).innerHTML = `Última: <b>correcta</b> · ahora mismo · ${newMB} MB nuevos`;
    toast(`Copia "${j.name}" terminada: ${newMB} MB nuevos de ${j.sizeGB.toLocaleString('es-ES')} GB`);
  };
  requestAnimationFrame(step);
}

const snaps = [
  { n: '11 oct', s: 'primera completa', delta: 100 },
  { n: '18 oct', s: '+ 640 MB', delta: 3 },
];
const week = new Date(2026, 9, 18);

function renderSlots(entering = false) {
  $('#slots').innerHTML = snaps.map((x, i) => `
    <div class="snap ${entering && i === snaps.length - 1 ? 'enter' : ''}">
      <div class="n">${x.n}</div><div class="s">${x.s}</div>
      <div class="delta"><i data-vars="width=${x.delta}%"></i></div>
    </div>`).join('') + '<div class="snap ghost">la próxima ocupa este hueco y la más antigua se va</div>';
  applyVars($('#slots'));
}

function stepRetention() {
  const btn = $('#ret-step');
  btn.disabled = true;
  $('#slots .snap').classList.add('leave');
  setTimeout(() => {
    week.setDate(week.getDate() + 7);
    const mb = Math.round(rnd(300, 1400));
    snaps.shift();
    snaps.push({ n: week.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), s: `+ ${mb.toLocaleString('es-ES')} MB`, delta: Math.max(2, Math.round(mb / 250)) });
    renderSlots(true);
    btn.disabled = false;
  }, reduced ? 0 : 420);
}

/* ------------------------------------------------------------------ bitácora */

const LOG = [
  { d: '2026-10-20', k: 'cambio', t: 'Syncthing para los equipos de casa',
    w: 'Carpetas de otros equipos en modo solo envío hacia el NAS, con versionado escalonado y solo en LAN.', b: 'Parar la app y borrar su conjunto de datos. Ningún equipo depende de ella.' },
  { d: '2026-10-19', k: 'cambio', t: 'openGym: instalado y retirado',
    w: 'Publicado con certificado real, DNS local y tarjeta en el panel. Retirado esa tarde con todo: red, imágenes, datos y certificado guardado.', b: 'No aplica: ya está fuera y se comprobó que no queda ninguna mención.' },
  { d: '2026-10-18', k: 'cambio', t: 'Simulacro de restauración',
    w: 'Volcado de Nextcloud en un Postgres efímero, Vaultwarden en un contenedor aparte y una carpeta de fotos comparada por SHA-256. Todo idéntico. 38 minutos.', b: 'Borrar los contenedores efímeros. No tocan nada vivo.' },
  { d: '2026-10-11', k: 'cambio', t: 'Primera copia semanal real',
    w: 'Subió por primera vez los 186 GB de fotos originales. Varias horas. Las siguientes, minutos.', b: '<code>restic forget</code> sobre la instantánea, si hiciera falta.' },
  { d: '2026-10-04', k: 'incidente', t: 'Dieciocho descargas a la vez',
    w: 'Las actualizaciones en paralelo saturaron los discos: el panel cayó y Docker dejó de responder bien. Se esperó sin lanzar nada más y se aplicó pila a pila.', b: 'Imágenes antiguas conservadas unos días para volver a cualquier versión.' },
  { d: '2026-10-04', k: 'incidente', t: 'Tres de ocho peticiones dieron 500',
    w: 'Al retirar la clave vieja de Valkey, Nextcloud aún la leía desde otro fichero. Clave vieja restaurada en segundos; segundo intento con 30 de 30 correctas y 113 sesiones intactas.', b: 'Volver a añadir la clave vieja a Valkey: las dos conviven.' },
  { d: '2026-10-04', k: 'seguridad', t: 'Secreto rotado sin cortes',
    w: 'La clave de caché sale del <code>compose.yaml</code> a un fichero 600. Aparece que era la misma que la de la base de datos y la del administrador: todo rotado.', b: 'Copia de la configuración previa en una carpeta privada, borrada al confirmar.' },
  { d: '2026-10-04', k: 'cambio', t: 'Actualización general',
    w: '31 imágenes, entre ellas Nextcloud, Immich (con salto de versión mayor), n8n, Postgres y Valkey. Cada una con volcado fresco antes.', b: 'Etiqueta anterior en el compose y volcado de la base de datos.' },
  { d: '2026-10-04', k: 'cambio', t: 'Cuatro aplicaciones y 24 GB fuera',
    w: 'Cloudreve, WhoDB, Adminer y Homelable con su proxy, red, DNS, datos y tarjeta. Imágenes residuales de Jellyfin y otras. Docker de 43,2 a 19 GB.', b: 'No aplica: se retiraron a propósito y sin uso.' },
  { d: '2026-10-04', k: 'cambio', t: 'Copias programadas y probadas',
    w: 'Volcado de 5 bases de datos a las 03:30 y tres trabajos de restic a las 04:00 con retención de 2. Los tres ejecutados una vez para validar.', b: 'Desactivar las programaciones en Zerobyte.' },
  { d: '2026-10-04', k: 'incidente', t: 'La web que nadie veía',
    w: '502 desde fuera durante semanas: el túnel y la web estaban en redes distintas. 136.000 errores en el log. Red conectada en caliente y fijada en el compose.', b: '<code>docker network disconnect</code>, aunque no tendría sentido.' },
  { d: '2026-10-01', k: 'cambio', t: 'Google y Nextcloud, en los dos sentidos',
    w: 'vdirsyncer en un contenedor, cada minuto, con calendarios nuevos para no mezclar nada. 79 de 81 eventos en la primera pasada.', b: 'Parar <code>gcal-sync</code> y borrar los dos calendarios emparejados. Los originales no se tocaron.' },
  { d: '2026-10-01', k: 'seguridad', t: 'Una cuenta de correo iba en claro',
    w: 'IMAP 143 y SMTP 25 sin TLS contra IPs públicas. Pasada a 993 y 587 tras comprobar el certificado, y contraseña cambiada.', b: 'No aplica: volver atrás sería volver a enviar la contraseña en claro.' },
  { d: '2026-10-01', k: 'cambio', t: 'SnappyMail en lugar de Mail',
    w: 'IMAP en vivo dentro de Nextcloud, varias cuentas, firmas por identidad, autocompletado y tema Atelier.', b: 'Reactivar la app Mail; las cuentas viven en los servidores de correo.' },
  { d: '2026-10-01', k: 'cambio', t: 'Rendimiento sin comprar nada',
    w: 'Compresión en Caddy (28,9 a 5,1 MB por apertura), cron cada minuto, OPcache a 256 MB, Postgres sin commit síncrono, OnlyOffice por red interna.', b: '<code>ALTER SYSTEM RESET ALL</code> en Postgres y Caddyfile previo.' },
];

const KIND = { cambio: 'Cambio', incidente: 'Incidente', seguridad: 'Seguridad' };

function renderLog(kind = 'todo') {
  $('#log').innerHTML = LOG.filter(e => kind === 'todo' || e.k === kind).map(e => `
    <li class="entry glass ${e.k}">
      <button aria-expanded="false">
        <span class="date">${new Date(`${e.d}T00:00`).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <span class="t">${e.t}</span>
        <span class="kind">${KIND[e.k]}</span>
      </button>
      <div class="body"><div><div class="inner">
        <div><h5>Qué</h5><p>${e.w}</p></div>
        <div><h5>Vuelta atrás</h5><p>${e.b}</p></div>
      </div></div></div>
    </li>`).join('');
  for (const b of $$('#log .entry button')) {
    b.addEventListener('click', () => {
      const li = b.parentElement, open = !li.classList.contains('open');
      li.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
    });
  }
}

/* ------------------------------------------------------------------ navegación */

function show(view) {
  if (!VIEWS.includes(view)) view = 'panel';
  for (const t of $$('.tabs button')) {
    const on = t.dataset.view === view;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
  }
  for (const v of $$('.view')) {
    const on = v.id === `v-${view}`;
    v.hidden = !on;
    v.classList.toggle('active', on);
  }
  if (view === 'red') route();
  else cancelAnimationFrame(packetRaf);
  try { localStorage.setItem('kura-view', view); } catch {}
}

function segmented(container, attr, onPick) {
  const btns = $$('button', container);
  const pick = b => {
    for (const x of btns) {
      x.setAttribute('aria-checked', x === b);
      x.tabIndex = x === b ? 0 : -1;
    }
    onPick(b.dataset[attr]);
  };
  btns.forEach((b, i) => {
    b.tabIndex = i ? -1 : 0;
    b.addEventListener('click', () => pick(b));
  });
  arrows(container, btns, b => { pick(b); b.focus(); });
}

// Flechas, Inicio y Fin dentro de un grupo de pestañas o de radios (patrón ARIA)
function arrows(container, items, go) {
  container.addEventListener('keydown', e => {
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const n = items.length;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    go(items[to % n]);
  });
}

function init() {
  renderStats();
  renderGroups();
  renderNet();
  renderCal();
  renderJobs();
  renderSlots();
  renderLog();
  greet();

  const tabs = $$('.tabs button');
  for (const t of tabs) t.addEventListener('click', () => show(t.dataset.view));
  arrows($('.tabs'), tabs, t => { show(t.dataset.view); t.focus(); });
  segmented($('#v-red .seg'), 'origin', o => { origin = o; route(); });
  segmented($('#log-filter'), 'kind', renderLog);
  $('#q').addEventListener('input', e => filterCards(e.target.value));
  $('#ret-step').addEventListener('click', stepRetention);

  document.addEventListener('keydown', e => {
    if (e.target.matches('input')) {
      if (e.key === 'Escape') { e.target.value = ''; filterCards(''); e.target.blur(); }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key >= '1' && e.key <= '4') show(VIEWS[e.key - 1]);
    if (e.key === '/') { e.preventDefault(); show('panel'); $('#q').focus(); }
  });

  document.addEventListener('pointermove', e => {
    const el = e.target.closest?.('.spot');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  const clock = () => { $('#clock').textContent = new Date().toLocaleTimeString('es-ES'); };
  clock();
  setInterval(clock, 1000);
  const panelVisible = () => !$('#v-panel').hidden;
  setInterval(() => panelVisible() && tickStats(), 1500);
  setInterval(() => panelVisible() && tickCards(), 5000);

  let saved = 'panel';
  try { saved = localStorage.getItem('kura-view') || 'panel'; } catch {}
  show(saved);
}

init();
