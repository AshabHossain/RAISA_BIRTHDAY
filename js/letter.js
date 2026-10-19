/* =========================================================================
   Letter Experience Engine — For Raisa
   Web Audio music box "Happy Birthday", ambient embers canvas, and letter unfold
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. Web Audio Synthesizer: Music Box "Happy Birthday"
     Zero external audio files, 100% works on GitHub Pages & Mobile
  --------------------------------------------------------------- */
  const MusicBox = (() => {
    const N = (n) => {
      const map = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
      const m = n.match(/^([A-G])(#?)(\d)$/);
      if (!m) return 440;
      const semi = map[m[1]] + (m[2] ? 1 : 0) + (parseInt(m[3], 10) - 4) * 12;
      return 440 * Math.pow(2, semi / 12);
    };

    // Melody: [Note, Beats, optional Bass note]
    const SONG = [
      ["G4", 0.75], ["G4", 0.25],
      ["A4", 1.0, "C3"], ["G4", 1.0], ["C5", 1.0],
      ["B4", 2.0, "G2"], ["G4", 0.75], ["G4", 0.25],
      ["A4", 1.0, "G2"], ["G4", 1.0], ["D5", 1.0],
      ["C5", 2.0, "C3"], ["G4", 0.75], ["G4", 0.25],
      ["G5", 1.0, "C3"], ["E5", 1.0], ["C5", 1.0],
      ["B4", 1.0, "F2"], ["A4", 2.0], ["F5", 0.75], ["F5", 0.25],
      ["E5", 1.0, "C3"], ["C5", 1.0], ["D5", 1.0, "G2"],
      ["C5", 3.0, "C3"],
      [null, 2.5]
    ];

    const BPM = 88;
    const BEAT = 60 / BPM;

    let ctx = null;
    let master = null;
    let wet = null;
    let playing = false;
    let timer = null;
    let nextTime = 0;
    let idx = 0;

    function createReverbBuffer(seconds, decay) {
      const rate = ctx.sampleRate;
      const len = rate * seconds;
      const buf = ctx.createBuffer(2, len, rate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
      }
      return buf;
    }

    function initContext() {
      if (ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const verb = ctx.createConvolver();
      verb.buffer = createReverbBuffer(3.0, 2.4);
      wet = ctx.createGain();
      wet.gain.value = 0.42;
      verb.connect(wet).connect(master);
      master._verb = verb;
    }

    function playBell(freq, t, dur, vol) {
      const out = ctx.createGain();
      out.connect(master);
      out.connect(master._verb);

      // Acoustic celesta/music box timbre with delicate upper harmonics
      [[1, 1.0], [2.01, 0.32], [3.98, 0.12], [5.4, 0.04]].forEach(([mult, amp]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq * mult;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol * amp, t + 0.007);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (mult * 0.8));
        osc.connect(g).connect(out);
        osc.start(t);
        osc.stop(t + dur + 0.1);
      });
    }

    function playBassPad(freq, t, dur) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      osc.type = "triangle";
      osc.frequency.value = freq;
      filt.type = "lowpass";
      filt.frequency.value = 520;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.065, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(filt).connect(g).connect(master);
      g.connect(master._verb);
      osc.start(t);
      osc.stop(t + dur + 0.1);
    }

    function scheduler() {
      while (nextTime < ctx.currentTime + 0.4) {
        const [note, beats, bass] = SONG[idx];
        const dur = beats * BEAT;
        if (note) playBell(N(note), nextTime, Math.max(1.6, dur * 2.2), 0.24);
        if (bass) playBassPad(N(bass), nextTime, BEAT * 3.4);
        nextTime += dur;
        idx = (idx + 1) % SONG.length;
      }
    }

    function start() {
      initContext();
      if (ctx.state === "suspended") ctx.resume();
      if (playing) return;
      playing = true;
      nextTime = ctx.currentTime + 0.05;
      idx = 0;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.95, ctx.currentTime + 1.2);
      timer = setInterval(scheduler, 100);
      updateSoundUI(true);
    }

    function stop() {
      if (!playing || !ctx) return;
      playing = false;
      clearInterval(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      updateSoundUI(false);
    }

    function toggle() {
      if (playing) {
        stop();
        return false;
      } else {
        start();
        return true;
      }
    }

    function isPlaying() {
      return playing;
    }

    return { start, stop, toggle, isPlaying };
  })();

  /* ---------------------------------------------------------------
     2. Sound Button UI Helper
  --------------------------------------------------------------- */
  function updateSoundUI(isPlaying) {
    const btn = document.getElementById("sound-toggle");
    const label = document.getElementById("sound-label");
    if (!btn) return;
    if (isPlaying) {
      btn.classList.remove("is-muted");
      if (label) label.textContent = "Happy Birthday ♪";
    } else {
      btn.classList.add("is-muted");
      if (label) label.textContent = "Play Music";
    }
  }

  /* ---------------------------------------------------------------
     3. Ambient Canvas: Golden Star Dust & Embers
  --------------------------------------------------------------- */
  function initAmbientCanvas() {
    const cv = document.getElementById("letter-sky");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W, H, DPR;
    let particles = [];
    const COLORS = ["#ffd9a6", "#ecc492", "#f7ecd5", "#c69255", "#e06888"];

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const count = Math.min(70, Math.round((W * H) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.6 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.45,
        speedY: 0.12 + Math.random() * 0.28,
        swaySpeed: 0.008 + Math.random() * 0.015,
        swayDist: 10 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[(Math.random() * COLORS.length) | 0]
      }));
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.phase += p.swaySpeed;
        p.y -= p.speedY;
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }

        const currentX = p.x + Math.sin(p.phase) * (p.swayDist * 0.35);
        const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase * 1.5));

        ctx.beginPath();
        ctx.arc(currentX, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    resize();
    render();
  }

  /* ---------------------------------------------------------------
     4. Letter Reveal & Envelope Interaction
  --------------------------------------------------------------- */
  function initLetterInteraction() {
    const envelopeStage = document.getElementById("envelope-stage");
    const letterDoc = document.getElementById("letter-doc");
    const vintageEnv = document.getElementById("vintage-envelope");
    const soundToggle = document.getElementById("sound-toggle");

    // Sound toggle listener
    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        MusicBox.toggle();
      });
    }

    function openTheLetter() {
      // 1. Play music immediately on user gesture
      MusicBox.start();

      // 2. Hide envelope stage with smooth fade
      if (envelopeStage) {
        envelopeStage.style.opacity = "0";
        envelopeStage.style.transform = "translateY(-15px) scale(0.96)";
        setTimeout(() => {
          envelopeStage.classList.add("is-opened");
        }, 600);
      }

      // 3. Reveal and smoothly slide letter sheet onto desk
      if (letterDoc) {
        letterDoc.classList.add("is-visible");
      }

      // 4. Save state so refreshing keeps it open
      try {
        sessionStorage.setItem("raisa_letter_opened", "1");
      } catch (e) {}
    }

    if (vintageEnv) {
      vintageEnv.addEventListener("click", openTheLetter);
    }

    // Auto-open if previously opened in this session or requested via ?open=1
    const params = new URLSearchParams(window.location.search);
    if (params.get("open") === "1" || sessionStorage.getItem("raisa_letter_opened") === "1") {
      openTheLetter();
    }
  }

  /* ---------------------------------------------------------------
     Boot on DOM ready
  --------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initAmbientCanvas();
    initLetterInteraction();
  });

})();
