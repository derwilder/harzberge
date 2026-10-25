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

  // Hero-Video: eigenes Video (kein Drittanbieter), startet automatisch nur bei schnellem Netz, ohne Datensparmodus/reduzierte Bewegung, am Desktop
  const vid = $('.hero-video video'), cn = navigator.connection || {};
  const okVideo = vid && matchMedia('(min-width:861px)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches
    && !cn.saveData && (!cn.effectiveType || cn.effectiveType === '4g');
  if (okVideo) {
    const start = () => {
      vid.src = vid.dataset.src;
      vid.addEventListener('playing', () => vid.parentNode.classList.add('on'), { once: true });
      vid.play().catch(() => {});
    };
    if (document.readyState === 'complete') setTimeout(start, 300); else addEventListener('load', () => setTimeout(start, 300));
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
  const lang = document.documentElement.lang || 'de', base = lang === 'de' ? '' : '../';
  const TX = {
    de: { mon: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'], wd: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], busy: 'belegt', swap: 'Wechseltag', free: 'frei', loc: 'de-DE',
      hint: 'Tag anklicken, um Anreise und Abreise zu wählen.', stand: 'Stand', from: 'übernommen von Harz-Travel', down: 'Der Kalender ist gerade nicht erreichbar. Bitte fragen Sie Ihren Wunschtermin einfach an.', bad: 'In diesem Zeitraum ist die Wohnung laut Kalender bereits belegt. Bitte wählen Sie andere Daten.',
      q: { empty: 'Wählen Sie Anreise und Abreise, dann sehen Sie hier sofort Ihren Preis.', night: 'Nacht', nights: 'Nächte', extra: n => `${n} weitere ${n === 1 ? 'Person' : 'Personen'}`, short: 'Kurzurlaub-Zuschlag (bis 2 Nächte)', clean: 'Endreinigung', dog: n => n === 1 ? 'Hund' : `${n} Hunde`, bed: n => `Bettwäsche, ${n} ${n === 1 ? 'Satz' : 'Sätze'}`, total: 'Gesamtpreis', note: 'Unverbindliche Berechnung. Kinderreisebett und Kinderhochstuhl stellen wir kostenlos. Den endgültigen Preis bestätigen wir mit unserer Antwort.', pick: (a, b, p, k) => `${a} bis ${b}, ${p} ${p === 1 ? 'Person' : 'Personen'}${k ? `, davon ${k} ${k === 1 ? 'Kind' : 'Kinder'}` : ''}`, order: 'Nächte' } },
    en: { mon: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], wd: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], busy: 'booked', swap: 'changeover day', free: 'free', loc: 'en-GB',
      hint: 'Click a day to choose arrival and departure.', stand: 'Updated', from: 'taken from Harz-Travel', down: 'The calendar is currently unavailable. Please simply enquire about your preferred dates.', bad: 'According to the calendar, the apartment is already booked in this period. Please choose other dates.',
      q: { empty: 'Choose arrival and departure and your price appears here instantly.', night: 'night', nights: 'nights', extra: n => `${n} additional ${n === 1 ? 'guest' : 'guests'}`, short: 'Short-stay surcharge (up to 2 nights)', clean: 'Final cleaning', dog: n => n === 1 ? 'Dog' : `${n} dogs`, bed: n => `Bed linen, ${n} ${n === 1 ? 'set' : 'sets'}`, total: 'Total price', note: 'Non-binding calculation. Cot and high chair are free of charge. We confirm the final price in our reply.', pick: (a, b, p, k) => `${a} to ${b}, ${p} ${p === 1 ? 'guest' : 'guests'}${k ? `, of which ${k} ${k === 1 ? 'child' : 'children'}` : ''}` } },
    es: { mon: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'], wd: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'], busy: 'ocupado', swap: 'día de cambio', free: 'libre', loc: 'es-ES',
      hint: 'Haga clic en un día para elegir llegada y salida.', stand: 'Actualizado', from: 'procede de Harz-Travel', down: 'El calendario no está disponible en este momento. Envíenos su consulta con las fechas deseadas.', bad: 'Según el calendario, el apartamento ya está ocupado en este periodo. Elija otras fechas.',
      q: { empty: 'Elija llegada y salida y aquí verá su precio al instante.', night: 'noche', nights: 'noches', extra: n => `${n} ${n === 1 ? 'persona adicional' : 'personas adicionales'}`, short: 'Suplemento de estancia corta (hasta 2 noches)', clean: 'Limpieza final', dog: n => n === 1 ? 'Perro' : `${n} perros`, bed: n => `Ropa de cama, ${n} ${n === 1 ? 'juego' : 'juegos'}`, total: 'Precio total', note: 'Cálculo sin compromiso. Cuna y trona son gratuitas. Confirmaremos el precio final en nuestra respuesta.', pick: (a, b, p, k) => `${a} a ${b}, ${p} ${p === 1 ? 'persona' : 'personas'}${k ? `, de ellos ${k} ${k === 1 ? 'niño' : 'niños'}` : ''}` } }
  }[lang];
  const MON = TX.mon;
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
          const label = past ? '' : v === 'b' ? TX.busy : v ? TX.swap : TX.free;
          g += `<button type="button" class="day ${cls}" data-d="${k}" ${past || v === 'b' ? 'disabled' : ''} aria-label="${d} ${MON[m]} ${y} ${label}">${d}</button>`;
        }
        box.insertAdjacentHTML('beforeend', `<div class="cal-m"><h4>${MON[m]} ${y}</h4><div class="cal-wd">${TX.wd.map(x => `<span>${x}</span>`).join('')}</div><div class="cal-g">${g}</div></div>`);
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
      paint(); fa.dispatchEvent(new Event('change'));
      if (fb.value) $('#anfrage').scrollIntoView({ behavior: 'smooth' });
    });
    addEventListener('resize', render);
    [fa, fb].forEach(el => el.addEventListener('change', paint));
    fetch(base + 'data/belegung.json').then(r => r.json()).then(d => {
      Object.assign(days, d.tage);
      const s = new Date(d.stand); if (!isNaN(s)) $('#cal-stand').textContent = `${TX.hint} ${TX.stand}: ${s.toLocaleDateString(TX.loc)}, ${TX.from}.`;
      render(); checkRange();
    }).catch(() => { box.innerHTML = `<p class="muted">${TX.down}</p>`; });
  }

  // Wunschzeitraum prüfen (belegte Nächte)
  const warn = $('#f-warn');
  function checkRange() {
    if (!warn) return true;
    const bad = fa.value && fb.value && !rangeFree(fa.value, fb.value);
    warn.hidden = !bad;
    warn.textContent = bad ? TX.bad : '';
    return !bad;
  }
  [fa, fb].forEach(el => el && el.addEventListener('change', checkRange));

  // Preisrechner (Preise laut Vermieterin, unverbindlich)
  const P = { night: 60, extra: 20, clean: 35, short: 30, shortMax: 2, dog: 25, bed: 5 };
  const eur = n => n.toLocaleString(TX.loc, { minimumFractionDigits: 0 }) + ' €';
  const quoteEl = $('#quote'), next = $('#to-step2'), fpe = $('#f-pe'), fki = $('#f-ki'), fhu = $('#f-hu'), fbw = $('#f-bw');
  let quote = null;
  const calc = () => {
    if (!quoteEl) return;
    const free = checkRange();
    const n = fa.value && fb.value ? Math.round((new Date(fb.value) - new Date(fa.value)) / 864e5) : 0;
    if (n < 1) { quote = null; quoteEl.innerHTML = `<p class="muted">${TX.q.empty}</p>`; next.disabled = true; return; }
    const pers = +fpe.value, extra = Math.max(0, pers - 2), dogs = +fhu.value, sets = +fbw.value;
    const L = [[`${n} ${n === 1 ? TX.q.night : TX.q.nights} × ${eur(P.night)}`, n * P.night]];
    if (extra) L.push([`${TX.q.extra(extra)} × ${n} × ${eur(P.extra)}`, extra * n * P.extra]);
    if (n <= P.shortMax) L.push([TX.q.short, P.short]);
    L.push([TX.q.clean, P.clean]);
    if (dogs) L.push([TX.q.dog(dogs), dogs * P.dog]);
    if (sets) L.push([TX.q.bed(sets), sets * P.bed]);
    const total = L.reduce((s, x) => s + x[1], 0);
    quote = { n, pers, kids: +fki.value, dogs, sets, total, lines: L };
    quoteEl.innerHTML = `<ul>${L.map(([t, v]) => `<li><span>${t}</span><span>${eur(v)}</span></li>`).join('')}</ul><div class="tot"><span>${TX.q.total}</span><b>${eur(total)}</b></div><p class="n">${TX.q.note}</p>`;
    next.disabled = !free;
  };
  [fa, fb, fpe, fki, fhu, fbw].forEach(el => el && el.addEventListener('change', calc));
  if (fa) calc();

  // Schnellanfrage (Kopfbereich) -> Rechner
  const quick = $('#quick');
  if (quick) quick.addEventListener('submit', e => {
    e.preventDefault();
    fa.value = qa.value; fb.min = qa.value || today; fb.value = qb.value; fpe.value = $('#q-pe').value;
    fa.dispatchEvent(new Event('change')); location.hash = '#anfrage';
  });

  // Zweistufig: 1 Preis berechnen, 2 Kontaktdaten
  const form = $('#anfrage-form'), s1 = $('#step1'), s2 = $('#step2');
  const step = two => { s1.hidden = two; s2.hidden = !two; $('#st1').classList.toggle('on', !two); $('#st2').classList.toggle('on', two); };
  const go2 = () => {
    if (!fa.value || !fb.value || !quote || !checkRange()) { if (fa && !fa.value) fa.focus(); else if (fb && !fb.value) fb.focus(); return; }
    const d = v => new Date(v).toLocaleDateString(TX.loc);
    $('#pick').innerHTML = `${TX.q.pick(d(fa.value), d(fb.value), quote.pers, quote.kids)} · <b>${eur(quote.total)}</b>`;
    step(true); $('input[name=vorname]', form).focus({ preventScroll: true });
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  if (next) { next.addEventListener('click', go2); $('#back1').addEventListener('click', () => step(false)); }

  // Absenden: wird als normales Formular an das Buchungsportal Harz-Travel gesendet (neuer Tab)
  if (form) form.addEventListener('submit', e => {
    if (s2.hidden) { e.preventDefault(); go2(); return; }
    const de = v => v.split('-').reverse().join('.');
    if (!form.reportValidity() || !checkRange() || !quote) { e.preventDefault(); return; }
    $('#h-an').value = de(fa.value); $('#h-ab').value = de(fb.value); $('#f-zr').value = `${de(fa.value)} - ${de(fb.value)}`;
    const t = quote.lines.map(([x, v]) => `${x}: ${v} €`).join('; ');
    $('#h-msg').value = `Preisindikation über harzberge.de (unverbindlich): ${quote.total} € (${t}). Personen: ${quote.pers}, Kinder: ${quote.kids}, Hunde: ${quote.dogs}, Bettensätze: ${quote.sets}.${$('#f-ms').value.trim() ? `\n\n${$('#f-ms').value.trim()}` : ''}`;
    const sent = $('#sent');
    setTimeout(() => { form.hidden = true; sent.hidden = false; sent.focus({ preventScroll: true }); sent.scrollIntoView({ block: 'center' }); }, 300);
  });
  const again = $('#sent-again');
  if (again) again.addEventListener('click', () => { $('#sent').hidden = true; form.hidden = false; form.reset(); step(false); calc(); fa.focus(); });
})();
