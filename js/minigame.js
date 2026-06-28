/* =========================================================================
   MINI-JOGO BÔNUS — "Voo da Vassoura"
   Corredor infinito estilo dino do Chrome, mas mágico: pule os obstáculos
   e pegue os pomos de ouro. Um toque só (tecla, clique ou toque na tela).
   Canvas puro, autônomo. Chame MiniGame.open(onClaim) — onClaim(bonusPts).
   ========================================================================= */
(function (global) {
  'use strict';

  var S = global.Sound;

  function el(tag, css) { var e = document.createElement(tag); if (css) e.style.cssText = css; return e; }

  var MiniGame = {
    open: function (onClaim) {
      var overlay = el('div', 'position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;background:rgba(5,7,25,0.92);backdrop-filter:blur(2px);');

      var titulo = el('div', 'color:#ffe9a8;font-family:Cinzel,serif;font-weight:700;font-size:clamp(1.1rem,4vw,1.5rem);' +
        'text-shadow:0 0 10px rgba(240,199,94,.6);margin-bottom:8px;text-align:center;padding:0 12px;');
      titulo.innerHTML = '🧹 Voo da Vassoura — pegue os pomos! 🟡';

      var wrap = el('div', 'position:relative;width:min(720px,94vw);');
      var canvas = el('canvas');
      var W = Math.min(720, Math.floor(global.innerWidth * 0.94));
      var H = Math.round(W * 0.5);
      canvas.width = W; canvas.height = H;
      canvas.style.cssText = 'width:100%;border-radius:16px;border:2px solid #f0c75e;box-shadow:0 10px 30px rgba(0,0,0,.5);display:block;touch-action:none;';
      wrap.appendChild(canvas);

      var dica = el('div', 'color:#cdbfe8;margin-top:10px;font-size:0.95rem;text-align:center;padding:0 12px;');
      dica.textContent = 'Toque na tela (ou barra de espaço) para voar mais alto!';

      var sair = el('button', '');
      sair.className = 'btn btn-fantasma';
      sair.style.marginTop = '12px';
      sair.textContent = '✓ Pegar recompensa e voltar';

      overlay.appendChild(titulo);
      overlay.appendChild(wrap);
      overlay.appendChild(dica);
      overlay.appendChild(sair);
      document.body.appendChild(overlay);

      var ctx = canvas.getContext('2d');
      var ground = H - 30;
      var player = { x: 70, y: ground - 30, w: 34, h: 30, vy: 0, onGround: true };
      var grav = 0.7, jump = -10.5;
      var speed = 5, baseSpeed = 5;
      var obstacles = [], snitches = [], stars = [], clouds = [];
      var dist = 0, pomos = 0, score = 0;
      var state = 'ready'; // ready | playing | over
      var raf = null, spawnT = 0, snitchT = 0, claimed = false;
      var t = 0;

      for (var i = 0; i < 40; i++) stars.push({ x: Math.random() * W, y: Math.random() * (ground - 10), r: Math.random() * 1.6 + 0.4, tw: Math.random() * 6 });
      for (var k = 0; k < 4; k++) clouds.push({ x: Math.random() * W, y: 20 + Math.random() * (ground * 0.4), s: 0.4 + Math.random() * 0.5, w: 50 + Math.random() * 50 });

      function flap() {
        if (state === 'ready') { state = 'playing'; }
        if (state === 'playing') {
          if (player.onGround || player.vy > 2) { // pulo no chão ou "double-flap" suave
            player.vy = jump; player.onGround = false;
            if (S) S.pick();
          }
        } else if (state === 'over') { reiniciar(); }
      }

      function reiniciar() {
        obstacles = []; snitches = []; dist = 0; pomos = 0; score = 0;
        speed = baseSpeed; player.y = ground - player.h; player.vy = 0; player.onGround = true;
        spawnT = 60; snitchT = 90; state = 'playing';
      }

      function onKey(e) { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); } }
      function onPointer(e) { e.preventDefault(); flap(); }
      document.addEventListener('keydown', onKey);
      canvas.addEventListener('pointerdown', onPointer);

      function rect(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      }

      function update() {
        t++;
        if (state === 'playing') {
          dist += speed;
          speed = baseSpeed + Math.min(5, dist / 1200);
          // física do jogador
          player.vy += grav; player.y += player.vy;
          if (player.y >= ground - player.h) { player.y = ground - player.h; player.vy = 0; player.onGround = true; }
          // spawn de obstáculos
          if (--spawnT <= 0) {
            var hh = 24 + Math.random() * 34;
            obstacles.push({ x: W + 10, y: ground - hh, w: 22 + Math.random() * 12, h: hh });
            spawnT = Math.max(48, 95 - Math.floor(dist / 250)) + Math.floor(Math.random() * 30);
          }
          // spawn de pomos
          if (--snitchT <= 0) {
            snitches.push({ x: W + 10, y: ground - 70 - Math.random() * 60, r: 11, got: false });
            snitchT = 70 + Math.floor(Math.random() * 80);
          }
          // mover e colidir
          var i;
          for (i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= speed;
            if (rect(player, obstacles[i])) { fim(); }
            if (obstacles[i].x + obstacles[i].w < -10) obstacles.splice(i, 1);
          }
          for (i = snitches.length - 1; i >= 0; i--) {
            var s = snitches[i]; s.x -= speed;
            if (!s.got && rect(player, { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 })) {
              s.got = true; pomos++; score += 50; if (S) S.snitch();
            }
            if (s.x + s.r < -10) snitches.splice(i, 1);
          }
          score = Math.floor(dist / 10) + pomos * 50;
        }
        for (var c = 0; c < clouds.length; c++) {
          clouds[c].x -= clouds[c].s * (state === 'playing' ? 1.4 : 0.5);
          if (clouds[c].x < -clouds[c].w) { clouds[c].x = W + 20; clouds[c].y = 20 + Math.random() * (ground * 0.4); }
        }
      }

      function fim() {
        if (state !== 'playing') return;
        state = 'over';
        if (S) S.wrong();
      }

      function draw() {
        // céu noturno
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0a0f2c'); g.addColorStop(1, '#241a4d');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // estrelas
        for (var i = 0; i < stars.length; i++) {
          var st = stars[i];
          ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin((t + st.tw * 20) * 0.03));
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // nuvens/névoa
        ctx.fillStyle = 'rgba(138,92,246,0.18)';
        for (var c = 0; c < clouds.length; c++) {
          var cl = clouds[c];
          ctx.beginPath(); ctx.ellipse(cl.x, cl.y, cl.w, cl.w * 0.4, 0, 0, 7); ctx.fill();
        }
        // chão (castelo/torre base)
        ctx.fillStyle = '#1a1230'; ctx.fillRect(0, ground, W, H - ground);
        ctx.strokeStyle = '#3a2a5e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
        // obstáculos (torres de pedra com ameias)
        for (i = 0; i < obstacles.length; i++) {
          var o = obstacles[i];
          ctx.fillStyle = '#6b6275'; ctx.fillRect(o.x, o.y, o.w, o.h);
          ctx.fillStyle = '#857c92';
          ctx.fillRect(o.x, o.y, o.w / 3, 6); ctx.fillRect(o.x + o.w * 2 / 3, o.y, o.w / 3, 6);
          ctx.strokeStyle = '#4a4356'; ctx.strokeRect(o.x, o.y, o.w, o.h);
        }
        // pomos de ouro
        for (i = 0; i < snitches.length; i++) {
          var s = snitches[i]; if (s.got) continue;
          ctx.save(); ctx.translate(s.x, s.y);
          // asas
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          var wf = Math.sin(t * 0.5) * 4;
          ctx.beginPath(); ctx.ellipse(-s.r - 2, -2 + wf, 7, 3, -0.5, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.ellipse(s.r + 2, -2 + wf, 7, 3, 0.5, 0, 7); ctx.fill();
          // corpo
          var gg = ctx.createRadialGradient(-3, -3, 1, 0, 0, s.r);
          gg.addColorStop(0, '#fff3c0'); gg.addColorStop(1, '#f0c75e');
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, s.r, 0, 7); ctx.fill();
          ctx.strokeStyle = '#b8860b'; ctx.stroke();
          ctx.restore();
        }
        // jogador (bruxo na vassoura) — emoji
        ctx.save();
        ctx.font = (player.h + 6) + 'px serif';
        ctx.textBaseline = 'bottom';
        var tilt = Math.max(-0.3, Math.min(0.3, player.vy * 0.03));
        ctx.translate(player.x + player.w / 2, player.y + player.h);
        ctx.rotate(tilt);
        ctx.fillText('🧙‍♂️', -player.w / 2, 6);
        ctx.font = (player.h) + 'px serif';
        ctx.fillText('🧹', -player.w / 2 - 6, 12);
        ctx.restore();
        // rastro de faísca
        if (state === 'playing' && t % 2 === 0) {
          ctx.fillStyle = 'rgba(240,199,94,' + (0.3 + Math.random() * 0.3) + ')';
          ctx.beginPath(); ctx.arc(player.x - 4, player.y + player.h - 6, 2 + Math.random() * 2, 0, 7); ctx.fill();
        }
        // HUD
        ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 18px sans-serif'; ctx.textBaseline = 'top';
        ctx.fillText('⭐ ' + score, 12, 10);
        ctx.textAlign = 'right'; ctx.fillText('🟡 ' + pomos, W - 12, 10); ctx.textAlign = 'left';

        if (state === 'ready') {
          banner('Toque para começar a voar! 🧹', 'Pule os obstáculos e pegue os pomos 🟡');
        } else if (state === 'over') {
          banner('Voo encerrado! ⭐ ' + score + ' pontos', 'Toque para voar de novo, ou pegue a recompensa');
        }
      }

      function banner(linha1, linha2) {
        ctx.fillStyle = 'rgba(10,12,40,0.65)'; ctx.fillRect(0, H / 2 - 42, W, 84);
        ctx.fillStyle = '#ffe9a8'; ctx.textAlign = 'center';
        ctx.font = 'bold 22px sans-serif'; ctx.fillText(linha1, W / 2, H / 2 - 26);
        ctx.fillStyle = '#cdbfe8'; ctx.font = '14px sans-serif'; ctx.fillText(linha2, W / 2, H / 2 + 8);
        ctx.textAlign = 'left';
      }

      function frame() { update(); draw(); raf = requestAnimationFrame(frame); }
      frame();

      function fechar() {
        if (claimed) return; claimed = true;
        if (raf) cancelAnimationFrame(raf);
        document.removeEventListener('keydown', onKey);
        canvas.removeEventListener('pointerdown', onPointer);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (typeof onClaim === 'function') onClaim(score);
      }
      sair.addEventListener('click', function (e) { e.stopPropagation(); fechar(); });
    }
  };

  global.MiniGame = MiniGame;
})(window);
