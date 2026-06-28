/* =========================================================================
   TRILHA SONORA MÁGICA — Torneio Tribruxo da Matemática
   Música procedural contínua (Web Audio API), sem arquivos externos.
   Troca de tema por fase com crossfade suave (estilo trilha adaptativa).
   Usa um agendador com "lookahead" (padrão de áudio em jogos) para tocar
   sem cortes/estouros.
   ========================================================================= */
(function (global) {
  'use strict';

  var ctx = null, master = null, busGain = null;
  var enabled = true, running = false;
  var timer = null;
  var nextNoteTime = 0, beat = 0, bar = 0;
  var lookahead = 0.025, scheduleAhead = 0.12;
  var theme = null, targetTheme = null;
  var fadeUntil = 0;

  // notas: semitom -> Hz (a partir de uma raiz)
  function hz(root, semi) { return root * Math.pow(2, semi / 12); }

  /* ----- definição dos temas por fase ----- */
  // chords: triades em semitons (relativos à raiz). lead: pool de semitons (escala).
  var THEMES = {
    menu: {
      root: 220, bpm: 84, beatsPerBar: 4, wave: 'sine', bassWave: 'sine', energy: 0.15,
      scale: [0, 2, 3, 5, 7, 8, 10, 12, 15], // Lá menor (misterioso, acolhedor)
      chords: [[0, 3, 7], [-4, 0, 3], [5, 8, 12], [-2, 2, 5]],
      lvol: 0.10, pvol: 0.05, bvol: 0.07
    },
    feiticos: {
      root: 262, bpm: 96, beatsPerBar: 4, wave: 'triangle', bassWave: 'sine', energy: 0.3,
      scale: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16], // Dó maior (curioso, claro)
      chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]],
      lvol: 0.11, pvol: 0.05, bvol: 0.08
    },
    pocoes: {
      root: 294, bpm: 120, beatsPerBar: 4, wave: 'triangle', bassWave: 'triangle', energy: 0.5,
      scale: [0, 2, 4, 7, 9, 12, 14, 16], // pentatônica alegre, saltitante
      chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [2, 7, 11]],
      lvol: 0.11, pvol: 0.045, bvol: 0.09, staccato: true
    },
    evanesco: {
      root: 233, bpm: 76, beatsPerBar: 4, wave: 'sine', bassWave: 'sine', energy: 0.2,
      scale: [0, 2, 3, 5, 7, 8, 11, 12, 14], // menor harmônico (misterioso)
      chords: [[0, 3, 7], [3, 7, 10], [-2, 2, 5], [0, 3, 7]],
      lvol: 0.09, pvol: 0.06, bvol: 0.07, airy: true
    },
    quadribol: {
      root: 330, bpm: 138, beatsPerBar: 4, wave: 'triangle', bassWave: 'triangle', energy: 0.7,
      scale: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 19], // maior, voador, rápido
      chords: [[0, 4, 7], [7, 11, 14], [5, 9, 12], [0, 4, 7]],
      lvol: 0.11, pvol: 0.045, bvol: 0.09, drums: true
    },
    runas: {
      root: 277, bpm: 88, beatsPerBar: 4, wave: 'sine', bassWave: 'sine', energy: 0.25,
      scale: [0, 3, 5, 7, 10, 12, 15, 17], // pentatônica menor (etéreo, místico)
      chords: [[0, 7, 12], [-2, 5, 10], [3, 10, 15], [0, 7, 12]],
      lvol: 0.10, pvol: 0.06, bvol: 0.06, airy: true
    },
    duelo: {
      root: 247, bpm: 128, beatsPerBar: 4, wave: 'sawtooth', bassWave: 'triangle', energy: 0.65,
      scale: [0, 2, 3, 5, 7, 8, 10, 12, 14], // menor dramático
      chords: [[0, 3, 7], [5, 8, 12], [3, 7, 10], [-2, 2, 7]],
      lvol: 0.09, pvol: 0.05, bvol: 0.09, drums: true, marcato: true
    },
    dragao: {
      root: 196, bpm: 144, beatsPerBar: 4, wave: 'sawtooth', bassWave: 'sawtooth', energy: 0.9,
      scale: [0, 2, 3, 5, 6, 7, 10, 12, 14], // menor tenso (com trítono)
      chords: [[0, 3, 7], [-2, 3, 6], [5, 8, 12], [0, 3, 7]],
      lvol: 0.10, pvol: 0.05, bvol: 0.11, drums: true, epic: true
    }
  };

  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0;
      busGain = ctx.createGain();
      busGain.gain.value = 1.0;
      // filtro suave geral para não cansar o ouvido
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3800;
      busGain.connect(lp); lp.connect(master); master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }

  function voice(freq, t, dur, wave, vol, opts) {
    opts = opts || {};
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(freq, t);
    if (opts.glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.glide), t + dur);
    var atk = opts.attack == null ? 0.01 : opts.attack;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(busGain);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function kick(t, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(vol || 0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(busGain);
    o.start(t); o.stop(t + 0.18);
  }

  function hat(t, vol) {
    var len = Math.floor(ctx.sampleRate * 0.03);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    var g = ctx.createGain(); g.gain.setValueAtTime(vol || 0.04, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    s.connect(f); f.connect(g); g.connect(busGain);
    s.start(t); s.stop(t + 0.05);
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function scheduleBar() {
    var th = theme;
    if (!th) return;
    var spb = 60 / th.bpm;            // segundos por batida
    var chord = th.chords[bar % th.chords.length];
    var t0 = nextNoteTime;

    // PAD (acorde sustentado no compasso)
    for (var c = 0; c < chord.length; c++) {
      voice(hz(th.root, chord[c]), t0, spb * th.beatsPerBar * 0.98, th.wave === 'sawtooth' ? 'triangle' : 'sine',
        th.pvol, { attack: th.airy ? 0.5 : 0.18 });
    }
    // oitava aguda etérea
    if (th.airy) voice(hz(th.root, chord[0] + 12), t0, spb * th.beatsPerBar, 'sine', th.pvol * 0.5, { attack: 0.6 });

    // por batida: baixo + percussão + lead
    for (var b = 0; b < th.beatsPerBar; b++) {
      var tb = t0 + b * spb;
      // baixo (tônica do acorde, com quinta alternada)
      var bassSemi = chord[0] - 12 + (b % 2 === 1 ? 7 : 0);
      voice(hz(th.root, bassSemi), tb, spb * (th.marcato ? 0.5 : 0.9), th.bassWave, th.bvol, { attack: 0.01 });
      // percussão
      if (th.drums) {
        if (b === 0 || b === 2) kick(tb, th.epic ? 0.22 : 0.15);
        hat(tb + spb * 0.5, 0.035);
        if (th.epic && b === 2) kick(tb + spb * 0.5, 0.14);
      }
      // LEAD: 2 notas por batida (colcheias), seguindo a escala perto dos tons do acorde
      var notesPerBeat = th.energy > 0.55 ? 2 : (Math.random() < 0.6 ? 2 : 1);
      for (var n = 0; n < notesPerBeat; n++) {
        if (Math.random() < (0.30 - th.energy * 0.12)) continue; // alguns silêncios = respiro
        var semi = pick(th.scale);
        // puxa para tons do acorde de vez em quando (mais melódico)
        if (Math.random() < 0.45) semi = chord[Math.floor(Math.random() * chord.length)] + (Math.random() < 0.5 ? 12 : 0);
        var tn = tb + n * (spb / notesPerBeat);
        var dur = th.staccato ? spb * 0.22 : (spb / notesPerBeat) * 0.9;
        voice(hz(th.root, semi + 12), tn, dur, th.wave, th.lvol, { attack: th.staccato ? 0.005 : 0.02 });
      }
    }

    nextNoteTime += spb * th.beatsPerBar;
    bar++;
    // troca de tema no início do compasso (transição suave)
    if (targetTheme && targetTheme !== theme) { theme = targetTheme; }
  }

  function loop() {
    if (!ctx || !running) return;
    while (nextNoteTime < ctx.currentTime + scheduleAhead) {
      scheduleBar();
    }
  }

  var Music = {
    unlock: function () { var c = ensure(); if (c && c.state === 'suspended') c.resume(); },
    isEnabled: function () { return enabled; },
    setEnabled: function (v) { enabled = !!v; if (!enabled) this.stop(); },

    // toca/atualiza o tema (crossfade); inicia o agendador se preciso
    play: function (themeId) {
      if (!enabled) return;
      var c = ensure(); if (!c) return;
      if (c.state === 'suspended') c.resume();
      var th = THEMES[themeId] || THEMES.menu;
      targetTheme = th;
      if (!running) {
        theme = th; running = true; bar = 0;
        nextNoteTime = c.currentTime + 0.08;
        master.gain.cancelScheduledValues(c.currentTime);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), c.currentTime);
        master.gain.linearRampToValueAtTime(0.9, c.currentTime + 1.5);
        timer = setInterval(loop, lookahead * 1000);
        loop();
      } else {
        // crossfade rápido de volume para marcar a troca, mantendo continuidade
        master.gain.cancelScheduledValues(c.currentTime);
        master.gain.setValueAtTime(master.gain.value, c.currentTime);
        master.gain.linearRampToValueAtTime(0.45, c.currentTime + 0.25);
        master.gain.linearRampToValueAtTime(0.9, c.currentTime + 1.2);
      }
    },

    duck: function (on) { // abaixa a música em momentos de efeito (ex.: fanfarra)
      if (!ctx || !running) return;
      var v = on ? 0.35 : 0.9;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.2);
    },

    stop: function () {
      if (!ctx) { running = false; return; }
      running = false;
      if (timer) { clearInterval(timer); timer = null; }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    },

    isRunning: function () { return running; }
  };

  global.Music = Music;
})(window);
