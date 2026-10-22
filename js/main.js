(() => {
  const btn = document.querySelector('.menu-btn'), list = document.querySelector('.nav ul');
  if (btn) {
    btn.addEventListener('click', () => btn.setAttribute('aria-expanded', list.classList.toggle('open')));
    list.addEventListener('click', e => { if (e.target.closest('a')) { list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  }

  // Lightbox
  const dlg = document.querySelector('dialog.lb');
  const items = [...document.querySelectorAll('.gallery button')];
  let idx = 0;
  const show = i => {
    idx = (i + items.length) % items.length;
    const b = items[idx];
    dlg.querySelector('img').src = b.dataset.full;
    dlg.querySelector('img').alt = b.querySelector('img').alt;
    dlg.querySelector('p').textContent = b.dataset.caption;
  };
  if (dlg) {
    items.forEach((b, i) => b.addEventListener('click', () => { show(i); dlg.showModal(); }));
    dlg.querySelector('.prev').addEventListener('click', () => show(idx - 1));
    dlg.querySelector('.next').addEventListener('click', () => show(idx + 1));
    dlg.querySelector('.close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  }

  // Anfrage: öffnet das E-Mail-Programm (kein Server nötig)
  const form = document.getElementById('anfrage-form');
  if (form) {
    const a = form.elements.anreise, b = form.elements.abreise;
    const today = new Date().toISOString().slice(0, 10);
    a.min = today;
    a.addEventListener('change', () => { b.min = a.value; if (b.value && b.value < a.value) b.value = a.value; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      const body = [
        'Buchungsanfrage Ferienwohnung Harzberge.de', '',
        `Anreise: ${f.anreise}`, `Abreise: ${f.abreise}`, `Personen: ${f.personen}`, `Hund: ${f.hund}`, '',
        `Name: ${f.name}`, `E-Mail: ${f.email}`, `Telefon: ${f.telefon || '-'}`, '', f.nachricht || ''
      ].join('\n');
      location.href = 'mailto:info@harzberge.de?subject=' + encodeURIComponent(`Buchungsanfrage ${f.anreise} – ${f.abreise}`) + '&body=' + encodeURIComponent(body);
    });
  }
})();
