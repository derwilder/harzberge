(() => {
  if (window.top !== window) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Header
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const btn = $('.menu-btn'), list = $('.nav ul');
  btn.addEventListener('click', () => btn.setAttribute('aria-expanded', list.classList.toggle('open')));
  list.addEventListener('click', e => { if (e.target.closest('a')) { list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });

  // Sprachwahl: Auswahlmenü, merkt die Wahl (für die automatische Sprache beim ersten Besuch)
  const lw = $('.lang');
  if (lw) {
    const lb = $('.lang-btn', lw), setO = o => { lw.classList.toggle('open', o); lb.setAttribute('aria-expanded', String(o)); };
    lb.addEventListener('click', e => { e.stopPropagation(); setO(!lw.classList.contains('open')); });
    document.addEventListener('click', e => { if (!e.composedPath().includes(lw)) setO(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') { setO(false); } });
    $$('a[data-lang]', lw).forEach(a => a.addEventListener('click', () => { try { localStorage.setItem('harz-lang', a.dataset.lang); } catch (_) {} }));
  }

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
  // sanft scrollen, notfalls (gedrosselter Tab, Bewegung reduziert) direkt springen
  const goTo = el => { const y0 = scrollY; el.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => { if (Math.abs(scrollY - y0) < 10) el.scrollIntoView({ behavior: 'instant' }); }, 700); };
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
      q: { empty: 'Elija llegada y salida y aquí verá su precio al instante.', night: 'noche', nights: 'noches', extra: n => `${n} ${n === 1 ? 'persona adicional' : 'personas adicionales'}`, short: 'Suplemento de estancia corta (hasta 2 noches)', clean: 'Limpieza final', dog: n => n === 1 ? 'Perro' : `${n} perros`, bed: n => `Ropa de cama, ${n} ${n === 1 ? 'juego' : 'juegos'}`, total: 'Precio total', note: 'Cálculo sin compromiso. Cuna y trona son gratuitas. Confirmaremos el precio final en nuestra respuesta.', pick: (a, b, p, k) => `${a} a ${b}, ${p} ${p === 1 ? 'persona' : 'personas'}${k ? `, de ellos ${k} ${k === 1 ? 'niño' : 'niños'}` : ''}` } },
    nl: { mon: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'], wd: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'], busy: 'bezet', swap: 'wisseldag', free: 'vrij', loc: 'nl-NL',
      hint: 'Klik op een dag om aankomst en vertrek te kiezen.', stand: 'Bijgewerkt', from: 'afkomstig van Harz-Travel', down: 'De kalender is momenteel niet beschikbaar. Vraag gewoon uw gewenste periode aan.', bad: 'Volgens de kalender is het appartement in deze periode al bezet. Kies andere data.',
      q: { empty: 'Kies aankomst en vertrek en u ziet hier meteen uw prijs.', night: 'nacht', nights: 'nachten', extra: n => `${n} extra ${n === 1 ? 'persoon' : 'personen'}`, short: 'Toeslag kort verblijf (tot 2 nachten)', clean: 'Eindschoonmaak', dog: n => n === 1 ? 'Hond' : `${n} honden`, bed: n => `Beddengoed, ${n} ${n === 1 ? 'set' : 'sets'}`, total: 'Totaalprijs', note: 'Vrijblijvende berekening. Kinderreisbed en kinderstoel zijn gratis. De definitieve prijs bevestigen we in ons antwoord.', pick: (a, b, p, k) => `${a} tot ${b}, ${p} ${p === 1 ? 'persoon' : 'personen'}${k ? `, waarvan ${k} ${k === 1 ? 'kind' : 'kinderen'}` : ''}` } }
  }[lang];
  const MON = TX.mon;
  TX.dp = ({
    de: { pick: 'Datum wählen', arr: 'Anreise wählen', dep: 'Abreise wählen', na: 'Durchgestrichene Tage sind nicht verfügbar.', nights: n => `${n} ${n === 1 ? 'Nacht' : 'Nächte'}`, clear: 'Zurücksetzen', prev: 'Vorheriger Monat', next: 'Nächster Monat' },
    en: { pick: 'Select date', arr: 'Select arrival', dep: 'Select departure', na: 'Struck-through days are not available.', nights: n => `${n} ${n === 1 ? 'night' : 'nights'}`, clear: 'Reset', prev: 'Previous month', next: 'Next month' },
    es: { pick: 'Elegir fecha', arr: 'Elegir llegada', dep: 'Elegir salida', na: 'Los días tachados no están disponibles.', nights: n => `${n} ${n === 1 ? 'noche' : 'noches'}`, clear: 'Restablecer', prev: 'Mes anterior', next: 'Mes siguiente' },
    nl: { pick: 'Datum kiezen', arr: 'Aankomst kiezen', dep: 'Vertrek kiezen', na: 'Doorgestreepte dagen zijn niet beschikbaar.', nights: n => `${n} ${n === 1 ? 'nacht' : 'nachten'}`, clear: 'Wissen', prev: 'Vorige maand', next: 'Volgende maand' }
  })[lang];
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
      if (fb.value) goTo($('#anfrage'));
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


  // Datumsauswahl wie bei Hotelportalen: Anreise wählen, dann Abreise; belegte Tage sind gesperrt
  const pop = document.createElement('div');
  pop.className = 'dpop'; pop.hidden = true; pop.setAttribute('role', 'dialog');
  document.body.appendChild(pop);
  let cur = null;
  const pd = s => new Date(s + 'T12:00');
  const addDay = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return iso(d); };
  const fmtD = s => pd(s).toLocaleDateString(TX.loc, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const lastDep = arr => { for (let i = 1, d = addDay(arr, 1); i < 400; i++, d = addDay(d, 1)) if (nightBusy(d)) return d; return '9999-12-31'; };
  const labels = () => $$('.dp').forEach(b => { const v = document.getElementById(b.dataset.for).value; b.textContent = v ? fmtD(v) : TX.dp.pick; b.classList.toggle('empty', !v); });
  const fire = el => el.dispatchEvent(new Event('change', { bubbles: true }));
  const closePop = () => { pop.hidden = true; if (cur) { cur.trig.setAttribute('aria-expanded', 'false'); cur = null; } };
  const state = k => {
    const A = cur.a.value;
    if (k < today) return 'past';
    if (cur.mode === 'arr' || !A || k <= A) return nightBusy(k) ? 'busy' : 'ok';
    return k <= cur.limit ? 'ok' : 'busy';
  };
  const mark = hover => {
    const A = cur.a.value, B = cur.mode === 'dep' && hover ? hover : cur.b.value;
    $$('.dp-g button[data-d]', pop).forEach(el => {
      const k = el.dataset.d, inr = A && B && k > A && k < B;
      el.classList.toggle('sa', k === A); el.classList.toggle('sb', !!B && k === B && !!A);
      el.classList.toggle('span', k === A && !!B && !!A); el.classList.toggle('in', !!inr);
    });
    const n = A && B ? Math.round((pd(B) - pd(A)) / 864e5) : 0;
    $('.dp-n', pop).textContent = n > 0 ? TX.dp.nights(n) : '';
  };
  const drawPop = () => {
    const many = matchMedia('(min-width:701px)').matches ? 2 : 1;
    const first = cur.month;
    let html = `<div class="dp-h"><span>${cur.mode === 'arr' ? TX.dp.arr : TX.dp.dep}</span><span class="dp-nav"><button type="button" data-nav="-1" aria-label="${TX.dp.prev}" ${first <= new Date(new Date().getFullYear(), new Date().getMonth(), 1) ? 'disabled' : ''}>‹</button><button type="button" data-nav="1" aria-label="${TX.dp.next}">›</button></span></div><div class="dp-ms">`;
    for (let i = 0; i < many; i++) {
      const dt = new Date(first.getFullYear(), first.getMonth() + i, 1), y = dt.getFullYear(), m = dt.getMonth();
      const lead = (dt.getDay() + 6) % 7, nd = new Date(y, m + 1, 0).getDate();
      let g = '<span></span>'.repeat(lead);
      for (let d = 1; d <= nd; d++) {
        const k = key(y, m, d), s = state(k);
        g += `<button type="button" data-d="${k}" class="${s === 'busy' ? 'busy' : ''}${k === today ? ' today' : ''}" ${s === 'ok' ? '' : 'disabled'} aria-label="${fmtD(k)}">${d}</button>`;
      }
      html += `<div class="dp-m"><h4>${MON[m]} ${y}</h4><div class="dp-wd">${TX.wd.map(x => `<span>${x}</span>`).join('')}</div><div class="dp-g">${g}</div></div>`;
    }
    pop.innerHTML = html + `</div><div class="dp-f"><span>${TX.dp.na} <b class="dp-n"></b></span><button type="button" data-clear>${TX.dp.clear}</button></div>`;
    mark();
  };
  const place = () => {
    if (matchMedia('(max-width:700px)').matches) { pop.style.top = ''; pop.style.left = ''; return; }
    const r = cur.trig.getBoundingClientRect(), w = pop.offsetWidth;
    pop.style.top = `${r.bottom + scrollY + 6}px`;
    pop.style.left = `${Math.max(8, Math.min(r.left + scrollX, innerWidth - w - 8))}px`;
  };
  const openPop = trig => {
    const id = trig.dataset.for, isArr = /-an$/.test(id), a = document.getElementById(id.replace(/-ab$/, '-an')), b = document.getElementById(id.replace(/-an$/, '-ab'));
    if (cur) cur.trig.setAttribute('aria-expanded', 'false');
    const mode = isArr || !a.value ? 'arr' : 'dep';
    const base = (mode === 'dep' ? a.value : a.value || today);
    cur = { a, b, trig, mode, limit: a.value ? lastDep(a.value) : '', month: new Date(pd(base).getFullYear(), pd(base).getMonth(), 1) };
    trig.setAttribute('aria-expanded', 'true');
    pop.hidden = false; drawPop(); place();
  };
  const pickDay = k => {
    const A = cur.a.value;
    if (cur.mode === 'arr' || !A || k <= A) {
      cur.a.value = k;
      const clearB = cur.b.value && (cur.b.value <= k || cur.b.value > lastDep(k));
      if (clearB) cur.b.value = '';
      fire(cur.a); if (clearB) fire(cur.b);
      cur.mode = 'dep'; cur.limit = lastDep(k); drawPop(); place();
    } else {
      cur.b.value = k; fire(cur.b); closePop();
    }
  };
  pop.addEventListener('click', e => {
    const dbtn = e.target.closest('button[data-d]'), nav = e.target.closest('[data-nav]');
    if (dbtn) pickDay(dbtn.dataset.d);
    else if (nav) { cur.month = new Date(cur.month.getFullYear(), cur.month.getMonth() + +nav.dataset.nav, 1); drawPop(); place(); }
    else if (e.target.closest('[data-clear]')) { cur.a.value = ''; cur.b.value = ''; fire(cur.a); fire(cur.b); cur.mode = 'arr'; cur.limit = ''; drawPop(); }
  });
  pop.addEventListener('mouseover', e => { const b = e.target.closest('button[data-d]'); if (cur && cur.mode === 'dep' && b && !b.disabled && b.dataset.d > cur.a.value) mark(b.dataset.d); });
  pop.addEventListener('mouseleave', () => cur && mark());
  $$('.dp').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); cur && cur.trig === b && !pop.hidden ? closePop() : openPop(b); }));
  document.addEventListener('click', e => { if (cur && !e.composedPath().includes(pop)) closePop(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && cur) { const t = cur.trig; closePop(); t.focus(); } });
  addEventListener('resize', () => { if (cur) { drawPop(); place(); } });
  [qa, qb, fa, fb].forEach(el => el && el.addEventListener('change', labels));
  labels();

  // Preisrechner (Preise laut Vermieterin, unverbindlich)
  const P = { night: 60, extra: 20, clean: 35, short: 30, shortMax: 2, dog: 25, bed: 5 };
  const eur = n => n.toLocaleString(TX.loc, { minimumFractionDigits: 0 }) + ' €';
  const quoteEl = $('#quote'), next = $('#to-step2'), fpe = $('#f-pe'), fki = $('#f-ki'), fhu = $('#f-hu'), fbw = $('#f-bw');
  let quote = null;
  // Kinder und Bettensätze richten sich nach der Personenzahl (mind. 1 Erwachsener, höchstens 1 Bettensatz je Person)
  const fitOptions = (sel, max) => {
    const keep = Math.min(+sel.value || 0, max);
    if (sel.options.length !== max + 1) sel.innerHTML = Array.from({ length: max + 1 }, (_, i) => `<option value="${i}">${i}</option>`).join('');
    sel.value = String(keep);
  };
  const limits = () => { const p = +fpe.value || 1; fitOptions(fki, Math.max(0, p - 1)); fitOptions(fbw, p); };
  const calc = () => {
    if (!quoteEl) return;
    limits();
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
    fa.value = qa.value; fb.value = qb.value; fpe.value = $('#q-pe').value;
    fa.dispatchEvent(new Event('change')); goTo($('#anfrage')); history.replaceState(null, '', '#anfrage');
  });

  // Zweistufig: 1 Preis berechnen, 2 Kontaktdaten
  const form = $('#anfrage-form'), s1 = $('#step1'), s2 = $('#step2');
  const step = two => { s1.hidden = two; s2.hidden = !two; $('#st1').classList.toggle('on', !two); $('#st2').classList.toggle('on', two); };
  const go2 = () => {
    if (!fa.value || !fb.value || !quote || !checkRange()) { if (!fa.value) $('.dp[data-for=f-an]').click(); else if (!fb.value) $('.dp[data-for=f-ab]').click(); return; }
    const d = v => new Date(v).toLocaleDateString(TX.loc);
    $('#pick').innerHTML = `${TX.q.pick(d(fa.value), d(fb.value), quote.pers, quote.kids)} · <b>${eur(quote.total)}</b>`;
    step(true); $('input[name=vorname]', form).focus({ preventScroll: true });
    goTo(form);
  };
  if (next) { next.addEventListener('click', go2); $('#back1').addEventListener('click', () => step(false)); }
  if ($('#st1')) { $('#st1').addEventListener('click', () => step(false)); $('#st2').addEventListener('click', go2); }

  const SENT = {"de": {"ok": "Anfrage erfolgreich versendet. Vielen Dank!", "err": "Die Anfrage konnte nicht übermittelt werden. Bitte prüfen Sie Ihre Angaben (die Telefonnummer ist Pflicht) und versuchen Sie es erneut oder rufen Sie uns an: +49 178 4307460.", "sending": "Wird gesendet …"}, "en": {"ok": "Enquiry sent successfully. Thank you!", "err": "The enquiry could not be sent. Please check your details (a phone number is required) and try again, or call us: +49 178 4307460.", "sending": "Sending …"}, "es": {"ok": "Consulta enviada correctamente. ¡Gracias!", "err": "No se pudo enviar la consulta. Revise sus datos (el teléfono es obligatorio) e inténtelo de nuevo o llámenos: +49 178 4307460.", "sending": "Enviando …"}, "nl": {"ok": "Aanvraag succesvol verzonden. Hartelijk dank!", "err": "De aanvraag kon niet worden verzonden. Controleer uw gegevens (een telefoonnummer is verplicht) en probeer het opnieuw, of bel ons: +49 178 4307460.", "sending": "Bezig met verzenden …"}}[lang];
  const toast = (msg, err) => { const t = $('#toast'); if (!t) return; $('#toast-t').textContent = msg; t.classList.toggle('err', !!err); t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, err ? 20000 : 12000); };
  if ($('#toast-x')) $('#toast-x').addEventListener('click', () => { $('#toast').hidden = true; });

  // Absenden: die Anfrage geht unsichtbar (Rahmen) an das Buchungsportal Harz-Travel.
  // Fehler: das Portal leitet auf unsere Seite zurück (gleiche Herkunft, lesbar). Erfolg: Bestätigungsseite des Portals (fremde Herkunft).
  const frame = $('#harz-frame'), sendBtn = form ? $('button[type=submit]', form) : null;
  let sending = false, sendLabel = '', failTimer = 0;
  const done = ok => {
    clearTimeout(failTimer); sending = false;
    if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = sendLabel; }
    if (ok) { form.hidden = true; const sent = $('#sent'); sent.hidden = false; toast(SENT.ok); setTimeout(() => goTo(sent), 300); }
    else { toast(SENT.err, true); }
  };
  if (frame) frame.addEventListener('load', () => {
    if (!sending) return;
    let same = false;
    try { void frame.contentWindow.location.href; same = frame.contentWindow.location.href !== 'about:blank'; } catch (_) { same = false; }
    done(!same);
  });
  if (form) form.addEventListener('submit', e => {
    if (s2.hidden) { e.preventDefault(); go2(); return; }
    const de = v => v.split('-').reverse().join('.');
    if (sending || !form.reportValidity() || !checkRange() || !quote) { e.preventDefault(); return; }
    $('#h-an').value = de(fa.value); $('#h-ab').value = de(fb.value); $('#f-zr').value = `${de(fa.value)} - ${de(fb.value)}`;
    const t = quote.lines.map(([x, v]) => `${x}: ${v} €`).join('; ');
    $('#h-msg').value = `Preisindikation über harzberge.de (unverbindlich): ${quote.total} € (${t}). Personen: ${quote.pers}, Kinder: ${quote.kids}, Hunde: ${quote.dogs}, Bettensätze: ${quote.sets}.${$('#f-ms').value.trim() ? `\n\n${$('#f-ms').value.trim()}` : ''}`;
    sending = true;
    if (sendBtn) { sendLabel = sendBtn.textContent; sendBtn.disabled = true; sendBtn.textContent = SENT.sending; }
    failTimer = setTimeout(() => done(false), 40000);
  });
  const again = $('#sent-again');
  if (again) again.addEventListener('click', () => { $('#sent').hidden = true; form.hidden = false; form.reset(); step(false); calc(); labels(); });
})();
