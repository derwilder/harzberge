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
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = iso(new Date());
  const pair = (a, b) => {
    a.min = today;
    a.addEventListener('change', () => { b.min = a.value || today; if (b.value && b.value <= a.value) b.value = ''; });
  };
  const qa = $('#q-an'), qb = $('#q-ab'), fa = $('#f-an'), fb = $('#f-ab');
  if (qa) { pair(qa, qb); pair(fa, fb); }

  // Belegungskalender: liest data/belegung.json (täglich von Harz-Travel abgeglichen)
  const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const days = {};
  const pad = x => String(x).padStart(2, '0');
  const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  // belegt ist ein Tag, wenn die Nacht davor/danach nicht frei ist: 'b' ganz, 'a' ab Anreise, 'w' Wechsel
  const nightBusy = k => { const v = days[k]; return v === 'b' || v === 'a' || v === 'w'; };
  const rangeFree = (a, b) => {
    for (let t = new Date(a + 'T12:00'); iso(t) < b; t.setDate(t.getDate() + 1)) if (nightBusy(iso(t))) return false;
    return true;
  };
  const calEl = $('#cal');
  if (calEl) {
    const box = $('#cal-months'); let start = new Date(); start.setDate(1);
    const render = () => {
      const w = matchMedia('(min-width:560px)').matches ? 2 : 1; box.innerHTML = '';
      for (let i = 0; i < w; i++) {
        const dt = new Date(start.getFullYear(), start.getMonth() + i, 1), y = dt.getFullYear(), m = dt.getMonth();
        const lead = (dt.getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
        let g = '';
        for (let k = 0; k < lead; k++) g += '<span></span>';
        for (let d = 1; d <= n; d++) {
          const k = key(y, m, d), v = days[k], past = k < today;
          const cls = past ? 'past' : v === 'b' ? 'busy' : v === 'a' || v === 'd' || v === 'w' ? 'half' : 'free';
          const label = past ? '' : v === 'b' ? 'belegt' : v ? 'Wechseltag' : 'frei';
          g += `<button type="button" class="day ${cls}" data-d="${k}" ${past || v === 'b' ? 'disabled' : ''} aria-label="${d}. ${MON[m]} ${y} ${label}">${d}</button>`;
        }
        box.insertAdjacentHTML('beforeend', `<div class="cal-m"><h4>${MON[m]} ${y}</h4><div class="cal-wd"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div><div class="cal-g">${g}</div></div>`);
      }
      paint();
    };
    const paint = () => {
      const a = fa.value, b = fb.value;
      $$('.day', box).forEach(el => { const k = el.dataset.d; el.classList.toggle('sel', k === a || k === b); el.classList.toggle('in', !!(a && b && k > a && k < b)); });
    };
    $('.prev', calEl).addEventListener('click', () => { const p = new Date(start.getFullYear(), start.getMonth() - 1, 1); if (iso(p) >= today.slice(0, 8) + '01') { start = p; render(); } });
    $('.next', calEl).addEventListener('click', () => { start.setMonth(start.getMonth() + 1); render(); });
    box.addEventListener('click', e => {
      const el = e.target.closest('.day'); if (!el) return; const k = el.dataset.d;
      if (!fa.value || (fa.value && fb.value) || k <= fa.value) { fa.value = k; fb.value = ''; fb.min = k; }
      else { fb.value = k; }
      paint(); checkRange();
      if (fb.value) $('#anfrage').scrollIntoView({ behavior: 'smooth' });
    });
    addEventListener('resize', render);
    [fa, fb].forEach(el => el.addEventListener('change', paint));
    fetch('data/belegung.json').then(r => r.json()).then(d => {
      Object.assign(days, d.tage);
      const s = new Date(d.stand); if (!isNaN(s)) $('#cal-stand').textContent = `Tag anklicken, um Anreise und Abreise zu wählen. Stand: ${s.toLocaleDateString('de-DE')}, übernommen von Harz-Travel.`;
      render(); checkRange();
    }).catch(() => { box.innerHTML = '<p class="muted">Der Kalender ist gerade nicht erreichbar. Bitte fragen Sie Ihren Wunschtermin einfach an.</p>'; });
  }

  // Wunschzeitraum prüfen (belegte Nächte)
  const warn = $('#f-warn');
  function checkRange() {
    if (!warn) return true;
    const bad = fa.value && fb.value && !rangeFree(fa.value, fb.value);
    warn.hidden = !bad;
    warn.textContent = bad ? 'In diesem Zeitraum ist die Wohnung laut Kalender bereits belegt. Bitte wählen Sie andere Daten.' : '';
    return !bad;
  }
  [fa, fb].forEach(el => el && el.addEventListener('change', checkRange));

  // Schnellanfrage -> Formular
  const quick = $('#quick');
  if (quick) quick.addEventListener('submit', e => {
    e.preventDefault();
    fa.value = qa.value; fb.min = qa.value || today; fb.value = qb.value; $('#f-pe').value = $('#q-pe').value;
    checkRange(); location.hash = '#anfrage';
    setTimeout(() => (qa.value ? $('#f-na') : fa).focus({ preventScroll: true }), 400);
  });

  // Anfrage: wird als normales Formular an das Buchungsportal Harz-Travel gesendet (neuer Tab)
  const form = $('#anfrage-form');
  if (form) form.addEventListener('submit', e => {
    const de = v => v.split('-').reverse().join('.');
    if (!form.reportValidity() || !checkRange()) { e.preventDefault(); return; }
    $('#h-an').value = de(fa.value); $('#h-ab').value = de(fb.value); $('#f-zr').value = `${de(fa.value)} - ${de(fb.value)}`;
  });
})();
