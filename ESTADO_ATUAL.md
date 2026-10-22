# ESTADO_ATUAL.md — Diagnóstico e Registro de Sessão

**Data:** 2026-10-21  
**Marco Atual:** M1 (Protótipo de física) e M2 (Vertical Slice de 5 fases e persistência) concluídos na camada de engenharia e testados (27 testes passando com 100% de sucesso); Marco M3 (Áudio e narrativa) planejado.

---

## 1. Diagnóstico do Ambiente e Repositório

- **Transição de ambiente:** A sessão anterior rodou no Windows (`E:\jogo-c`). A sessão atual foi iniciada no Arch Linux (`/run/media/pedro/Ventoy/jogo-c`).
- **Runtime Node.js no Linux:** O sistema host não possuía binários de `node`/`npm` no `$PATH` global. Foi configurado Node.js standalone oficial v26.11.1 e npm v11.20.0 em `~/.local` com links em `~/.gemini/antigravity-ide/bin`, garantindo disponibilidade de execução.
- **Dependências e bindings:** Executado `npm i` para adicionar os bindings nativos do Rolldown para Linux x64 (`@rolldown/binding-linux-x64-gnu`).
- **Build de produção:** `npm run build` compila perfeitamente via Vite 8.3.5 em ~56ms sem erros ou avisos.
- **Suíte de testes:** 27 testes unitários passando em ~70ms com runner nativo `node --test tests/**/*.test.js`.

---

## 2. Implementações Realizadas Nesta Sessão

### Marco M1 — Protótipo de Física e Controles
1. **`src/core/math.js` & `tests/math.test.js`**: Vetores 2D puros, produto escalar/vetorial, lerp, clamp, normalização angular e `closestPointOnSegment` (7 testes).
2. **`src/core/input.js` & `tests/input.test.js`**: `InputManager` para teclado e multitoque (Pointer Events) com soma zero e reset seguro (6 testes).
3. **`src/physics/collision.js`, `src/physics/engine.js` & `tests/physics.test.js`**: Resolução normal/tangencial, impacto frontal com desaceleração, wall thrust boost, antiexploit e 4 subpassos contra tunelamento (5 testes).
4. **`src/gameplay/camera.js` & `src/rendering/renderer.js`**: Câmera 2D com lerp e look-ahead; renderizador Canvas 2D neon com rastro de luz proporcional, partículas de faísca e modo debug.

### Marco M2 — Vertical Slice de 5 Fases e Persistência
1. **`src/platform/storage.js` & `tests/storage.test.js`**:
   - `StorageManager` com schema versionado (`v1`), detecção e migração automática de dados legados (`SAVE-002`).
   - Fallback resiliente em memória caso `localStorage` esteja bloqueado, corrompido ou indisponível (`SAVE-003`).
   - Gravação de melhores tempos por fase (`SAVE-001`), versionamento de física (`SAVE-007`) e reset seguro com confirmação (`SAVE-004`).
   - 5 testes unitários cobrindo todos os fluxos de persistência e corrupção de dados.
2. **`src/levels/tracks.js` & `tests/tracks.test.js`**:
   - Banco com as 5 pistas autorais do Vertical Slice (`LEVEL-009`):
     1. `track-01-proto`: Circuito Alfa (Linear, introdução ao movimento e inércia).
     2. `track-02-arc`: Arco Cinético (Linear, curvas amplas para domínio do wall boost).
     3. `track-03-loop`: O Anel Digital (Circuito fechado de 2 voltas com checkpoints obrigatórios - `LEVEL-002`, `RACE-002`, `RACE-011`).
     4. `track-04-rush`: Sobrecarga Crítica (Contra o relógio com limite de 12.5s e falha ao expirar - `LEVEL-003`, `RACE-003`).
     5. `track-05-bifurcation`: Bifurcação Quântica (Pista com atalhos e caminhos alternativos - `LEVEL-011`).
   - Validador `validateTracks` que audita integridade de spawns, paredes e regras (`LEVEL-012`).
   - 4 testes unitários cobrindo integridade das pistas e sequenciamento de níveis.
3. **`src/main.js` & `index.html`**:
   - Modal de Seleção de Fases (`#level-select-overlay`) com grid responsivo de cards mostrando status de bloqueio, melhor tempo e tipo de prova (`UI-004`).
   - Fluxo completo de progressão: ao vencer, salva o recorde, desbloqueia a próxima pista e exibe botão "Próxima Fase" (`CORE-002`, `UI-003`, `SAVE-001`).
   - HUD dinâmica com nome da fase, indicador de voltas ("Volta 1/2"), temporizador regressivo ("Restam X.Xs") e velocidade instantânea (`CORE-007`).
   - Botão para reset de save com confirmação em `index.html`.

---

## 3. Estado Atual dos Documentos

- **`CHECKLIST.md`**:
  - M1-01 a M1-06 marcados como `[x]` (engenharia e testes concluídos); M1-07 e M1-08 mantidos em aberto para playtest em dispositivos reais.
  - M2-01 a M2-05 marcados como `[x]` (engenharia e testes concluídos); M2-06 e M2-07 mantidos em aberto para validação em múltiplos aparelhos.
  - Requisitos individuais correspondentes em CORE, CTRL, PHYS, CAM, LEVEL, RACE, VIS, UI, RESP e SAVE atualizados com rigor.
  - Seções 6 e 7 atualizadas com comandos e evidências.
  - BUG-001 (geometria das linhas de chegada das fases 1 e 2) registrado e resolvido com evidência.
- **`AGENTS.md`**: Seção 3 (Mapa Real do Repositório) atualizada com todos os novos arquivos e testes.
- **`FUNCIONALIDADES.md`**: Íntegro e preservado.

---

## 3.5. Correção da Geometria das Linhas de Chegada — Fases 1 e 2 (BUG-001)

**Data:** 2026-10-21

### Causa raiz

- **Fase 1 (Circuito Alfa):** O corredor final sobe diagonalmente com declividade `m ≈ -0.8` (de `y=750` para `y=350` na parede superior, e `y=900` para `y=550` na inferior). A linha de chegada original era um segmento vertical em `x=2100` de `y=350` a `y=550`. Como a parede superior passa por `y≈430` em `x=2100`, a linha começava fora da pista em `y=350`, cortava a parede superior e terminava no meio do corredor sem encostar na parede inferior.
- **Fase 2 (Arco Cinético):** O corredor final é estritamente vertical descendo de `y=750` a `y=950` entre paredes em `x=1650` (esquerda) e `x=1900` (direita). A linha original era vertical em `x=1800` de `y=750` a `y=950`, correndo paralela às paredes — impossível de cruzar normalmente.

### Correções aplicadas

| Fase | Antes | Depois | Ângulo relativo ao corredor |
|---|---|---|---|
| 1 | `(2100,350)→(2100,550)` vertical | `(2102,428)→(2200,550)` diagonal | ~89.9° (perpendicular) |
| 2 | `(1800,750)→(1800,950)` vertical | `(1650,950)→(1900,950)` horizontal | 90° (perpendicular) |

### Arquivos alterados

- `src/levels/tracks.js` — coordenadas da finishLine e ponto `b` da parede superior (fase 1)
- `src/levels/prototypeTrack.js` — mesma geometria corrigida para coerência
- `tests/tracks.test.js` — 2 testes de integridade geométrica adicionados
- `tests/physics.test.js` — 2 testes de detecção de cruzamento adicionados

### Validação

- `npm test`: 31 testes passando em 68ms (0 falhas)
- `npm run build`: compilação limpa em 62ms
- Fases 3, 4 e 5 verificadas: sem alterações
- Verificação visual automatizada: indisponível (Playwright driver inacessível); playtest manual recomendado

---

- Verificação visual automatizada: indisponível (Playwright driver inacessível); playtest manual recomendado

---

## 4. Implementações Realizadas no Marco M3 (Áudio, Narrativa e Apresentação)

1. **Motor de Áudio Procedural Autoral (`src/platform/audio.js` & `tests/audio.test.js`)**:
   - 100% sintetizado via Web Audio API, sem dependências ou samples de terceiros (`AUDIO-001`, `AUDIO-009`).
   - Synth arpeggiator procedural pentatônico em Lá menor no menu e fanfarras de vitória (`AUDIO-002`).
   - Som contínuo de motor com onda dente-de-serra suavizada por filtro passa-baixa e pitch reativo à velocidade (`AUDIO-008`).
   - SFX procedurais: batida frontal (`wallHit`), raspagem com faísca (`wallScrape`), ativação de wall thrust (`boost`), chegada (`finish`), derrota (`fail`), volta (`lap`), bleeps de diálogo (`dialogue`) e cliques de UI (`uiClick`) (`AUDIO-003`).
   - Mixagem independente com sliders de volume Master, Música e SFX, botão de mudo e persistência no `StorageManager` (`AUDIO-004`).
   - Desbloqueio tardio do AudioContext no primeiro gesto do usuário (`AUDIO-005`).
   - Suspensão/retomada de áudio na troca de aba via `visibilitychange` e durante pausa (`AUDIO-006`).
   - Limite de 8 vozes SFX simultâneas e execução resiliente em ambientes headless/Node.js (`AUDIO-007`).
   - 10 testes unitários em `tests/audio.test.js`.

2. **Sistema de Diálogos e Narrativa Autoral (`src/gameplay/story.js` & `tests/story.test.js`)**:
   - Assistente original **KRONA** (Kernel de Roteamento e Operação Navegacional Autônoma) com tom analítico e progressão de vínculo (`NARR-001`, `NARR-002`).
   - Diálogos orientados por dados nas 5 pistas do Vertical Slice, cobrindo introdução de inércia, wall thrust, checkpoints/voltas, contra o relógio e bifurcação de caminhos (`NARR-003`, `NARR-004`).
   - Modal de diálogo neon (`#dialogue-overlay`) com speaker pulsante, botões "Avançar ▶" e "Pular" (atalhos via clique na caixa, Enter/Espaço/Seta e Esc) (`NARR-005`, `NARR-008`).
   - Textos localizados centralizados em PT-BR (`NARR-010`).
   - Persistência e controle de diálogos já vistos (`seenDialogues`) em `src/platform/storage.js` para não interromper repetições de fases (`NARR-015`).
   - 4 testes unitários cobrindo integridade e validação de diálogos em `tests/story.test.js`.

3. **Overlay de Pausa e Controles de Acessibilidade (`index.html` & `src/main.js`)**:
   - Novo overlay `#pause-overlay` com botões "Continuar", "Reiniciar Fase", "Selecionar Fase", "Menu Principal" (`CORE-002`, `UI-002`).
   - Painel de áudio embutido na pausa e no HUD com sliders de volume e botão de mudo acessível por touch e teclado (`AUDIO-004`, `UI-002`).
   - Botão de pausa (⏸) e mudo (🔊/🔇) no HUD para suporte nativo a telas sensíveis ao toque (`UI-002`).

---

4. **Mecânicas Avançadas de Forças e Zonas (`src/physics/engine.js`, `src/levels/tracks.js`, `src/rendering/renderer.js` & `tests/physics.test.js`)**:
   - Gravidade vertical ambiental (`MECH-001`) configurável por pista (ex.: `gravity: 340` na Fase 6 e `gravity: 280` na Fase 8).
   - Zonas de vento com força vetorial contínua (`MECH-002`) permitindo empuxo direcional (ex.: vento ascendente para neutralizar a gravidade).
   - Zonas turbo (`MECH-003`) com impulso de aceleração ao longo da direção e elevação do teto de velocidade para `maxBoostSpeed` (1100 px/s).
   - Zonas de vácuo / propulsão suspensa (`MECH-004`), onde a aceleração do motor é desativada e a nave desliza em inércia pura sofrendo apenas arrasto.
   - Sinalização visual neon de zonas (`MECH-009`) com setas animadas na direção do fluxo (verde para turbo, ciano com partículas para vento, listras de alerta roxas para vácuo).
   - Gerenciamento limpo de sobreposição de zonas (`MECH-010`), impedindo duplicação abusiva de aceleração e mantendo estabilidade.
   - 3 novas pistas autorais dedicadas ao aprendizado dessas forças (`LEVEL-009`):
     - `track-06-gravity`: "Poço Gravitacional" (Linear com gravidade vertical e 2 zonas de vento ascendente).
     - `track-07-turbo`: "Corredor Hiper-Turbo" (Linear com 2 pistas de boost turbo e zona de vácuo central).
     - `track-08-nexus`: "Nexo Quântico" (Circuito fechado de 2 voltas integrando gravidade, vento e turbo).
   - Diálogos didáticos de KRONA contextualizando cada nova mecânica (`NARR-004`).
   - 5 novos testes unitários em `tests/physics.test.js` totalizando 52 testes automatizados na suíte com 100% de sucesso.

---

5. **Sistema de Corredor-Fantasma / Ghost Benchmark e Replay (`src/gameplay/ghost.js`, `src/platform/storage.js`, `src/rendering/renderer.js`, `src/main.js`, `index.html` & `tests/ghost.test.js`)**:
   - Gravação periódica de alta performance (20Hz / 0.05s) via `GhostRecorder` sem alocações desnecessárias por frame (`RACE-012`).
   - `GhostPlayer` desacoplado com interpolação linear suave de coordenadas e interpolação angular pelo menor arco entre fronteiras de $-\pi$ a $+\pi$ (`RACE-004`).
   - Persistência e recuperação atrelada ao melhor tempo de cada fase no `StorageManager` (`src/platform/storage.js`), com versionamento e sanitização defensiva (`validateGhostData`).
   - Renderização visual neon translúcida etérea da nave-fantasma (`drawGhost`) no `NeonRenderer`, sem interferir na física ou nas colisões da nave do jogador (`RACE-004`, `RACE-012`).
   - Chave seletora no painel de Áudio e Preferências do menu de pausa ("Fantasma (Ghost): Sim/Não") com persistência das configurações do usuário (`SAVE-001`).
   - 5 testes unitários dedicados em `tests/ghost.test.js` e 1 teste em `tests/storage.test.js`, elevando a suíte para 58 testes automatizados passando em ~106ms.

6. **Persistência Multi-sessão e Responsividade Multi-resolução (`M3-06`, `M3-07`, `SAVE-008`, `RESP-004`, `RESP-007`, `RESP-009`, `RESP-011`, `RESP-012`)**:
   - `StorageManager` testado com restauração completa de dados pós-recarregamento simulado (recordes, ghosts, fases desbloqueadas, diálogos vistos e preferências).
   - Migração retrocompatível resiliente de schemas legados (v0) preenchendo novos campos com defaults sem perda de dados históricos (`SAVE-002`, `SAVE-007`).
   - Métodos de exportação e importação de save via JSON versionado (`exportSave`, `importSave`) com validação defensiva (`SAVE-008`).
   - `Camera2D` com zoom adaptativo responsivo mantendo campo de visão seguro em viewports móveis estreitas/retrato (390×844) e paisagem (844×390), iPad (768×1024), FHD e ultrawide (3440×1440) (`RESP-001`, `RESP-009`).
   - `viewport-fit=cover` com safe-area insets no HUD e controles, feedback visual ativo nos botões touch, altura de toque generosa (44px) e suporte a acessibilidade com `prefers-reduced-motion` (`RESP-004`, `RESP-007`, `RESP-011`, `RESP-012`).
   - Suíte expandida para 65 testes automatizados (9 suítes) passando em ~101ms.

---

## 5. Marco Atual e Próximos Passos (Marco M4 — Conteúdo e Polimento)

O **Marco M3 está 100% concluído em engenharia e testes**. O próximo foco é o **Marco M4**:

1. **Expansão de Fases Autorais (`M4-01 [P2]`, `LEVEL-009`)**:
   - Expandir o catálogo atual de 8 fases para novas pistas explorando combinações avançadas (curvas fechadas, contra o relógio em vácuo, percursos gravitacionais com atalhos).
2. **Colecionáveis de Dados / Bits e Chaves (`M4-02 [P2]`, `LEVEL-007`, `MECH-006`)**:
   - Integrar bits/colecionáveis neon que recompensam domínio de traçado e curvas sem quebrar o ritmo de corrida rápida.
3. **Refinamento de Feedback e Acessibilidade (`M4-03 [P2]`, `VIS-004`, `VIS-008`, `UI-007`)**:
   - Adicionar velocímetro radial analógico ou barra de boost dinâmico no rastro da nave, melhorando ainda mais a legibilidade em telas compactas.


