(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Mobile navigation
  var btn = document.querySelector('.header__toggle'), nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  }

  // Solid header after scrolling (home page overlay header)
  var header = document.querySelector('.header--over');
  if (header) {
    var f = function () { header.classList.toggle('is-solid', window.scrollY > 40); };
    f(); window.addEventListener('scroll', f, { passive: true });
  }

  // Subtle reveal
  var items = document.querySelectorAll('.feature,.principles li,.col,.certrow,.tender,.prose-block');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // Enquiry form: client validation + fetch submit (falls back to normal POST without JS)
  document.querySelectorAll('form.form').forEach(function (form) {
    var status = form.querySelector('.form__status');
    function setStatus(msg, ok) { status.textContent = msg; status.className = 'form__status ' + (ok ? 'ok' : 'err'); }
    form.addEventListener('submit', function (ev) {
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (el) {
        var invalid = !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) || (el.minLength > 0 && el.value.trim().length < el.minLength);
        el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
        if (invalid && !bad) bad = el;
      });
      if (bad) { ev.preventDefault(); bad.focus(); setStatus('Please complete the highlighted fields.', false); return; }
      if (!window.fetch) return;
      ev.preventDefault();
      var submit = form.querySelector('button[type=submit]'); submit.disabled = true; setStatus('Sending...', true);
      fetch(form.action, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (r) {
          if (r.ok && r.j.ok) { form.reset(); setStatus('Thank you. Your enquiry has been received and will be reviewed by the Lulomine team.', true); }
          else setStatus((r.j && r.j.error) || 'Your enquiry could not be sent. Please try again.', false);
        })
        .catch(function () { setStatus('A network error occurred. Please try again.', false); })
        .then(function () { submit.disabled = false; });
    });
  });
})();
