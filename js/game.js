/* =========================================================================
   MOTOR DO JOGO — Torneio Tribruxo da Matemática
   ========================================================================= */
(function () {
  'use strict';

  var GC = window.GAME_CONTENT;
  var S = window.Sound;

  /* ---------------- textos e configuração (narrativa) ---------------- */
  var CONFIG = {
    tagline: 'Vire bruxo dos números e enfrente o dragão da Primeira Tarefa!',
    chapeuIntro: 'Olá, jovem bruxo! Sou o Chapéu Falante. Coloque-me na sua cabeça... hummm, eu sinto uma magia muito forte aí dentro! Você é corajoso e ama os números. Agora, escolha a sua casa!',
    houses: [
      { id: 'grifinoria', name: 'Grifinória', motto: 'Coragem para tentar de novo!', emoji: '🦁', primary: '#740001', accent: '#d3a625' },
      { id: 'corvinal', name: 'Corvinal', motto: 'Pensar é a maior magia!', emoji: '🦅', primary: '#0e1a40', accent: '#946b2d' },
      { id: 'lufalufa', name: 'Lufa-Lufa', motto: 'Com calma a gente chega lá!', emoji: '🦡', primary: '#ecb939', accent: '#372e29' },
      { id: 'sonserina', name: 'Sonserina', motto: 'Esperto como uma cobra!', emoji: '🐍', primary: '#1a472a', accent: '#aaaaaa' }
    ],
    phaseIntros: {
      feiticos: 'A primeira aula vai começar! Hoje você aprende a magia dos números. Levante a varinha e diga: encantar!',
      pocoes: 'Pegue o caldeirão fumegante! Vamos misturar os ingredientes mágicos. Pronto para somar como um mestre das poções?',
      evanesco: 'Diga a palavra mágica: Evanesco! Esse feitiço faz as coisas sumirem. Vamos ver quanto sobra!',
      quadribol: 'Suba na vassoura e voe alto! O pomo de ouro está fugindo pela reta dos números. Pegue ele na ordem certa!',
      runas: 'As paredes estão cheias de símbolos secretos! Tem caixinhas escondendo números. Use sua esperteza!',
      duelo: 'Erga a varinha, o duelo vai começar! Quem é maior? Quem é menor? Em guarda!',
      dragao: 'Chegou a hora! O dragão está rugindo na arena. Use TUDO o que aprendeu. A Primeira Tarefa começa AGORA!'
    },
    sucesso: ['Magia perfeita! ✨', 'Uau, sua varinha brilhou!', 'Isso! Você é um mestre dos números!',
      'Feitiço certeiro! 🪄', 'Bravo! O Chapéu está orgulhoso!', 'Que magia poderosa!',
      'Acertou em cheio, jovem bruxo!', 'Os professores aplaudiram você!', 'Brilhante! Pontos para sua casa!',
      'Você está virando um bruxo de verdade!', 'Espetacular! A poção ficou perfeita!', 'Pomo de ouro capturado! 🟡',
      'Incrível! O dragão ficou com medo!', 'Mágico! Continue assim!'],
    incentivo: ['Quase lá! Tenta de novo, você consegue!', 'Todo bruxo erra às vezes. Respira e tenta outra vez!',
      'Opa! A magia escapou. Vamos de novo!', 'Não desiste! Os grandes bruxos treinam muito.',
      'Tá quase! Pensa com calma.', 'Errar faz parte de aprender magia. Você vai conseguir!',
      'Quase pegou o feitiço!', 'Sem problema! Até o Harry errou no começo.',
      'Ânimo! Cada tentativa te deixa mais forte.', 'A varinha tremeu um pouquinho. Tenta de novo!'],
    estrelas: {
      3: 'TRÊS ESTRELAS! ⭐⭐⭐ Magia perfeita! Você é um verdadeiro campeão tribruxo!',
      2: 'DUAS ESTRELAS! ⭐⭐ Muito bem! Quer tentar de novo para pegar a terceira?',
      1: 'UMA ESTRELA! ⭐ Você conseguiu! Que tal lançar a magia mais uma vez e brilhar ainda mais?',
      0: 'Quase lá, bruxinho! ✨ A magia é difícil mesmo, mas eu acredito em você. Vamos tentar de novo juntos?'
    },
    badges: [
      { id: 'primeiro_feitico', name: 'Primeiro Feitiço', desc: 'Lançou seu primeiro feitiço de números!', emoji: '🪄' },
      { id: 'mestre_pocoes', name: 'Mestre das Poções', desc: '3 estrelas na Aula de Poções!', emoji: '🧪' },
      { id: 'evanesco_perfeito', name: 'Evanesco Perfeito', desc: '3 estrelas no Feitiço Evanesco!', emoji: '💨' },
      { id: 'cacador_pomo', name: 'Caçador do Pomo', desc: '3 estrelas no Quadribol!', emoji: '🟡' },
      { id: 'leitor_runas', name: 'Leitor de Runas', desc: 'Decifrou as Runas Antigas!', emoji: '🔮' },
      { id: 'campeao_duelo', name: 'Campeão do Duelo', desc: '3 estrelas no Duelo!', emoji: '⚔️' },
      { id: 'domador_dragao', name: 'Domador de Dragão', desc: 'Enfrentou a Primeira Tarefa!', emoji: '🐉' },
      { id: 'tres_estrelas', name: 'Estrela Tribruxo', desc: 'Tirou três estrelas em uma fase!', emoji: '⭐' },
      { id: 'casa_orgulhosa', name: 'Orgulho da Casa', desc: 'Ganhou 3000 pontos de magia!', emoji: '🏆' },
      { id: 'campeao_torneio', name: 'Campeão Tribruxo', desc: 'Venceu o torneio inteiro! Uma lenda!', emoji: '👑' }
    ],
    victory: '🐉 O DRAGÃO ABAIXOU A CABEÇA! 🐉\n\nVocê conseguiu, jovem bruxo! Com a varinha na mão e os números no coração, você enfrentou o dragão da Primeira Tarefa e VENCEU!\n\nOs feitiços brilharam. As poções borbulharam. O pomo de ouro voou direto para a sua mão. Toda a escola está de pé, gritando o seu nome!\n\nAgora você é um CAMPEÃO TRIBRUXO DA MATEMÁTICA! 🏆👑\n\nA magia sempre esteve dentro de você. ✨'
  };

  function houseById(id) {
    for (var i = 0; i < CONFIG.houses.length; i++) if (CONFIG.houses[i].id === id) return CONFIG.houses[i];
    return CONFIG.houses[0];
  }
  function badgeById(id) {
    for (var i = 0; i < CONFIG.badges.length; i++) if (CONFIG.badges[i].id === id) return CONFIG.badges[i];
    return null;
  }

  /* ---------------- armazenamento (localStorage) ---------------- */
  var KEY = 'tribruxoMath_v1';
  var DB = { players: {}, currentId: null, settings: { sound: true } };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.players) DB = p;
        if (!DB.settings) DB.settings = { sound: true };
      }
    } catch (e) { /* começa do zero */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {}
  }
  function currentPlayer() { return DB.currentId ? DB.players[DB.currentId] : null; }

  function makeId(name) {
    return 'p_' + name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 9000 + 1000);
  }

  function newPlayer(name) {
    var id = makeId(name);
    DB.players[id] = {
      id: id, name: name, house: null, xp: 0,
      phases: {}, badges: {}, victory: false,
      created: Date.now(), lastPlayed: Date.now()
    };
    DB.currentId = id;
    save();
    return DB.players[id];
  }

  /* ---------------- utilidades de DOM ---------------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function show(screenId) {
    var telas = document.querySelectorAll('.tela');
    for (var i = 0; i < telas.length; i++) telas[i].classList.remove('ativa');
    $(screenId).classList.add('ativa');
    window.scrollTo(0, 0);
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------------- toast ---------------- */
  var toastTimer = null;
  function toast(msg, ms) {
    var t = $('toast');
    t.innerHTML = msg;
    t.classList.add('mostrar');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('mostrar'); }, ms || 2600);
  }

  /* ---------------- fundo mágico (estrelas + velas) ---------------- */
  function montarFundo() {
    var ceu = $('ceu');
    var n = window.innerWidth < 600 ? 50 : 90;
    for (var i = 0; i < n; i++) {
      var s = el('div', 'estrela');
      var size = Math.random() * 2.5 + 1;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 3) + 's';
      s.style.animationDuration = (2 + Math.random() * 3) + 's';
      if (Math.random() < 0.15) s.style.background = '#f0c75e';
      ceu.appendChild(s);
    }
    var velas = $('velas');
    var nv = window.innerWidth < 600 ? 6 : 10;
    for (var v = 0; v < nv; v++) {
      var vela = el('div', 'vela');
      vela.style.left = (5 + Math.random() * 90) + '%';
      vela.style.top = (5 + Math.random() * 45) + '%';
      vela.style.animationDelay = (Math.random() * 4) + 's';
      vela.style.animationDuration = (5 + Math.random() * 3) + 's';
      vela.innerHTML = '<span class="chama"></span>';
      velas.appendChild(vela);
    }
  }

  var reduzMov = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temaAtual = 'menu';
  var audioUnlocked = false;

  /* muda o cenário (fundo + clima + música) por fase */
  function setTema(id) {
    temaAtual = id;
    document.body.className = 'tema-' + id;
    montarClima(id);
    if (DB.settings.sound && audioUnlocked && window.Music) window.Music.play(id);
  }

  function montarClima(id) {
    var c = $('clima');
    if (!c) return;
    c.innerHTML = '';
    if (reduzMov) return;
    var i, e;
    if (id === 'pocoes') {
      for (i = 0; i < 14; i++) {
        e = el('div', 'bolha');
        var sz = 6 + Math.random() * 18;
        e.style.width = sz + 'px'; e.style.height = sz + 'px';
        e.style.left = Math.random() * 100 + '%';
        e.style.animationDuration = (5 + Math.random() * 6) + 's';
        e.style.animationDelay = (Math.random() * 6) + 's';
        c.appendChild(e);
      }
    } else if (id === 'dragao') {
      for (i = 0; i < 22; i++) {
        e = el('div', 'brasa');
        e.style.left = Math.random() * 100 + '%';
        e.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
        e.style.animationDuration = (3 + Math.random() * 4) + 's';
        e.style.animationDelay = (Math.random() * 5) + 's';
        c.appendChild(e);
      }
    } else if (id === 'quadribol') {
      for (i = 0; i < 6; i++) {
        e = el('div', 'nuvem');
        var w = 70 + Math.random() * 90;
        e.style.width = w + 'px'; e.style.height = (w * 0.5) + 'px';
        e.style.top = (5 + Math.random() * 50) + '%';
        e.style.animationDuration = (18 + Math.random() * 22) + 's';
        e.style.animationDelay = (-Math.random() * 30) + 's';
        c.appendChild(e);
      }
    } else if (id === 'runas') {
      var runas = ['ᚠ', 'ᚱ', 'ᚷ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᚹ', 'ᛚ', 'ᛞ', 'ᚨ'];
      for (i = 0; i < 10; i++) {
        e = el('div', 'runa-flutua');
        e.textContent = pick(runas);
        e.style.left = Math.random() * 96 + '%';
        e.style.top = Math.random() * 90 + '%';
        e.style.fontSize = (16 + Math.random() * 26) + 'px';
        e.style.animationDuration = (4 + Math.random() * 5) + 's';
        e.style.animationDelay = (Math.random() * 4) + 's';
        c.appendChild(e);
      }
    } else if (id === 'evanesco') {
      for (i = 0; i < 4; i++) {
        e = el('div', 'nuvem');
        var w2 = 120 + Math.random() * 120;
        e.style.width = w2 + 'px'; e.style.height = (w2 * 0.5) + 'px';
        e.style.top = (20 + Math.random() * 60) + '%';
        e.style.background = 'radial-gradient(circle, rgba(180,150,255,0.5), transparent 70%)';
        e.style.animationDuration = (26 + Math.random() * 20) + 's';
        e.style.animationDelay = (-Math.random() * 30) + 's';
        c.appendChild(e);
      }
    }
  }

  /* brasão (crest) em SVG por casa */
  function crestSVG(h) {
    var darker = sombrear(h.primary);
    var id = 'g_' + h.id;
    return '<svg class="brasao-svg" viewBox="0 0 100 122" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + h.primary + '"/><stop offset="1" stop-color="' + darker + '"/></linearGradient></defs>' +
      '<path d="M50 3 L95 17 V60 C95 95 73 113 50 119 C27 113 5 95 5 60 V17 Z" fill="url(#' + id + ')" stroke="' + h.accent + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M50 3 L95 17 V60 C95 95 73 113 50 119 C27 113 5 95 5 60 V17 Z" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" transform="scale(0.88) translate(7,8)"/>' +
      '<text x="50" y="60" font-size="44" text-anchor="middle" dominant-baseline="central">' + h.emoji + '</text>' +
      '<text x="22" y="26" font-size="11" fill="' + h.accent + '" text-anchor="middle">✦</text>' +
      '<text x="78" y="26" font-size="11" fill="' + h.accent + '" text-anchor="middle">✦</text>' +
      '</svg>';
  }

  /* ---------------- efeitos de partículas ---------------- */
  function faiscas(x, y) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cont = $('particulas');
    var total = 16;
    for (var i = 0; i < total; i++) {
      var f = el('div', 'faisca');
      var ang = (i / total) * Math.PI * 2 + Math.random() * 0.5;
      var dist = 50 + Math.random() * 90;
      f.style.left = x + 'px';
      f.style.top = y + 'px';
      f.style.setProperty('--dx', (Math.cos(ang) * dist) + 'px');
      f.style.setProperty('--dy', (Math.sin(ang) * dist + 30) + 'px');
      var dourada = Math.random() < 0.6;
      f.style.background = 'radial-gradient(circle, #ffe9a8, ' + (dourada ? '#f0c75e' : '#8a5cf6') + ')';
      f.style.boxShadow = '0 0 8px ' + (dourada ? 'rgba(240,199,94,0.8)' : 'rgba(138,92,246,0.8)');
      f.style.animation = 'estrelar ' + (600 + Math.random() * 400) + 'ms cubic-bezier(.2,.7,.2,1) forwards';
      cont.appendChild(f);
      (function (node) { setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 1100); })(f);
    }
  }

  function confete() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cont = $('particulas');
    var cores = ['#f0c75e', '#8a5cf6', '#4aa3df', '#6ee06e', '#ff7a5c', '#ffe9a8'];
    var n = window.innerWidth < 600 ? 70 : 120;
    for (var i = 0; i < n; i++) {
      var c = el('div', 'confete');
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = pick(cores);
      c.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      c.style.borderRadius = Math.random() < 0.5 ? '2px' : '50%';
      var dur = 2.5 + Math.random() * 2.5;
      c.style.animation = 'cair ' + dur + 's linear ' + (Math.random() * 0.8) + 's forwards';
      cont.appendChild(c);
      (function (node) { setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, (dur + 1.2) * 1000); })(c);
    }
  }

  /* ---------------- botão de som ---------------- */
  function atualizarBotaoSom() {
    $('btnSom').textContent = DB.settings.sound ? '🔊' : '🔇';
  }
  function setupSom() {
    atualizarBotaoSom();
    S.setEnabled(DB.settings.sound);
    if (window.Music) window.Music.setEnabled(DB.settings.sound);
    $('btnSom').addEventListener('click', function () {
      DB.settings.sound = S.toggle();
      save();
      atualizarBotaoSom();
      audioUnlocked = true;
      if (window.Music) {
        window.Music.setEnabled(DB.settings.sound);
        if (DB.settings.sound) { window.Music.unlock(); window.Music.play(temaAtual); }
      }
      if (DB.settings.sound) { S.unlock(); S.click(); }
    });
    // desbloqueia o áudio no primeiro toque (política de autoplay)
    var unlock = function () {
      audioUnlocked = true;
      S.unlock();
      if (window.Music) { window.Music.unlock(); if (DB.settings.sound) window.Music.play(temaAtual); }
      document.removeEventListener('pointerdown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
  }

  /* ---------------- progressão / desbloqueio ---------------- */
  function fasesAprendizado() {
    return GC.PHASES.filter(function (p) { return !p.boss; });
  }
  function faseDesbloqueada(phaseId) {
    var p = currentPlayer();
    var lista = GC.PHASES;
    var idx = -1;
    for (var i = 0; i < lista.length; i++) if (lista[i].id === phaseId) idx = i;
    if (idx <= 0) return true; // primeira sempre liberada
    var ph = lista[idx];
    if (ph.boss) {
      // chefe libera quando todas as fases de aprendizado foram concluídas ao menos 1 vez
      var todas = fasesAprendizado();
      for (var j = 0; j < todas.length; j++) {
        if (!p.phases[todas[j].id] || !p.phases[todas[j].id].plays) return false;
      }
      return true;
    }
    var anterior = lista[idx - 1];
    return !!(p.phases[anterior.id] && p.phases[anterior.id].plays);
  }

  /* ---------------- telas: cadastro ---------------- */
  function setupCadastro() {
    $('tagline').textContent = CONFIG.tagline;
    $('btnComecar').addEventListener('click', function () {
      S.unlock();
      var nome = ($('inputNome').value || '').trim();
      if (nome.length < 1) { toast('✋ Escreva seu nome, bruxo!'); $('inputNome').focus(); return; }
      nome = nome.replace(/[<>]/g, '').replace(/\s+/g, ' ').slice(0, 18);
      if (!nome) { toast('✋ Escreva seu nome, bruxo!'); return; }
      S.click();
      // se já existe jogador com esse nome, entra nele
      var existente = null;
      for (var id in DB.players) {
        if (DB.players[id].name.toLowerCase() === nome.toLowerCase()) existente = DB.players[id];
      }
      if (existente) {
        DB.currentId = existente.id;
        existente.lastPlayed = Date.now();
        save();
        if (existente.house) { irParaMapa(); toast('Bem-vindo de volta, ' + existente.name + '! ✨'); }
        else irParaChapeu();
      } else {
        newPlayer(nome);
        irParaChapeu();
      }
    });
    $('inputNome').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('btnComecar').click(); });
    $('btnVerPlacarCadastro').addEventListener('click', function () { S.click(); mostrarPlacar('tela-cadastro'); });
  }

  /* ---------------- telas: chapéu seletor ---------------- */
  var casaEscolhida = null;
  function irParaChapeu() {
    var p = currentPlayer();
    $('chapeuIntro').textContent = CONFIG.chapeuIntro;
    $('nomeChapeu').textContent = p.name;
    casaEscolhida = null;
    var cont = $('casas');
    cont.innerHTML = '';
    CONFIG.houses.forEach(function (h) {
      var c = el('div', 'casa-opcao');
      c.style.background = 'linear-gradient(160deg, ' + h.primary + ', ' + sombrear(h.primary) + ')';
      c.style.borderColor = h.accent;
      var corTexto = textoContraste(h.primary);
      c.style.color = corTexto;
      var corNome = (corTexto === '#fff') ? h.accent : '#2a1d0e';
      c.innerHTML = '<div class="crest-box">' + crestSVG(h) + '</div><h3 style="color:' + corNome + '">' + h.name + '</h3><p>"' + h.motto + '"</p>';
      c.addEventListener('click', function () {
        S.pick();
        casaEscolhida = h.id;
        var todos = cont.querySelectorAll('.casa-opcao');
        for (var i = 0; i < todos.length; i++) todos[i].classList.remove('sel');
        c.classList.add('sel');
        $('btnConfirmarCasa').disabled = false;
      });
      cont.appendChild(c);
    });
    $('btnConfirmarCasa').disabled = true;
    setTema('menu');
    show('tela-chapeu');
    S.spell();
  }
  $('btnConfirmarCasa').addEventListener('click', function () {
    if (!casaEscolhida) return;
    var p = currentPlayer();
    p.house = casaEscolhida;
    save();
    S.levelUp();
    var h = houseById(casaEscolhida);
    toast(h.emoji + ' Bem-vindo à ' + h.name + '!');
    irParaMapa();
  });

  function sombrear(hex) {
    // escurece levemente um hex para gradiente
    try {
      var n = parseInt(hex.slice(1), 16);
      var r = Math.max(0, (n >> 16) - 40), g = Math.max(0, ((n >> 8) & 255) - 40), b = Math.max(0, (n & 255) - 40);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } catch (e) { return hex; }
  }

  function textoContraste(hex) {
    // escolhe texto claro ou escuro conforme a luminância do fundo
    try {
      var n = parseInt(hex.slice(1), 16);
      var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      var lum = (0.299 * r + 0.587 * g + 0.114 * b);
      return lum > 150 ? '#2a1d0e' : '#fff';
    } catch (e) { return '#fff'; }
  }

  function aplicarCoresCasa(h) {
    document.documentElement.style.setProperty('--casa-1', h.accent);
    document.documentElement.style.setProperty('--casa-2', h.primary);
  }

  /* ---------------- telas: mapa do torneio ---------------- */
  function estrelasMini(n) {
    var h = '';
    for (var i = 0; i < 3; i++) h += '<span class="' + (i < n ? 'estrela-on' : 'estrela-off') + '">★</span>';
    return h;
  }

  function irParaMapa() {
    var p = currentPlayer();
    var h = houseById(p.house);
    aplicarCoresCasa(h);
    $('brasaoTopo').innerHTML = crestSVG(h);
    $('nomeTopo').textContent = p.name;
    $('casaTopo').textContent = h.name;
    $('xpTopo').textContent = p.xp;

    var mapa = $('mapa');
    mapa.innerHTML = '';
    GC.PHASES.forEach(function (ph, idx) {
      var liberada = faseDesbloqueada(ph.id);
      var dados = p.phases[ph.id] || {};
      var card = el('div', 'fase-card' + (ph.boss ? ' chefe' : '') + (liberada ? '' : ' bloqueada'));
      var estr = ph.boss
        ? (p.victory ? '<div class="estrelas-mini estrela-on">👑 VENCIDO!</div>' : '')
        : '<div class="estrelas-mini">' + estrelasMini(dados.bestStars || 0) + '</div>';
      card.innerHTML =
        '<div class="icone">' + (liberada ? ph.icon : '🔒') + '</div>' +
        '<div class="info"><h3>' + (idx + 1) + '. ' + ph.name + '</h3><p>' + ph.short + '</p>' + estr + '</div>' +
        (liberada ? '' : '<div class="cadeado">🔒</div>');
      if (liberada) {
        card.addEventListener('click', function () { S.click(); iniciarFase(ph.id); });
      } else {
        card.addEventListener('click', function () { S.wrong(); toast('🔒 Conclua a aula anterior para abrir esta!'); });
      }
      mapa.appendChild(card);
    });
    setTema('menu');
    show('tela-mapa');
  }

  $('btnPlacar').addEventListener('click', function () { S.click(); mostrarPlacar('tela-mapa'); });
  $('btnMedalhas').addEventListener('click', function () { S.click(); mostrarMedalhas(); });
  $('btnTrocarBruxo').addEventListener('click', function () {
    S.click();
    DB.currentId = null; save();
    $('inputNome').value = '';
    show('tela-cadastro');
  });

  /* ---------------- motor da fase (quiz) ---------------- */
  var Quiz = {
    phaseId: null, phase: null, total: 0, i: 0,
    acertos: 0, score: 0, hearts: 3, combo: 0, respondida: false, q: null, ordemPos: 0, ordemErro: false
  };

  function iniciarFase(phaseId) {
    var ph = null;
    for (var k = 0; k < GC.PHASES.length; k++) if (GC.PHASES[k].id === phaseId) ph = GC.PHASES[k];
    Quiz.phaseId = phaseId; Quiz.phase = ph; Quiz.total = ph.count;
    Quiz.i = 0; Quiz.acertos = 0; Quiz.score = 0; Quiz.hearts = 3; Quiz.combo = 0;

    $('tituloFase').innerHTML = ph.icon + ' ' + ph.name;
    setTema(phaseId); // muda cenário e trilha da fase
    toast(ph.icon + ' ' + (CONFIG.phaseIntros[phaseId] || ''), 4200);
    S.phaseStart();
    show('tela-fase');
    proximaQuestao();
  }

  function atualizarHUD() {
    $('vidas').innerHTML = '❤️'.repeat(Quiz.hearts) + '🖤'.repeat(3 - Quiz.hearts);
    $('pontosFase').textContent = Quiz.score;
    $('contadorQuestao').textContent = 'Questão ' + (Quiz.i) + ' de ' + Quiz.total;
    var pct = Math.round(((Quiz.i - 1) / Quiz.total) * 100);
    $('progressoFase').style.width = Math.max(0, pct) + '%';
    $('comboTxt').innerHTML = Quiz.combo >= 2 ? '🔥 Combo x' + Quiz.combo : '';
  }

  function proximaQuestao() {
    if (Quiz.i >= Quiz.total) { finalizarFase(); return; }
    Quiz.i++;
    Quiz.respondida = false;
    Quiz.ordemPos = 0; Quiz.ordemErro = false;
    Quiz.q = GC.gerar(Quiz.phaseId, Quiz.i - 1, Quiz.total);
    atualizarHUD();

    var q = Quiz.q;
    $('contextoMagico').innerHTML = q.context || '';
    $('palco').innerHTML = q.stageHTML || '';
    $('palco').style.display = q.stageHTML ? 'flex' : 'none';
    $('enunciado').innerHTML = q.promptHTML;
    $('feedback').className = 'feedback';
    $('feedback').innerHTML = '';
    $('areaContinuar').classList.add('escondido');

    if (q.type === 'order') renderOrder(q);
    else renderMC(q);
  }

  /* --- múltipla escolha --- */
  function renderMC(q) {
    var area = $('areaResposta');
    area.innerHTML = '';
    var opcaoLonga = q.options.some(function (o) { return String(o).length > 7; });
    var umaColuna = (q.layout === 'tres') || q.options.length <= 2 || opcaoLonga;
    var grade = el('div', 'opcoes' + (umaColuna ? ' uma-coluna' : ''));
    if (q.layout === 'tres') grade.style.gridTemplateColumns = '1fr 1fr 1fr';
    q.options.forEach(function (opt) {
      var b = el('button', 'opcao');
      b.innerHTML = opt;
      b.addEventListener('click', function (ev) {
        if (Quiz.respondida) return;
        responderMC(b, opt, q, ev);
      });
      grade.appendChild(b);
    });
    area.appendChild(grade);
  }

  function responderMC(botao, opt, q, ev) {
    Quiz.respondida = true;
    var area = $('areaResposta');
    var botoes = area.querySelectorAll('.opcao');
    for (var i = 0; i < botoes.length; i++) {
      botoes[i].disabled = true;
      if (botoes[i].innerHTML === String(q.correct)) botoes[i].classList.add('certa');
    }
    var acertou = String(opt) === String(q.correct);
    if (acertou) registrarAcerto(ev);
    else { botao.classList.add('errada'); registrarErro(q); }
    mostrarFeedback(acertou, q);
  }

  /* --- ordenar (clicar em ordem) --- */
  function renderOrder(q) {
    var area = $('areaResposta');
    area.innerHTML = '';
    var trilha = el('div', 'trilha');
    for (var s = 0; s < q.correctOrder.length; s++) {
      var slot = el('div', 'slot');
      slot.dataset.pos = s;
      slot.innerHTML = '?';
      trilha.appendChild(slot);
    }
    var fichas = el('div', 'fichas');
    q.items.forEach(function (val) {
      var f = el('button', 'ficha', String(val));
      f.addEventListener('click', function (ev) {
        if (Quiz.respondida) return;
        tocarFicha(f, val, q, trilha, ev);
      });
      fichas.appendChild(f);
    });
    area.appendChild(trilha);
    area.appendChild(fichas);
  }

  function tocarFicha(ficha, val, q, trilha, ev) {
    var esperado = q.correctOrder[Quiz.ordemPos];
    if (String(val) === String(esperado)) {
      ficha.classList.add('usada');
      var slot = trilha.querySelector('.slot[data-pos="' + Quiz.ordemPos + '"]');
      slot.innerHTML = String(val);
      slot.style.color = 'var(--ouro)';
      Quiz.ordemPos++;
      S.pick();
      faiscasEvento(ev);
      if (Quiz.ordemPos >= q.correctOrder.length) {
        Quiz.respondida = true;
        var acertou = !Quiz.ordemErro;
        if (acertou) registrarAcerto(ev); else registrarErro(q);
        mostrarFeedback(acertou, q);
      }
    } else {
      Quiz.ordemErro = true;
      ficha.classList.add('errada');
      S.wrong();
      setTimeout(function () { ficha.classList.remove('errada'); }, 500);
      Quiz.hearts = Math.max(0, Quiz.hearts - 0); // sem punição extra no ordenar
      toast('Esse não é o próximo... olhe com calma! 🤔', 1600);
    }
  }

  function faiscasEvento(ev) {
    var x = (ev && ev.clientX) || window.innerWidth / 2;
    var y = (ev && ev.clientY) || window.innerHeight / 2;
    faiscas(x, y);
  }

  /* ----- efeitos "juice" (baseados em pesquisa de game design) ----- */
  function countUp(elem, from, to, ms) {
    if (!elem) return;
    if (reduzMov || from === to) { elem.textContent = to; return; }
    var ini = null;
    function step(ts) {
      if (ini == null) ini = ts;
      var p = Math.min(1, (ts - ini) / ms);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out
      elem.textContent = Math.round(from + (to - from) * eased);
      elem.style.transform = 'scale(' + (1 + 0.18 * (1 - p)) + ')';
      if (p < 1) requestAnimationFrame(step);
      else elem.style.transform = '';
    }
    requestAnimationFrame(step);
  }

  function shake(amp, ms) {
    if (reduzMov) return;
    var alvo = $('cartaoQuestao');
    if (!alvo) return;
    var ini = null;
    function step(ts) {
      if (ini == null) ini = ts;
      var p = (ts - ini) / ms;
      if (p >= 1) { alvo.style.transform = ''; return; }
      var a = amp * (1 - p);
      alvo.style.transform = 'translate(' + ((Math.random() * 2 - 1) * a) + 'px,' + ((Math.random() * 2 - 1) * a) + 'px)';
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function flashScreen() {
    if (reduzMov) return;
    var f = $('flash');
    if (!f) return;
    f.classList.remove('bater'); void f.offsetWidth; f.classList.add('bater');
  }

  function comboPop(texto) {
    if (reduzMov) { toast(texto, 1200); return; }
    var p = el('div', 'combo-pop', texto);
    document.body.appendChild(p);
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 950);
  }

  function registrarAcerto(ev) {
    Quiz.acertos++;
    Quiz.combo++;
    var prev = Quiz.score;
    var ganho = 100 + Math.min(Quiz.combo - 1, 5) * 20;
    if (Quiz.hearts === 3) ganho += 20; // bônus por mandar bem
    Quiz.score += ganho;
    S.correct();
    faiscasEvento(ev);

    // escalonamento de combo (recompensa crescente) — marcos 3,5,7,10...
    if (Quiz.combo === 3 || Quiz.combo === 5 || Quiz.combo === 7 || Quiz.combo >= 10 && Quiz.combo % 3 === 0) {
      S.coin();
      flashScreen();
      comboPop('🔥 Combo x' + Quiz.combo + '!');
      if (window.Music) { window.Music.duck(true); setTimeout(function () { window.Music.duck(false); }, 600); }
    }

    // recompensa de razão variável (surpresa) — pomo de ouro bônus
    if (Math.random() < 0.16) {
      var bonus = 50 + Math.floor(Math.random() * 5) * 25; // 50..150
      Quiz.score += bonus;
      setTimeout(function () {
        S.snitch();
        voarPomo();
        toast('🟡 Sorte de bruxo! +' + bonus + ' de magia!', 2200);
      }, 260);
    }

    atualizarHUD();
    countUp($('pontosFase'), prev, Quiz.score, 550);
  }

  // animação de um pomo de ouro cruzando a tela (recompensa surpresa)
  function voarPomo() {
    if (reduzMov) return;
    var p = el('div', '', '🟡');
    p.style.cssText = 'position:fixed;z-index:62;font-size:34px;left:-50px;top:' + (20 + Math.random() * 50) + '%;' +
      'filter:drop-shadow(0 0 10px gold);transition:transform 1.1s cubic-bezier(.4,0,.6,1),opacity 1.1s;pointer-events:none;';
    document.body.appendChild(p);
    requestAnimationFrame(function () {
      p.style.transform = 'translateX(' + (window.innerWidth + 120) + 'px) translateY(-30px) rotate(40deg)';
    });
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 1200);
  }

  function registrarErro(q) {
    Quiz.combo = 0;
    Quiz.hearts = Math.max(0, Quiz.hearts - 1);
    S.wrong();
    shake(6, 320); // tremor leve e curto (kid-safe)
    atualizarHUD();
  }

  function mostrarFeedback(acertou, q) {
    var fb = $('feedback');
    if (acertou) {
      fb.className = 'feedback mostrar bom';
      fb.innerHTML = '✅ ' + pick(CONFIG.sucesso);
    } else {
      fb.className = 'feedback mostrar dica';
      fb.innerHTML = '💡 ' + pick(CONFIG.incentivo) + '<br><strong>' + (q.explain || '') + '</strong>';
    }
    var cont = $('areaContinuar');
    cont.classList.remove('escondido');
    $('btnProxima').textContent = (Quiz.i >= Quiz.total) ? 'Ver resultado ✨' : 'Continuar ➜';
  }

  $('btnProxima').addEventListener('click', function () { S.click(); proximaQuestao(); });
  $('btnVoltarMapa').addEventListener('click', function () { S.click(); irParaMapa(); });

  /* ---------------- fim de fase ---------------- */
  function calcularEstrelas() {
    var f = Quiz.acertos / Quiz.total;
    if (f >= 0.9) return 3;
    if (f >= 0.7) return 2;
    if (f >= 0.5) return 1;
    return 0;
  }

  function finalizarFase() {
    var p = currentPlayer();
    var estrelas = calcularEstrelas();
    var ph = Quiz.phase;

    // grava progresso
    var reg = p.phases[Quiz.phaseId] || { bestStars: 0, bestScore: 0, plays: 0, bestAcertos: 0 };
    reg.plays = (reg.plays || 0) + 1;
    reg.bestStars = Math.max(reg.bestStars || 0, estrelas);
    reg.bestScore = Math.max(reg.bestScore || 0, Quiz.score);
    reg.bestAcertos = Math.max(reg.bestAcertos || 0, Quiz.acertos);
    p.phases[Quiz.phaseId] = reg;
    p.xp += Quiz.score;
    p.lastPlayed = Date.now();

    if (ph.boss && estrelas >= 1) p.victory = true;

    var novas = avaliarMedalhas(p, Quiz.phaseId, estrelas);
    save();

    // monta tela de resultado
    $('progressoFase').style.width = '100%';
    $('resTitulo').innerHTML = ph.icon + ' ' + ph.name;
    var estrHtml = '';
    for (var i = 0; i < 3; i++) {
      estrHtml += '<span class="' + (i < estrelas ? 'on e' + (i + 1) : 'off') + '">★</span>';
    }
    $('resEstrelas').innerHTML = estrHtml;
    $('resMensagem').textContent = CONFIG.estrelas[estrelas];
    $('resAcertos').textContent = Quiz.acertos;
    $('resTotal').textContent = Quiz.total;
    $('resPontos').textContent = '0';

    var medHtml = '';
    if (novas.length) {
      novas.forEach(function (b) {
        medHtml += '<div class="medalha-nova">' + b.emoji + ' Nova medalha: <strong>' + b.name + '</strong></div>';
      });
    }
    $('resMedalha').innerHTML = medHtml;

    // botão próxima fase — só aparece se a próxima já estiver desbloqueada
    var prox = proximaFaseId(Quiz.phaseId);
    if (prox && faseDesbloqueada(prox)) {
      $('btnProximaFase').style.display = '';
      $('btnProximaFase').onclick = function () { S.click(); iniciarFase(prox); };
    } else {
      $('btnProximaFase').style.display = 'none';
    }

    // botão do mini-jogo bônus (recompensa ao fim da fase)
    var btnMini = $('btnMiniJogo');
    btnMini.style.display = '';
    btnMini.onclick = function () {
      S.click();
      if (window.Music) window.Music.play('quadribol'); // trilha animada no voo
      window.MiniGame.open(function (placar) {
        var bonus = Math.min(800, placar | 0);
        if (bonus > 0) {
          p.xp += bonus; save();
          var atual = parseInt($('resPontos').textContent, 10) || Quiz.score;
          countUp($('resPontos'), atual, atual + bonus, 800);
          toast('🎁 +' + bonus + ' pontos de magia no mini-jogo!', 2800);
          confete();
        }
        if (window.Music) window.Music.play(temaAtual);
      });
    };

    show('tela-resultado');
    countUp($('resPontos'), 0, Quiz.score, 900);

    if (window.Music) { window.Music.duck(true); setTimeout(function () { window.Music.duck(false); }, 2200); }
    if (ph.boss && p.victory) {
      S.dragon();
      setTimeout(function () { mostrarVitoria(); }, 1800);
      confete(); confete();
    } else if (estrelas >= 2) {
      S.fanfare(); confete();
    } else if (estrelas === 1) {
      S.levelUp();
    } else {
      S.phaseStart();
    }
    if (novas.length) setTimeout(function () { S.levelUp(); }, 600);
  }

  function proximaFaseId(phaseId) {
    var lista = GC.PHASES;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === phaseId && i + 1 < lista.length) return lista[i + 1].id;
    }
    return null;
  }

  $('btnRepetir').addEventListener('click', function () { S.click(); iniciarFase(Quiz.phaseId); });
  $('btnVoltarMapa2').addEventListener('click', function () { S.click(); irParaMapa(); });

  /* ---------------- medalhas ---------------- */
  function ganhar(p, badgeId, lista) {
    if (!p.badges[badgeId]) {
      p.badges[badgeId] = true;
      var b = badgeById(badgeId);
      if (b) lista.push(b);
    }
  }
  function avaliarMedalhas(p, phaseId, estrelas) {
    var novas = [];
    if (phaseId === 'feiticos') ganhar(p, 'primeiro_feitico', novas);
    if (phaseId === 'runas') ganhar(p, 'leitor_runas', novas);
    if (phaseId === 'dragao') ganhar(p, 'domador_dragao', novas);
    if (phaseId === 'pocoes' && estrelas === 3) ganhar(p, 'mestre_pocoes', novas);
    if (phaseId === 'evanesco' && estrelas === 3) ganhar(p, 'evanesco_perfeito', novas);
    if (phaseId === 'quadribol' && estrelas === 3) ganhar(p, 'cacador_pomo', novas);
    if (phaseId === 'duelo' && estrelas === 3) ganhar(p, 'campeao_duelo', novas);
    if (estrelas === 3) ganhar(p, 'tres_estrelas', novas);
    if (p.xp >= 3000) ganhar(p, 'casa_orgulhosa', novas);
    if (p.victory) ganhar(p, 'campeao_torneio', novas);
    return novas;
  }

  function mostrarMedalhas() {
    var p = currentPlayer();
    var grade = $('gradeMedalhas');
    grade.innerHTML = '';
    var qtd = 0;
    CONFIG.badges.forEach(function (b) {
      var tem = !!p.badges[b.id];
      if (tem) qtd++;
      var card = el('div', 'painel-escuro');
      card.style.opacity = tem ? '1' : '0.45';
      card.style.padding = '14px';
      card.innerHTML = '<div style="font-size:2.2rem;">' + (tem ? b.emoji : '🔒') + '</div>' +
        '<strong style="color:var(--ouro-claro)">' + b.name + '</strong>' +
        '<p style="margin:4px 0 0;font-size:0.85rem;opacity:0.9;">' + b.desc + '</p>';
      grade.appendChild(card);
    });
    $('medalhasResumo').textContent = 'Você conquistou ' + qtd + ' de ' + CONFIG.badges.length + ' medalhas!';
    show('tela-medalhas');
  }
  $('btnFecharMedalhas').addEventListener('click', function () { S.click(); irParaMapa(); });

  /* ---------------- placar / taça ---------------- */
  var voltarDe = 'tela-mapa';
  function mostrarPlacar(origem) {
    voltarDe = origem || 'tela-mapa';
    var jogadores = [];
    for (var id in DB.players) jogadores.push(DB.players[id]);
    jogadores.sort(function (a, b) { return b.xp - a.xp; });

    var corpo = $('corpoPlacar');
    corpo.innerHTML = '';
    var medalhasPos = ['🥇', '🥈', '🥉'];
    jogadores.slice(0, 20).forEach(function (j, idx) {
      var h = houseById(j.house);
      var tr = el('tr', (j.id === DB.currentId) ? 'eu' : '');
      tr.innerHTML =
        '<td class="pos-medalha">' + (medalhasPos[idx] || (idx + 1)) + '</td>' +
        '<td>' + escapar(j.name) + (j.victory ? ' 👑' : '') + '</td>' +
        '<td>' + h.emoji + ' ' + h.name + '</td>' +
        '<td><strong>' + j.xp + '</strong></td>';
      corpo.appendChild(tr);
    });
    $('placarVazio').textContent = jogadores.length ? '' : 'Ainda não há bruxos no torneio. Seja o primeiro!';

    // taça das casas
    var casas = {};
    CONFIG.houses.forEach(function (h) { casas[h.id] = 0; });
    jogadores.forEach(function (j) { if (j.house && casas[j.house] != null) casas[j.house] += j.xp; });
    var arr = CONFIG.houses.map(function (h) { return { h: h, pts: casas[h.id] }; }).sort(function (a, b) { return b.pts - a.pts; });
    var html = '<h3 style="color:var(--ouro);margin-top:0;">🏆 Taça das Casas</h3>';
    arr.forEach(function (x) {
      var maxp = arr[0].pts || 1;
      var pct = Math.round((x.pts / maxp) * 100);
      html += '<div style="margin:8px 0;">' +
        '<div style="display:flex;justify-content:space-between;"><span>' + x.h.emoji + ' ' + x.h.name + '</span><strong>' + x.pts + '</strong></div>' +
        '<div style="height:12px;background:rgba(0,0,0,0.3);border-radius:999px;overflow:hidden;border:1px solid ' + x.h.accent + ';">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,' + x.h.primary + ',' + x.h.accent + ');"></div></div></div>';
    });
    $('taçaCasas').innerHTML = html;

    show('tela-placar');
  }
  $('btnFecharPlacar').addEventListener('click', function () {
    S.click();
    if (voltarDe === 'tela-cadastro') show('tela-cadastro');
    else irParaMapa();
  });

  function escapar(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------- vitória ---------------- */
  function mostrarVitoria() {
    $('vitoriaTexto').innerHTML = CONFIG.victory.replace(/\n/g, '<br>');
    show('tela-vitoria');
    confete(); confete();
    S.fanfare();
  }
  $('btnVitoriaMapa').addEventListener('click', function () { S.click(); irParaMapa(); });
  $('btnVitoriaPlacar').addEventListener('click', function () { S.click(); mostrarPlacar('tela-mapa'); });

  /* ---------------- início ---------------- */
  function init() {
    load();
    montarFundo();
    setupSom();
    setupCadastro();

    var p = currentPlayer();
    if (p && p.house) { irParaMapa(); }
    else if (p && !p.house) { irParaChapeu(); }
    else { show('tela-cadastro'); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
