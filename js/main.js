(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Header
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const btn = $('.menu-btn'), list = $('.nav ul');
  btn.addEventListener('click', () => btn.setAttribute('aria-expanded', list.classList.toggle('open')));
  list.addEventListener('click', e => { if (e.target.closest('a')) { list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });

  // Hero-Video (wie auf der alten Seite): nur ohne Bewegungs- und Datensparwunsch
  const hero = $('.hero[data-video]');
  const saver = (navigator.connection && navigator.connection.saveData) || matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (hero && !saver) {
    const id = hero.dataset.video, box = $('.hero-video', hero), f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1&disablekb=1`;
    f.title = ''; f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.allow = 'autoplay; encrypted-media'; f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.addEventListener('load', () => setTimeout(() => box.classList.add('on'), 1500));
    box.appendChild(f);
  }

  // Lightbox
  const dlg = $('dialog.lb'), items = $$('.gallery button');
  let idx = 0;
  const show = i => {
    idx = (i + items.length) % items.length; const b = items[idx];
    $('img', dlg).src = b.dataset.full; $('img', dlg).alt = $('img', b).alt; $('p', dlg).textContent = b.dataset.caption;
  };
  if (dlg) {
    items.forEach((b, i) => b.addEventListener('click', () => { show(i); dlg.showModal(); }));
    $('.prev', dlg).addEventListener('click', () => show(idx - 1));
    $('.next', dlg).addEventListener('click', () => show(idx + 1));
    $('.close', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  }

  // Daten: Minimum heute, Abreise nach Anreise
  const iso = d => d.toISOString().slice(0, 10);
  const today = iso(new Date());
  const pair = (a, b) => {
    a.min = today;
    a.addEventListener('change', () => { b.min = a.value || today; if (b.value && b.value <= a.value) b.value = ''; });
  };
  const qa = $('#q-an'), qb = $('#q-ab'), fa = $('#f-an'), fb = $('#f-ab');
  if (qa) { pair(qa, qb); pair(fa, fb); }

  // Preisrechner
  const eur = n => n.toLocaleString('de-DE') + ' €';
  const n = $('#c-n'), p = $('#c-p'), b = $('#c-b'), d = $('#c-d');
  const calc = () => {
    const nights = Math.max(1, Math.min(60, +n.value || 1)), pers = +p.value, sets = Math.max(0, Math.min(6, +b.value || 0));
    const extra = Math.max(0, pers - 2), base = nights * 50, add = nights * extra * 15, clean = 30, bed = sets * 5, dog = d.checked ? 25 : 0;
    const lines = [[`${nights} ${nights === 1 ? 'Nacht' : 'Nächte'} × 50 €`, base]];
    if (extra) lines.push([`${extra} weitere ${extra === 1 ? 'Person' : 'Personen'} × ${nights} × 15 €`, add]);
    lines.push(['Endreinigung', clean]);
    if (bed) lines.push([`Bettwäsche ${sets} × 5 €`, bed]);
    if (dog) lines.push(['Hund pauschal', dog]);
    $('#c-l').innerHTML = lines.map(([t, v]) => `<li><span>${t}</span><span>${eur(v)}</span></li>`).join('');
    $('#c-t').textContent = eur(base + add + clean + bed + dog);
    return { nights, pers, sets, total: base + add + clean + bed + dog };
  };
  if (n) { [n, p, b, d].forEach(el => el.addEventListener('input', calc)); calc(); }

  // Schnellanfrage -> Formular
  const quick = $('#quick');
  if (quick) quick.addEventListener('submit', e => {
    e.preventDefault();
    fa.value = qa.value; fb.min = qa.value || today; fb.value = qb.value; $('#f-pe').value = $('#q-pe').value;
    location.hash = '#anfrage';
    setTimeout(() => (qa.value ? $('#f-na') : fa).focus({ preventScroll: true }), 400);
  });

  // Anfrage: öffnet das E-Mail-Programm
  const form = $('#anfrage-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const body = ['Buchungsanfrage Ferienwohnung Harzberge.de', '',
      `Anreise: ${f.anreise}`, `Abreise: ${f.abreise}`, `Personen: ${f.personen}`, `Hund: ${f.hund}`, '',
      `Name: ${f.name}`, `E-Mail: ${f.email}`, `Telefon: ${f.telefon || '-'}`, '', f.nachricht || ''].join('\n');
    location.href = 'mailto:info@harzberge.de?subject=' + encodeURIComponent(`Buchungsanfrage ${f.anreise} – ${f.abreise}`) + '&body=' + encodeURIComponent(body);
  });
})();
