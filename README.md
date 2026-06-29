# 🏆 Torneio Tribruxo da Matemática

Um jogo mágico (tema Harry Potter / Torneio Tribruxo) para uma criança do **2º ano**
estudar e praticar matemática de forma gamificada. Toda a preparação é a jornada rumo à
**Primeira Tarefa** do torneio, e cada fase é uma aula de magia.

Feito em **HTML, CSS e JavaScript puro** — sem nenhuma dependência externa. Funciona
abrindo o arquivo no navegador e também publicado na **Vercel**. Os sons e a música são
sintetizados em tempo real (Web Audio API), então não há arquivos de áudio para baixar.

### ✨ Imersão e engajamento
- 🎵 **Trilha sonora contínua e adaptativa**: cada fase tem seu próprio tema musical
  (procedural, sem arquivos), que troca com transição suave conforme a aula.
- 🌌 **Cenário muda a cada fase**: masmorra verde com bolhas (Poções), brasas (Dragão),
  nuvens no céu (Quadribol), runas flutuantes, névoa, etc.
- 🎉 **Efeitos de recompensa (game juice)**: pontos que sobem animados, selo de combo,
  faíscas, brilho suave e **pomo-surpresa** de vez em quando (recompensa de razão variável).
- 🎁 **Mini-jogo bônus diferente ao fim de cada fase**: oficina de valor posicional,
  caldeirão de somas, Evanesco de subtração, voo sequencial do pomo, memória de runas,
  duelo de comparação e arena final do dragão.
- 🛡️ Casas com **brasões** (escudos) e velas do Salão Principal mais realistas.

> Tudo respeita `prefers-reduced-motion` e há um botão para ligar/desligar som e música.

---

## 🎮 Como jogar

1. A criança digita o **nome** (assim vários colegas podem jogar no mesmo aparelho).
2. O **Chapéu Seletor** escolhe a casa (Grifinória, Corvinal, Lufa-Lufa ou Sonserina).
3. No **mapa do torneio**, cada aula vira disponível conforme a anterior é concluída.
4. Pode **repetir** qualquer fase quantas vezes quiser para melhorar as estrelas.
5. Tudo (nome, pontos, estrelas, medalhas e progresso) fica salvo **neste aparelho**
   (no `localStorage` do navegador).

---

## 📚 Conteúdo (mapeado à prova — Unidades 2 e 4 do livro)

| Fase | Aula | Conteúdo da prova |
|------|------|-------------------|
| 1 | 🪄 Feitiços de Encantamento | Composição/decomposição, valor posicional, por extenso, material dourado |
| 2 | 🧪 Aula de Poções | Adição (com e sem reagrupamento), problemas |
| 3 | 💨 Feitiço Evanesco | Subtração (com e sem reagrupamento), problemas |
| 4 | 🧹 Treino de Quadribol | Reta numérica, antecessor/sucessor, sequências (2,3,5,6 em 6 e Fibonacci) |
| 5 | 🔮 Runas Antigas | **Aprofundamento**: número escondido (`5 + 🟪 = 8`), símbolos alternativos de operação, comparação `> < =`, mesma quantidade em outras formas |
| 6 | ⚔️ Duelo de Feitiços | Maior/menor/igual e ordenar (crescente e decrescente) |
| 7 | 🐉 A Primeira Tarefa | Desafio final misturando tudo |

Além de múltipla escolha, o jogo agora alterna respostas digitadas, ordenação e construção
de números com centenas, dezenas e unidades.

As contas começam na faixa **0–99** e avançam até **0–499**, exatamente como o livro.
As questões são **geradas por código** (números novos a cada partida), então dá para
jogar muitas vezes sem repetir. Toda a matemática foi verificada automaticamente.

---

## 💻 Abrir no computador (sem internet)

- **Modo mais simples:** dê **dois cliques** no arquivo `index.html`. Ele abre no
  navegador e já funciona.
- Se algum navegador bloquear, rode um servidorzinho local na pasta do jogo:
  - `npx serve` (precisa de Node) **ou**
  - `python3 -m http.server 8000` e acesse `http://localhost:8000`.

---

## 🚀 Publicar na Vercel

Você só precisa publicar **esta pasta** (`jogo-tribruxo`). É um site estático.

### Opção A — Arrastar e soltar (mais fácil)
1. Crie uma conta grátis em <https://vercel.com>.
2. Vá em **Add New → Project → Deploy** (ou use <https://vercel.com/new>).
3. **Arraste a pasta `jogo-tribruxo`** para a área de upload.
4. Clique em **Deploy**. Pronto: você recebe um link público para compartilhar.

### Opção B — Pela linha de comando
```bash
npm i -g vercel
cd jogo-tribruxo
vercel        # siga as perguntas (aceite os padrões)
vercel --prod # publica a versão final
```

### Opção C — Pelo GitHub
1. Suba a pasta `jogo-tribruxo` para um repositório no GitHub.
2. Em <https://vercel.com/new>, importe o repositório.
3. Em *Framework Preset* escolha **Other** (é site estático) e clique em **Deploy**.

> Não precisa configurar nada de build: não há etapa de compilação.

---

## 🔧 Personalizar (opcional)

Tudo é fácil de mexer, em texto simples:

- **Quantidade de questões por fase:** em `js/questions.js`, no array `PHASES`,
  mude o campo `count` de cada fase.
- **Textos, casas, medalhas, falas:** em `js/game.js`, no objeto `CONFIG` lá no início.
- **Cores e visual:** em `styles.css` (as cores ficam nas variáveis `--ouro`, etc.).
- **Sons:** em `js/sound.js`.
- **Dificuldade:** em `js/questions.js`, a função `nivelPara` controla quando os números
  ficam maiores dentro de cada fase.

---

## 📁 Arquivos

```
jogo-tribruxo/
├── index.html        ← a página do jogo
├── styles.css        ← visual mágico (céu, velas, pergaminho…)
├── vercel.json       ← configuração mínima para a Vercel
├── README.md         ← este arquivo
└── js/
    ├── sound.js      ← efeitos sonoros (Web Audio API)
    ├── music.js      ← trilha sonora procedural por fase (Web Audio API)
    ├── minigame.js   ← registry dos mini-jogos bônus por fase
    ├── questions.js  ← geradores de questões (a matemática)
    └── game.js       ← motor do jogo, telas, cenários e progresso
```

Feito com carinho para o Joaquim. ✨🦁
