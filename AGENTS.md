# AGENTS.md — Instruções permanentes para IA (Antigravity IDE)

> **ARQUIVO DE REGRAS ATIVAS DO PROJETO.** Este arquivo fica na **raiz do repositório**, no mesmo nível de `FUNCIONALIDADES.md` e `CHECKLIST.md`. Aplica-se a toda sessão de IA que lê, cria, corrige, refatora ou testa este jogo.
>
> **REGRA MAIS IMPORTANTE:** **NUNCA** modificar código sem ler os outros dois `.md` e inspecionar **a estrutura e o código realmente existentes**. **NUNCA** concluir uma implementação sem atualizar `CHECKLIST.md` na **mesma tarefa**, após validar o comportamento. O que não foi testado permanece pendente.

**Produto:** jogo autoral de corrida/aventura 2D neon para navegador, inspirado em princípios de DATA WING, com suporte responsivo a desktop, celular e tablet.  
**Data inicial da regra:** 2026-10-21.  
**Documentos obrigatórios:** `FUNCIONALIDADES.md` (o que construir) e `CHECKLIST.md` (o que falta e o que foi comprovado).  
**Fontes sobre regras Antigravity:** https://antigravity.google/docs/rules/ — `AGENTS.md` na raiz é reconhecido como regra de workspace. NÃO usar YAML frontmatter neste arquivo. Não ultrapassar ~24 KB, pois regras excessivamente grandes podem ser truncadas.

## 0. Prioridades absolutas (sempre executar)

1. **Ler ANTES de alterar:** `AGENTS.md` (este), `FUNCIONALIDADES.md` **inteiro** e `CHECKLIST.md` **inteiro**, em seguida o código relevante e dependências diretas. Nunca se basear só no nome de um arquivo ou no resumo de sessão passada.
2. **Inspecionar a realidade:** mapear repositório, entrada da aplicação, stack, sistema de build, módulos, assets, testes, comandos, trabalho não commitado, erros atuais. A árvore recomendada em `FUNCIONALIDADES.md` é **apenas sugestão**, não a estrutura real.
3. **Preservar:** código funcional, dados/saves, configurações, layout, controles, desempenho e convenções existentes. Mudar apenas o indispensável ao pedido e suas dependências comprovadas.
4. **Implementar com prova:** explicar objetivo e plano sucinto, editar, executar build/testes possíveis, validar o caminho do usuário e reportar o que passou/falhou.
5. **Atualizar o checklist IMEDIATAMENTE:** depois de implementar **e validar** cada requisito, mudar sua linha `- [ ]` para `- [x]`, adicionar evidência de teste na seção 6 de `CHECKLIST.md` e conferir dependências. Se parcial, manter `[ ]` e anotar o problema na seção 7.
6. **Nova funcionalidade que não existe nos docs:** ANTES de desenvolver, adicionar um ID único, origem, descrição, prioridade e critério de aceitação a `FUNCIONALIDADES.md`, e checkbox com mesmo ID a `CHECKLIST.md`. Depois, seguir o fluxo normal de teste e atualização.
7. **Atualizar arquitetura viva:** se adicionar/mover/remover arquivos relevantes, alterarem responsabilidades, scripts, APIs, dependências ou convenções, revisar o **Mapa Real do Repositório** (seção 3 deste arquivo) na mesma tarefa.
8. **Não inventar:** não afirmar que algo existe, foi testado, é igual ao original ou está concluído sem evidência. Diferenciar **observado**, **confirmado**, **proposto** e **pendente**.
9. **Sempre respeitar decisões explícitas do usuário** sobre stack, recursos e priorização. Não promover protótipos para multiplayer/backend complexo sem necessidade.

Se um documento estiver ausente ou ilegível, procure-o na raiz do workspace e subpastas pertinentes. Se realmente ausente, explique o bloqueio. Não fabricar conteúdo alegando que leu arquivos inexistentes.

## 1. Protocolo de abertura de CADA sessão

### Etapa A — Descoberta sem modificar nada

1. Identificar o diretório raiz **real** do projeto aberto no Antigravity (não presumir caminhos usados em outros projetos).
2. Ler os três `.md` integralmente. Identificar: objetivo pedido, requisitos relacionados, status do checklist, riscos e critérios de aceitação.
3. Ler `package.json`, lockfile, config do bundler, README (caso existam) e scripts existentes. Detectar JS/TS, engine, módulos, rotas, CSS, armazenamento, ferramentas de testes.
4. Mapear pastas e arquivos ignorando diretórios enormes como `node_modules`, `.git`, `dist`, `coverage`. Preferir inventário rápido com `rg --files`, `find`, e buscas por `import`/`export`/eventos conforme stack.
5. Identificar arquivos de entrada, carregamento de cenas, ciclo de update, input, física, colisão, fase, HUD, áudio, save, assets, testes e tratamento de redimensionamento.
6. Ler os **arquivos completos que vai modificar** e os chamadores/callees que possam quebrar; para mudanças amplas, rastrear o fluxo de ponta a ponta.
7. Examinar `git status --short` e diferenças se Git existir. **Não sobrescrever nem descartar trabalho pré-existente.** Sem Git, propor backup pontual antes de uma mudança destrutiva.
8. Verificar se o jogo **já roda**: usar scripts do projeto como estão e observar logs/erros. Se não for possível executar, documentar exatamente por quê.
9. Comparar código versus `CHECKLIST.md`: itens marcados como feitos mas não encontrados precisam ser sinalizados e revalidados. Nunca criar conclusões apenas a partir de documentos.
10. Registrar no resumo inicial: `situação atual`, `arquivos afetados`, `IDs da tarefa`, `estratégia mínima`, `testes planejados` e `riscos`.

**Exemplos de comandos de inspeção**, somente quando fizer sentido na stack real e ambiente:

```sh
pwd
rg --files -g '!node_modules' -g '!dist' -g '!coverage' -g '!.git'
git status --short
cat package.json
rg -n "requestAnimationFrame|update\(|physics|collision|pointerdown|pointerup|resize|localStorage|indexedDB" src
npm run
```

Não executar comandos sem verificar se os arquivos/comandos existem. Não usar `sudo`, `rm -rf`, reset/clean de Git, update geral de dependências, formatação em massa ou migração de stack por iniciativa própria.

### Etapa B — Planejamento pré-edição

Produzir um plano curto, técnico e verificável:

- **Solicitação:** o que o usuário quer mudar e o que deve permanecer idêntico.
- **Requisito:** ID(s) exatos (`PHYS-005`, `CTRL-005` etc.). Se for novo, cadastrar ID antes de codar.
- **Caminho de execução:** entrada do usuário → módulo controlador → estado/simulação → efeito visual/UI/save.
- **Arquivos:** lista de arquivos a editar, novos arquivos e por que são necessários.
- **Dependências:** quais sistemas podem quebrar e como protegê-los.
- **Critério de aceite:** observável no browser, preferencialmente com teste automatizado.
- **Validação:** script, teste, navegador/dispositivo e verificação manual, conforme disponível.

Para pedido pequeno, plano curto. Para alteração arriscada (arquitetura, física, save, dependências), planejar em etapas testáveis. Não sair criando dezenas de arquivos sem necessidade.

### Etapa C — Implementação e verificação

1. Modificar o mínimo suficiente, mantendo arquitetura coesa e contratos existentes.
2. Evitar duplicar listeners, loops, timeouts, APIs, entidades ou estado global. Garantir cleanup ao desmontar cenas e pausar.
3. Implementar teste de unidade/regressão quando a mudança for determinística (física, timer, save, regras e validação de fase).
4. Executar build e testes existentes; fazer smoke test do fluxo afetado. Registrar erros e limitações, sem maquiar resultado.
5. Repetir verificação nos sistemas sensíveis ao tipo da mudança (ver seção 5).
6. Depois da validação, atualizar **imediatamente** `CHECKLIST.md` — checkbox certo, registro de evidência e pendências — e `AGENTS.md` se o mapa mudou.
7. Se não for possível testar o resultado, manter o requisito `- [ ]`, registrar o que foi implementado e deixar verificação pendente. Compilar sozinho não equivale a estar pronto.

### Etapa D — Relatório obrigatório ao usuário

A resposta final do agente deve conter, de maneira objetiva:

1. **O que mudou** e por quê (IDs dos requisitos).
2. **Arquivos efetivamente alterados/criados.**
3. **O que foi testado** (comandos, teste manual, navegador ou ferramenta e resultado observável).
4. **O que não foi testado ou ainda não funciona**, sem exagerar certeza.
5. **Status atualizado do `CHECKLIST.md`** e se `FUNCIONALIDADES.md` / `AGENTS.md` precisaram mudar.
6. **Próximo passo pequeno e lógico**, ligado ao milestone atual.

A expressão “feito”/“100%” só é permitida quando a Definition of Done do `CHECKLIST.md` foi satisfeita.

## 2. Hierarquia, IDs e sincronização da documentação

| Arquivo | Papel principal | Quando alterar |
|---|---|---|
| `FUNCIONALIDADES.md` | Especificação, ID estável, origem e critérios | novo requisito; mudança de escopo/comportamento; evidência descoberta |
| `CHECKLIST.md` | Estado real, milestones, pendências, testes e histórico | **toda entrega**, todo bug relevante, toda funcionalidade nova, validação ou alteração de prioridade |
| `AGENTS.md` | Regras permanentes e mapa real de arquitetura/código | novo módulo, migração, dependência, regra, comando, decisão estrutural ou risco |

**Workflow transacional para funcionalidades novas (OBRIGATÓRIO):**

```text
Receber pedido
  -> ler os 3 documentos
  -> inventariar / entender código real
  -> procurar requisito ID existente
  -> se novo: criar ID em FUNCIONALIDADES + checkbox em CHECKLIST
  -> planejar mudança mínima
  -> implementar + validar
  -> se passou: marcar [x] o ID, registrar evidência em CHECKLIST
  -> se parcial/falhou: manter [ ], registrar pendência e passos de reprodução
  -> se arquitetura mudou: atualizar mapa e decisões em AGENTS
  -> confirmar sincronização dos 3 docs
  -> relatar ao usuário, sem inventar resultados
```

**ID:** siga prefixos existentes (`CORE`, `CTRL`, `PHYS`, `CAM`, `LEVEL`, `RACE`, `MECH`, `NARR`, `VIS`, `AUDIO`, `UI`, `RESP`, `SAVE`, `ONLINE`) e numeração incremental que ainda não exista. Outros prefixos só se abrirem domínio novo justificável, por exemplo `PWA` ou `SEC`. **Nunca reutilize IDs antigos**, mesmo se uma função for removida. Especifique se requisito é original confirmado `[O]`, comunidade `[C]`, requisito web `[W]`, novo `[N]` ou futuro `[F]`.

**Critério de aceitação:** descreva evento, entrada, estado esperado e casos negativos. Exemplo: `Ao manter dois dedos em lados opostos durante jogo, estado de direção fica neutro; ao retirar um dedo, a direção do outro permanece ativa; ao sair da aba, zera ambos.`

**Se a implementação alterar algo já marcado `[x]`:** rode novamente os testes associados. Se quebrou ou se tornou inconclusiva, **reverter checkbox para `[ ]`** com anotação precisa de regressão e ação corretiva. Não manter um status falso por orgulho ou conveniência.

## 3. Mapa REAL do repositório — preencher após a primeira inspeção

> **Estado atual: NÃO INSPECIONADO.** Esta documentação foi preparada sem acesso ao código deste projeto. **Não inventar nomes de classes, pastas, engines, cenas ou módulos.** Na primeira sessão com o workspace aberto, completar os campos abaixo usando os nomes e caminhos que existirem, mantendo-os atualizados sempre que o projeto evoluir.

| Elemento | Caminho real / módulo | Contrato e responsabilidade | Como verificar |
|---|---|---|---|
| Raiz do workspace | `/run/media/pedro/Ventoy/jogo-c` (Linux / Ventoy) / `E:\jogo-c` (Windows) | Repositório do jogo | `git status`, listagem de arquivos |
| Stack + versões | Vite 8.3.5, JavaScript ESM puro (Node.js v26.11.1 / npm 11.20.0) | Bundler e runtime sem frameworks externos | `package.json`, `npm run build` |
| Entrada / bootstrap | `index.html`, `src/main.js` | Loop de jogo, máquina de estados (MENU/PLAYING/PAUSED/FINISHED), passo fixo, HUD e overlays | Carregamento via Vite, `npm run build` |
| Utilidades matemáticas 2D | `src/core/math.js` | Vetores 2D, produto escalar/vetorial, clamp, lerp, projeção ponto-segmento | `tests/math.test.js` |
| Config de mundo / física | `src/config.js` | Parâmetros de física, passo fixo, wall boost, câmera e estilo neon | `PHYS-012` |
| Controles desktop e mobile | `src/core/input.js` | InputManager: teclado (A/D, setas, R, Esc/P, F3) e Touch (Pointer Events) com soma zero e reset seguro | `tests/input.test.js` |
| Nave / física / colisão | `src/physics/collision.js`, `src/physics/engine.js` | Passo fixo 60Hz, aceleração, inércia, arrasto, impacto frontal vs tangencial com wall thrust | `tests/physics.test.js` |
| Gerenciador de fases / pistas | `src/levels/tracks.js`, `src/levels/prototypeTrack.js` | Banco de 8 pistas originais (linear, voltas, contra o relógio, atalhos, gravidade, vento, turbo e vácuo) e validador LEVEL-012 | `tests/tracks.test.js` |
| Câmera / resize | `src/gameplay/camera.js` | Acompanhamento suave com lerp e look-ahead proporcional à velocidade | Testes visuais e renderizador |
| Renderizador Neon | `src/rendering/renderer.js` | Canvas 2D nativo, trilha iluminada, partículas de boost, setas de turbo/vento e paredes emissivas | Renderização no canvas |
| UI/HUD | `index.html` (DOM/CSS) | Menus, modal de seleção de fases (8 pistas), overlays de tempo, velocidade e dicas | Interação DOM |
| Progresso / save | `src/platform/storage.js` | StorageManager: LocalStorage versionado com fallback em memória e migrações | `tests/storage.test.js` |
| Música / efeitos | `src/platform/audio.js` | AudioManager: Web Audio API pura com synth autoral, motor contínuo por velocidade, SFX procedurais e mixagem com persistência | `tests/audio.test.js` |
| Diálogos / narrativa | `src/gameplay/story.js` | Banco de diálogos orientados por dados com assistente original KRONA para as 8 pistas e validador | `tests/story.test.js` |
| Fantasma / Replay | `src/gameplay/ghost.js` | GhostRecorder e GhostPlayer com amostragem a 20Hz, interpolação de posições/ângulos e validação de telemetria | `tests/ghost.test.js` |
| Testes | `tests/` (`tests/*.test.js`) | 65 testes unitários nativos Node.js cobrindo math, input, física, storage, tracks, audio, story, ghost e camera | `npm test` |
| Builds / deploy | `dist/` gerado via Vite | Build estático limpo (66ms, 17 módulos) | `npm run build` |
| Ativos e licenças | `public/`, `src/assets/` | Gráficos e SVGs | Inspeção de arquivos |

### Inventário das dependências importantes

- **Engine/render:** Canvas 2D nativo (sem Phaser, sem React).
- **Gerenciador de pacotes e versão:** npm com Node.js v26.11.1 (standalone em `~/.local`).
- **Comando para iniciar desenvolvimento:** `npm run dev`
- **Comando para build de produção:** `npm run build` (testado e funcionando em ~66ms).
- **Comando para testes/lint:** `npm test` (`node --test tests/**/*.test.js`, 65 testes passando em ~101ms).
- **Onde estão as fases e schemas:** `src/levels/` (`tracks.js`).
- **Como a nave se movimenta:** Passo fixo 60Hz com inércia gradual, arrasto linear, rotação angular, 4 subpassos de colisão por frame e wall thrust tangencial em `src/physics/`.
- **Como o save é versionado:** `src/platform/storage.js` com schema v1, tolerância a corrupção, preferências de áudio e fallback em memória.
- **Narrativa e diálogos:** `src/gameplay/story.js` com assistente KRONA, diálogos declarativos por fase e persistência de vistos.
- **Áudio autoral:** `src/platform/audio.js` 100% sintetizado via Web Audio API (sem samples externos).
- **Browsers/dispositivos já verificados:** Servidor Vite 8.3.5 testado localmente via HTTP. Playtest manual em navegadores desktop e móveis em andamento.

**Quando atualizar o mapa:** incluir caminho real de arquivo + função concreta, remover somente caminhos confirmadamente aposentados e atualizar efeitos nos imports. Se um caminho ainda não existir, escrever `A IDENTIFICAR` / `PLANEJADO`; **não listá-lo como real**.

## 4. Arquitetura e padrões de longo prazo

1. **Prioridade 1 — gameplay e física:** a nave deve dar sensação de precisão e potência no deslizamento. Não trocar o sistema de movimento por animações artificiais para esconder bugs.
2. **Unidades independentes de resolução:** física em espaço de mundo; layout/câmera em CSS pixels; render usa DPR controlado. Nunca multiplicar velocidade porque a tela ficou maior.
3. **Passo de simulação fixo:** usar `dt` fixo apropriado à stack, com limite de catch-up e comportamento definido para aba oculta. Cronômetro e colisão independentes do FPS de render.
4. **Entrada normalizada:** teclado, touch e eventualmente gamepad alimentam a mesma intenção horizontal (-1/0/+1). Leitura de `window` e DOM fica na camada de platform/input.
5. **Colisão reprodutível:** separar detecção e resolução; validar velocidades altas, contatos repetidos e cantos. Evitar `boost` infinito ao pressionar a parede.
6. **Fases dirigidas por dados:** IDs e geometria em formato validável. Progressão/resultado desacoplados de objetos visuais; permitir adicionar fases sem editar uma cadeia gigantesca de `if`.
7. **Ciclo de vida:** listeners, cenas, sons, timers, sprites, partículas e eventos são limpos corretamente ao sair, pausar, reiniciar e recarregar.
8. **Persistência versionada:** guardar apenas estado serializável; migração e defaults explícitos. Nunca apagar saves para consertar um bug sem autorização do usuário.
9. **UI acessível e responsiva:** touch multimodal, `safe-area`, navegação por teclado, foco visível, redução de movimento; telas desktop, retrato e paisagem.
10. **Áudio para navegador:** aceitar bloqueios de autoplay e iniciar áudio após interação quando exigido. Mute e volumes salvos.
11. **Observabilidade:** logs úteis no ambiente de desenvolvimento, modo debug da física, contagem de FPS e detecção de eventos duplicados, sem poluir produção.
12. **Qualidade:** testes de módulos determinísticos, cenários de regressão, scripts de build, lint/format se já disponíveis. Não adicionar ferramentas apenas pela moda.
13. **Performance:** preferir pooling e limites de partículas; medir antes de otimizar; evitar garbage desnecessário por frame; controlar DPR em aparelhos modestos.
14. **Assets e propriedade intelectual:** usar apenas código, desenho, trilha, diálogos e nomes autorais/licenciados. Inspirar-se em mecânicas não autoriza copiar níveis, personagens, logos ou música do DATA WING.
15. **Sem React por padrão**; para projeto novo, `Vite + JavaScript ESM + Phaser` pode ser avaliado, mas escolher versões por compatibilidade testada. Para projeto existente, **manter a stack detectada** salvo mudança solicitada e justificada.
16. **Sem backend prematuro:** começar com leaderboard e ghosts locais. Sistemas de conta, leaderboard remoto e anticheat só quando houver requisito aprovado e estratégia de privacidade.
17. **Segurança:** não vazar chaves, `.env`, tokens, dados pessoais ou arquivos locais. Nunca gravar credenciais em código, exemplos ou docs.
18. **Foco:** implementação incremental e funcional tem prioridade sobre pastas sofisticadas e abstrações que não sejam usadas.

## 5. Testes mínimos por tipo de alteração

### Entrada e responsividade

- Controles esquerdo/direito no teclado; uso simultâneo sem ficar preso; browser não rola com teclas durante gameplay.
- Multi-pointer verdadeiro (dois dedos ao mesmo tempo); `pointerup`, `pointercancel`, blur e retorno à aba limpam intenções.
- Viewports: `390×844`, `844×390`, `768×1024`, `1366×768`, `1920×1080` e `3440×1440`, escolhendo emulação se não houver dispositivos reais; anotar limitações.
- Área jogável e HUD não se escondem sob controles, notch, menus e barras de navegador. Física igual ao redimensionar.

### Física e pistas

- Em condições idênticas, resultado comparável com relógio em 30/60/120 FPS; não recalcular forças a partir de pixels da tela.
- Colisão frontal não dá bônus; deslizamento apropriado dá aceleração; nave não atravessa cantos na velocidade máxima.
- Reinício restaura posição, ângulo, velocidade, zonas, timers e pontuação esperados.
- Circuito não permite terminar pela direção errada ou pulando checkpoints; vitória não dispara duas vezes.
- Pausa, foco e background não adicionam segundos indevidos nem explosões de delta.

### Dados e fluxo

- Save local: gravar, carregar, atualizar versão, salvar novamente, lidar com conteúdo inválido/storage indisponível.
- Sequência: menu → fase → pausa → continuar → reiniciar → vitória → resultado → próxima fase → menu.
- Transições repetidas não duplicam áudio, timers, pointers ou colisores.
- Testes existentes, build de produção e carregamento de assets funcionam sem erros novos.

**Regra da evidência:** escrever exatamente `verificado em ...` ou `não testado: motivo ...`. Capturas de tela, logs ou passos de reprodução podem compor evidência, mas NÃO contam como teste de física/controle se não exercitam o cenário.

## 6. Controle de mudanças que afetam código existente

**Antes de modificar arquivo:**

- Ler todas as funções/classes relevantes do arquivo, seus imports e o módulo que o utiliza.
- Checar se há abstração parecida que pode ser reutilizada; evitar duplicação.
- Não trocar assinatura/export/API pública silenciosamente; identificar chamadores.
- Não renomear/mover arquivos sem corrigir referências e conferir build.
- Não editar CSS global para resolver apenas um componente sem checar sobreposição.
- Não eliminar código “sobrando” sem confirmar uso dinâmico, saves legados ou referências em outras fases.
- Não reformatar o projeto todo se a tarefa é corrigir um bug.

**Se houver erro após a mudança:** inspecionar stacktrace, identificar módulo dono e causa raiz, corrigir com escopo limitado e repetir testes. Não aplicar uma sequência de hacks temporários sem registrar dívida técnica. Nunca fazer rollback destrutivo sobre alterações do usuário.

**Se for necessário alterar dependências ou framework:** explicar justificativa, compatibilidade, impactos em lockfile, planos de migração, reversão e testes. Não rodar `npm audit fix --force`, nem instalar pacotes desconhecidos sem necessidade.

## 7. Gestão de decisão e conflitos

- **Prioridade documental:** solicitação atual explícita do usuário > requisitos confirmados em `FUNCIONALIDADES.md` > estado efetivo verificado no código > sugestões de arquitetura. Entretanto, **não destruir funcionalidades existentes** para obedecer a uma interpretação ambígua do pedido; registrar alternativas.
- **Conflito entre arquivos `.md`:** sinalizar discrepância e alinhar documentos; `FUNCIONALIDADES.md` define o comportamento desejado, `CHECKLIST.md` informa validação, `AGENTS.md` organiza o processo. Código e testes são a evidência da implementação atual.
- **Se o checklist diz `[x]` mas o código não possui a função:** investigar antes de mexer, anotar inconsistência, atualizar estado e não fingir que está certo.
- **Mudança deliberada de escopo:** preservar histórico, escrever `substituído por [ID]`, motivo e consequências para save/arquitetura; nunca apagar item concluído sem rastreabilidade.
- **Escassez de tempo/contexto:** completar uma fatia menor funcionando com docs honestos; não declarar dezenas de itens feitos por extrapolação.

## 8. Template obrigatório de cada entrega

Use como checklist interno na sessão e reporte adaptado ao usuário:

```text
PEDIDO / OBJETIVO:
REQUISITO(S) / ID(S):
CÓDIGO EXISTENTE INSPECIONADO:
ARQUIVOS REAIS AFETADOS:
ALTERAÇÕES IMPLEMENTADAS:
TESTES EXECUTADOS E RESULTADOS:
TESTES NÃO EXECUTADOS + MOTIVO:
REGRESSÕES / LIMITAÇÕES:
CHECKLIST.md: [IDs marcados x] / [IDs ainda em aberto] + registro seção 6
FUNCIONALIDADES.md: [atualizado/não necessário] + ID novo se houver
AGENTS.md: [mapa/decisões atualizados ou não necessário]
PRÓXIMO PASSO RECOMENDADO:
```

## 9. Primeira ação recomendada no Antigravity

1. Colocar estes três arquivos na **raiz do projeto certo**. Não misturar com repositórios de outros jogos.
2. Abrir esse diretório como workspace no Antigravity.
3. Dar ao agente o seguinte pedido inicial (é **inspeção**, não criação indiscriminada):

> Leia `AGENTS.md`, `FUNCIONALIDADES.md` e `CHECKLIST.md` integralmente. Faça um inventário da estrutura real do repositório, leia os arquivos de entrada, física, input, fases, interface e persistência que existirem, detecte a stack e registre a arquitetura real na seção 3 de `AGENTS.md`. Confira o `CHECKLIST.md` contra o código existente, sem marcar nada como concluído sem evidência. Em seguida, apresente um plano para o marco M0/M1 com arquivos, riscos e critérios de teste. Preserve tudo que já funciona e atualize a documentação na mesma tarefa que qualquer mudança.

**Lembrete final:** este arquivo é uma regra de projeto, não uma ordem para afirmar que tudo já existe. Trabalhar de forma incremental; cada recurso novo exige requisito, implementação, teste, checkbox e documentação sincronizada.
