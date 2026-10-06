/* =========================================================================
   Music box "Happy Birthday" — synthesized live with Web Audio.
   No audio files needed, so it's light and works on GitHub Pages.
   ========================================================================= */
(function () {
  const N = (n) => {
    const map = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
    const m = n.match(/^([A-G])(#?)(\d)$/);
    const semi = map[m[1]] + (m[2] ? 1 : 0) + (parseInt(m[3], 10) - 4) * 12;
    return 440 * Math.pow(2, semi / 12);
  };

  // [melody note, beats, optional bass note]
  const SONG = [
    ["G4", .75], ["G4", .25],
    ["A4", 1, "C3"], ["G4", 1], ["C5", 1],
    ["B4", 2, "G2"], ["G4", .75], ["G4", .25],
    ["A4", 1, "G2"], ["G4", 1], ["D5", 1],
    ["C5", 2, "C3"], ["G4", .75], ["G4", .25],
    ["G5", 1, "C3"], ["E5", 1], ["C5", 1],
    ["B4", 1, "F2"], ["A4", 2], ["F5", .75], ["F5", .25],
    ["E5", 1, "C3"], ["C5", 1], ["D5", 1, "G2"],
    ["C5", 3, "C3"],
    [null, 3]
  ];

  const BPM = 92;
  const BEAT = 60 / BPM;

  let ctx, master, wet, playing = false, timer = null, nextTime = 0, idx = 0;

  function impulse(seconds, decay) {
    const rate = ctx.sampleRate, len = rate * seconds;
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const verb = ctx.createConvolver();
    verb.buffer = impulse(3.2, 2.6);
    wet = ctx.createGain();
    wet.gain.value = .45;
    verb.connect(wet).connect(master);
    master._verb = verb;
  }

  function bell(freq, t, dur, vol) {
    const out = ctx.createGain();
    out.connect(master);
    out.connect(master._verb);

    // music-box timbre: fundamental + bright inharmonic partials
    [[1, 1], [2.01, .35], [3.98, .12], [5.4, .05]].forEach(([mult, amp]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * amp, t + .006);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur / (mult * .8));
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + dur + .1);
    });
  }

  function pad(freq, t, dur) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = "triangle";
    o.frequency.value = freq;
    f.type = "lowpass";
    f.frequency.value = 600;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.07, t + .08);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(f).connect(g).connect(master);
    g.connect(master._verb);
    o.start(t);
    o.stop(t + dur + .1);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + .4) {
      const [note, beats, bass] = SONG[idx];
      const dur = beats * BEAT;
      if (note) bell(N(note), nextTime, Math.max(1.6, dur * 2.2), .22);
      if (bass) pad(N(bass), nextTime, BEAT * 3.2);
      nextTime += dur;
      idx = (idx + 1) % SONG.length;
    }
  }

  window.Music = {
    start() {
      if (!ctx) setup();
      if (ctx.state === "suspended") ctx.resume();
      if (playing) return;
      playing = true;
      idx = 0;
      nextTime = ctx.currentTime + .15;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(.9, ctx.currentTime, .6);
      timer = setInterval(schedule, 100);
      schedule();
    },
    stop() {
      if (!ctx || !playing) return;
      playing = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, .25);
      clearInterval(timer);
    },
    toggle() { playing ? this.stop() : this.start(); return playing; },
    get playing() { return playing; },

    // little sparkle sound for UI moments
    chime() {
      if (!ctx) setup();
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime;
      if (!playing) master.gain.setTargetAtTime(.9, t, .01);
      ["E6", "G6", "C7"].forEach((n, i) => bell(N(n), t + i * .07, 1.4, .12));
    }
  };
})();
