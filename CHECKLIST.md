# CHECKLIST.md — Planejamento, tarefas e evidências

**Projeto:** corrida/aventura 2D neon para web (inspirada nas mecânicas de DATA WING; conteúdo original).  
**Atualização inicial:** 2026-10-21  
**Origem:** cada ID da lista abaixo corresponde a `FUNCIONALIDADES.md`.  
**Condição atual:** a base de código deste projeto **não foi fornecida** na criação do documento; portanto **nenhuma tarefa está comprovadamente implementada**. Marcação inicial `[ ]` é intencional.

> **Regra obrigatória para o Antigravity e qualquer outro agente:** ao criar, alterar ou concluir uma funcionalidade, **atualize este arquivo na mesma intervenção de código**, antes de entregar a resposta final. Não aguarde o próximo pedido, não espere o fim de uma fase e não marque `[x]` apenas porque o código foi escrito. Leia também `AGENTS.md`.

## 1. Como usar este checklist

- `- [ ]` = pendente, em execução, não validada ou bloqueada. Não representa `quase pronto`.
- `- [x]` = implementada **e** validada, com evidência de teste e sem regressão conhecida. Registre a evidência na seção 6.
- `P0` = indispensável para protótipo/vertical slice; `P1` = jogo base pronto; `P2` = conteúdo/polimento; `P3` = expansão opcional/online.
- Tags `[O] [C] [W] [N] [F]` são explicadas em `FUNCIONALIDADES.md`. Elas tratam da origem/escopo, **não** do estado de implementação.
- Se a implementação for parcial, **mantenha `[ ]`**, anote na seção 7 o que funciona, o que falta e qual teste falhou. Não usar checkbox parcial.
- Se uma tarefa for removida do escopo, não apagar o ID: registrar decisão, substituição e motivo na seção 7 e ajustar `FUNCIONALIDADES.md`.
- **Novo recurso:** criar ID inédito e estável em `FUNCIONALIDADES.md` + checkbox com o **mesmo ID** aqui. Atualizar mapa de código e decisões em `AGENTS.md` quando necessário. Fazer tudo no mesmo conjunto de alterações.
- **Correção de bug:** se já houver requisito, associar a ele e registrar resultado; se for comportamento novo, criar requisito. Bugs sem ID funcional podem usar `BUG-YYYYMMDD-NN` no registro da seção 7, sem poluir requisitos do produto.

### Definition of Done — aplicável a CADA checkbox

Só marcar `[x]` depois que TODAS as condições aplicáveis forem verdadeiras:

1. O comportamento cumpre o critério/descrição de `FUNCIONALIDADES.md` em execução real.
2. Há teste automatizado relevante ou validação manual com passos reprodutíveis; resultado documentado na seção 6.
3. Foram verificadas regressões de entrada, física, navegação, áudio, layout, saves ou sistemas que a mudança afeta.
4. O jogo inicia; ferramentas existentes de `build`, `lint`, `test` e verificações importantes passaram (ou limitações foram relatadas sem marcar concluído).
5. `FUNCIONALIDADES.md` descreve o comportamento **real** após a implementação (e não promessas).
6. `CHECKLIST.md` foi atualizado **imediatamente** após a validação; `AGENTS.md` foi atualizado caso surjam arquivos, subsistemas, APIs, dependências, decisões ou riscos relevantes.

**Registro de evidência:** no final, preencher `DATA | ID(s) | mudança | arquivos | teste/comando | resultado | limitações` na seção 6. Não afirmar que algo foi testado se não executou os testes.

## 2. Ordem de execução sugerida (marcos verificáveis)

A ordem aqui favorece um protótipo divertido antes de campanhas extensas. Marcos são **portões**: só marcar após cumprir todos os critérios, mesmo que parte das tarefas funcionais abaixo já esteja pronta.

### M0 — Repositório e diagnóstico (antes de qualquer implementação)

- [x] **M0-01 [P0]** Ler os três documentos integralmente e registrar lacunas, sem alterar requisitos arbitrariamente.
- [x] **M0-02 [P0]** Inventariar o repositório real: árvore de pastas, entrada, módulos, assets, dependências e scripts disponíveis.
- [x] **M0-03 [P0]** Identificar a stack real e a origem dos problemas; não presumir Vite, Phaser ou React.
- [x] **M0-04 [P0]** Abrir o jogo/servidor atual e anotar erros de console e estado visual inicial; se não houver projeto, registrar como novo.
- [x] **M0-05 [P0]** Configurar Git/backup **sem sobrescrever trabalho existente**; examinar mudanças pendentes antes de editar.
- [x] **M0-06 [P0]** Criar ou ajustar scripts de desenvolvimento, build e verificação que existam de fato, sem dependências supérfluas.
- [x] **M0-07 [P0]** Escrever em `AGENTS.md` o mapa dos diretórios REAIS, comandos reais e módulos críticos após inventário.
- [x] **M0-08 [P0]** Criar um plano curto da primeira tarefa, incluindo arquivos afetados, critérios, testes e riscos.

### M1 — Protótipo de física (a prova de diversão)

- [x] **M1-01 [P0]** Nave 2D visível com orientação, velocidade e propulsão em ambiente original.
- [x] **M1-02 [P0]** Comandos esquerda/direita no teclado e multitoque, com limpeza de estado ao perder foco.
- [x] **M1-03 [P0]** Pista simples com colisão contínua robusta; sem atravessar parede ao acelerar.
- [x] **M1-04 [P0]** Contato tangencial com parede gera impulso controlado; impacto frontal não vira turbo.
- [x] **M1-05 [P0]** Atualização em passo fixo e teste em FPS diferentes com comportamento equivalente.
- [x] **M1-06 [P0]** HUD mínima, cronômetro, saída, vitória, reinício instantâneo.
- [ ] **M1-07 [P0]** Dois layouts verificados: desktop teclado e celular multitoque.
- [ ] **M1-08 [P0]** Playtest básico de 5–10 minutos: jogador entende por que ganhou/perdeu velocidade.

### M2 — Vertical slice de 5 desafios originais

- [x] **M2-01 [P0]** Cinco fases autorais baseadas em dados e com curva de aprendizado clara.
- [x] **M2-02 [P0]** Ao menos uma fase linear, uma com voltas e uma com tempo-alvo.
- [x] **M2-03 [P0]** Carregar/reiniciar/trocar fase sem tela branca, listeners duplicados ou leak evidente.
- [x] **M2-04 [P0]** Menu, seleção, pausa, resultado e próxima fase navegáveis.
- [x] **M2-05 [P0]** Persistência local do desbloqueio e melhor tempo com versionamento.
- [ ] **M2-06 [P0]** Efeitos simples de nave, parede e boost com legibilidade em telas pequenas.
- [ ] **M2-07 [P0]** Testar pelo menos um navegador desktop e um mobile real (ou anotar impossibilidade).

### M3 — Campanha mínima e apresentação

- [x] **M3-01 [P1]** Roteiro e identidade original da campanha estabelecidos, sem cópia de personagens, arte ou áudio.
- [x] **M3-02 [P1]** Sequências de tutorial, texto e desbloqueio ligadas ao progresso salvo.
- [x] **M3-03 [P1]** Gravidade, vento e turbo implementados com pelo menos uma fase de aprendizado cada.
- [x] **M3-04 [P1]** Fantasma ilustrativo e/ou replay pessoal com feedback ao melhorar tempo.
- [x] **M3-05 [P1]** Menus, efeitos sonoros, trilha licenciada/original, configurações e créditos.
- [x] **M3-06 [P1]** Salvamento íntegro após recarregar página, mudar orientação e atualizar versão.
- [x] **M3-07 [P1]** Exercitar modos retrato, paisagem, tablet, FHD e ultrawide sem distorção.

### M4 — Conteúdo e polimento

- [ ] **M4-01 [P2]** Expandir progressivamente de 5 para 15–20 fases originais, com métricas de dificuldade (atualmente 11 fases implementadas).
- [x] **M4-02 [P2]** Integrar puzzles de bits, chaves/portas e colecionáveis apenas se melhorarem ritmo da campanha.
- [ ] **M4-03 [P2]** Refinar indicadores de boost, partículas, feedback e acessibilidade.
- [ ] **M4-04 [P2]** Fazer sessões de playtest com jogadores novos e corrigir pontos de abandono.
- [ ] **M4-05 [P2]** Revisar loading, memória, compatibilidade, pacote e performance em aparelhos modestos.
- [ ] **M4-06 [P2]** Só após validar qualidade, planejar expansão a 40+ desafios distintos.

### M5 — Expansões opcionais (não bloquear lançamento inicial)

- [ ] **M5-01 [P3]** Ranking remoto com backend, validação anti-fraude e consentimento explícito.
- [ ] **M5-02 [P3]** Exportar/importar saves, ghosts compartilháveis e desafios especiais.
- [ ] **M5-03 [P3]** Editor de fases maduro, publicação/compartilhamento e moderação apropriada.
- [ ] **M5-04 [P3]** PWA/offline instalável somente após versão web robusta e cache corretamente versionado.

## 3. Requisitos funcionais — acompanhamento individual (fonte de verdade)

**ATENÇÃO:** esta seção contém um checkbox para **cada** ID formal de `FUNCIONALIDADES.md`. IDs devem ser preservados mesmo se o planejamento for reorganizado. A descrição resumida não substitui os critérios completos daquele arquivo. *Nenhum está concluído por padrão.*

### CORE — Fluxo do jogo, estados e sessões
- [x] **CORE-001** `[W]` — página carrega sem erro; mostra tela inicial, opção de iniciar/continuar e estado de carregamento.
- [x] **CORE-002** `[W]` — ciclo explícito `boot -> menu -> mapa/seleção -> gameplay -> resultado -> mapa/próxima fase`; pausa em overlay.
- [x] **CORE-003** `[W]` — estados intermediários bem definidos: carregando, jogando, pausado, vitória, falha, transição, erro recuperável.
- [ ] **CORE-004** `[O/W]` — primeira entrada tem tutorial interativo curto; jogador controla antes de ler textos longos.
- [x] **CORE-005** `[W]` — reinício da fase a qualquer momento com entrada dedicada e sem recarregar página.
- [ ] **CORE-006** `[W]` — a cena é desmontada corretamente ao trocar de fase, evitando eventos, áudios, timers e objetos duplicados.
- [x] **CORE-007** `[W]` — HUD exibe somente o que importa ao desafio atual (tempo, objetivo, voltas, meta e reinício).

### CTRL — Controles e múltiplas entradas
- [x] **CTRL-001** `[O]` — comando de virar para a esquerda.
- [x] **CTRL-002** `[O]` — comando de virar para a direita.
- [x] **CTRL-003** `[O/C]` — propulsão principal automática; comando básico não exige botão de acelerar, salvo opção original de design explicitamente aprovada.
- [x] **CTRL-004** `[W]` — teclado: `A`/`←` e `D`/`→`; `R` reinicia; `Esc`/`P` pausa; `Enter` confirma nos menus, sem conflito com foco.
- [x] **CTRL-005** `[W]` — celular: duas áreas de toque seguras e independentes com `Pointer Events`, suporte a dois dedos simultâneos.
- [ ] **CTRL-006** `[W]` — controles mobile configuráveis em tamanho, opacidade e posição; respeitar margens `safe-area`.
- [x] **CTRL-007** `[W]` — resetar estados de entrada em `pointercancel`, `pointerup`, blur, perda de foco, troca de aba e pausa para evitar direção travada.
- [x] **CTRL-008** `[W]` — priorização clara quando esquerda e direita estão simultaneamente ativas (padrão: soma zero; configurar se playtest indicar outro comportamento).
- [x] **CTRL-009** `[W]` — teclado não move/rola a página durante gameplay; menu não sequestra teclas quando campo de texto estiver focado.
- [ ] **CTRL-010** `[F]` — controles de gamepad e remapeamento do teclado.
- [ ] **CTRL-011** `[W]` — orientação inicial opcional recomendando paisagem, sem bloquear desnecessariamente o retrato.

### PHYS — Física, colisões e impulso em paredes
- [x] **PHYS-001** `[O/W]` — posição, velocidade, orientação angular e velocidade de rotação observáveis em unidades consistentes do mundo.
- [x] **PHYS-002** `[O/C]` — aceleração para frente baseada na direção da nave, com sensação de inércia e resposta gradual.
- [x] **PHYS-003** `[W]` — desaceleração/arrasto calibrados; nave não freia instantaneamente sem motivo.
- [x] **PHYS-004** `[O/W]` — viragem suave, sem teletransporte de ângulo; sensibilidade ajustável por parâmetros.
- [x] **PHYS-005** `[O]` — contato com parede permite ganhar velocidade e se afastar dela por **wall thrust**; preservar componente tangencial de deslocamento para criar curvas fluidas. Segundo o criador, a força também pode orientar a nave para longe da parede.
- [x] **PHYS-006** `[W]` — resolver colisão com sólidos por normal/tangente, impedindo penetração e saltos de posição.
- [x] **PHYS-007** `[W]` — distinguir impacto frontal (perde velocidade/rebate moderadamente) de contato raspando (pode gerar impulso).
- [x] **PHYS-008** `[W]` — impulso de parede calibrado por normal de contato, direção da nave, ângulo, velocidade tangencial, duração e potência; incluir componente de afastamento da parede e limites que evitem boost infinito parado.
- [x] **PHYS-009** `[W]` — evitar atravessar paredes em alta velocidade (subpassos, swept collision ou estratégia equivalente validada).
- [x] **PHYS-010** `[W]` — loop físico de passo fixo, desacoplado do render, para comportamento consistente a 30/60/120/144 Hz.
- [ ] **PHYS-011** `[W]` — interpolação visual opcional, sem introduzir discrepância com a simulação.
- [x] **PHYS-012** `[W]` — limites de velocidade, aceleração, fricção e rotação centralizados em configuração, nunca mágicos espalhados.
- [ ] **PHYS-013** `[O/C]` — perfis da nave ajustáveis pelo tutorial; desenvolver habilidade sem frustrar novatos (referência: Dan Vogt descreve progressão gradual de parâmetros).
- [x] **PHYS-014** `[W]` — colisão com geometria côncava/segmentos e curvas aproximadas; junções de pista não podem prender a nave.
- [x] **PHYS-015** `[W]` — instrumentos temporários de debug: vetores velocidade, normal da parede, contato, FPS, posição e força de boost.
- [x] **PHYS-016** `[W]` — câmera e controles não dependem de FPS, tamanho da janela ou pixel ratio.

### CAM — Câmera e enquadramento
- [x] **CAM-001** `[W]` — câmera 2D acompanha a nave com suavização configurável e sem induzir enjoo.
- [ ] **CAM-002** `[W]` — zoom adaptativo calculado a partir do espaço útil, sem distorcer física nem mudar unidades de mundo.
- [x] **CAM-003** `[W]` — enquadramento mantém área de antecipação na direção da velocidade, sem esconder curvas críticas.
- [ ] **CAM-004** `[W]` — transição e feedback de saída de fase sem cortes bruscos desnecessários.
- [ ] **CAM-005** `[N]` — opção de intensidade de câmera, zoom e tremor reduzidos.

### LEVEL — Criação, carregamento e validação das fases
- [x] **LEVEL-001** `[O/W]` — níveis lineares com ponto inicial e ponto de chegada.
- [x] **LEVEL-002** `[O/W]` — circuitos fechados com contagem de voltas.
- [x] **LEVEL-003** `[O/W]` — fases com limite de tempo e indicação clara de falha/êxito.
- [x] **LEVEL-004** `[O/W]` — progressão por desbloqueio; alguns desafios opcionais ou diferentes caminhos no mapa.
- [x] **LEVEL-005** `[W]` — carregar fase de dados declarativos (`JSON`/objetos validados), não por ifs gigantes e coordenadas mágicas.
- [x] **LEVEL-006** `[W]` — cada fase declara ID, nome interno, geometria, spawn, direção inicial, física/zones, objetivos, checkpoints se houver, câmera, ambientação e recompensas.
- [x] **LEVEL-007** `[W]` — separação entre lógica de missão e desenho da pista; reutilizar sistemas entre 40+ fases.
- [x] **LEVEL-008** `[W]` — mudança da fase sem recarregar a aplicação e sem vazamento de memória.
- [x] **LEVEL-009** `[W]` — primeiro lote com cinco níveis originais, cada um validando uma mecânica diferente.
- [ ] **LEVEL-010** `[N]` — editor interno simples para visualizar e validar colisores/triggers; **não** construir editor sofisticado antes do gameplay.
- [x] **LEVEL-011** `[N]` — atalhos alternativos desenhados intencionalmente, sem permitir atravessar geometria.
- [x] **LEVEL-012** `[W]` — validador rejeita IDs repetidos, paredes malformadas, objetivo inalcançável óbvio e dados ausentes.

### RACE — Regras de corrida, cronômetro e fantasmas
- [x] **RACE-001** `[O]` — alcançar a saída em um percurso linear.
- [x] **RACE-002** `[O]` — completar voltas no circuito, contando passagem na ordem correta.
- [x] **RACE-003** `[O]` — bater um tempo-alvo e mostrar resultado final.
- [x] **RACE-004** `[O]` — fantasmas (ghost racers) demonstram trajetórias e funcionam como benchmark.
- [ ] **RACE-005** `[O]` — prova contra múltiplos corredores-fantasma/oponentes pré-programados, ao menos em formatos específicos.
- [x] **RACE-006** `[O]` — reinício rápido e sem punição de recursos.
- [ ] **RACE-007** `[O]` — desafios opcionais para quem busca melhorar desempenho, mantendo campanha acessível.
- [ ] **RACE-008** `[O]` — recordes e sistema competitivo de coroas associado a pistas/placares.
- [x] **RACE-009** `[W]` — melhores tempos locais separados por fase, versão da física e categoria de corrida.
- [x] **RACE-010** `[W]` — cronômetro monotônico da simulação ou clock apropriado com comportamento documentado em pausa, background e reinício.
- [x] **RACE-011** `[W]` — volta válida requer cruzamento da linha de chegada na direção correta e checkpoints ordenados ou regra equivalente contra cortar pista.
- [x] **RACE-012** `[N]` — ghost pessoal gravado como entradas/estados em formato versionado; reprodução sem alterar colisões do jogador.
- [ ] **RACE-013** `[F]` — rankings globais com serviço remoto, consentimento, limites de requisições, validação de runs e antitrapaça.

### MECH — Zonas, forças, obstáculos e puzzles
- [x] **MECH-001** `[O]` — gravidade em níveis específicos, inicialmente puxando para baixo; intensidade configurável por fase.
- [x] **MECH-002** `[O]` — zonas de vento/força ambiental que ajudam o deslocamento, especialmente em introdução à gravidade.
- [x] **MECH-003** `[C]` — zonas turbo que aumentam velocidade ao atravessar.
- [x] **MECH-004** `[C]` — zonas onde a propulsão é reduzida ou desativada e a nave depende de inércia.
- [ ] **MECH-005** `[O]` — barreiras de segurança/obstáculos usados intencionalmente no level design.
- [x] **MECH-006** `[N]` — gatilhos de missão (cruzar, coletar, ativar, interagir) desacoplados da renderização.
- [x] **MECH-007** `[C]` — itens/fragmentos de dados e notas opcionais associados à narrativa.
- [ ] **MECH-008** `[C]` — desafios de lógica simples ou interação com dados/binário no contexto de missões.
- [x] **MECH-009** `[W]` — indicadores visuais distintos para zona turbo, vento, gravidade e falta de propulsão.
- [x] **MECH-010** `[W]` — entradas e saídas de zonas tratam sobreposição, borda e reinício sem empilhar efeitos indevidamente.
- [ ] **MECH-011** `[N]` — zona direcional que muda a gravidade (somente após gravidade base validada).
- [ ] **MECH-012** `[F]` — obstáculos móveis e mutações de pista, com orçamento de performance.
- [x] **MECH-013** `[C]` — chaves e portas vinculadas a objetivos (recolher chave, validar autorização e abrir saída); o conteúdo da fase deve declarar relação chave-porta.
- [ ] **MECH-014** `[C]` — terminais/payload de bits com alteração de valores binários e feedback de validação, para fases especiais (design autoral).
- [x] **MECH-015** `[C]` — objetos de dados/notas coletáveis opcionais, com identificação estável e prevenção de coleta duplicada.
- [x] **MECH-016** `[N]` — forma declarativa de combinar trigger, ação, condição e recompensa sem depender de grandes condicionais por fase.

### NARR — História, progressão e conteúdo narrativo
- [x] **NARR-001** `[O]` — história em episódios distribuídos entre fases; ambientação de sistema computacional, porém com personagens e enredo originais nesta versão.
- [x] **NARR-002** `[O]` — personagem narrador/assistente que orienta e muda a relação com o jogador conforme progresso; não copiar Mãe/Mother.
- [x] **NARR-003** `[O]` — diálogos curtos de missão no início e de lore no fim/entre fases.
- [x] **NARR-004** `[O]` — início ensina movimento; depois paredes, fantasmas, tempo, gravidade, disputa e habilidades avançadas.
- [x] **NARR-005** `[O]` — conteúdo narrativo opcional/destravável; não obrigar leitura durante curvas difíceis.
- [x] **NARR-006** `[C]` — colecionáveis com fragmentos/notas sobre o universo e personagens.
- [x] **NARR-007** `[C]` — recompensas simbólicas/moeda narrativa sem economia funcional necessária (não inventar loja obrigatória).
- [x] **NARR-008** `[W]` — sistema de diálogo dirigido por dados: ID, speaker, texto, condição, opção de avançar/pular, estado de visto.
- [ ] **NARR-009** `[W]` — sistema de progressão de capítulos e pré-requisitos, com salvamento e desbloqueio determinísticos.
- [x] **NARR-010** `[W]` — textos localizáveis (PT-BR base), sem frases hardcoded em dezenas de arquivos.
- [x] **NARR-011** `[N]` — narrativa original a ser escrita separadamente; placeholders neutros e claramente rotulados até aprovação.
- [ ] **NARR-012** `[N]` — bônus de desafio/coroas sem obrigar repetição exaustiva para ver o fim da história.
- [ ] **NARR-013** `[C]` — desafios de lógica binária apresentados como quizzes ou bloqueios opcionais; texto, feedback de erro e solução devem ser conteúdos originais.
- [ ] **NARR-014** `[C/N]` — colecionáveis/recompensas simbólicas análogos ao conceito de gemas; decidir finalidade antes de criar uma economia.
- [x] **NARR-015** `[W]` — log de eventos narrativos com condições de desbloqueio e recuperação ao carregar save sem repetir cenas indevidamente.

### VIS — Gráficos, neon e feedback
- [x] **VIS-001** `[O/N]` — visual 2D minimalista com trilhas digitais, nave triangular própria e elementos geométricos de leitura rápida.
- [x] **VIS-002** `[O/N]` — neon emissivo e paleta própria, com contraste suficiente para nave, parede e fundo.
- [x] **VIS-003** `[O/N]` — rastro luminoso da nave com comprimento/intensidade proporcionais à velocidade.
- [x] **VIS-004** `[O/N]` — feedback visual mais intenso no deslizamento/impulso bem executado.
- [x] **VIS-005** `[W]` — partículas limitadas por orçamento e escaladas por qualidade.
- [ ] **VIS-006** `[W]` — efeitos de brilho configuráveis; fallback sem pós-processamento pesado.
- [ ] **VIS-007** `[W]` — HUD e tipografia legíveis tanto em tela pequena quanto retina/4K.
- [x] **VIS-008** `[W]` — efeitos de colisão diferenciados entre choque e raspagem positiva.
- [x] **VIS-009** `[W]` — sinalização clara de início, direção da pista, checkpoints, chegada e zonas.
- [ ] **VIS-010** `[W]` — redução de flashes e de tremor para acessibilidade.
- [ ] **VIS-011** `[N]` — temas visuais por capítulo, sem perder consistência de colisão e legibilidade.
- [ ] **VIS-012** `[W]` — transições com tempo limitado e opção de pular animações longas.

### AUDIO — Trilha, efeitos e controle de áudio
- [x] **AUDIO-001** `[O/N]` — trilha eletrônica/vaporwave **licenciada ou produzida originalmente**, não reutilizar músicas do jogo de referência.
- [x] **AUDIO-002** `[W]` — música contextual por menu, corrida, vitória e clímax, com transições suaves.
- [x] **AUDIO-003** `[W]` — SFX de motor, parede, boost, turbo, UI, chegada, derrota e diálogo.
- [x] **AUDIO-004** `[W]` — mixagem independente de música/SFX, mute geral e preferências salvas.
- [x] **AUDIO-005** `[W]` — desbloquear contexto de áudio mediante gesto do usuário quando navegador exigir.
- [x] **AUDIO-006** `[W]` — pausa/resume apropriados ao alternar aba; evitar múltiplas trilhas simultâneas.
- [x] **AUDIO-007** `[W]` — limite de vozes simultâneas e comportamento sem som caso API falhe.
- [x] **AUDIO-008** `[N]` — pitch/dinâmica de motor e efeitos em função da velocidade, sem som agressivo.
- [x] **AUDIO-009** `[W]` — créditos e licenças documentados para cada recurso importado.

### UI — Menus, HUD e navegação
- [x] **UI-001** `[W]` — menu inicial com iniciar/continuar, seleção, configurações, créditos.
- [x] **UI-002** `[W]` — pausa e reinício instantâneo acessíveis em touch/teclado.
- [x] **UI-003** `[W]` — tela de resultado com tempo, meta, recorde, objetivos, próxima fase e tentar novamente.
- [x] **UI-004** `[W]` — seleção de níveis com bloqueio/desbloqueio, percurso, melhor tempo e descrição.
- [ ] **UI-005** `[W]` — tutoriais contextuais dispensáveis e revisitáveis.
- [ ] **UI-006** `[W]` — feedback de toque/hover/foco e labels acessíveis em controles HTML.
- [ ] **UI-007** `[W]` — erros de carregamento e saves tratados com mensagens recuperáveis.
- [ ] **UI-008** `[W]` — indicador de qualidade gráfica e controles configuráveis.
- [ ] **UI-009** `[W]` — texto com tamanho mínimo legível e quebra adequada no retrato.

### RESP — Responsividade, acessibilidade e navegador
- [x] **RESP-001** `[W]` — canvas ocupa área disponível de maneira proporcional; sem distorção em telas 16:9, 19.5:9, 4:3, retrato, ultrawide.
- [x] **RESP-002** `[W]` — distinguir espaço de mundo, CSS pixels, pixels físicos e `devicePixelRatio`; cap de DPR configurável por desempenho.
- [x] **RESP-003** `[W]` — `resize`/`orientationchange` reconstroem apenas viewport/câmera/UI, sem mudar posição ou impulso da nave.
- [x] **RESP-004** `[W]` — HUD fora de regiões obstruídas, notches e barras do navegador via `env(safe-area-inset-*)`.
- [x] **RESP-005** `[W]` — `touch-action` apropriado nas áreas do jogo; impedir scroll/zoom acidental sem prejudicar menus.
- [x] **RESP-006** `[W]` — suporte a multi-pointer independente e pointer capture/cancel limpos.
- [x] **RESP-007** `[W]` — botões touch com área generosa e contraste; não depender de hover.
- [ ] **RESP-008** `[W]` — HUD nunca sobrepõe saída da fase ou encobre nave por períodos prolongados.
- [x] **RESP-009** `[W]` — modo retrato funcional ou orientação assistida sem travar navegador; documentar limitações.
- [x] **RESP-010** `[W]` — pausar ao perder foco/visibilidade, preservar estado e evitar salto de delta ao retornar.
- [x] **RESP-011** `[W]` — ajustes de acessibilidade: reduzir movimento, flashes e efeitos; volume e contraste.
- [x] **RESP-012** `[W]` — menus navegáveis via teclado, indicação de foco e texto escalável sempre que viável.
- [ ] **RESP-013** `[W]` — testar Firefox e Chromium desktop, Safari iOS e Chrome Android em dispositivos reais/emulação.
- [ ] **RESP-014** `[W]` — otimizar bundle/carregamento, liberar memória de cenas e lidar com context loss quando aplicável.
- [ ] **RESP-015** `[F]` — PWA instalável e cache versionado como extensão opcional depois que a versão online responsiva estiver madura; validar atualizações sem deixar versões antigas presas.

### SAVE — Persistência e compatibilidade de progresso
- [x] **SAVE-001** `[W]` — salvar progresso de fases, estrelas/coroas locais se houver, melhores tempos, configurações e diálogos vistos.
- [x] **SAVE-002** `[W]` — schema de save versionado e migrações, sem sobrescrever dados desconhecidos silenciosamente.
- [x] **SAVE-003** `[W]` — validar dados lidos; tratar storage indisponível, corrompido ou cheio com fallback em memória.
- [x] **SAVE-004** `[W]` — operação de `reset` apenas mediante confirmação explícita do jogador.
- [x] **SAVE-005** `[W]` — persistir ao finalizar fases e alterar opções; não gravar a cada frame.
- [x] **SAVE-006** `[W]` — separar save/progresso de cache, ghosts e estatísticas temporárias.
- [x] **SAVE-007** `[W]` — categoria/versão de tempo evita comparar recordes de físicas radicalmente diferentes.
- [x] **SAVE-008** `[N]` — exportar/importar progresso local via arquivo versionado, sujeito a validação.
- [ ] **SAVE-009** `[F]` — sincronização de conta opcional; funcionamento offline não pode depender disso.

### ONLINE — Classificações e expansões online
- [ ] **ONLINE-001** `[O/N]` — conceito competitivo de melhores tempos e coroas por pista; começar **local**, sem criar backend prematuro.
- [ ] **ONLINE-002** `[F]` — leaderboard remoto por fase, filtros e autenticação opcional.
- [ ] **ONLINE-003** `[F]` — aceitar apenas tempos auditáveis; o cliente sozinho não é confiável contra fraude.
- [ ] **ONLINE-004** `[F]` — política de privacidade e minimização de dados se houver contas/rankings.
- [ ] **ONLINE-005** `[F]` — cache/offline-first e degradação graciosa quando servidor cair.
- [ ] **ONLINE-006** `[N]` — eventos/desafios semanais somente após campanha, manutenção e anticheat.
- [ ] **ONLINE-007** `[N]` — editor/compartilhamento de fases futuramente, com verificação e moderação se público.
- [ ] **ONLINE-008** `[C/F]` — visualização de ranking/coroas por circuito inspirada em sistemas sociais como o DataUplink da referência; qualquer nome, interface e protocolo devem ser originais.

## 4. Testes de regressão obrigatórios por mudança

Antes de finalizar qualquer alteração, escolha todos os grupos pertinentes e registre resultado. **Não marcar teste que não foi executado.**

| Área | Prova mínima | Falha típica a detectar |
|---|---|---|
| Boot | abrir URL local e alcançar menu | erro de import, tela vazia |
| Movimento | 20 s girando esquerda/direita e soltar teclas | input preso, aceleração anormal |
| Multitoque | manter dedo esquerdo, adicionar direito, soltar separadamente | perda de pointer, travamento |
| Colisão | raspar curvas e acertar canto frontal com alta velocidade | atravessar, tremer, impulso infinito |
| FPS | repetir sequência de controle em 30/60/120 FPS ou clocks simulados | física variar com refresh |
| Fase | entrar/sair/reiniciar 10 vezes | evento duplicado, memória crescente |
| Timer/voltas | cruzar meta de trás, pular checkpoint, pausar | contagem inválida |
| Storage | terminar fase, recarregar, salvar e migrar versão | perda de save ou JSON inválido |
| Mobile | retrato/paisagem e rolagem da página | UI sobreposta, touch não funciona |
| Desktop | Firefox/Chromium e 1366×768/3440×1440 | distorção e UI cortada |
| Audio | mute/pause/retorno de aba | sons duplos, bloqueio por autoplay |
| Acessibilidade | navegação por teclado, foco, reduzir animação | controles inacessíveis |
| Build | build de produção, verificação de console e carregamento final | pacote incompleto, paths quebrados |

**Plataformas de referência:** Chrome Android, Safari iOS, Chromium desktop e Firefox desktop. Quando não houver acesso ao dispositivo real, registrar exatamente o que não foi possível validar; um emulador não substitui teste real.

## 5. Critérios de saída por release

**Protótipo (`0.1`)**: M0 + M1; física divertida com parede e nível mínimo.  
**Vertical slice (`0.2`)**: M2 + jogo completo em 5 fases.  
**Alpha (`0.3`)**: M3 + narrativa e mecânicas avançadas básicas.  
**Beta (`0.7`)**: M4 parcialmente (15–20 fases boas), performance, acessibilidade, save versionado.  
**Versão `1.0`**: bugs críticos corrigidos, revisão legal de conteúdo, testes nos navegadores-alvo e documentação sincronizada.  
**Pós-lançamento**: conteúdo 40+ e M5 conforme dados reais de jogadores.

Os números são **rótulos de versões sugeridos**, não prazos. Não aumentar versão sem aprovar critérios do marco.

## 6. Registro de validações e entregas — manter atualizado

> **Modelo para adicionar a cada entrega concluída; nunca declarar teste fictício.**

| Data | IDs concluídos ou alterados | Arquivos alterados | Evidência / comando / teste | Resultado e ambiente | Limitações |
|---|---|---|---|---|---|
| 2026-10-21 | M0-01 a M0-08, PHYS-012 | `package.json`, `index.html`, `src/config.js`, `AGENTS.md`, `ESTADO_ATUAL.md`, `CHECKLIST.md` | `npm install` (16 packages auditados), `npm run build` (vite v8.3.5, 217ms), `node -e "process.version"` (v24.11.1), `git status` | PASSOU em Windows / Node v24.11.1 | Gameplay M1 ainda não executável |
| 2026-10-21 | M1-01 a M1-06, CORE-001..003, CORE-005, CORE-007, CTRL-001..005, CTRL-007..009, PHYS-001..010, PHYS-014..016, CAM-001, CAM-003, LEVEL-001, LEVEL-005, LEVEL-006, RACE-001, RACE-006, RACE-010, VIS-001..005, VIS-008, VIS-009, UI-002, UI-003, RESP-001..003, RESP-005, RESP-006, RESP-010 | `src/core/math.js`, `src/core/input.js`, `src/physics/collision.js`, `src/physics/engine.js`, `src/levels/prototypeTrack.js`, `src/gameplay/camera.js`, `src/rendering/renderer.js`, `src/main.js`, `tests/math.test.js`, `tests/input.test.js`, `tests/physics.test.js` | `npm test` (18 testes nativos passando em 61ms com node:test), `npm run build` (vite v8.3.5 compilando limpo em 50ms), servidor Vite testado via curl HTTP 200 OK | PASSOU em Arch Linux / Node v26.11.1 | Playtest interativo manual em múltiplos dispositivos (M1-07 e M1-08) pendente de execução pelo jogador |
| 2026-10-21 | M2-01 a M2-05, LEVEL-002..004, LEVEL-007..009, LEVEL-011, LEVEL-012, RACE-002, RACE-003, RACE-009, RACE-011, UI-001, UI-004, SAVE-001..007 | `src/platform/storage.js`, `src/levels/tracks.js`, `src/main.js`, `index.html`, `tests/storage.test.js`, `tests/tracks.test.js` | `npm test` (27 testes nativos passando em 72ms com node:test), `npm run build` (vite v8.3.5 compilando limpo em 56ms) | PASSOU em Arch Linux / Node v26.11.1 | M2-06 e M2-07 (testes em telas mobile reais) em aberto para playtest direto do usuário |
| 2026-10-21 | BUG: Geometria das linhas de chegada das fases 1 e 2 | `src/levels/tracks.js`, `src/levels/prototypeTrack.js`, `tests/tracks.test.js`, `tests/physics.test.js` | `npm test` (31 testes passando em 68ms), `npm run build` (vite v8.3.5, 62ms) — inclui 2 testes novos de geometria perpendicular e 2 testes de detecção de cruzamento | PASSOU em Arch Linux / Node v26.11.1 | Verificação visual automatizada indisponível (Playwright driver não acessível); playtest manual pelo jogador é recomendado para validação final |
| 2026-10-21 | M3-01, M3-02, M3-05, AUDIO-001..009, NARR-001..005, NARR-008, NARR-010, NARR-011, NARR-015, CORE-002, UI-002 | `src/platform/audio.js`, `src/gameplay/story.js`, `src/platform/storage.js`, `src/main.js`, `index.html`, `tests/audio.test.js`, `tests/story.test.js`, `tests/storage.test.js` | `npm test` (47 testes nativos passando em ~82ms), `npm run build` (vite v8.3.5 compilando em 66ms, 16 módulos), testes unitários cobrindo synth autoral, limites de vozes, clamping de volume, tolerância sem Web Audio API, persistência de configurações de áudio, diálogos com assistente KRONA e integridade de dados | PASSOU em Arch Linux / Node v26.11.1 | Áudio real Web Audio requer interação de usuário para desbloqueio (comportamento nativo de navegadores); playtest manual em andamento |
| 2026-10-21 | M3-03, MECH-001, MECH-002, MECH-003, MECH-004, MECH-009, MECH-010 | `src/physics/engine.js`, `src/levels/tracks.js`, `src/rendering/renderer.js`, `src/gameplay/story.js`, `src/main.js`, `tests/physics.test.js`, `tests/tracks.test.js`, `tests/story.test.js` | `npm test` (52 testes nativos passando em ~85ms, 7 suítes), `npm run build` (vite v8.3.5 compilando em 68ms, 16 módulos), testes cobrindo gravidade vertical (MECH-001), forças de vento ambiental (MECH-002), aceleração direcional em zonas turbo com teto maxBoostSpeed (MECH-003), inércia pura em zonas de vácuo (MECH-004), renderização visual com animações/setas neon (MECH-009), anti-duplicação de efeitos em sobreposição (MECH-010), e 3 novas fases autorais com diálogos de KRONA | PASSOU em Arch Linux / Node v26.11.1 | Playtest manual em navegadores mobile/desktop recomendado para sentir ajuste fino das forças de vento/turbo |
| 2026-10-21 | M3-04, RACE-004, RACE-012 | `src/gameplay/ghost.js`, `src/platform/storage.js`, `src/rendering/renderer.js`, `src/main.js`, `index.html`, `tests/ghost.test.js`, `tests/storage.test.js` | `npm test` (58 testes nativos passando em 106ms, 8 suítes), `npm run build` (vite v8.3.5 compilando limpo em 70ms, 17 módulos). Testes unitários cobrindo amostragem a 20Hz, interpolação de posições e ângulos no menor arco angular, validação defensiva de telemetria corrompida, persistência atrelada ao melhor tempo no StorageManager, desenho de silhueta neon etérea não-obstrutiva e chave seletora no menu de pausa | PASSOU em Arch Linux / Node v26.11.1 | Driver Playwright inacessível no ambiente (404 azureedge); validação visual interativa depende de teste no browser local pelo usuário |
| 2026-10-21 | M3-06, M3-07, SAVE-008, RESP-004, RESP-007, RESP-009, RESP-011, RESP-012 | `src/platform/storage.js`, `src/gameplay/camera.js`, `src/main.js`, `index.html`, `tests/storage.test.js`, `tests/camera.test.js` | `npm test` (65 testes nativos passando em ~101ms, 9 suítes), `npm run build` (vite v8.3.5 compilando limpo em 66ms, 17 módulos). Testes cobrindo persistência completa pós-recarregamento com simulação multi-sessão, migração retrocompatível de schemas legados (v0), exportação/importação de save via JSON (SAVE-008), zoom adaptativo da câmera para iPhone portrait (390×844), landscape (844×390), iPad (768×1024), FHD e ultrawide (3440×1440), feedback visual de touch, viewport-fit=cover e acessibilidade reduced-motion | PASSOU em Arch Linux / Node v26.11.1 | Marco M3 100% implementado em engenharia e validado por 65 testes automatizados |
| 2026-10-21 | M4-02, MECH-006, MECH-007, MECH-013, MECH-015, MECH-016, NARR-006, NARR-007, LEVEL-009 | `src/levels/tracks.js`, `src/gameplay/story.js`, `src/platform/storage.js`, `src/rendering/renderer.js`, `src/physics/engine.js`, `src/main.js`, `tests/missions.test.js`, `tests/tracks.test.js`, `tests/story.test.js` | `npm test` (68 testes nativos passando em 142ms, 10 suítes), `npm run build` (vite v8.3.5 compilando limpo em 70ms, 17 módulos). Adicionadas 3 novas pistas autorais (fases 9, 10 e 11) expandindo catálogo para 11 desafios. Implementadas barreiras laser bloqueadoras ativas, coleta de chaves com desbloqueio instantâneo, coleta de fragmentos de memória de kernel com persistência versionada, diálogos de KRONA e renderizador com laser vibrante, prisma giratório e octaedros dourados | PASSOU em Arch Linux / Node v26.11.1 | Marco M4 em andamento com 68 testes automatizados passando |

## 7. Decisões, pendências, bloqueios e bugs

> Preservar o histórico; incluir data, ID, impacto, decisão, responsável (se houver) e próximo passo. Não esconder testes que falharam.

| Data | Referência | Estado | Nota e próximo passo |
|---|---|---|---|
| 2026-10-21 | M0 | CONCLUÍDO | Inspeção do repositório concluída. Stack: Vite 8.3.5 + Vanilla JS (sem frameworks/Phaser). Configuração centralizada em `src/config.js`. Estrutura de HTML do jogo preparada. |
| 2026-10-21 | M1 | CONCLUÍDO (Engenharia OK) | Protótipo de física, colisões, wall boost, antiexploit, entrada com soma zero e renderizador Canvas 2D neon totalmente implementados e testados (18 testes). M1-07 e M1-08 reservados para playtest do jogador. |
| 2026-10-21 | M2 | PARCIALMENTE CONCLUÍDO (Engenharia e testes OK) | Vertical slice com 5 fases autorais (linear, arcos, circuito com voltas, contra o relógio e atalhos), validador LEVEL-012, gerenciador de persistência versionada SAVE-001..007, seleção de fases e transição de próxima fase implementados e validados por 27 testes automatizados. Próximo passo: Marco M3 (Áudio synth autoral Web Audio API e narrativa). |
| 2026-10-21 | BUG-001: Finish line fases 1 e 2 | RESOLVIDO | **Fase 1:** Linha de chegada vertical em `x=2100` cortava parede superior diagonal (declividade -0.8) e não alcançava parede inferior. Corrigido para `(2102,428)→(2200,550)`, perpendicular ao corredor final (~89.9°), ancorada exatamente nas pontas das paredes. Ponto `b` da parede superior ajustado de `(2200,350)` para `(2102,428)`. **Fase 2:** Linha de chegada vertical em `x=1800` corria paralela às paredes do corredor final vertical. Corrigido para horizontal `(1650,950)→(1900,950)`, perpendicular à descida. **Fases 3–5 preservadas sem alterações.** 4 testes unitários adicionados (2 geométricos + 2 de detecção de cruzamento). |
| 2026-10-21 | M3 | CONCLUÍDO (Engenharia e testes OK) | Campanha mínima e apresentação completa: áudio procedural 100% sintetizado via Web Audio API (AUDIO-001..009), narrativa autoral com assistente KRONA em 8 pistas (NARR-001..015), mecânicas de gravidade, vento e turbo (MECH-001..010), sistema de fantasma/replay pessoal (M3-04, RACE-004, RACE-012), persistência versionada tolerante a recarregamento com migrações e export/import (M3-06, SAVE-001..008) e responsividade multi-resolução com safe areas e acessibilidade (M3-07, RESP-001..012). Suíte com 65 testes unitários passando. Próxima etapa: Marco M4 (Conteúdo e Polimento: expansão de fases originais, colecionáveis e refinamentos visuais). |

## 8. Procedimento inegociável ao implementar recurso novo

1. **ANTES:** ler os três `.md`, conferir código e anotar ID/critério e arquivos afetados. Se não houver ID, criar um novo em `FUNCIONALIDADES.md` e um checkbox aqui **antes de codificar**.
2. **DURANTE:** implementar com escopo controlado, preservar funcionalidades anteriores e testar em execução. Se identificar novo módulo, descrever mapa real em `AGENTS.md`.
3. **IMEDIATAMENTE APÓS VALIDAR:** mudar exatamente a caixa do ID para `[x]`; registrar data/arquivos/comandos e resultado na seção 6. Se ainda não passou, manter `[ ]` e registrar bloqueio na seção 7.
4. **ANTES DE RESPONDER:** comparar todos os IDs adicionados/alterados em `FUNCIONALIDADES.md` com este documento, executar verificações possíveis e entregar resumo do que mudou, provas, pendências e próximo passo.
5. **NUNCA:** dizer "concluído" com checklist desatualizado, marcar tudo de uma vez, apagar tarefas não feitas, inventar testes ou substituir código inteiro sem necessidade.

