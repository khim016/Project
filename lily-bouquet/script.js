/* =========================================================
   Purple Lily Bouquet: script.js
   1. Draws every lily, leaf and the wrapping as SVG
   2. Falling petals + sparkles
   3. Mouse-hover tilt
   0. Intro build animation, 4. Draggable lilies, 5. Photo burst, 6. Message card
   ========================================================= */
(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);

  /* ---------- 1. Colour palettes: [base, middle, tip] per shade ---------- */
  const PAL = {
    lavender: ['#9a6fd2', '#c9b0ee', '#f1e8fc'],
    lilac:    ['#8350c0', '#bb96e8', '#e9dbf9'],
    violet:   ['#5f2f9a', '#9967d6', '#d8c0f2'],
    plum:     ['#3f1d5e', '#7c3fa3', '#c690dc'],
  };

  /* Shared gradients, placed once in a zero-size SVG so every drawing can use them */
  function buildDefs() {
    let g = '';
    for (const [name, c] of Object.entries(PAL)) {
      g += `<linearGradient id="p-${name}" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="${c[0]}"/><stop offset=".5" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>`;
    }
    g += `
      <radialGradient id="throat"><stop offset="0" stop-color="#f3f7b8" stop-opacity=".95"/><stop offset=".6" stop-color="#cfe39a" stop-opacity=".45"/><stop offset="1" stop-color="#cfe39a" stop-opacity="0"/></radialGradient>
      <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f7d5e"/><stop offset="1" stop-color="#9dbf9a"/></linearGradient>
      <linearGradient id="paperBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d9ea"/><stop offset="1" stop-color="#d9c2f0"/></linearGradient>
      <linearGradient id="paperL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9dbf9"/><stop offset="1" stop-color="#b595e4"/></linearGradient>
      <linearGradient id="paperR" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf4"/><stop offset="1" stop-color="#e8dcf5"/></linearGradient>
      <linearGradient id="ribbon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a77be0"/><stop offset=".5" stop-color="#7a45bb"/><stop offset="1" stop-color="#53288f"/></linearGradient>`;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML = `<defs>${g}</defs>`;
    document.body.prepend(svg);
  }

  /* One lily seen face-on, centred on (0,0). `seed` keeps speckles stable. */
  function lilyHead(pal, r, seed) {
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;

    // A single pointed, slightly wavy petal with midrib, shading and speckles
    const petal = (len, w, ang) => {
      const d = `M0 0C${-w * len} ${-.28 * len} ${-w * len * 1.08} ${-.8 * len} 0 ${-len}C${w * len * 1.08} ${-.8 * len} ${w * len} ${-.28 * len} 0 0Z`;
      let dots = '';
      for (let i = 0; i < 9; i++) {
        const y = -(.12 + rnd() * .5) * len;
        const x = (rnd() - .5) * w * len * .9;
        dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(len * (.012 + rnd() * .012)).toFixed(1)}" fill="#3a1058" opacity=".5"/>`;
      }
      return `<g transform="rotate(${ang})">
        <path d="${d}" fill="url(#p-${pal})" stroke="rgba(58,16,88,.22)" stroke-width="1"/>
        <path d="M0 ${-.05 * len}Q${-.03 * len} ${-.5 * len} 0 ${-.8 * len}" fill="none" stroke="#3a1058" stroke-opacity=".18" stroke-width="${(len * .05).toFixed(1)}"/>
        <path d="M0 ${-.05 * len}Q${.03 * len} ${-.5 * len} 0 ${-.92 * len}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="${(len * .022).toFixed(1)}" stroke-linecap="round"/>
        ${dots}</g>`;
    };

    let out = '';
    for (let i = 0; i < 3; i++) out += petal(r, .34, i * 120 + (rnd() - .5) * 10);              // outer petals
    for (let i = 0; i < 3; i++) out += petal(r * .94, .42, i * 120 + 60 + (rnd() - .5) * 10);   // inner petals

    out += `<circle r="${r * .26}" fill="url(#throat)"/>`; // green-yellow throat

    // Stamens with rusty anthers + one pistil
    for (let i = 0; i < 6; i++) {
      const deg = i * 60 + 15 + rnd() * 20, a = deg * Math.PI / 180, L = r * (.36 + rnd() * .1);
      const x = Math.sin(a) * L, y = -Math.cos(a) * L;
      out += `<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#d9d28a" stroke-width="${(r * .018).toFixed(1)}"/>
        <ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r * .04).toFixed(1)}" ry="${(r * .09).toFixed(1)}" transform="rotate(${deg.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#a9622f"/>`;
    }
    out += `<path d="M0 0Q${r * .06} ${-r * .3} ${r * .02} ${-r * .5}" fill="none" stroke="#e6e3a0" stroke-width="${(r * .025).toFixed(1)}"/>
      <circle cx="${r * .02}" cy="${-r * .5}" r="${r * .035}" fill="#c9d77a"/>`;
    return `<g>${out}</g>`;
  }

  /* A long lance-shaped leaf, pointing along +x then rotated */
  const leaf = (x, y, len, ang) => `<g transform="translate(${x} ${y}) rotate(${ang})">
    <path d="M0 0C${len * .25} ${-len * .2} ${len * .7} ${-len * .16} ${len} 0C${len * .7} ${len * .12} ${len * .25} ${len * .17} 0 0Z" fill="url(#leaf)" stroke="rgba(40,80,55,.35)"/>
    <path d="M0 0Q${len * .5} ${-len * .02} ${len * .95} 0" fill="none" stroke="#e6f1dc" stroke-opacity=".55" stroke-width="1.5"/></g>`;

  /* ---------- Main bouquet ---------- */
  function buildBouquet() {
    let seedN = 11;
    const rand = (a, b) => a + ((seedN = (seedN * 16807) % 2147483647) / 2147483647) * (b - a);
    const swayAttr = () => `class="sway" style="animation-duration:${rand(5.5, 7.5).toFixed(1)}s;animation-delay:-${rand(0, 6).toFixed(1)}s"`;

    // [x, y, radius, rotation, squash (tilt), palette], listed back to front
    const FLOWERS = [
      [300, 108, 66, 12, .82, 'lilac'],
      [196, 176, 74, -26, .78, 'plum'],
      [404, 172, 74, 22, .78, 'violet'],
      [128, 300, 70, -42, .74, 'violet'],
      [472, 304, 70, 40, .74, 'lilac'],
      [300, 268, 104, 4, 1, 'lavender'],   // the hero lily, facing forward
      [196, 392, 82, -14, .86, 'lilac'],
      [404, 396, 84, 16, .86, 'plum'],
    ];

    let svg = '';
    const b = (cls, d, inner) => `<g class="build ${cls}" style="--d:${d}s">${inner}</g>`; // intro-animation wrapper

    // Back sheet of wrapping, rises behind the flowers at the sides
    svg += b('unfurl', 3.4, `<path d="M300 752L64 372Q104 436 170 444L430 444Q496 436 536 372Z" fill="url(#paperBack)" stroke="rgba(255,255,255,.7)"/>`);

    // Leaves fanning out from the top of the wrapping
    [[262, 492, 210, -158], [338, 492, 210, -22], [282, 500, 175, -128], [318, 500, 175, -52], [250, 506, 140, -175], [350, 506, 140, -5]]
      .forEach(([x, y, l, a], i) => {
        svg += `<g ${swayAttr()}><g class="build grow" style="--d:${(.3 + i * .12).toFixed(2)}s;transform-origin:${x}px ${y}px">${leaf(x, y, l, a)}</g></g>`;
      });

    // Two buds on slim stems (stem draws upward, bud opens at the tip)
    [[104, 236, -22], [498, 246, 24]].forEach(([x, y, a], i) => {
      const d = 1 + i * .3;
      svg += `<g ${swayAttr()}><path class="build draw" pathLength="1" style="--d:${d.toFixed(2)}s" d="M300 570Q${(x + 300) / 2} ${y + 200} ${x} ${y}" fill="none" stroke="#6c9a74" stroke-width="5" stroke-linecap="round"/>
        <g transform="translate(${x} ${y}) rotate(${a})"><g class="build bloom" style="--d:${(d + .9).toFixed(2)}s"><path d="M0 0C-17 -20 -15 -62 0 -92C15 -62 17 -20 0 0Z" fill="url(#p-lavender)" stroke="rgba(58,16,88,.25)"/>
        <path d="M0 -4Q4 -45 0 -84" fill="none" stroke="#fff" stroke-opacity=".45"/></g></g></g>`;
    });

    // Each lily = stem (draws upward) + head (blooms open at the tip), sharing a sway group
    FLOWERS.forEach(([x, y, r, rot, sq, pal], i) => {
      const d = .6 + i * .28;
      svg += `<g ${swayAttr()}>
        <path class="build draw" pathLength="1" style="--d:${d.toFixed(2)}s" d="M${300 + (x - 300) * .08} 580Q${x + (300 - x) * .2} ${y + (570 - y) * .6} ${x} ${y}" fill="none" stroke="#6c9a74" stroke-width="7" stroke-linecap="round"/>
        <g transform="translate(${x} ${y})"><g class="build bloom" style="--d:${(d + .8).toFixed(2)}s"><g transform="rotate(${rot}) scale(1 ${sq})">${lilyHead(pal, r, 7 + i * 13)}</g></g></g></g>`;
    });

    // Front wrapping: lavender sheet (left) + cream sheet (right) overlapping
    svg += `<g class="build unfurl" style="--d:3.8s"><path d="M300 752L96 418Q190 500 360 500Z" fill="url(#paperL)" stroke="rgba(255,255,255,.7)"/>
      <path d="M300 752L504 418Q430 478 335 496Z" fill="url(#paperR)" stroke="rgba(255,255,255,.8)"/>
      <path d="M335 496L300 752" stroke="rgba(80,40,130,.28)" stroke-width="2"/>
      <path d="M300 752L180 472M300 752L240 502" stroke="rgba(255,255,255,.4)" stroke-width="1.5" fill="none"/>
      <path d="M300 752L420 480M300 752L368 500" stroke="rgba(120,80,180,.2)" stroke-width="1.5" fill="none"/>
      <path d="M96 418Q190 500 360 500" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"/></g>`;

    // Ribbon band, bow loops, knot and tails
    svg += `<g class="build band" style="--d:4.7s"><path d="M202 592Q300 624 398 592L382 618Q300 652 218 618Z" fill="url(#ribbon)"/>
      <path d="M206 596Q300 626 394 596" stroke="#fff" stroke-opacity=".4" fill="none"/>
      </g><g class="build bow" style="--d:5.1s"><path d="M296 640C272 690 250 714 230 738L258 732L264 750C280 716 298 690 306 648Z" fill="url(#ribbon)" stroke="rgba(255,255,255,.35)"/>
      <path d="M304 640C328 690 350 714 370 738L342 732L336 750C320 716 302 690 294 648Z" fill="url(#ribbon)" stroke="rgba(255,255,255,.35)"/>
      <path d="M300 628C235 582 190 620 225 652C250 668 285 645 300 628Z" fill="url(#ribbon)" stroke="rgba(255,255,255,.4)"/>
      <path d="M300 628C365 582 410 620 375 652C350 668 315 645 300 628Z" fill="url(#ribbon)" stroke="rgba(255,255,255,.4)"/>
      <path d="M292 632C250 606 226 624 238 640M308 632C350 606 374 624 362 640" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>
      <ellipse cx="300" cy="634" rx="17" ry="14" fill="url(#ribbon)" stroke="rgba(255,255,255,.5)"/></g>`;

    $('bouquet').innerHTML = svg;
  }

  /* ---------- Individual lilies around the bouquet ---------- */
  function sideLily(el, pal, seed) {
    el.innerHTML = `<svg viewBox="0 0 220 460">
      <path d="M110 108C100 220 125 330 110 450" fill="none" stroke="#6c9a74" stroke-width="7" stroke-linecap="round"/>
      ${leaf(112, 390, 120, -120)}${leaf(110, 330, 100, -55)}
      <g transform="translate(110 108) rotate(8) scale(1 .9)">${lilyHead(pal, 92, seed)}</g></svg>`;
  }

  /* Small lily heads for the message card corners */
  function cornerLily(el, pal, seed) {
    el.innerHTML = `<svg viewBox="-95 -95 190 190">${lilyHead(pal, 88, seed)}</svg>`;
  }

  /* ---------- 2. Falling petals and sparkles ---------- */
  function buildParticles() {
    const box = $('particles');
    const colors = ['#f6bfdc', '#e3c9fa', '#c9a6f0', '#fbe3ee', '#b58be6'];
    const small = window.innerWidth < 600;

    for (let i = 0; i < (small ? 12 : 20); i++) {
      const p = document.createElement('span');
      const size = 9 + Math.random() * 12;
      p.className = 'petal';
      p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size * 1.3}px;
        background:${colors[i % colors.length]};--drift:${(Math.random() - .5) * 220}px;
        animation-duration:${14 + Math.random() * 14}s;animation-delay:-${Math.random() * 26}s`;
      box.appendChild(p);
    }
    for (let i = 0; i < (small ? 16 : 28); i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;
        animation-duration:${2.5 + Math.random() * 3.5}s;animation-delay:-${Math.random() * 6}s;
        transform:scale(${.6 + Math.random() * .8})`;
      box.appendChild(s);
    }
  }

  /* ---------- 3. Gentle tilt when the mouse hovers the bouquet ---------- */
  function setupTilt() {
    const wrap = document.querySelector('.bouquet-float');
    const tilt = $('tilt');
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 7}deg) translate(${px * 8}px,${py * 6}px) scale(1.015)`;
    });
    wrap.addEventListener('mouseleave', () => { tilt.style.transform = ''; });
  }

  /* ---------- 4. Draggable lilies: grab one, move it, let go and it springs back ---------- */
  function makeDraggable(el) {
    let sx = 0, sy = 0, active = false;

    const move = (e) => { el.style.translate = `${e.clientX - sx}px ${e.clientY - sy}px`; };
    const drop = () => {
      if (!active) return;
      active = false;
      el.classList.remove('dragging');
      el.style.translate = '0px 0px'; // CSS transition makes it spring back to its spot
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', drop);
      window.removeEventListener('pointercancel', drop);
    };

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      active = true; sx = e.clientX; sy = e.clientY;
      el.classList.add('dragging');
      $('hint').classList.add('gone');
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', drop);
      window.addEventListener('pointercancel', drop);
    });
  }

  /* ---------- 5. Photos burst out one by one, then the card appears ---------- */
  const PHOTOS = Array.from({ length: 9 }, (_, i) => `photos/photo${i + 1}.jpg`);
  const FIRST_DELAY = 300;  // ms before the first photo bursts out
  const PHOTO_DELAY = 450;  // ms between each photo  <- change this to speed up / slow down
  const CARD_DELAY = 1300;  // ms to wait after the last photo before the card shows
  const photoEls = [];

  function buildPhotos() {
    PHOTOS.forEach((src) => {
      const fig = document.createElement('figure');
      fig.className = 'photo';
      const img = new Image();
      img.src = src; img.alt = 'A memory together'; img.draggable = false;
      fig.appendChild(img);
      $('photos').appendChild(fig);
      photoEls.push(fig);
    });
  }

  /* Little hearts and sparkles popping from where the photo launches */
  function burstAt(x, y) {
    const cols = ['#e58cc1', '#c79bf0', '#fff'];
    for (let k = 0; k < 8; k++) {
      const s = document.createElement('span');
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
      s.className = 'pop';
      s.textContent = k % 2 ? '♥' : '✦';
      s.style.cssText = `left:${x}px;top:${y}px;color:${cols[k % 3]};--px:${Math.cos(a) * d}px;--py:${Math.sin(a) * d}px`;
      $('photos').appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  }

  /* ---------- 6. Message card ---------- */
  function setupCard() {
    const overlay = $('overlay'), openBtn = $('openBtn'), closeBtn = $('closeBtn'), deco = $('deco');

    // Hearts and sparkles floating around the card edges
    [['-14px', '38%', '♥', '#e58cc1', 22], ['calc(100% - 4px)', '20%', '✦', '#fff', 24], ['8%', '-20px', '✦', '#fff', 20],
     ['72%', '-24px', '♥', '#f3a3cf', 20], ['-16px', '74%', '✦', '#fff', 22], ['calc(100% - 6px)', '62%', '♥', '#c79bf0', 22],
     ['28%', 'calc(100% - 6px)', '♥', '#e58cc1', 20], ['58%', 'calc(100% - 2px)', '✦', '#fff', 24]]
      .forEach(([l, t, ch, col, sz], i) => {
        const s = document.createElement('span');
        s.textContent = ch;
        s.style.cssText = `left:${l};top:${t};color:${col};font-size:${sz}px;text-shadow:0 0 10px ${col};animation-delay:-${i * .6}s`;
        deco.appendChild(s);
      });

    const openCard = () => {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('card-open');
      closeBtn.focus({ preventScroll: true });
    };

    // Button click: photos burst out from the button, then the card opens
    const startReveal = () => {
      openBtn.disabled = true;
      const b = openBtn.getBoundingClientRect();
      const ox = b.left + b.width / 2, oy = b.top + b.height / 2;
      const W = innerWidth, H = innerHeight, n = photoEls.length, small = W < 600;
      const rx = W * (small ? .36 : .39), ry = H * (small ? .36 : .37);

      photoEls.forEach((el, i) => {
        // spread the photos around an oval so the middle stays free for the card
        const a = (i / n) * Math.PI * 2 - Math.PI / 2 + .3, k = .94 + (i % 3) * .04;
        const hw = el.offsetWidth / 2 + 6, hh = el.offsetHeight / 2 + 6;
        const tx = Math.min(W - hw, Math.max(hw, W / 2 + Math.cos(a) * rx * k));
        const ty = Math.min(H - hh, Math.max(hh, H / 2 + Math.sin(a) * ry * k));
        el.style.setProperty('--sx', ox + 'px'); el.style.setProperty('--sy', oy + 'px');
        el.style.setProperty('--tx', tx + 'px'); el.style.setProperty('--ty', ty + 'px');
        el.style.setProperty('--rot', (((i * 47) % 27) - 13) + 'deg');
        setTimeout(() => { el.classList.add('show'); burstAt(ox, oy); }, FIRST_DELAY + i * PHOTO_DELAY);
      });
      setTimeout(openCard, FIRST_DELAY + (n - 1) * PHOTO_DELAY + CARD_DELAY);
    };

    // Closing: card fades, photos fly back, button works again
    const close = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('card-open');
      photoEls.forEach((el, i) => setTimeout(() => el.classList.remove('show'), i * 70));
      setTimeout(() => { openBtn.disabled = false; openBtn.focus({ preventScroll: true }); }, photoEls.length * 70 + 800);
    };

    openBtn.addEventListener('click', startReveal);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); }); // click outside card

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); } // keep focus inside the dialog
    });
  }

  /* ---------- Intro: the bouquet builds itself, then the rest of the page fades in ---------- */
  function playIntro() {
    [['lilyLeft', 4800], ['lilyRight', 5300], ['lilyTop', 5800]]
      .forEach(([id, t]) => setTimeout(() => $(id).classList.add('in'), t));
    setTimeout(() => {
      document.body.classList.remove('building'); // button becomes clickable
      const r = $('bouquet').getBoundingClientRect();
      burstAt(r.left + r.width / 2, r.top + r.height * .8); // little sparkle pop when finished
    }, 6100);
  }

  /* ---------- Start ---------- */
  buildDefs();
  buildBouquet();
  sideLily($('lilyLeft'), 'lavender', 31);
  sideLily($('lilyRight'), 'violet', 57);
  sideLily($('lilyTop'), 'lilac', 83);
  ['lilyLeft', 'lilyRight', 'lilyTop'].forEach((id) => makeDraggable($(id)));
  cornerLily(document.querySelector('.corner.tl'), 'lilac', 41);
  cornerLily(document.querySelector('.corner.br'), 'violet', 67);
  buildParticles();
  buildPhotos();
  setupTilt();
  setupCard();
  playIntro();
})();
