/* =========================================================================
   For Raisa — main choreography
   ========================================================================= */
(() => {
  const C = window.CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (!hasGSAP) document.documentElement.classList.add("no-gsap");

  let userMuted = false;
  let timeOffset = 0; // serverTime - deviceTime

  /* ---------------------------------------------------------------
     text helpers
  --------------------------------------------------------------- */
  const splitChars = (el, text) => {
    el.innerHTML = "";
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c === " " ? "\u00A0" : c;
      el.appendChild(s);
    });
    return $$(".ch", el);
  };
  // split into words while keeping <em> styling
  const splitWords = (el, html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    el.innerHTML = "";
    const walk = (node, wrapEm) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/\s+/).filter(Boolean).forEach((w) => {
            const s = document.createElement("span");
            s.className = "w";
            if (wrapEm) { const e = document.createElement("em"); e.textContent = w; s.appendChild(e); }
            else s.textContent = w;
            el.appendChild(s);
          });
        } else if (n.nodeType === 1) walk(n, wrapEm || n.tagName === "EM");
      });
    };
    walk(tmp, false);
    return $$(".w", el);
  };

  /* ---------------------------------------------------------------
     toast
  --------------------------------------------------------------- */
  let toastTimer;
  function toast(msg, ms = 2600) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), ms);
  }

  /* ---------------------------------------------------------------
     ambient sky: stars, drifting hearts, tap bursts
  --------------------------------------------------------------- */
  const Sky = (() => {
    const cv = $("#sky");
    const ctx = cv.getContext("2d");
    let W, H, DPR, stars = [], hearts = [], bursts = [];
    const COLORS = ["#f2a0b5", "#ffd9e3", "#ecc9a0", "#e46f8f"];

    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.round((W * H) / 9000);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: rand(.3, 1.2),
        p: Math.random() * Math.PI * 2, s: rand(.005, .02)
      }));
    }
    function heartPath(x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x, y + s * .3);
      ctx.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3);
      ctx.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .75, x, y + s);
      ctx.bezierCurveTo(x, y + s * .75, x + s * .5, y + s * .6, x + s * .5, y + s * .3);
      ctx.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3);
      ctx.closePath();
    }
    function spawnHeart(initial) {
      hearts.push({
        x: Math.random() * W, y: initial ? Math.random() * H : H + 30,
        s: rand(6, 16), v: rand(.15, .45), sw: rand(.4, 1.2), ph: Math.random() * 6.28,
        c: COLORS[(Math.random() * COLORS.length) | 0], a: rand(.12, .35)
      });
    }
    function burst(x, y, n = 10) {
      for (let i = 0; i < n; i++) {
        const ang = rand(-Math.PI, 0), sp = rand(1.5, 5);
        bursts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, s: rand(7, 15), life: 1, c: COLORS[(Math.random() * 4) | 0], rot: rand(-.5, .5) });
      }
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const st of stars) {
        st.p += st.s;
        ctx.globalAlpha = .25 + Math.sin(st.p) * .25 + .2;
        ctx.fillStyle = "#ffe9f0";
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill();
      }
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.y -= h.v; h.ph += .01;
        const x = h.x + Math.sin(h.ph) * 14 * h.sw;
        ctx.globalAlpha = h.a; ctx.fillStyle = h.c;
        heartPath(x, h.y, h.s); ctx.fill();
        if (h.y < -30) { hearts.splice(i, 1); spawnHeart(false); }
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx; b.y += b.vy; b.vy += .12; b.life -= .016;
        ctx.save(); ctx.globalAlpha = Math.max(b.life, 0); ctx.fillStyle = b.c;
        ctx.translate(b.x, b.y); ctx.rotate(b.rot); heartPath(0, -b.s / 2, b.s); ctx.fill(); ctx.restore();
        if (b.life <= 0) bursts.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    resize();
    for (let i = 0; i < (reduced ? 6 : 16); i++) spawnHeart(true);
    addEventListener("resize", resize);
    requestAnimationFrame(frame);
    return { burst };
  })();

  // little hearts wherever she taps
  addEventListener("pointerdown", (e) => {
    if (e.target.closest(".btn-no, .flee-btn")) return;
    Sky.burst(e.clientX, e.clientY, 7);
  });

  /* ---------------------------------------------------------------
     custom cursor
  --------------------------------------------------------------- */
  if (finePointer && hasGSAP) {
    document.body.classList.add("has-cursor");
    const cur = $(".cursor"), dot = $(".cursor-dot"), ring = $(".cursor-ring");
    const dx = gsap.quickTo(dot, "x", { duration: .08 }), dy = gsap.quickTo(dot, "y", { duration: .08 });
    const rx = gsap.quickTo(ring, "x", { duration: .45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: .45, ease: "power3" });
    addEventListener("pointermove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener("pointerover", (e) => cur.classList.toggle("is-hover", !!e.target.closest("button, .cake, a")));
  }

  /* ---------------------------------------------------------------
     time — trust the server clock (so changing phone time won't work)
  --------------------------------------------------------------- */
  async function syncTime() {
    if (location.protocol === "file:") return;
    try {
      const t0 = Date.now();
      const res = await fetch(location.pathname + "?t=" + t0, { method: "HEAD", cache: "no-store" });
      const t1 = Date.now();
      const d = res.headers.get("date");
      if (d) timeOffset = new Date(d).getTime() + (t1 - t0) / 2 - t1;
    } catch (_) { /* offline → fall back to device clock */ }
  }
  const now = () => Date.now() + timeOffset;

  async function isPreview() {
    const key = new URLSearchParams(location.search).get("preview");
    if (!key || !crypto.subtle) return false;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex === C.previewHash;
  }

  /* ---------------------------------------------------------------
     LOCK SCREEN
  --------------------------------------------------------------- */
  function showLock(unlockMs) {
    const L = C.lock;
    $("#lock-eyebrow").textContent = L.eyebrow;
    $("#lock-title").innerHTML = L.title;
    $("#lock-lead").textContent = L.lead;
    const lock = $("#lock");
    lock.hidden = false;

    if (hasGSAP) {
      gsap.from(".lock-inner > *", { y: 30, opacity: 0, duration: 1.2, stagger: .1, ease: "expo.out", delay: .2 });
      gsap.from("#flee-btn", { y: 40, opacity: 0, duration: 1, delay: 1, ease: "expo.out" });
    }

    // countdown
    const nums = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
    const set = (el, v) => {
      v = String(v).padStart(2, "0");
      if (el.textContent !== v) { el.textContent = v; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    };
    let done = false;
    const tick = () => {
      const left = Math.max(0, unlockMs - now());
      const s = Math.floor(left / 1000);
      set(nums.d, Math.floor(s / 86400)); set(nums.h, Math.floor((s % 86400) / 3600));
      set(nums.m, Math.floor((s % 3600) / 60)); set(nums.s, s % 60);
      if (left <= 0 && !done) { done = true; clearInterval(iv); unlockNow(); }
    };
    const iv = setInterval(tick, 250);
    tick();

    // rotating taunts
    const tEl = $("#taunt");
    let ti = 0;
    const nextTaunt = () => {
      tEl.classList.add("swap");
      setTimeout(() => { tEl.textContent = L.taunts[ti++ % L.taunts.length]; tEl.classList.remove("swap"); }, 400);
    };
    nextTaunt();
    const tiv = setInterval(nextTaunt, 4200);

    // sealed envelope
    let si = 0;
    $("#lock-envelope").addEventListener("click", (e) => {
      const env = e.currentTarget;
      env.classList.remove("shake"); void env.offsetWidth; env.classList.add("shake");
      toast(L.sealTaunts[si++ % L.sealTaunts.length], 1800);
      if (navigator.vibrate) navigator.vibrate(40);
    });

    // the button that won't be caught
    const btn = $("#flee-btn");
    let flees = 0, gaveUp = false;
    const flee = () => {
      flees++;
      if (flees >= L.fleeLabels.length) {
        gaveUp = true;
        btn.textContent = L.gaveUpLabel;
        return;
      }
      btn.textContent = L.fleeLabels[flees];
      btn.classList.add("is-free");
      const r = btn.getBoundingClientRect();
      const pad = 16;
      let x, y, tries = 0;
      do {
        x = rand(pad, innerWidth - r.width - pad);
        y = rand(pad + 50, innerHeight - r.height - pad);
        tries++;
      } while (Math.hypot(x - r.left, y - r.top) < 140 && tries < 30);
      btn.style.left = x + "px";
      btn.style.top = y + "px";
    };
    btn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !gaveUp) flee(); });
    btn.addEventListener("touchstart", (e) => { if (!gaveUp) { e.preventDefault(); flee(); } }, { passive: false });
    btn.addEventListener("click", () => {
      if (!gaveUp) return flee();
      toast(L.gaveUpToast, 4200);
      Sky.burst(innerWidth / 2, innerHeight / 2, 18);
      // reset the chase, she can keep playing
      gaveUp = false; flees = 0;
      btn.textContent = L.fleeLabels[0];
    });

    async function unlockNow() {
      clearInterval(tiv);
      $("#lock-title").innerHTML = L.unlockedTitle;
      tEl.textContent = "";
      btn.hidden = true;
      if (window.confetti) confetti({ particleCount: 140, spread: 90, origin: { y: .6 }, colors: ["#f2a0b5", "#ffd9e3", "#ecc9a0", "#e46f8f"] });
      await sleep(1800);
      if (hasGSAP) await gsap.to(lock, { opacity: 0, duration: 1, ease: "power2.inOut" });
      lock.hidden = true;
      showGate();
    }
  }

  /* ---------------------------------------------------------------
     fill the experience with content
  --------------------------------------------------------------- */
  const PHOTOS = [];
  function fillExperience() {
    $("#hero-img").src = C.hero.photo; PHOTOS.push(C.hero.photo);
    $("#hero-script").textContent = C.hero.script;
    splitChars($("#hero-name"), C.name);
    $("#hero-date").textContent = C.hero.date;
    $("#ring-text").textContent = `happy birthday ${C.name} · happy birthday ${C.name} · `;

    splitWords($("#statement"), C.statement);

    $("#story-title").innerHTML = C.storyTitle;
    const track = $("#story-track");
    C.story.forEach((s, i) => {
      PHOTOS.push(s.src);
      track.insertAdjacentHTML("beforeend", `
        <article class="card">
          <div class="card-media"><span class="card-num">${String(i + 1).padStart(2, "0")}</span><img src="${s.src}" alt="${s.title}" loading="eager" decoding="async"></div>
          <div class="card-body"><h4 class="card-title">${s.title}</h4><p class="card-text">${s.text}</p></div>
        </article>`);
    });
    track.insertAdjacentHTML("beforeend", `<div class="card card--end"><p>${C.storyEnd}</p></div>`);

    const stage = $("#reel-stage");
    C.reel.forEach((r) => {
      PHOTOS.push(r.src);
      stage.insertAdjacentHTML("beforeend", `
        <div class="reel-slide">
          <div class="reel-card">
            <div class="reel-photo-wrap">
              <img src="${r.src}" alt="" decoding="async">
            </div>
            <div class="reel-copy">
              <p class="reel-line">${r.line}</p>
              <p class="reel-sub">${r.sub}</p>
            </div>
          </div>
        </div>`);
    });
    $$(".reel-line").forEach((el) => splitChars(el, el.textContent));
    $("#reel-end").innerHTML = C.reelEnd.map((l) => `<span class="ln-wrap"><span class="ln">${l}</span></span>`).join("");

    const M = C.memory;
    $("#memory-img").src = M.src; PHOTOS.push(M.src);
    $("#memory-note").textContent = M.note;
    $("#memory-eyebrow").textContent = M.eyebrow;
    $("#memory-title").innerHTML = M.title;
    $("#memory-text").textContent = M.text;

    $("#letter-title").textContent = C.letterTitle;
    const body = $("#letter-body");
    C.letter.forEach((line) => { const p = document.createElement("p"); body.appendChild(p); splitWords(p, line); });
    $("#letter-from").textContent = C.from;

    // reasons list
    const rl = $("#reasons-list");
    C.reasons.forEach((r) => { const li = document.createElement("li"); li.textContent = r; rl.appendChild(li); });

    // stars name
    $("#stars-name").textContent = C.name;

    const G = C.game;
    $("#game-eyebrow").textContent = G.eyebrow;
    $("#game-q").textContent = G.question;
    $("#game-sub").textContent = G.subTexts[0];
    $("#btn-yes").textContent = G.yes;
    $("#btn-no").textContent = G.noTexts[0];
    $("#game-yes-reply").textContent = G.yesReply;
    $("#game-yes-sub").textContent = G.yesSub;

    const F = C.finale;
    $("#finale-eyebrow").textContent = F.eyebrow;
    $("#finale-title").innerHTML = F.title;
    $("#finale-hint").textContent = F.hint;
    $("#finale-after-title").textContent = F.afterTitle;
    splitChars($("#finale-name"), C.name);
    $("#finale-text").textContent = F.afterText;
    const candles = $("#candles");
    for (let i = 0; i < 5; i++) candles.insertAdjacentHTML("beforeend", `<span class="candle"><span class="flame"></span><span class="smoke"></span></span>`);

    $("#footer").textContent = C.footer;
  }

  function preload(srcs) {
    return Promise.all([...new Set(srcs)].map((src) => new Promise((res) => {
      const im = new Image(); im.onload = im.onerror = res; im.src = src;
    })));
  }

  /* ---------------------------------------------------------------
     GATE & BLOCKED NOTICE TRANSITION
  --------------------------------------------------------------- */
  function showBlockedNotice() {
    const modal = $("#blocked-notice-modal");
    const bar = $("#blocked-progress-bar");
    const btn = $("#blocked-proceed-btn");
    if (!modal) {
      window.location.href = "letter.html" + window.location.search;
      return;
    }
    
    modal.hidden = false;
    modal.style.display = "grid";
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    
    // Animate progress bar
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (bar) bar.style.width = "100%";
      }, 60);
    });

    let navigated = false;
    const proceed = () => {
      if (navigated) return;
      navigated = true;
      window.location.href = "letter.html" + window.location.search;
    };

    if (btn) btn.addEventListener("click", proceed);

    // Auto proceed after 3.8s
    setTimeout(proceed, 3800);
  }

  let photosReady;
  function showGate() {
    const G = C.gate;
    $("#gate-eyebrow").textContent = G.eyebrow;
    $("#gate-title").textContent = G.title;
    $("#gate-hint").textContent = G.hint;
    $("#gate-small").textContent = G.small;

    const gate = $("#gate");
    gate.hidden = false;
    if (hasGSAP) gsap.from(".gate-inner > *", { y: 40, opacity: 0, duration: 1.4, stagger: .12, ease: "expo.out" });

    const env = $("#gate-envelope");
    env.addEventListener("click", async () => {
      if (env.classList.contains("is-open")) return;
      env.classList.add("is-open");
      await sleep(950);
      showBlockedNotice();
    }, { once: false });
  }

  async function enterExperience() {
    const flash = $("#flash");
    if (hasGSAP) await gsap.to(flash, { opacity: 1, duration: .7, ease: "power2.in" });
    $("#gate").hidden = true;
    const exp = $("#experience");
    exp.hidden = false;
    document.body.classList.remove("no-scroll");
    scrollTo(0, 0);
    initScroll();
    if (hasGSAP) {
      gsap.to(flash, { opacity: 0, duration: 1.6, ease: "power2.out" });
      heroIntro();
    }
  }

  /* ---------------------------------------------------------------
     SCROLL CHOREOGRAPHY
  --------------------------------------------------------------- */
  let lenis;
  function initScroll() {
    if (!hasGSAP) return;

    if (window.Lenis && !reduced) {
      lenis = new Lenis({ lerp: .085, wheelMultiplier: .9 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // hero states
    gsap.set(".hero-arch", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 18px 18px)" });
    gsap.set("#hero-name .ch", { yPercent: 115 });
    gsap.set("#hero-script", { opacity: 0, y: 30, filter: "blur(10px)" });

    // hero parallax out
    gsap.to(".hero-frame", { yPercent: -14, scale: .9, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-arch img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-type", { yPercent: 60, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

    // statement — words light up as you scroll
    gsap.to("#statement .w", {
      opacity: 1, stagger: .1, ease: "none",
      scrollTrigger: { trigger: ".statement", start: "top 65%", end: "bottom 75%", scrub: true }
    });

    // horizontal story
    const track = $("#story-track");
    const dist = () => track.scrollWidth - innerWidth;
    const horiz = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: "#story", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => gsap.set("#story-progress", { scaleX: self.progress })
      }
    });
    $$(".card").forEach((card) => {
      const img = $("img", card);
      if (img) {
        gsap.fromTo(img, { xPercent: -9 }, { xPercent: 9, ease: "none", scrollTrigger: { trigger: card, containerAnimation: horiz, start: "left right", end: "right left", scrub: true } });
      }
      gsap.from(card, { y: 80, rotate: 4, opacity: .2, ease: "power2.out", scrollTrigger: { trigger: card, containerAnimation: horiz, start: "left 100%", end: "left 55%", scrub: true } });
    });
    gsap.from(".story-head", { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#story", start: "top 75%" } });

    // cinematic reel
    const slides = $$(".reel-slide");
    gsap.set(".reel-end .ln", { yPercent: 110 });
    gsap.set(".reel-end", { opacity: 0 });
    const reel = gsap.timeline({
      scrollTrigger: { trigger: "#reel", start: "top top", end: () => "+=" + innerHeight * (slides.length * 1.8 + 1.2), pin: true, scrub: 1 }
    });
    slides.forEach((sl) => {
      const card = $(".reel-card", sl), chars = $$(".ch", sl), sub = $(".reel-sub", sl);
      reel.to(sl, { opacity: 1, duration: 0.8, ease: "power2.out" })
        .fromTo(card, { y: 35, scale: 0.95 }, { y: 0, scale: 1, duration: 1.2, ease: "power2.out" }, "<")
        .from(chars, { yPercent: 100, opacity: 0, stagger: 0.04, duration: 0.6, ease: "power3.out" }, "<0.3")
        .from(sub, { opacity: 0, y: 15, duration: 0.5 }, "<0.2")
        .to({}, { duration: 0.8 })
        .to(sl, { opacity: 0, y: -30, duration: 0.8, ease: "power2.in" });
    });
    reel.to(".reel-end", { opacity: 1, duration: 0.5 })
      .to(".reel-end .ln", { yPercent: 0, stagger: 0.2, duration: 0.8, ease: "power3.out" }, "<")
      .to({}, { duration: 0.8 });

    // memory
    gsap.from("#polaroid", { y: 160, rotate: -16, opacity: 0, ease: "power3.out", scrollTrigger: { trigger: "#memory", start: "top 85%", end: "center 60%", scrub: 1 } });
    gsap.from(".memory-copy > *", { y: 40, opacity: 0, stagger: .15, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".memory-copy", start: "top 80%" } });

    // letter — words fade in as she reads
    gsap.from(".letter", { y: 80, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "#letter", start: "top 85%" } });
    gsap.from(".letter-title", { opacity: 0, x: -30, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".letter", start: "top 70%" } });
    $$("#letter-body p").forEach((p) => {
      gsap.to($$(".w", p), { opacity: 1, y: 0, stagger: .06, ease: "none", scrollTrigger: { trigger: p, start: "top 88%", end: "bottom 62%", scrub: true } });
    });
    gsap.set("#letter-body .w", { y: 6 });
    gsap.from(".letter-sign", { opacity: 0, y: 20, duration: 1.2, scrollTrigger: { trigger: ".letter-sign", start: "top 92%" } });

    // reasons — each item fades in on scroll
    gsap.from(".reasons-inner .eyebrow, .reasons-title", { y: 40, opacity: 0, stagger: .1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#reasons", start: "top 75%" } });
    $$("#reasons-list li").forEach((li, i) => {
      ScrollTrigger.create({
        trigger: li,
        start: "top 88%",
        onEnter: () => { setTimeout(() => li.classList.add("is-visible"), i * 60); },
        once: true
      });
    });

    // game + finale
    gsap.from("#game-card", { y: 80, scale: .94, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: "#game", start: "top 70%" } });

    // stars section enter
    gsap.from(".stars-overlay > *", { y: 30, opacity: 0, stagger: .12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#stars-section", start: "top 70%" } });

    gsap.from(".finale-before > *, .cake", { y: 50, opacity: 0, stagger: .12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#finale", start: "top 70%" } });

    // init the starry sky canvas
    initStars();

    addEventListener("load", () => ScrollTrigger.refresh());
    ScrollTrigger.refresh();
  }

  function heroIntro() {
    const tl = gsap.timeline({ delay: .2 });
    tl.to(".hero-arch", { clipPath: "inset(0% 0% 0% 0% round 999px 999px 18px 18px)", duration: 1.8, ease: "expo.inOut" })
      .fromTo(".hero-arch img", { scale: 1.45 }, { scale: 1.08, duration: 2.6, ease: "expo.out" }, "<.2")
      .to("#hero-name .ch", { yPercent: 0, duration: 1.4, stagger: .07, ease: "expo.out" }, "-=1.4")
      .to("#hero-script", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, ease: "expo.out" }, "-=1.1")
      .to(".hero-ring", { opacity: 1, duration: 1.6 }, "-=1")
      .to(".hero-date", { opacity: .9, duration: 1 }, "-=1.2")
      .to(".scroll-cue", { opacity: 1, duration: 1 }, "-=.6")
      .add(() => {
        if (window.confetti) {
          const colors = ["#f2a0b5", "#ffd9e3", "#ecc9a0", "#e46f8f", "#fff1df"];
          confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: .8 }, colors });
          confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: .8 }, colors });
        }
      }, "-=2");
  }

  /* ---------------------------------------------------------------
     STARRY SKY — interactive constellation with name reveal
  --------------------------------------------------------------- */
  function initStars() {
    const canvas = $("#stars-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, stars = [], raf;
    const STAR_COUNT = 180;
    let nameRevealed = false;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width * devicePixelRatio;
      H = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    function seed() {
      stars = [];
      const w = W / devicePixelRatio, h = H / devicePixelRatio;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + .4,
          alpha: Math.random() * .6 + .3,
          twinkleSpeed: Math.random() * .02 + .005,
          twinkleOffset: Math.random() * Math.PI * 2,
          vx: 0, vy: 0
        });
      }
    }

    let shootingStar = null;
    function spawnShootingStar() {
      const w = W / devicePixelRatio, h = H / devicePixelRatio;
      shootingStar = {
        x: Math.random() * w * .6 + w * .1,
        y: Math.random() * h * .3,
        vx: 3 + Math.random() * 2,
        vy: 1.5 + Math.random(),
        life: 1,
        len: 40 + Math.random() * 30
      };
    }

    function draw(t) {
      const w = W / devicePixelRatio, h = H / devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      // stars
      stars.forEach((s) => {
        const flicker = Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * .3 + .7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(252, 216, 226, ${s.alpha * flicker})`;
        ctx.fill();
        // glow on brighter stars
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(234, 200, 158, ${s.alpha * flicker * .12})`;
          ctx.fill();
        }
        // physics for burst
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= .97;
        s.vy *= .97;
      });

      // shooting star
      if (shootingStar) {
        const ss = shootingStar;
        ctx.save();
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * ss.len * .3, ss.y - ss.vy * ss.len * .3);
        grad.addColorStop(0, `rgba(252, 216, 226, ${ss.life})`);
        grad.addColorStop(1, "rgba(252, 216, 226, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * ss.len * .3, ss.y - ss.vy * ss.len * .3);
        ctx.stroke();
        ctx.restore();
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= .012;
        if (ss.life <= 0) shootingStar = null;
      }

      raf = requestAnimationFrame(draw);
    }

    function burst() {
      const w = W / devicePixelRatio, h = H / devicePixelRatio;
      const cx = w / 2, cy = h / 2;
      stars.forEach((s) => {
        const dx = s.x - cx, dy = s.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 2 + Math.random() * 3;
        s.vx = (dx / dist) * force;
        s.vy = (dy / dist) * force;
      });
    }

    function handleTap(e) {
      if (nameRevealed) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const tx = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const ty = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

      // check if near any star
      const hit = stars.find((s) => Math.hypot(s.x - tx, s.y - ty) < 22);
      if (!hit) return;

      nameRevealed = true;
      if (!userMuted) Music.chime();

      // burst outward
      burst();

      // show name
      setTimeout(() => {
        const nameEl = $("#stars-name");
        nameEl.classList.add("is-visible");
        // mini confetti
        if (window.confetti) {
          const colors = ["#eac89e", "#f5dabb", "#fcd8e2", "#f0a0b4"];
          confetti({ particleCount: 50, spread: 90, origin: { x: .5, y: .5 }, colors, gravity: .6 });
        }
      }, 600);

      // update hint
      setTimeout(() => {
        const hint = $("#stars-hint");
        if (hint) hint.textContent = "This sky is yours tonight. ✨";
      }, 1200);
    }

    canvas.addEventListener("click", handleTap);
    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handleTap(e); }, { passive: false });

    resize();
    seed();
    draw(0);

    // periodic shooting star
    setInterval(() => { if (!shootingStar) spawnShootingStar(); }, 5000);
    setTimeout(spawnShootingStar, 2000);

    addEventListener("resize", () => { resize(); seed(); });
  }

  /* ---------------------------------------------------------------
     THE GAME — "No" refuses to be pressed
  --------------------------------------------------------------- */
  function initGame() {
    const G = C.game;
    const yes = $("#btn-yes"), no = $("#btn-no"), sub = $("#game-sub"), section = $("#game");
    let tries = 0;

    const dodge = () => {
      tries++;
      no.textContent = G.noTexts[Math.min(tries, G.noTexts.length - 1)];
      sub.textContent = G.subTexts[Math.min(tries, G.subTexts.length - 1)];
      yes.style.transform = `scale(${Math.min(1 + tries * .14, 2.1)})`;

      const sr = section.getBoundingClientRect();
      if (!no.classList.contains("is-fleeing")) {
        const r0 = no.getBoundingClientRect();
        section.appendChild(no);
        no.classList.add("is-fleeing");
        no.style.left = r0.left - sr.left + "px";
        no.style.top = r0.top - sr.top + "px";
        void no.offsetWidth;
      }
      const r = no.getBoundingClientRect();
      const yr = yes.getBoundingClientRect();
      const visTop = Math.max(0, -sr.top) + 70;
      const visBot = Math.min(sr.height, innerHeight - sr.top) - r.height - 20;
      let x, y, n = 0;
      do {
        x = rand(16, sr.width - r.width - 16);
        y = rand(visTop, Math.max(visTop + 10, visBot));
        n++;
        // avoid landing on the Yes button or right where it was
        const overYes = x + r.width > yr.left - sr.left - 20 && x < yr.right - sr.left + 20 && y + r.height > yr.top - sr.top - 20 && y < yr.bottom - sr.top + 20;
        const tooClose = Math.hypot(x - (r.left - sr.left), y - (r.top - sr.top)) < 120;
        if (!overYes && !tooClose) break;
      } while (n < 40);
      no.style.left = x + "px";
      no.style.top = y + "px";
      no.style.transform = `rotate(${rand(-14, 14)}deg)`;
    };

    no.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") dodge(); });
    no.addEventListener("touchstart", (e) => { e.preventDefault(); dodge(); }, { passive: false });
    no.addEventListener("click", (e) => { e.preventDefault(); dodge(); });

    yes.addEventListener("click", () => {
      if (yes.disabled) return;
      yes.disabled = true;
      if (!userMuted) Music.chime();

      if (window.confetti) {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { x: 0.5, y: 0.65 },
          colors: ["#f2a0b5", "#ffd9e3", "#ecc9a0", "#e46f8f", "#fff1df"]
        });
      }

      const elementsToHide = [$("#game-eyebrow"), $("#game-q"), sub, $("#game-btns")];
      if (no && no.parentNode) elementsToHide.push(no);

      if (hasGSAP) {
        gsap.to(elementsToHide, {
          opacity: 0,
          y: -15,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            elementsToHide.forEach((el) => { if (el) el.hidden = true; });
            if (no) no.remove();
            const res = $("#game-result");
            res.hidden = false;
            gsap.fromTo(res,
              { opacity: 0, y: 20, scale: 0.94 },
              { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.5)" }
            );
            gsap.fromTo([$(".game-result-emoji"), $("#game-yes-reply"), $("#game-yes-sub")],
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out", delay: 0.1 }
            );
          }
        });
      } else {
        elementsToHide.forEach((el) => { if (el) el.hidden = true; });
        if (no) no.remove();
        $("#game-result").hidden = false;
      }
    });
  }

  function heartRain() {
    if (!window.confetti) return;
    const colors = ["#f2a0b5", "#ffd9e3", "#e46f8f", "#ecc9a0"];
    const end = Date.now() + 1400;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: .7 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: .7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  /* ---------------------------------------------------------------
     FINALE — blow the candles
  --------------------------------------------------------------- */
  function initFinale() {
    const cake = $("#cake");
    let blown = false;
    const blow = async () => {
      if (blown) return;
      blown = true;
      const candles = $$(".candle");
      for (const c of candles) { c.classList.add("out"); await sleep(160); }
      await sleep(500);
      if (!userMuted) Music.chime();
      if (window.confetti) {
        const colors = ["#f2a0b5", "#ffd9e3", "#ecc9a0", "#e46f8f", "#fff1df"];
        const fire = (x) => confetti({ particleCount: 90, startVelocity: 45, spread: 360, ticks: 120, origin: { x, y: rand(.2, .45) }, colors });
        fire(.25); setTimeout(() => fire(.75), 300); setTimeout(() => fire(.5), 650);
        setTimeout(heartRain, 900);
      }
      const before = $("#finale-before"), after = $("#finale-after");
      if (hasGSAP) {
        await gsap.to([before, cake], { opacity: 0, y: -30, duration: .8, ease: "power2.in" });
        before.hidden = true; cake.hidden = true; after.hidden = false;
        gsap.set("#finale-name .ch", { yPercent: 115 });
        const tl = gsap.timeline();
        tl.from("#finale-after-title", { opacity: 0, y: 30, filter: "blur(10px)", duration: 1.2, ease: "expo.out" })
          .to("#finale-name .ch", { yPercent: 0, stagger: .07, duration: 1.2, ease: "expo.out" }, "-=.8")
          .from("#finale-text", { opacity: 0, y: 20, duration: 1.2, ease: "expo.out" }, "-=.6")
          .from("#replay", { opacity: 0, y: 10, duration: 1 }, "-=.4");
        ScrollTrigger.refresh();
      } else {
        before.hidden = true; cake.hidden = true; after.hidden = false;
      }
    };
    cake.addEventListener("click", blow);
    cake.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); blow(); } });

    $("#replay").addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0, { duration: 3, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------------
     sound toggle + pause when app hidden
  --------------------------------------------------------------- */
  function initSound() {
    const sb = $("#sound");
    sb.addEventListener("click", () => {
      const on = Music.toggle();
      userMuted = !on;
      sb.classList.toggle("is-muted", !on);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) Music.stop();
      else if (!userMuted && !$("#experience").hidden) Music.start();
    });
  }

  /* ---------------------------------------------------------------
     boot
  --------------------------------------------------------------- */
  async function boot() {
    document.body.classList.add("no-scroll");
    const fill = $("#loader-fill");
    fill.style.width = "30%";
    const [preview] = await Promise.all([isPreview(), syncTime(), document.fonts ? document.fonts.ready : null]);
    fill.style.width = "100%";
    await sleep(500);
    $("#loader").classList.add("is-done");
    document.body.classList.remove("is-loading");

    initGame();
    initFinale();
    initSound();

    const unlockMs = new Date(C.unlockAt).getTime();
    if (preview) toast("👀 Preview mode — lock skipped", 2400);
    if (now() >= unlockMs || preview) showGate();
    else showLock(unlockMs);
  }

  boot();
})();
