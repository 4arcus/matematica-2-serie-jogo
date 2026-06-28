/* =========================================================================
   BANCO DE MAGIAS — Geradores de questões do Torneio Tribruxo
   Tudo é gerado por código (questões novas a cada partida), seguindo o
   conteúdo da prova de Matemática do 2º ano (Unidades 2 e 4) e validado
   matematicamente. Faixas: 0–99 (início) até 0–499 (avançado).
   ========================================================================= */
(function (global) {
  'use strict';

  /* ---------------- utilitários ---------------- */
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function digits(n) { return { c: Math.floor(n / 100), d: Math.floor(n / 10) % 10, u: n % 10 }; }

  // Monta opções de múltipla escolha (correta + distratores), sem repetir,
  // garantindo que nenhum distrator seja igual à resposta correta.
  function buildOptions(correct, pool, total) {
    total = total || 4;
    var c = String(correct);
    var opts = [c];
    for (var i = 0; i < pool.length && opts.length < total; i++) {
      var s = String(pool[i]);
      if (opts.indexOf(s) === -1) opts.push(s);
    }
    // completa com valores próximos, se faltar
    var k = 1;
    while (opts.length < total && k < 60) {
      var cand = Number(correct) + (k % 2 === 0 ? k / 2 : -(Math.ceil(k / 2)));
      if (cand >= 0 && opts.indexOf(String(cand)) === -1) opts.push(String(cand));
      k++;
    }
    return shuffle(opts);
  }

  /* ---------------- número por extenso (0–499) ---------------- */
  var UNI = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  var DEZ10 = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  var DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  var CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos'];

  function porExtenso(n) {
    if (n < 0) return '' + n;
    if (n < 10) return UNI[n];
    if (n < 20) return DEZ10[n - 10];
    if (n < 100) {
      var d = Math.floor(n / 10), u = n % 10;
      return u ? (DEZENAS[d] + ' e ' + UNI[u]) : DEZENAS[d];
    }
    if (n === 100) return 'cem';
    var c = Math.floor(n / 100), rest = n % 100;
    var cen = (c === 1) ? 'cento' : CENTENAS[c];
    if (rest === 0) return CENTENAS[c];
    return cen + ' e ' + porExtenso(rest);
  }

  /* ---------------- visuais (material dourado, reta, caldeirão) ---------------- */
  function ouroDourado(c, d, u) {
    var pecas = '';
    var i;
    for (i = 0; i < c; i++) pecas += '<span class="centena"></span>';
    if (d > 0) {
      pecas += '<span class="grupo-dez" title="dezenas">';
      for (i = 0; i < d; i++) pecas += '<span class="dezena"></span>';
      pecas += '</span>';
    }
    if (u > 0) {
      pecas += '<span class="grupo-dez" title="unidades">';
      for (i = 0; i < u; i++) pecas += '<span class="unidade"></span>';
      pecas += '</span>';
    }
    var legenda = '<div class="md-legenda">';
    if (c > 0) legenda += '<span><span class="amostra-centena"></span> cada placa = 100</span>';
    legenda += '<span><span class="amostra-dezena"></span> cada barra = 1 dezena = 10</span>';
    legenda += '<span><span class="amostra-unidade"></span> cada cubinho = 1 unidade = 1</span>';
    legenda += '</div>';
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;">' +
      '<div style="display:flex;gap:10px;align-items:flex-end;justify-content:center;flex-wrap:wrap;">' + pecas + '</div>' +
      legenda + '</div>';
  }

  function retaNumerica(valores) {
    // valores: array de números ou null (espaço vazio "?")
    var h = '<div style="display:flex;align-items:center;gap:0;flex-wrap:wrap;justify-content:center;">';
    for (var i = 0; i < valores.length; i++) {
      var v = valores[i];
      var box = (v === null)
        ? '<span class="slot" style="background:rgba(240,199,94,0.25);border:2px dashed var(--ouro);font-size:1.5rem;">?</span>'
        : '<span class="slot">' + v + '</span>';
      h += box;
      if (i < valores.length - 1) h += '<span style="color:var(--ouro);font-size:1.2rem;">―</span>';
    }
    h += '</div>';
    return h;
  }

  var NOMES = ['Harry', 'Hermione', 'Rony', 'Luna', 'Neville', 'Gina', 'Hagrid', 'Dobby', 'Cho', 'Jorge'];
  var INGREDIENTES = [
    { n: 'folhas de mandrágora', f: true }, { n: 'penas de fênix', f: true }, { n: 'escamas de dragão', f: true },
    { n: 'sapos de chocolate', f: false }, { n: 'feijõezinhos mágicos', f: false }, { n: 'cristais brilhantes', f: false },
    { n: 'cogumelos da floresta', f: false }, { n: 'estrelas cadentes', f: true }, { n: 'moedas de ouro', f: true }
  ];
  function quantos(ing) { return ing.f ? 'Quantas' : 'Quantos'; }

  /* =====================================================================
     FASE 1 — FEITIÇOS DE ENCANTAMENTO
     Composição/decomposição, valor posicional, por extenso, material dourado
     ===================================================================== */
  function genFeiticos(level) {
    var maxTipo = (level >= 2) ? 6 : 5;
    var tipo = randInt(1, maxTipo);
    var N, c, d, u, parte = [], correct, pool, opts, prompt, stage = '', context, explain;

    // sorteia N conforme o nível
    if (level === 1) N = randInt(11, 99);
    else if (level === 2) N = randInt(100, 299);
    else N = randInt(100, 499);

    var dg = digits(N); c = dg.c; d = dg.d; u = dg.u;

    if (tipo === 1) { // valor posicional
      var posicoes = [];
      if (u > 0) posicoes.push({ alg: u, valor: u, nome: 'unidades' });
      if (d > 0) posicoes.push({ alg: d, valor: d * 10, nome: 'dezenas' });
      if (c > 0) posicoes.push({ alg: c, valor: c * 100, nome: 'centenas' });
      var p = pick(posicoes);
      correct = p.valor;
      pool = [p.alg, p.alg * (p.nome === 'unidades' ? 10 : (p.nome === 'dezenas' ? 100 : 10)),
        Number(('' + N).split('').reverse().join(''))];
      opts = buildOptions(correct, pool);
      context = '🪄 Magia do valor posicional';
      prompt = 'No número <span class="num">' + N + '</span>, quanto vale o algarismo <span class="num">' + p.alg + '</span>?';
      explain = 'O ' + p.alg + ' está na casa das ' + p.nome + ', então vale ' + correct + '.';
    } else if (tipo === 2) { // decompor
      parte = [];
      if (c > 0) parte.push(c * 100);
      if (d > 0) parte.push(d * 10);
      if (u > 0) parte.push(u);
      correct = parte.join(' + ');
      // candidatos de distratores (formas decompostas incorretas), todos distintos
      var cand = [];
      var raw = [];
      if (c > 0) raw.push(c);
      if (d > 0) raw.push(d);
      if (u > 0) raw.push(u);
      cand.push(raw.join(' + '));                                   // algarismos crus: 3 + 5
      var t1 = parte.slice(); t1[t1.length - 1] = t1[t1.length - 1] * 10; cand.push(t1.join(' + ')); // última x10: 30 + 50
      if (d > 0) cand.push(parte.map(function (x) { return x === d * 10 ? d * 100 : x; }).join(' + ')); // dezena vira centena
      if (u > 0) cand.push(parte.map(function (x) { return x === u ? u * 10 : x; }).join(' + ')); // unidade x10
      var t4 = parte.slice(); t4[0] = Math.floor(t4[0] / 10) || t4[0]; cand.push(t4.join(' + '));
      var seenD = {}; seenD[correct] = 1; var distr = [];
      for (var ci = 0; ci < cand.length; ci++) { var sc = cand[ci]; if (sc && !seenD[sc]) { seenD[sc] = 1; distr.push(sc); } }
      var extraD = [N + 10, N - 1, N + 1].filter(function (x) { return x > 0; });
      for (var ei = 0; ei < extraD.length && distr.length < 3; ei++) { var sv = String(extraD[ei]); if (!seenD[sv]) { seenD[sv] = 1; distr.push(sv); } }
      opts = buildOptions(correct, distr);
      context = '✨ Feitiço da decomposição';
      prompt = 'Separe o número <span class="num">' + N + '</span> em partes (forma decomposta): qual está certa?';
      explain = 'Separando ' + N + ' em ' + (c > 0 ? 'centenas, ' : '') + 'dezenas e unidades: ' + correct + '.';
    } else if (tipo === 3) { // compor a partir da decomposição
      parte = [];
      if (c > 0) parte.push(c * 100);
      if (d > 0) parte.push(d * 10);
      if (u > 0) parte.push(u);
      correct = N;
      var concat = '' + (c > 0 ? c : '') + d + u; // erro de concatenação
      pool = [Number(('' + N).split('').reverse().join('')), Number(concat), N + 10, N - 1];
      opts = buildOptions(correct, pool);
      context = '✨ Feitiço da composição';
      prompt = 'Que número é formado por <span class="num">' + parte.join(' + ') + '</span>?';
      explain = parte.join(' + ') + ' = ' + N + '.';
    } else if (tipo === 4) { // X dezenas e Y unidades (0–99)
      d = randInt(1, 9); u = randInt(0, 9); N = d * 10 + u;
      correct = N;
      pool = [u * 10 + d, Number('' + d + u + '0'), d + u];
      opts = buildOptions(correct, pool);
      context = '🔢 Juntando dezenas e unidades';
      prompt = '<span class="num">' + d + '</span> ' + (d === 1 ? 'dezena' : 'dezenas') + ' e <span class="num">' + u + '</span> ' + (u === 1 ? 'unidade' : 'unidades') + ' formam qual número?';
      explain = d + (d === 1 ? ' dezena = ' : ' dezenas = ') + (d * 10) + ', mais ' + u + (u === 1 ? ' unidade = ' : ' unidades = ') + N + '.';
    } else if (tipo === 5) { // material dourado -> número
      if (level === 1) { c = 0; d = randInt(1, 9); u = randInt(0, 9); }
      else { c = randInt(1, 4); d = randInt(0, 9); u = randInt(0, 9); }
      N = c * 100 + d * 10 + u;
      correct = N;
      pool = [c * 100 + u * 10 + d, c + d + u, N + 10, N - 10].filter(function (x) { return x >= 0 && x !== N; });
      opts = buildOptions(correct, pool);
      context = '🟨 Material dourado mágico';
      stage = ouroDourado(c, d, u);
      var desc = [];
      if (c) desc.push('<strong>' + c + ' placa' + (c > 1 ? 's' : '') + '</strong>');
      if (d) desc.push('<strong>' + d + ' barra' + (d > 1 ? 's' : '') + '</strong>');
      if (u) desc.push('<strong>' + u + ' cubinho' + (u > 1 ? 's' : '') + '</strong>');
      prompt = 'Lembre: cada <strong>barra</strong> vale <strong>10</strong> (uma dezena) e cada <strong>cubinho</strong> vale <strong>1</strong> (uma unidade)' +
        (c ? ', e cada <strong>placa</strong> vale <strong>100</strong>' : '') + '.<br>Aqui temos ' + desc.join(', ') + '. Que número elas formam juntas?';
      var partsExp = [], somaExp = [];
      if (c) { partsExp.push(c + ' placa' + (c > 1 ? 's' : '') + ' = ' + (c * 100)); somaExp.push(c * 100); }
      if (d) { partsExp.push(d + ' barra' + (d > 1 ? 's' : '') + ' = ' + d + ' dezena' + (d > 1 ? 's' : '') + ' = ' + (d * 10)); somaExp.push(d * 10); }
      if (u) { partsExp.push(u + ' cubinho' + (u > 1 ? 's' : '') + ' = ' + u + ' unidade' + (u > 1 ? 's' : '')); somaExp.push(u); }
      explain = partsExp.join('; ') + (somaExp.length > 1 ? '. Juntando tudo: ' + somaExp.join(' + ') + ' = ' + N : '. No total: ' + N) + '.';
    } else { // tipo 6 — por extenso
      correct = porExtenso(N);
      var candN = [
        Number(('' + N).split('').reverse().join('')),
        c * 100 + u * 10 + d, // troca dezena/unidade
        N + 10, N - 10, N + 1, N - 1, N + 11, N - 11, N + 100, N - 100
      ];
      var seenE = {}; seenE[correct] = 1; var distrE = [];
      var emb = shuffle(candN);
      for (var wi = 0; wi < emb.length && distrE.length < 3; wi++) {
        var w = emb[wi];
        if (w < 0 || w > 499) continue;
        var sp = porExtenso(w);
        if (!seenE[sp]) { seenE[sp] = 1; distrE.push(sp); }
      }
      opts = buildOptions(correct, distrE);
      context = '📜 Escrevendo a magia por extenso';
      prompt = 'Como se escreve por extenso o número <span class="num">' + N + '</span>?';
      explain = N + ' por extenso é "' + correct + '".';
    }

    return { type: 'mc', context: context, promptHTML: prompt, stageHTML: stage, options: opts, correct: String(correct), explain: explain };
  }

  /* =====================================================================
     FASE 2 — AULA DE POÇÕES (Adição)
     ===================================================================== */
  function genPocoes(level) {
    var A, B, soma;
    if (level === 1) { // sem reagrupamento, 0–99
      var dA = randInt(1, 4), dB = randInt(1, 9 - dA);
      var uA = randInt(0, 5), uB = randInt(0, 9 - uA);
      A = dA * 10 + uA; B = dB * 10 + uB;
    } else if (level === 2) { // com reagrupamento na unidade, 0–99
      var uA2 = randInt(2, 9), uB2 = randInt(10 - uA2, 9);
      var dA2 = randInt(1, 4), dB2 = randInt(1, 4);
      A = dA2 * 10 + uA2; B = dB2 * 10 + uB2;
    } else { // até 499
      do { A = randInt(100, 399); B = randInt(50, 299); } while (A + B > 499);
    }
    soma = A + B;

    var sa = digits(A), sb = digits(B);
    var semReagrupar = ('' + (sa.c + sb.c || '')) + ((sa.d + sb.d) % 10 >= 0 ? '' : '');
    // distratores pedagógicos
    var pool = [soma - 10, soma + 10, soma - 1, soma + 1, soma + 100].filter(function (x) { return x >= 0; });
    var opts = buildOptions(soma, pool);

    var ehProblema = Math.random() < 0.4;
    var prompt, context, stage = '';
    if (ehProblema) {
      var nome = pick(NOMES), nome2 = pick(NOMES), ing = pick(INGREDIENTES);
      context = '🧪 Poção a preparar';
      prompt = nome + ' juntou <span class="num">' + A + '</span> ' + ing.n + ' e ' + nome2 +
        ' trouxe mais <span class="num">' + B + '</span>. ' + quantos(ing) + ' ' + ing.n + ' há no caldeirão?';
      stage = '<span class="caldeirao">🧪</span>';
    } else {
      context = '🧪 Misture os ingredientes';
      prompt = 'No caldeirão: <span class="num">' + A + ' + ' + B + '</span> = ?';
      stage = '<span class="caldeirao">⚗️</span>';
    }
    return {
      type: 'mc', context: context, promptHTML: prompt, stageHTML: stage,
      options: opts, correct: String(soma),
      explain: A + ' + ' + B + ' = ' + soma + '. Some primeiro as unidades, depois as dezenas (e troque 10 por 1 quando passar de 9!).'
    };
  }

  /* =====================================================================
     FASE 3 — FEITIÇO EVANESCO (Subtração)
     ===================================================================== */
  function genEvanesco(level) {
    var A, B, dif;
    if (level === 1) { // sem reagrupamento, 0–99
      var dA = randInt(2, 9), uA = randInt(1, 9);
      var dB = randInt(1, dA), uB = randInt(0, uA);
      A = dA * 10 + uA; B = dB * 10 + uB;
    } else if (level === 2) { // empréstimo na unidade, 0–99
      var dA2 = randInt(3, 9), uA2 = randInt(0, 7);
      var dB2 = randInt(1, dA2 - 1), uB2 = randInt(uA2 + 1, 9);
      A = dA2 * 10 + uA2; B = dB2 * 10 + uB2;
    } else { // até 499, com possíveis empréstimos
      A = randInt(200, 499); B = randInt(100, A - 20);
    }
    dif = A - B;

    var sa = digits(A), sb = digits(B);
    // erro comum: subtrair coluna a coluna em módulo (sem empréstimo)
    var semEmpr = Math.abs(sa.c - sb.c) * 100 + Math.abs(sa.d - sb.d) * 10 + Math.abs(sa.u - sb.u);
    var pool = [dif + 10, dif - 10, semEmpr, dif + 1, dif - 1].filter(function (x) { return x >= 0; });
    var opts = buildOptions(dif, pool);

    var ehProblema = Math.random() < 0.45;
    var prompt, context, stage = '<span class="caldeirao">💨</span>';
    if (ehProblema) {
      var nome = pick(NOMES), ing = pick(INGREDIENTES);
      context = '💨 Evanesco! (algo vai sumir)';
      prompt = 'Havia <span class="num">' + A + '</span> ' + ing.n + '. Com o feitiço Evanesco, <span class="num">' + B +
        '</span> sumiram. ' + quantos(ing) + ' ' + ing.n + ' sobraram?';
    } else {
      context = '💨 Faça os números sumirem';
      prompt = '<span class="num">' + A + ' − ' + B + '</span> = ?';
    }
    return {
      type: 'mc', context: context, promptHTML: prompt, stageHTML: stage,
      options: opts, correct: String(dif),
      explain: A + ' − ' + B + ' = ' + dif + '. Quando não dá para tirar, peça emprestado 1 da casa do lado (vira 10)!'
    };
  }

  /* =====================================================================
     FASE 4 — TREINO DE QUADRIBOL
     Reta numérica, antecessor/sucessor, sequências
     ===================================================================== */
  function genQuadribol(level) {
    var tipo = pick(['antsuc', 'antsuc', 'reta', 'seq', 'seq', (level >= 2 ? 'fib' : 'seq')]);
    var N, correct, pool, opts, prompt, context, stage = '', explain;

    if (tipo === 'antsuc') {
      N = (level === 1) ? randInt(2, 98) : randInt(100, 498);
      var modo = pick(['ant', 'suc']);
      if (modo === 'ant') {
        correct = N - 1;
        pool = [N + 1, N - 10, N + 10, N - 2];
        context = '🧹 Voe para trás (antecessor)';
        prompt = 'Qual é o <strong>antecessor</strong> de <span class="num">' + N + '</span>? (o que vem ANTES)';
        explain = 'O antecessor vem antes: ' + N + ' − 1 = ' + correct + '.';
      } else {
        correct = N + 1;
        pool = [N - 1, N + 10, N - 10, N + 2];
        context = '🧹 Voe para frente (sucessor)';
        prompt = 'Qual é o <strong>sucessor</strong> de <span class="num">' + N + '</span>? (o que vem DEPOIS)';
        explain = 'O sucessor vem depois: ' + N + ' + 1 = ' + correct + '.';
      }
      opts = buildOptions(correct, pool);
    } else if (tipo === 'reta') {
      var passo = pick([1, 2, 5, 10]);
      if (level >= 2 && passo === 1) passo = 10;
      var inicio = passo * randInt(level === 1 ? 0 : 10, level === 1 ? 9 : 40);
      var faltaIdx = randInt(1, 3);
      var vals = [], i;
      for (i = 0; i < 5; i++) vals.push(inicio + i * passo);
      correct = vals[faltaIdx];
      var mostra = vals.slice();
      mostra[faltaIdx] = null;
      stage = retaNumerica(mostra);
      pool = [correct + passo, correct - passo, correct + 1, correct - 1].filter(function (x) { return x >= 0; });
      opts = buildOptions(correct, pool);
      context = '🪄 Reta numérica voadora';
      prompt = 'Qual número está faltando na reta? (de ' + passo + ' em ' + passo + ')';
      explain = 'A reta anda de ' + passo + ' em ' + passo + ': o número que falta é ' + correct + '.';
    } else if (tipo === 'fib') {
      var fib = [1, 1, 2, 3, 5, 8, 13, 21];
      var idx = randInt(2, fib.length - 2);
      correct = fib[idx];
      var mostraF = fib.slice(0, idx + 3).map(function (v, k) { return k === idx ? '__' : v; });
      context = '🟡 Sequência mágica do pomo';
      prompt = 'Cada número é a soma dos dois anteriores. Qual falta?<br><span class="num">' + mostraF.join(', ') + '</span>';
      pool = [correct + 1, correct - 1, correct + 2, fib[idx - 1]];
      opts = buildOptions(correct, pool);
      explain = 'Some os dois de trás: ' + fib[idx - 2] + ' + ' + fib[idx - 1] + ' = ' + correct + '.';
    } else { // seq
      var p = pick([2, 3, 5, 6]);
      var cresc = Math.random() < 0.6;
      var t0;
      if (cresc) t0 = (level === 1) ? randInt(0, 8) * 1 : randInt(0, 20);
      else t0 = (level === 1) ? randInt(8, 18) : randInt(20, 60);
      // garante não-negativo na decrescente
      var seq = [], i2;
      for (i2 = 0; i2 < 5; i2++) seq.push(cresc ? (t0 + i2 * p) : (t0 - i2 * p));
      if (!cresc && seq[4] < 0) { t0 = 4 * p + randInt(0, 5); seq = []; for (i2 = 0; i2 < 5; i2++) seq.push(t0 - i2 * p); }
      var faltaI = randInt(1, 3);
      correct = seq[faltaI];
      var mostraS = seq.map(function (v, k) { return k === faltaI ? '__' : v; });
      context = (cresc ? '🟡 Pegue o pomo subindo' : '🟡 Pegue o pomo descendo') + ' (de ' + p + ' em ' + p + ')';
      prompt = 'Complete a sequência:<br><span class="num">' + mostraS.join(', ') + '</span>';
      pool = [correct + p, correct - p, correct + 1, correct - 1].filter(function (x) { return x >= 0; });
      opts = buildOptions(correct, pool);
      explain = 'A sequência ' + (cresc ? 'aumenta' : 'diminui') + ' de ' + p + ' em ' + p + ': o número certo é ' + correct + '.';
    }

    return { type: 'mc', context: context, promptHTML: prompt, stageHTML: stage, options: opts, correct: String(correct), explain: explain };
  }

  /* =====================================================================
     FASE 5 — RUNAS ANTIGAS (APROFUNDAMENTO: outros símbolos)
     Incógnita em caixa-runa, símbolos alternativos de operação,
     comparação com sinais, mesma quantidade de formas diferentes.
     ===================================================================== */
  var RUNA = '🟪'; // a "caixa-runa" do número desconhecido

  function genRunas(level) {
    var tipo = pick(['incognita', 'incognita', 'simbolo', 'mesmo', 'comparaRuna']);
    var max = (level >= 2) ? 99 : 20;
    var correct, pool, opts, prompt, context, stage = '', explain;

    if (tipo === 'incognita') {
      var modo = pick(['soma', 'subA', 'subB']);
      if (modo === 'soma') { // a + [] = total
        var a = randInt(1, max), total = randInt(a + 1, Math.min(max + a, 120));
        correct = total - a;
        prompt = '<span class="num">' + a + ' + ' + RUNA + ' = ' + total + '</span><br>Quanto vale a runa ' + RUNA + '?';
        explain = 'Para descobrir a runa, faça a conta ao contrário: ' + total + ' − ' + a + ' = ' + correct + '.';
      } else if (modo === 'subA') { // [] - b = r
        var b = randInt(1, 9), r = randInt(1, max);
        correct = r + b;
        prompt = '<span class="num">' + RUNA + ' − ' + b + ' = ' + r + '</span><br>Quanto vale a runa ' + RUNA + '?';
        explain = 'Faça ao contrário: ' + r + ' + ' + b + ' = ' + correct + '.';
      } else { // a - [] = r
        var a2 = randInt(5, max), r2 = randInt(0, a2 - 1);
        correct = a2 - r2;
        prompt = '<span class="num">' + a2 + ' − ' + RUNA + ' = ' + r2 + '</span><br>Quanto vale a runa ' + RUNA + '?';
        explain = 'Faça ao contrário: ' + a2 + ' − ' + r2 + ' = ' + correct + '.';
      }
      context = '🔮 Descubra o número escondido';
      pool = [correct + 1, correct - 1, correct + 2, correct + 10].filter(function (x) { return x >= 0; });
      opts = buildOptions(correct, pool);
    } else if (tipo === 'simbolo') {
      // símbolo inventado para uma operação conhecida (com legenda)
      var juntar = Math.random() < 0.55;
      var x = randInt(level >= 2 ? 20 : 5, level >= 2 ? 80 : 19);
      var y = randInt(1, level >= 2 ? 19 : 9);
      if (juntar) {
        correct = x + y;
        context = '✦ Runa que significa JUNTAR (somar)';
        prompt = 'Na língua das runas, <strong>✦ quer dizer juntar</strong>.<br>Quanto é <span class="num">' + x + ' ✦ ' + y + '</span>?';
        explain = '✦ é juntar (somar): ' + x + ' + ' + y + ' = ' + correct + '.';
      } else {
        if (y > x) { var t = x; x = y; y = t; }
        correct = x - y;
        context = '✸ Runa que significa TIRAR (subtrair)';
        prompt = 'Na língua das runas, <strong>✸ quer dizer tirar</strong>.<br>Quanto é <span class="num">' + x + ' ✸ ' + y + '</span>?';
        explain = '✸ é tirar (subtrair): ' + x + ' − ' + y + ' = ' + correct + '.';
      }
      pool = [correct + 1, correct - 1, correct + 10, correct - 10].filter(function (z) { return z >= 0; });
      opts = buildOptions(correct, pool);
    } else if (tipo === 'mesmo') {
      // o mesmo número de várias formas
      var N = randInt(level >= 2 ? 21 : 11, level >= 2 ? 99 : 49);
      var dg = digits(N);
      var formas = pick(['decomp', 'extenso', 'dezuni']);
      correct = N;
      if (formas === 'decomp') {
        prompt = 'Qual destes é o MESMO que <span class="num">' + (dg.d * 10) + ' + ' + dg.u + '</span>?';
        explain = (dg.d * 10) + ' + ' + dg.u + ' = ' + N + '.';
      } else if (formas === 'extenso') {
        prompt = 'Qual número é o mesmo que <span class="num">"' + porExtenso(N) + '"</span>?';
        explain = '"' + porExtenso(N) + '" é o número ' + N + '.';
      } else {
        prompt = 'Qual número tem <span class="num">' + dg.d + (dg.d === 1 ? ' dezena' : ' dezenas') + ' e ' + dg.u + (dg.u === 1 ? ' unidade' : ' unidades') + '</span>?';
        explain = dg.d + (dg.d === 1 ? ' dezena' : ' dezenas') + ' e ' + dg.u + (dg.u === 1 ? ' unidade' : ' unidades') + ' = ' + N + '.';
      }
      context = '🔁 O mesmo número, outra forma';
      pool = [Number(('' + N).split('').reverse().join('')), N + 10, N - 1, dg.d + dg.u];
      opts = buildOptions(correct, pool);
    } else { // comparaRuna — sinais < > = como "runas de duelo"
      var A = randInt(1, max), B = randInt(1, max);
      if (Math.random() < 0.2) B = A; // às vezes iguais
      correct = A > B ? '>' : (A < B ? '<' : '=');
      context = '🔮 Runa-sinal misteriosa';
      prompt = 'Qual runa-sinal vai no lugar da caixa?<br><span class="num">' + A + ' ' + RUNA + ' ' + B + '</span>' +
        '<br><span style="font-size:0.8rem;opacity:0.8;">&gt; é maior &nbsp; &lt; é menor &nbsp; = é igual</span>';
      explain = A + ' ' + correct + ' ' + B + '. (> é maior, < é menor, = é igual.)';
      opts = shuffle(['>', '<', '=']);
    }

    return {
      type: 'mc', context: context, promptHTML: prompt, stageHTML: stage,
      options: opts, correct: String(correct), explain: explain,
      layout: (tipo === 'comparaRuna') ? 'tres' : 'normal'
    };
  }

  /* =====================================================================
     FASE 6 — DUELO DE FEITIÇOS (Comparação e ordenação)
     ===================================================================== */
  function genDuelo(level) {
    var tipo = pick(['sinal', 'sinal', 'maiormenor', 'ordenar', 'ordenar']);
    var max = (level >= 2) ? 499 : 99;
    var correct, pool, opts, prompt, context, explain;

    if (tipo === 'sinal') {
      var A = randInt(1, max), B = randInt(1, max);
      if (Math.random() < 0.18) B = A;
      correct = A > B ? '>' : (A < B ? '<' : '=');
      context = '⚔️ Quem vence o duelo?';
      prompt = 'Qual sinal vai entre os números?<br><span class="num">' + A + ' ___ ' + B + '</span>' +
        '<br><span style="font-size:0.8rem;opacity:0.8;">&gt; é maior &nbsp; &lt; é menor &nbsp; = é igual</span>';
      explain = 'Compare a casa de maior valor: ' + A + ' ' + correct + ' ' + B + '.';
      return { type: 'mc', context: context, promptHTML: prompt, stageHTML: '', options: shuffle(['>', '<', '=']), correct: correct, explain: explain, layout: 'tres' };
    } else if (tipo === 'maiormenor') {
      var qtd = (level >= 2) ? 4 : 3;
      var nums = [];
      while (nums.length < qtd) { var n = randInt(1, max); if (nums.indexOf(n) === -1) nums.push(n); }
      var querMaior = Math.random() < 0.5;
      correct = querMaior ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
      context = '⚔️ Encontre o feitiço mais forte';
      prompt = 'Qual é o <strong>' + (querMaior ? 'MAIOR' : 'MENOR') + '</strong> número?<br><span class="num">' + nums.join(', ') + '</span>';
      explain = (querMaior ? 'O maior' : 'O menor') + ' de ' + nums.join(', ') + ' é ' + correct + '.';
      opts = shuffle(nums.map(String));
      return { type: 'mc', context: context, promptHTML: prompt, stageHTML: '', options: opts, correct: String(correct), explain: explain };
    } else { // ordenar (clicar em ordem)
      var qtd2 = (level >= 2) ? 4 : 3;
      var nums2 = [];
      while (nums2.length < qtd2) { var n2 = randInt(1, max); if (nums2.indexOf(n2) === -1) nums2.push(n2); }
      var cresc = Math.random() < 0.5;
      var ordem = nums2.slice().sort(function (a, b) { return cresc ? a - b : b - a; });
      context = '⚔️ Ordene os feitiços';
      prompt = 'Toque nos números em ordem <strong>' + (cresc ? 'crescente (do menor para o maior)' : 'decrescente (do maior para o menor)') + '</strong>:';
      explain = 'Ordem ' + (cresc ? 'crescente' : 'decrescente') + ': ' + ordem.join(', ') + '.';
      return { type: 'order', context: context, promptHTML: prompt, items: shuffle(nums2), correctOrder: ordem, explain: explain };
    }
  }

  /* =====================================================================
     FASE 7 — A PRIMEIRA TAREFA (Chefe: mistura de tudo)
     ===================================================================== */
  function genDragao(level) {
    var fontes = [genFeiticos, genPocoes, genEvanesco, genQuadribol, genRunas, genDuelo];
    var q = pick(fontes)(Math.random() < 0.5 ? 2 : 3);
    q.context = '🐉 Desafio do Dragão — ' + (q.context || '');
    return q;
  }

  /* ---------------- definição das fases ---------------- */
  var PHASES = [
    { id: 'feiticos', name: 'Feitiços de Encantamento', icon: '🪄', short: 'Compor, decompor e valor dos números', count: 8, gen: genFeiticos },
    { id: 'pocoes', name: 'Aula de Poções', icon: '🧪', short: 'Adição: juntar ingredientes', count: 8, gen: genPocoes },
    { id: 'evanesco', name: 'Feitiço Evanesco', icon: '💨', short: 'Subtração: fazer sumir', count: 8, gen: genEvanesco },
    { id: 'quadribol', name: 'Treino de Quadribol', icon: '🧹', short: 'Reta, antecessor, sucessor e sequências', count: 8, gen: genQuadribol },
    { id: 'runas', name: 'Runas Antigas', icon: '🔮', short: 'Símbolos secretos e números escondidos', count: 8, gen: genRunas },
    { id: 'duelo', name: 'Duelo de Feitiços', icon: '⚔️', short: 'Maior, menor, igual e ordenar', count: 8, gen: genDuelo },
    { id: 'dragao', name: 'A Primeira Tarefa', icon: '🐉', short: 'O desafio final: tudo junto!', count: 10, gen: genDragao, boss: true }
  ];

  // calcula o "nível" (1,2,3) conforme o progresso dentro da fase
  function nivelPara(i, total) {
    var frac = i / total;
    if (frac < 0.4) return 1;
    if (frac < 0.7) return 2;
    return 3;
  }

  global.GAME_CONTENT = {
    PHASES: PHASES,
    porExtenso: porExtenso,
    nivelPara: nivelPara,
    gerar: function (phaseId, i, total) {
      var ph = PHASES.filter(function (p) { return p.id === phaseId; })[0];
      if (!ph) return null;
      var lvl = nivelPara(i, total);
      var q;
      // proteção contra geração inválida (raríssimo): tenta de novo
      for (var tentativa = 0; tentativa < 5; tentativa++) {
        q = ph.gen(lvl);
        if (q && q.correct !== undefined ? true : (q && q.correctOrder)) break;
      }
      return q;
    }
  };
})(window);
