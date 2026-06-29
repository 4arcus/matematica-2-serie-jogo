/* =========================================================================
   MINI-JOGOS BÔNUS — Torneio Tribruxo da Matemática
   API: MiniGame.open(phaseId, onClaim). Mantém compatibilidade com
   MiniGame.open(onClaim), usando Quadribol como fallback.
   ========================================================================= */
(function (global) {
  'use strict';

  var S = global.Sound;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function digits(n) { return { c: Math.floor(n / 100), d: Math.floor(n / 10) % 10, u: n % 10 }; }

  var CATALOG = {
    feiticos: { title: '🪄 Oficina da Varinha Numérica', subtitle: 'Monte números com centenas, dezenas e unidades.', theme: 'bonus-feiticos', music: 'feiticos', start: feiticos },
    pocoes: { title: '🧪 Caldeirão Borbulhante', subtitle: 'Escolha dois ingredientes que somam a receita pedida.', theme: 'bonus-pocoes', music: 'pocoes', start: pocoes },
    evanesco: { title: '💨 Sala do Evanesco', subtitle: 'Faça desaparecer a quantidade pedida e veja quanto sobra.', theme: 'bonus-evanesco', music: 'evanesco', start: evanesco },
    quadribol: { title: '🧹 Voo do Pomo Sequencial', subtitle: 'Voe pelo portal correto da sequência numérica.', theme: 'bonus-quadribol', music: 'quadribol', start: quadribol },
    runas: { title: '🔮 Biblioteca das Runas Secretas', subtitle: 'Encontre pares que representam a mesma quantidade.', theme: 'bonus-runas', music: 'runas', start: runas },
    duelo: { title: '⚔️ Clube de Duelos Numéricos', subtitle: 'Defenda-se escolhendo o sinal correto.', theme: 'bonus-duelo', music: 'duelo', start: duelo },
    dragao: { title: '🐉 Arena do Dragão', subtitle: 'Um mini-chefe com desafios misturados.', theme: 'bonus-dragao', music: 'dragao', start: dragao }
  };

  function gameFor(id) { return CATALOG[id] || CATALOG.quadribol; }

  function shell(game, onClaim) {
    var overlay = el('div', 'mini-overlay ' + game.theme);
    var card = el('div', 'mini-card');
    var header = el('div', 'mini-header');
    var hud = el('div', 'mini-hud');
    var scoreBox = el('span', '', '⭐ <strong>0</strong>');
    var timeBox = el('span', '', '⏳ <strong>45</strong>s');
    var stage = el('div', 'mini-stage');
    var hint = el('div', 'mini-hint', 'Toque para jogar. A recompensa vem quando você voltar.');
    var claim = el('button', 'btn btn-grande', '✓ Pegar recompensa e voltar');
    var score = 0, time = 45, done = false, timers = [], cleaners = [];

    hud.appendChild(scoreBox); hud.appendChild(timeBox);
    header.appendChild(el('h2', '', game.title)); header.appendChild(el('p', '', game.subtitle)); header.appendChild(hud);
    card.appendChild(header); card.appendChild(stage); card.appendChild(hint); card.appendChild(claim); overlay.appendChild(card);
    document.body.appendChild(overlay);

    function setScore(v) { score = Math.max(0, Math.floor(v || 0)); scoreBox.querySelector('strong').textContent = score; }
    function addScore(v) { setScore(score + v); if (S && v > 0) S.coin(); }
    function setHint(msg) { hint.innerHTML = msg; }
    function every(fn, ms) { var id = setInterval(fn, ms); timers.push(id); return id; }
    function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function on(target, evt, fn) { target.addEventListener(evt, fn); cleaners.push(function () { target.removeEventListener(evt, fn); }); }
    function setTime(v) { time = Math.max(0, Math.floor(v || 0)); timeBox.querySelector('strong').textContent = time; if (time <= 0) setHint('Tempo! Você pode pegar a recompensa ou brincar mais um pouco.'); }
    function close() {
      if (done) return; done = true;
      for (var i = 0; i < timers.length; i++) { clearInterval(timers[i]); clearTimeout(timers[i]); }
      for (var c = 0; c < cleaners.length; c++) cleaners[c]();
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof onClaim === 'function') onClaim(score);
    }
    claim.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    every(function () { if (time > 0) setTime(time - 1); }, 1000);
    return { stage: stage, addScore: addScore, setScore: setScore, setHint: setHint, setTime: setTime, every: every, later: later, on: on, close: close, get score() { return score; }, get time() { return time; } };
  }

  function btn(label, cls) { return el('button', 'mini-choice ' + (cls || ''), label); }
  function boom(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); setTimeout(function () { node.classList.remove(cls); }, 500); }

  function feiticos(api) {
    var target, current, rounds = 0, number = el('div', 'mini-number'), blocks = el('div', 'mini-blocks'), controls = el('div', 'mini-controls');
    var b100 = btn('+100', 'centena-btn'), b10 = btn('+10', 'dezena-btn'), b1 = btn('+1', 'unidade-btn'), clear = btn('Limpar'), cast = btn('Conjurar ✨', 'primary');
    controls.appendChild(b100); controls.appendChild(b10); controls.appendChild(b1); controls.appendChild(clear); controls.appendChild(cast);
    api.stage.appendChild(number); api.stage.appendChild(blocks); api.stage.appendChild(controls);
    function draw() { var d = digits(current); number.innerHTML = 'Alvo: <strong>' + target + '</strong><br><span>Você montou: ' + current + '</span>'; blocks.innerHTML = '<div><strong>' + d.c + '</strong><small>centenas</small></div><div><strong>' + d.d + '</strong><small>dezenas</small></div><div><strong>' + d.u + '</strong><small>unidades</small></div>'; }
    function next() { target = randInt(rounds < 2 ? 30 : 100, rounds < 2 ? 99 : 499); current = 0; rounds++; draw(); api.setHint('Pense no valor posicional: 243 = 2 centenas, 4 dezenas e 3 unidades.'); }
    function add(v) { if (current + v <= 499) { current += v; if (S) S.pick(); draw(); } }
    api.on(b100, 'click', function () { add(100); }); api.on(b10, 'click', function () { add(10); }); api.on(b1, 'click', function () { add(1); });
    api.on(clear, 'click', function () { current = 0; if (S) S.spell(); draw(); });
    api.on(cast, 'click', function () { if (current === target) { api.addScore(140); api.setHint('Feitiço perfeito!'); next(); } else { api.setScore(api.score - 25); api.setHint('Confira centenas, dezenas e unidades.'); boom(api.stage, 'mini-wrong'); if (S) S.wrong(); } });
    next();
  }

  function pocoes(api) {
    var target, selected = [], label = el('div', 'mini-number'), grid = el('div', 'mini-grid');
    api.stage.appendChild(label); api.stage.appendChild(grid);
    function next() {
      selected = []; grid.innerHTML = '';
      var a = randInt(8, 60), b = randInt(5, 60); target = a + b; var nums = [a, b];
      while (nums.length < 8) { var n = randInt(3, Math.min(95, target - 1)); if (nums.indexOf(n) === -1 && nums.indexOf(target - n) === -1) nums.push(n); }
      label.innerHTML = 'Receita: <strong>' + target + '</strong>'; api.setHint('Toque em dois ingredientes. Some antes de jogar no caldeirão.');
      shuffle(nums).forEach(function (n) { var x = btn('🫧 ' + n); x.dataset.n = n; api.on(x, 'click', function () { pickIng(x); }); grid.appendChild(x); });
    }
    function pickIng(x) {
      if (x.classList.contains('sel')) return; x.classList.add('sel'); selected.push(x); if (S) S.bubble();
      if (selected.length < 2) return;
      var sum = Number(selected[0].dataset.n) + Number(selected[1].dataset.n);
      if (sum === target) { api.addScore(130); api.setHint(selected[0].dataset.n + ' + ' + selected[1].dataset.n + ' = ' + target + '. Poção perfeita!'); next(); }
      else { api.setScore(api.score - 20); api.setHint('Essa mistura deu ' + sum + '. Tente formar ' + target + '.'); selected.forEach(function (b) { b.classList.remove('sel'); }); selected = []; if (S) S.wrong(); }
    }
    next();
  }

  function evanesco(api) {
    var total, vanish, clicked, label = el('div', 'mini-number'), field = el('div', 'mini-objects');
    api.stage.appendChild(label); api.stage.appendChild(field);
    function next() {
      total = randInt(8, 18); vanish = randInt(2, total - 3); clicked = 0; field.innerHTML = '';
      label.innerHTML = '<strong>' + total + '</strong> objetos. Faça sumir <strong>' + vanish + '</strong>.';
      api.setHint('Depois de sumir, diga mentalmente quanto sobra: ' + total + ' − ' + vanish + '.');
      for (var i = 0; i < total; i++) { var o = btn(pick(['📚', '🕯️', '🪶', '💎']), 'object'); api.on(o, 'click', vanishObj(o)); field.appendChild(o); }
    }
    function vanishObj(o) { return function () {
      if (o.classList.contains('gone') || clicked >= vanish) return; o.classList.add('gone'); clicked++; if (S) S.spell();
      if (clicked === vanish) { var rest = total - vanish; api.addScore(120); api.setHint('Evanesco! Sobraram ' + rest + ' objetos, pois ' + total + ' − ' + vanish + ' = ' + rest + '.'); api.later(next, 850); }
    }; }
    next();
  }

  function quadribol(api) {
    var answer, label = el('div', 'mini-number'), lanes = el('div', 'mini-grid');
    api.stage.appendChild(label); api.stage.appendChild(lanes);
    function next() {
      lanes.innerHTML = ''; var mode = pick(['seq', 'ant', 'suc']), start = randInt(2, 80), step = pick([2, 3, 5, 10]);
      if (mode === 'seq') { answer = start + step * 3; label.innerHTML = 'Portal da sequência:<br><strong>' + start + ', ' + (start + step) + ', ' + (start + step * 2) + ', ?</strong>'; api.setHint('O pomo está voando de ' + step + ' em ' + step + '.'); }
      else { answer = mode === 'ant' ? start - 1 : start + 1; label.innerHTML = 'Portal do ' + (mode === 'ant' ? 'antecessor' : 'sucessor') + ': <strong>' + start + '</strong>'; api.setHint(mode === 'ant' ? 'Antecessor vem antes.' : 'Sucessor vem depois.'); }
      var opts = shuffle([answer, answer + step, Math.max(0, answer - step), answer + 1]).slice(0, 4);
      opts.forEach(function (n) { var p = btn('🟡 ' + n); api.on(p, 'click', function () { if (n === answer) { api.addScore(130); api.setHint('Pomo capturado no portal ' + answer + '!'); next(); } else { api.setScore(api.score - 20); api.setHint('Esse portal desviou da rota.'); if (S) S.wrong(); } }); lanes.appendChild(p); });
    }
    next();
  }

  function runas(api) {
    var first = null, lock = false, grid = el('div', 'mini-grid mini-rune-grid');
    api.stage.appendChild(grid);
    function next() {
      grid.innerHTML = ''; first = null; lock = false; api.setHint('Vire duas runas. Faça pares com o mesmo valor.');
      var vals = shuffle([randInt(6, 18), randInt(20, 49), randInt(50, 99), randInt(10, 30)]);
      var cards = [];
      vals.forEach(function (v) {
        var parte = randInt(1, Math.min(9, v - 1));
        cards.push({ v: v, t: String(v) });
        cards.push({ v: v, t: parte + ' + ' + (v - parte) });
      });
      shuffle(cards).forEach(function (card) { var c = btn('ᚱ', 'rune-card'); c.dataset.v = card.v; c.dataset.t = card.t; api.on(c, 'click', function () { flip(c); }); grid.appendChild(c); });
    }
    function flip(c) {
      if (lock || c.classList.contains('matched') || c === first) return;
      c.innerHTML = c.dataset.t; c.classList.add('open'); if (S) S.pick();
      if (!first) { first = c; return; }
      if (first.dataset.v === c.dataset.v) { first.classList.add('matched'); c.classList.add('matched'); api.addScore(110); api.setHint('Par de runas equivalente!'); first = null; if (!grid.querySelector('.rune-card:not(.matched)')) api.later(next, 800); }
      else { lock = true; api.setScore(api.score - 15); api.setHint('Essas runas não valem a mesma coisa.'); api.later(function () { first.innerHTML = 'ᚱ'; c.innerHTML = 'ᚱ'; first.classList.remove('open'); c.classList.remove('open'); first = null; lock = false; }, 700); if (S) S.wrong(); }
    }
    next();
  }

  function duelo(api) {
    var a, b, ans, label = el('div', 'mini-number'), controls = el('div', 'mini-controls');
    api.stage.appendChild(label); api.stage.appendChild(controls);
    ['<', '=', '>'].forEach(function (s) { var x = btn(s, 'sign'); api.on(x, 'click', function () { strike(s); }); controls.appendChild(x); });
    function next() { a = randInt(1, 499); b = Math.random() < 0.2 ? a : randInt(1, 499); ans = a > b ? '>' : (a < b ? '<' : '='); label.innerHTML = 'Bloqueie o feitiço:<br><strong>' + a + ' ___ ' + b + '</strong>'; api.setHint('Compare primeiro as centenas, depois dezenas e unidades.'); }
    function strike(s) { if (s === ans) { api.addScore(125); api.setHint(a + ' ' + ans + ' ' + b + '. Defesa perfeita!'); next(); } else { api.setScore(api.score - 20); api.setHint('Olhe com calma: ' + a + ' ' + ans + ' ' + b + '.'); if (S) S.wrong(); } }
    next();
  }

  function dragao(api) {
    var area = el('div', 'mini-dragon'), step = 0;
    api.stage.appendChild(area);
    function ask() {
      area.innerHTML = ''; step++;
      var kind = pick(['sum', 'sub', 'cmp', 'order']);
      if (step % 5 === 1) kind = 'sum';
      if (kind === 'sum') askChoices(randInt(20, 180), randInt(10, 120), '+');
      else if (kind === 'sub') { var a = randInt(80, 499), b = randInt(10, a - 5); askChoices(a, b, '-'); }
      else if (kind === 'cmp') askCompare();
      else askOrder();
    }
    function askChoices(a, b, op) {
      var ans = op === '+' ? a + b : a - b;
      area.appendChild(el('div', 'mini-number', 'O dragão exige:<br><strong>' + a + ' ' + op + ' ' + b + ' = ?</strong>'));
      shuffle([ans, ans + 10, Math.max(0, ans - 10), ans + 1]).forEach(function (n) { var x = btn(n); api.on(x, 'click', function () { hit(n === ans, ans); }); area.appendChild(x); });
    }
    function askCompare() {
      var a = randInt(1, 499), b = randInt(1, 499), ans = a > b ? '>' : (a < b ? '<' : '=');
      area.appendChild(el('div', 'mini-number', 'Escudo de comparação:<br><strong>' + a + ' ___ ' + b + '</strong>'));
      ['<', '=', '>'].forEach(function (s) { var x = btn(s, 'sign'); api.on(x, 'click', function () { hit(s === ans, ans); }); area.appendChild(x); });
    }
    function askOrder() {
      var nums = shuffle([randInt(1, 120), randInt(121, 260), randInt(261, 499)]);
      var ans = nums.slice().sort(function (a, b) { return a - b; }).join(',');
      area.appendChild(el('div', 'mini-number', 'Ordene os escudos do menor para o maior:<br><strong>' + nums.join(' • ') + '</strong>'));
      shuffle([ans, nums.slice().reverse().join(','), nums.join(',')]).forEach(function (s) { var x = btn(s.replace(/,/g, ' < ')); api.on(x, 'click', function () { hit(s === ans, ans.replace(/,/g, ' < ')); }); area.appendChild(x); });
    }
    function hit(ok, ans) {
      if (ok) { api.addScore(160); api.setHint('O dragão recuou!'); if (S) S.dragon(); api.later(ask, 450); }
      else { api.setScore(api.score - 30); api.setHint('O escudo correto era: ' + ans + '.'); if (S) S.wrong(); }
    }
    ask();
  }

  global.MiniGame = {
    catalog: CATALOG,
    get: gameFor,
    open: function (phaseId, onClaim) {
      if (typeof phaseId === 'function') { onClaim = phaseId; phaseId = 'quadribol'; }
      var game = gameFor(phaseId);
      var api = shell(game, onClaim);
      game.start(api);
    }
  };
})(window);
