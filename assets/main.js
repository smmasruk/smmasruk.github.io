/* Portfolio interactions: animated sky + interacting binary, nav, reveal, count-up. No dependencies. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
  });

  /* scroll-spy */
  var links = {};
  nav.querySelectorAll('.nav-links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
          var l = links[e.target.id];
          if (l) { l.classList.add('active'); l.setAttribute('aria-current', 'true'); }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

    /* reveal on scroll */
    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { rv.observe(el); });

    /* count-up for KPIs */
    var cu = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cu.unobserve(e.target);
        if (reduce) return;
        var el = e.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
        var pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = performance.now(), D = 1400;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / D), v = to * (1 - Math.pow(1 - p, 3));
          el.textContent = pre + v.toFixed(dec) + suf;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-to]').forEach(function (el) { cu.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- SKY + INTERACTING BINARY ---------- */
  var cv = document.getElementById('sky');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, dpr = 1, stars = [], parts = [], running = false, raf = 0, t = 0, last = 0;
  var hero = cv.parentElement;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(520, Math.round((W * H) / 4200));
    stars = [];
    for (var i = 0; i < n; i++) {
      var warm = Math.random();
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.pow(Math.random(), 3) * 1.5 + 0.25,
        a: rand(0.25, 0.95), ph: rand(0, 6.28), sp: rand(0.4, 1.6),
        c: warm < 0.14 ? '255,224,180' : warm < 0.3 ? '190,215,255' : '235,240,255'
      });
    }
    if (reduce) draw(0);
  }

  function geom() {
    var wide = W > 860;
    var a = wide ? Math.min(W, H) * 0.27 : Math.min(W * 0.2, H * 0.11);
    return { cx: wide ? W * 0.74 : W * 0.5, cy: wide ? H * 0.46 : H * 0.215, a: a };
  }

  function spawn(g) {
    parts.push({ u: 0, sp: rand(0.16, 0.26), j: rand(-1, 1), s: rand(0.7, 1.7), lat: rand(-0.05, 0.05) });
  }

  function glow(x, y, r, c0, c1) {
    var gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, c0); gr.addColorStop(1, c1);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  }

  function draw(dt) {
    t += dt;
    ctx.clearRect(0, 0, W, H);

    /* stars */
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.sp + s.ph);
      ctx.fillStyle = 'rgba(' + s.c + ',' + (s.a * tw).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
    }

    /* binary */
    var g = geom(), a = g.a;
    var M1 = 1.0, M2 = 0.55;                       /* accretor, donor masses */
    var th = t * 0.55;                              /* orbital phase */
    var ca = Math.cos(th), sa = Math.sin(th);
    var accx = g.cx - ca * a * (M2 / (M1 + M2)), accy = g.cy - sa * a * (M2 / (M1 + M2));
    var donx = g.cx + ca * a * (M1 / (M1 + M2)), dony = g.cy + sa * a * (M1 / (M1 + M2));
    var rd = a * 0.2, ra = a * 0.055;

    /* orbit guides */
    ctx.save();
    ctx.strokeStyle = 'rgba(142,203,255,0.10)'; ctx.setLineDash([3, 7]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(g.cx, g.cy, a * M1 / (M1 + M2), 0, 6.2832); ctx.stroke();
    ctx.beginPath(); ctx.arc(g.cx, g.cy, a * M2 / (M1 + M2), 0, 6.2832); ctx.stroke();
    ctx.restore();

    /* direction accretor -> donor */
    var dirx = donx - accx, diry = dony - accy, dl = Math.hypot(dirx, diry);
    var base = Math.atan2(diry, dirx);
    var d0 = dl - rd * 1.05, rIn = ra * 2.6;

    /* accretion disk (tilted ring) */
    ctx.save();
    ctx.translate(accx, accy); ctx.rotate(-0.35);
    for (var k = 0; k < 3; k++) {
      ctx.strokeStyle = 'rgba(197,230,255,' + (0.20 - k * 0.05) + ')';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, 0, ra * (3.0 + k * 1.2), ra * (1.1 + k * 0.45), 0, 0, 6.2832); ctx.stroke();
    }
    ctx.restore();

    /* stream particles (additive) */
    if (!reduce && parts.length < 150 && Math.random() < 0.9) spawn(g);
    ctx.globalCompositeOperation = 'lighter';
    for (var p = parts.length - 1; p >= 0; p--) {
      var q = parts[p];
      q.u += q.sp * dt * (reduce ? 0 : 1);
      if (q.u >= 1) { parts.splice(p, 1); continue; }
      var u = q.u;
      var r = rIn + (d0 - rIn) * Math.pow(1 - u, 1.7);
      var ang = base + 5.4 * Math.pow(u, 0.85) + q.lat * (1 - u);
      var spread = (1 - u) * rd * 0.12 * q.j;
      var px = accx + Math.cos(ang) * r + Math.cos(ang + 1.5708) * spread;
      var py = accy + Math.sin(ang) * r + Math.sin(ang + 1.5708) * spread;
      var mix = u, al = Math.sin(Math.min(1, u * 1.15) * Math.PI) * 0.85;
      var cr = Math.round(255 - 60 * mix), cg = Math.round(150 + 80 * mix), cb = Math.round(80 + 175 * mix);
      ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + al.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(px, py, q.s * (1.6 - u * 0.6), 0, 6.2832); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    /* donor: Roche-lobe-filling, stretched toward the accretor */
    glow(donx, dony, rd * 3.2, 'rgba(255,140,70,0.20)', 'rgba(255,140,70,0)');
    ctx.save();
    ctx.translate(donx, dony); ctx.rotate(base + Math.PI);
    ctx.scale(1.16, 0.96);
    var gd = ctx.createRadialGradient(-rd * 0.25, -rd * 0.2, rd * 0.1, 0, 0, rd);
    gd.addColorStop(0, '#ffd9a1'); gd.addColorStop(0.45, '#ff9a55'); gd.addColorStop(1, '#c4492c');
    ctx.fillStyle = gd; ctx.beginPath(); ctx.arc(0, 0, rd, 0, 6.2832); ctx.fill();
    ctx.restore();

    /* accretor: compact, hot */
    glow(accx, accy, ra * 9, 'rgba(142,203,255,0.30)', 'rgba(142,203,255,0)');
    glow(accx, accy, ra * 2.6, 'rgba(255,255,255,0.9)', 'rgba(197,230,255,0)');
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(accx, accy, ra, 0, 6.2832); ctx.fill();

    /* caption */
    ctx.fillStyle = 'rgba(123,130,148,0.9)';
    ctx.font = '10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INTERACTING BINARY · MASS TRANSFER · SCHEMATIC', g.cx, Math.min(H - 70, g.cy + a * 0.95));
  }

  function loop(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    draw(dt);
    raf = requestAnimationFrame(loop);
  }
  function start() { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 120); });
  if (reduce) { draw(0); return; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }, { threshold: 0 }).observe(hero);
  } else { start(); }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
