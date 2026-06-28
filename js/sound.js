/* =========================================================================
   SOM MÁGICO — Torneio Tribruxo da Matemática
   Efeitos sonoros 100% sintetizados com Web Audio API.
   Não usa nenhum arquivo de áudio externo: funciona abrindo o HTML
   localmente (file://) e também publicado na Vercel.
   ========================================================================= */
(function (global) {
  'use strict';

  var ctx = null;          // AudioContext (criado no primeiro toque)
  var master = null;       // ganho geral
  var enabled = true;      // som ligado/desligado
  var musicNode = null;    // música de fundo (pad)
  var musicOn = false;

  // Notas (Hz) — escala que soa "mágica"
  var N = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98
  };

  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }

  function resume() {
    var c = ensure();
    if (c && c.state === 'suspended') { c.resume(); }
  }

  // Toca uma nota simples com envelope ADSR curtinho
  function tone(freq, start, dur, type, vol, opts) {
    if (!ctx) return;
    opts = opts || {};
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, start);
    if (opts.slideTo) {
      o.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), start + dur);
    }
    var peak = (vol == null ? 0.35 : vol);
    var atk = opts.attack == null ? 0.008 : opts.attack;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(master);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  // Pequeno ruído (para "fumaça"/poção) usando buffer
  function noise(start, dur, vol, filterFreq) {
    if (!ctx) return;
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) { data[i] = (Math.random() * 2 - 1); }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filterFreq || 800;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(start); src.stop(start + dur);
  }

  function play(fn) {
    if (!enabled) return;
    var c = ensure();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    fn(c.currentTime);
  }

  var Sound = {
    /* Liga o áudio (chamar no primeiro gesto do usuário) */
    unlock: function () { resume(); },

    isEnabled: function () { return enabled; },
    setEnabled: function (v) {
      enabled = !!v;
      if (!enabled) { this.stopMusic(); }
      return enabled;
    },
    toggle: function () { this.setEnabled(!enabled); return enabled; },

    /* Clique de botão — blip curtinho e suave */
    click: function () {
      play(function (t) {
        tone(N.E5, t, 0.09, 'triangle', 0.22, { slideTo: N.A5 });
      });
    },

    /* Selecionar uma opção */
    pick: function () {
      play(function (t) {
        tone(N.C5, t, 0.08, 'sine', 0.25);
        tone(N.G5, t + 0.05, 0.10, 'sine', 0.2);
      });
    },

    /* ACERTO — faísca alegre ascendente */
    correct: function () {
      play(function (t) {
        var seq = [N.C5, N.E5, N.G5, N.C6];
        for (var i = 0; i < seq.length; i++) {
          tone(seq[i], t + i * 0.06, 0.18, 'triangle', 0.3);
        }
        // brilho agudo
        tone(N.E6, t + 0.24, 0.25, 'sine', 0.18, { slideTo: N.G6 });
      });
    },

    /* Ganhar pontos extras / moeda mágica */
    coin: function () {
      play(function (t) {
        tone(N.B5, t, 0.07, 'square', 0.18);
        tone(N.E6, t + 0.06, 0.16, 'square', 0.18);
      });
    },

    /* ERRO — gentil, descendente, nunca assustador */
    wrong: function () {
      play(function (t) {
        tone(N.A4, t, 0.16, 'sine', 0.22, { slideTo: N.F4 });
        tone(N.F4, t + 0.12, 0.22, 'sine', 0.18, { slideTo: N.D4 });
      });
    },

    /* Pomo de ouro capturado — brilho rápido cintilante */
    snitch: function () {
      play(function (t) {
        var seq = [N.G5, N.B5, N.D6, N.G6, N.E6];
        for (var i = 0; i < seq.length; i++) {
          tone(seq[i], t + i * 0.045, 0.12, 'sine', 0.22);
        }
      });
    },

    /* Borbulhar da poção */
    bubble: function () {
      play(function (t) {
        noise(t, 0.25, 0.12, 600);
        tone(N.C4, t + 0.02, 0.18, 'sine', 0.12, { slideTo: N.G4 });
      });
    },

    /* Som de feitiço/varinha (whoosh mágico) */
    spell: function () {
      play(function (t) {
        tone(N.C6, t, 0.3, 'sine', 0.16, { slideTo: N.C4 });
        noise(t, 0.3, 0.06, 1200);
      });
    },

    /* Começo de fase — abertura encantada */
    phaseStart: function () {
      play(function (t) {
        var seq = [N.C5, N.G5, N.C6];
        for (var i = 0; i < seq.length; i++) {
          tone(seq[i], t + i * 0.10, 0.4, 'triangle', 0.25);
        }
      });
    },

    /* Subir de nível / nova conquista — fanfarra curta */
    levelUp: function () {
      play(function (t) {
        var melody = [
          [N.C5, 0.00], [N.E5, 0.10], [N.G5, 0.20], [N.C6, 0.32],
          [N.G5, 0.46], [N.C6, 0.56]
        ];
        for (var i = 0; i < melody.length; i++) {
          tone(melody[i][0], t + melody[i][1], 0.28, 'triangle', 0.3);
          tone(melody[i][0] / 2, t + melody[i][1], 0.28, 'sine', 0.12);
        }
      });
    },

    /* Fim de fase vitorioso — fanfarra maior */
    fanfare: function () {
      play(function (t) {
        var melody = [
          [N.G4, 0.00, 0.18], [N.C5, 0.18, 0.18], [N.E5, 0.36, 0.18],
          [N.G5, 0.54, 0.24], [N.E5, 0.78, 0.14], [N.G5, 0.92, 0.5]
        ];
        for (var i = 0; i < melody.length; i++) {
          tone(melody[i][0], t + melody[i][1], melody[i][2], 'triangle', 0.32);
          tone(melody[i][0] / 2, t + melody[i][1], melody[i][2], 'sine', 0.14);
        }
        // brilhos finais
        tone(N.C6, t + 1.0, 0.5, 'sine', 0.18);
        tone(N.E6, t + 1.05, 0.5, 'sine', 0.14);
      });
    },

    /* Rugido do dragão (chefe) — grave e texturizado, sem ser assustador */
    dragon: function () {
      play(function (t) {
        tone(73.42, t, 0.7, 'sawtooth', 0.18, { slideTo: 110 });
        noise(t, 0.7, 0.12, 300);
      });
    },

    /* Tique de contagem / suspense */
    tick: function () {
      play(function (t) { tone(N.A5, t, 0.04, 'square', 0.12); });
    },

    /* Música de fundo: pad suave e mágico (loop por osciladores) */
    startMusic: function () {
      if (!enabled || musicOn) return;
      var c = ensure();
      if (!c) return;
      if (c.state === 'suspended') c.resume();
      musicOn = true;
      var g = c.createGain();
      g.gain.value = 0.0;
      g.gain.linearRampToValueAtTime(0.06, c.currentTime + 2);
      g.connect(master);
      var notes = [N.C4, N.E4, N.G4];
      var oscs = [];
      for (var i = 0; i < notes.length; i++) {
        var o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = notes[i];
        // leve vibrato
        var lfo = c.createOscillator();
        var lfoG = c.createGain();
        lfo.frequency.value = 0.12 + i * 0.05;
        lfoG.gain.value = 2;
        lfo.connect(lfoG); lfoG.connect(o.frequency);
        o.connect(g);
        o.start(); lfo.start();
        oscs.push(o); oscs.push(lfo);
      }
      musicNode = { gain: g, oscs: oscs };
    },

    stopMusic: function () {
      if (!musicNode || !ctx) { musicOn = false; return; }
      try {
        musicNode.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1);
        var oscs = musicNode.oscs;
        setTimeout(function () {
          for (var i = 0; i < oscs.length; i++) { try { oscs[i].stop(); } catch (e) {} }
        }, 1100);
      } catch (e) {}
      musicNode = null;
      musicOn = false;
    },

    musicPlaying: function () { return musicOn; }
  };

  global.Sound = Sound;
})(window);
