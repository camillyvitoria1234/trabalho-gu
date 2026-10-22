# FUNCIONALIDADES.md — Especificação de produto e jogo

**Projeto:** jogo de corrida/aventura 2D neon para navegador, inspirado nas ideias de design de DATA WING.  
**Versão do documento:** 1.0 — 2026-10-21  
**Estado:** especificação de referência; NÃO significa que alguma funcionalidade já foi implementada.  
**Documentos relacionados:** `CHECKLIST.md` (execução e progresso) e `AGENTS.md` (instruções obrigatórias para agentes de IA).

> **Escopo e autoria.** DATA WING é uma obra de Dan Vogt. Este projeto pretende produzir um **jogo original inspirado no gênero e nas mecânicas**. Não copiar fases, diálogos, personagens, logos, músicas, efeitos sonoros ou imagens proprietárias. Nome comercial, enredo, identidade visual e conteúdo final serão próprios. Este arquivo descreve comportamentos e objetivos de engenharia, não especificações extraídas do código-fonte do original.

## 1. Fontes, evidências e classificação

**Legendas dos requisitos:**

- **[O] Original confirmado:** consta em descrição oficial do criador, lojas ou texto do próprio desenvolvedor.
- **[C] Relatado/observado:** aparece em fontes secundárias ou análises; confirmar jogando e pesquisando antes de afirmar equivalência exata.
- **[W] Requisito web:** adaptação necessária/recomendada para PC, tablet e celular; não é alegação sobre o original.
- **[N] Nova proposta:** inovação planejada para este projeto, não existe necessariamente no original.
- **[F] Futuro/opcional:** só após a base funcionar bem.

**Fontes de consulta (2026-10-21):**

1. Página do desenvolvedor: https://www.danvogt.info/datawing.html — controles por dois toques, impulsos nas paredes, história com mais de 40 níveis, coroas/rankings, trilha sonora.
2. Loja oficial Android: https://play.google.com/store/apps/details?id=com.DanVogt.DATAWING — descrição do produto e caráter offline/single-player.
3. Ensaio do desenvolvedor sobre tutorial, fantasmas, desafios, gravidade, reinícios e progressão: https://medium.com/@davogt/welcoming-players-into-data-wing-92c6587091ef
4. Wiki comunitária (verificação secundária): https://data-wing.fandom.com/wiki/DATA_WING ; https://data-wing.fandom.com/wiki/Turbo_Zone
5. Resenha da App Store (editorial): https://apps.apple.com/us/story/id1339831033 — descrição da navegação, impulsos e variedade de objetivos.
6. Registros de fãs, úteis apenas como fonte secundária: https://data-wing.fandom.com/wiki/Deconstruction ; https://data-wing.fandom.com/wiki/Whitewater ; https://data-wing.fandom.com/wiki/Sundown — portas/chaves, missões com payload binário, notas e quizzes; validar antes de reproduzir comportamentos específicos.

**Limite de certeza:** a documentação pública não descreve todos os valores físicos, gatilhos, efeitos e cada uma das fases do jogo. Não inventar parâmetros, contagens ou comportamento exato. Usar `TBD`, prototipar e validar por playtest. A meta de 40+ fases é um objetivo de conteúdo, não uma promessa de reprodução nível a nível.

## 2. Visão de produto

**Pitch:** conduzir uma pequena nave em circuitos digitais luminosos, aprendendo a ganhar velocidade ao deslizar pelas paredes; alternar entre desafios curtos, corrida por tempo, gravidade e progressão narrativa.

**Pilares não negociáveis:**

1. **Movimentação gostosa:** acelerar, virar e deslizar precisa ser imediatamente divertido mesmo sem história.
2. **Parede = habilidade:** raspar uma parede de forma inteligente ajuda a ganhar velocidade; colidir de frente não concede uma recompensa ilimitada.
3. **Legibilidade:** nave e trajetória visíveis apesar de velocidade, partículas e neon.
4. **Curva de aprendizado:** apresentar uma ideia por vez e recompensar domínio sem tornar toda fase difícil.
5. **Web de verdade:** jogar em desktop e mobile, com entrada apropriada, adaptação de tela e persistência local.
6. **Originalidade:** conteúdo próprio; referência de gameplay não autoriza cópia integral de obra protegida.

**Plataformas-alvo:** navegadores modernos desktop e mobile; teclado obrigatório no desktop, multitoque obrigatório em celular, mouse nos menus e acessibilidade básica. Gamepad é futuro.

**Progressão sugerida:** protótipo de 1 pista -> vertical slice de 5 fases -> primeira campanha original de 15–20 fases -> expansão para 40+ desafios variados -> extras competitivos. Quantidade só conta quando as fases são jogáveis e testadas.

## 3. Experiência central do jogador

### 3.1 Navegação, início e ciclo de jogo

- **CORE-001 [W]:** página carrega sem erro; mostra tela inicial, opção de iniciar/continuar e estado de carregamento.
- **CORE-002 [W]:** ciclo explícito `boot -> menu -> mapa/seleção -> gameplay -> resultado -> mapa/próxima fase`; pausa em overlay.
- **CORE-003 [W]:** estados intermediários bem definidos: carregando, jogando, pausado, vitória, falha, transição, erro recuperável.
- **CORE-004 [O/W]:** primeira entrada tem tutorial interativo curto; jogador controla antes de ler textos longos.
- **CORE-005 [W]:** reinício da fase a qualquer momento com entrada dedicada e sem recarregar página.
- **CORE-006 [W]:** a cena é desmontada corretamente ao trocar de fase, evitando eventos, áudios, timers e objetos duplicados.
- **CORE-007 [W]:** HUD exibe somente o que importa ao desafio atual (tempo, objetivo, voltas, meta e reinício).

### 3.2 Comandos e entrada (simples, responsivos e previsíveis)

- **CTRL-001 [O]:** comando de virar para a esquerda.
- **CTRL-002 [O]:** comando de virar para a direita.
- **CTRL-003 [O/C]:** propulsão principal automática; comando básico não exige botão de acelerar, salvo opção original de design explicitamente aprovada.
- **CTRL-004 [W]:** teclado: `A`/`←` e `D`/`→`; `R` reinicia; `Esc`/`P` pausa; `Enter` confirma nos menus, sem conflito com foco.
- **CTRL-005 [W]:** celular: duas áreas de toque seguras e independentes com `Pointer Events`, suporte a dois dedos simultâneos.
- **CTRL-006 [W]:** controles mobile configuráveis em tamanho, opacidade e posição; respeitar margens `safe-area`.
- **CTRL-007 [W]:** resetar estados de entrada em `pointercancel`, `pointerup`, blur, perda de foco, troca de aba e pausa para evitar direção travada.
- **CTRL-008 [W]:** priorização clara quando esquerda e direita estão simultaneamente ativas (padrão: soma zero; configurar se playtest indicar outro comportamento).
- **CTRL-009 [W]:** teclado não move/rola a página durante gameplay; menu não sequestra teclas quando campo de texto estiver focado.
- **CTRL-010 [F]:** controles de gamepad e remapeamento do teclado.
- **CTRL-011 [W]:** orientação inicial opcional recomendando paisagem, sem bloquear desnecessariamente o retrato.

### 3.3 Física da nave — **área de maior prioridade**

- **PHYS-001 [O/W]:** posição, velocidade, orientação angular e velocidade de rotação observáveis em unidades consistentes do mundo.
- **PHYS-002 [O/C]:** aceleração para frente baseada na direção da nave, com sensação de inércia e resposta gradual.
- **PHYS-003 [W]:** desaceleração/arrasto calibrados; nave não freia instantaneamente sem motivo.
- **PHYS-004 [O/W]:** viragem suave, sem teletransporte de ângulo; sensibilidade ajustável por parâmetros.
- **PHYS-005 [O]:** contato com parede permite ganhar velocidade e se afastar dela por **wall thrust**; preservar componente tangencial de deslocamento para criar curvas fluidas. Segundo o criador, a força também pode orientar a nave para longe da parede.
- **PHYS-006 [W]:** resolver colisão com sólidos por normal/tangente, impedindo penetração e saltos de posição.
- **PHYS-007 [W]:** distinguir impacto frontal (perde velocidade/rebate moderadamente) de contato raspando (pode gerar impulso).
- **PHYS-008 [W]:** impulso de parede calibrado por normal de contato, direção da nave, ângulo, velocidade tangencial, duração e potência; incluir componente de afastamento da parede e limites que evitem boost infinito parado.
- **PHYS-009 [W]:** evitar atravessar paredes em alta velocidade (subpassos, swept collision ou estratégia equivalente validada).
- **PHYS-010 [W]:** loop físico de passo fixo, desacoplado do render, para comportamento consistente a 30/60/120/144 Hz.
- **PHYS-011 [W]:** interpolação visual opcional, sem introduzir discrepância com a simulação.
- **PHYS-012 [W]:** limites de velocidade, aceleração, fricção e rotação centralizados em configuração, nunca mágicos espalhados.
- **PHYS-013 [O/C]:** perfis da nave ajustáveis pelo tutorial; desenvolver habilidade sem frustrar novatos (referência: Dan Vogt descreve progressão gradual de parâmetros).
- **PHYS-014 [W]:** colisão com geometria côncava/segmentos e curvas aproximadas; junções de pista não podem prender a nave.
- **PHYS-015 [W]:** instrumentos temporários de debug: vetores velocidade, normal da parede, contato, FPS, posição e força de boost.
- **PHYS-016 [W]:** câmera e controles não dependem de FPS, tamanho da janela ou pixel ratio.

**Modelo de física inicial (PROPOSTO, não fórmula de DATA WING):**

```text
passo fixo dt
rotacao = entradaHorizontal * taxaDeRotacao * dt
orientacao += rotacao
frente = (cos(orientacao), sin(orientacao))
aceleracao = frente * forcaMotor + vetorGravidade + forcaZona
velocidade += aceleracao * dt
velocidade = aplicarArrastoELimites(velocidade, dt)
proximaPosicao = posicao + velocidade * dt
resolverContatosComParedes(proximaPosicao, velocidade, geometria)
se contato tangencial válido e nave orientada para beneficiar o deslizamento:
    aplicarImpulsoDeParede(normal, velocidadeTangencial, orientacao, teto, antiexploit)
    aplicarTorqueDeAfastamentoSeNecessario(normal, orientacao)
```

**Aceitação da sensação de controle:** curvas amplas permitem ganho evidente; bater perpendicularmente não acelera; mesma pista e entradas produzem tempo aproximadamente igual sob diferentes FPS; nave não atravessa a parede; novato entende o básico sem ler um manual.

### 3.4 Câmera e leitura visual

- **CAM-001 [W]:** câmera 2D acompanha a nave com suavização configurável e sem induzir enjoo.
- **CAM-002 [W]:** zoom adaptativo calculado a partir do espaço útil, sem distorcer física nem mudar unidades de mundo.
- **CAM-003 [W]:** enquadramento mantém área de antecipação na direção da velocidade, sem esconder curvas críticas.
- **CAM-004 [W]:** transição e feedback de saída de fase sem cortes bruscos desnecessários.
- **CAM-005 [N]:** opção de intensidade de câmera, zoom e tremor reduzidos.

## 4. Pistas, regras de fases e objetivos

### 4.1 Fases e mapa

- **LEVEL-001 [O/W]:** níveis lineares com ponto inicial e ponto de chegada.
- **LEVEL-002 [O/W]:** circuitos fechados com contagem de voltas.
- **LEVEL-003 [O/W]:** fases com limite de tempo e indicação clara de falha/êxito.
- **LEVEL-004 [O/W]:** progressão por desbloqueio; alguns desafios opcionais ou diferentes caminhos no mapa.
- **LEVEL-005 [W]:** carregar fase de dados declarativos (`JSON`/objetos validados), não por ifs gigantes e coordenadas mágicas.
- **LEVEL-006 [W]:** cada fase declara ID, nome interno, geometria, spawn, direção inicial, física/zones, objetivos, checkpoints se houver, câmera, ambientação e recompensas.
- **LEVEL-007 [W]:** separação entre lógica de missão e desenho da pista; reutilizar sistemas entre 40+ fases.
- **LEVEL-008 [W]:** mudança da fase sem recarregar a aplicação e sem vazamento de memória.
- **LEVEL-009 [W]:** primeiro lote com cinco níveis originais, cada um validando uma mecânica diferente.
- **LEVEL-010 [N]:** editor interno simples para visualizar e validar colisores/triggers; **não** construir editor sofisticado antes do gameplay.
- **LEVEL-011 [N]:** atalhos alternativos desenhados intencionalmente, sem permitir atravessar geometria.
- **LEVEL-012 [W]:** validador rejeita IDs repetidos, paredes malformadas, objetivo inalcançável óbvio e dados ausentes.

### 4.2 Objetivos e competições

- **RACE-001 [O]:** alcançar a saída em um percurso linear.
- **RACE-002 [O]:** completar voltas no circuito, contando passagem na ordem correta.
- **RACE-003 [O]:** bater um tempo-alvo e mostrar resultado final.
- **RACE-004 [O]:** fantasmas (ghost racers) demonstram trajetórias e funcionam como benchmark.
- **RACE-005 [O]:** prova contra múltiplos corredores-fantasma/oponentes pré-programados, ao menos em formatos específicos.
- **RACE-006 [O]:** reinício rápido e sem punição de recursos.
- **RACE-007 [O]:** desafios opcionais para quem busca melhorar desempenho, mantendo campanha acessível.
- **RACE-008 [O]:** recordes e sistema competitivo de coroas associado a pistas/placares.
- **RACE-009 [W]:** melhores tempos locais separados por fase, versão da física e categoria de corrida.
- **RACE-010 [W]:** cronômetro monotônico da simulação ou clock apropriado com comportamento documentado em pausa, background e reinício.
- **RACE-011 [W]:** volta válida requer cruzamento da linha de chegada na direção correta e checkpoints ordenados ou regra equivalente contra cortar pista.
- **RACE-012 [N]:** ghost pessoal gravado como entradas/estados em formato versionado; reprodução sem alterar colisões do jogador.
- **RACE-013 [F]:** rankings globais com serviço remoto, consentimento, limites de requisições, validação de runs e antitrapaça.

**Observação:** a referência usa fantasmas como ferramenta de ensino, inclusive mostrando uma volta anterior. Para esta versão, gravar/reproduzir fantasmas pessoais fica em etapa posterior ao movimento básico.

### 4.3 Elementos interativos e variações de física

- **MECH-001 [O]:** gravidade em níveis específicos, inicialmente puxando para baixo; intensidade configurável por fase.
- **MECH-002 [O]:** zonas de vento/força ambiental que ajudam o deslocamento, especialmente em introdução à gravidade.
- **MECH-003 [C]:** zonas turbo que aumentam velocidade ao atravessar.
- **MECH-004 [C]:** zonas onde a propulsão é reduzida ou desativada e a nave depende de inércia.
- **MECH-005 [O]:** barreiras de segurança/obstáculos usados intencionalmente no level design.
- **MECH-006 [N]:** gatilhos de missão (cruzar, coletar, ativar, interagir) desacoplados da renderização.
- **MECH-007 [C]:** itens/fragmentos de dados e notas opcionais associados à narrativa.
- **MECH-008 [C]:** desafios de lógica simples ou interação com dados/binário no contexto de missões.
- **MECH-009 [W]:** indicadores visuais distintos para zona turbo, vento, gravidade e falta de propulsão.
- **MECH-010 [W]:** entradas e saídas de zonas tratam sobreposição, borda e reinício sem empilhar efeitos indevidamente.
- **MECH-011 [N]:** zona direcional que muda a gravidade (somente após gravidade base validada).
- **MECH-012 [F]:** obstáculos móveis e mutações de pista, com orçamento de performance.
- **MECH-013 [C]:** chaves e portas vinculadas a objetivos (recolher chave, validar autorização e abrir saída); o conteúdo da fase deve declarar relação chave-porta.
- **MECH-014 [C]:** terminais/payload de bits com alteração de valores binários e feedback de validação, para fases especiais (design autoral).
- **MECH-015 [C]:** objetos de dados/notas coletáveis opcionais, com identificação estável e prevenção de coleta duplicada.
- **MECH-016 [N]:** forma declarativa de combinar trigger, ação, condição e recompensa sem depender de grandes condicionais por fase.

**Não presumir:** inimigos tradicionais, combate, sistema de armas, dano, saúde, upgrades compráveis, multiplayer ou loja — não constituem o núcleo confirmado de DATA WING. Não adicioná-los sem decisão explícita.

## 4.4 Inventário de recursos adicionais observados na comunidade

Essas referências **não são documentação técnica oficial**. Foram relatadas em páginas da comunidade e podem conter informações incompletas ou interpretação incorreta. O objetivo é não esquecer ideias ao planejar uma experiência comparável em riqueza, **não reproduzir puzzles/fases exatamente**.

| Elemento documentado por fãs | Interpretação de produto para versão web | IDs correspondentes |
|---|---|---|
| Turbo zones | aceleração contextual, com sinalização visual | `MECH-003`, `MECH-009` |
| Keys + doors | objetivo com item obrigatório e porta autorizada | `MECH-013` |
| Hack payload / números binários | terminal de lógica computacional | `MECH-014`, `NARR-013` |
| UserData notes | colecionáveis que revelam partes do universo narrativo | `MECH-015`, `NARR-006` |
| Shiny Gems / recompensas | pontuação ou recurso narrativo, sem loja imposta | `NARR-014` |
| DataUplink / coroas | classificação de tempos e recompensas competitivas | `RACE-008`, `ONLINE-008` |

**Regra de implementação:** criar objetivos e pistas próprios. Se a equipe descobrir um comportamento novo jogando a versão original, anotar a origem, definir um ID estável, adicionar critério de aceitação e inserir checkbox correspondente em `CHECKLIST.md` **antes de declarar implementação finalizada**.

## 5. Progressão, narrativa e experiência emocional

- **NARR-001 [O]:** história em episódios distribuídos entre fases; ambientação de sistema computacional, porém com personagens e enredo originais nesta versão.
- **NARR-002 [O]:** personagem narrador/assistente que orienta e muda a relação com o jogador conforme progresso; não copiar Mãe/Mother.
- **NARR-003 [O]:** diálogos curtos de missão no início e de lore no fim/entre fases.
- **NARR-004 [O]:** início ensina movimento; depois paredes, fantasmas, tempo, gravidade, disputa e habilidades avançadas.
- **NARR-005 [O]:** conteúdo narrativo opcional/destravável; não obrigar leitura durante curvas difíceis.
- **NARR-006 [C]:** colecionáveis com fragmentos/notas sobre o universo e personagens.
- **NARR-007 [C]:** recompensas simbólicas/moeda narrativa sem economia funcional necessária (não inventar loja obrigatória).
- **NARR-008 [W]:** sistema de diálogo dirigido por dados: ID, speaker, texto, condição, opção de avançar/pular, estado de visto.
- **NARR-009 [W]:** sistema de progressão de capítulos e pré-requisitos, com salvamento e desbloqueio determinísticos.
- **NARR-010 [W]:** textos localizáveis (PT-BR base), sem frases hardcoded em dezenas de arquivos.
- **NARR-011 [N]:** narrativa original a ser escrita separadamente; placeholders neutros e claramente rotulados até aprovação.
- **NARR-012 [N]:** bônus de desafio/coroas sem obrigar repetição exaustiva para ver o fim da história.
- **NARR-013 [C]:** desafios de lógica binária apresentados como quizzes ou bloqueios opcionais; texto, feedback de erro e solução devem ser conteúdos originais.
- **NARR-014 [C/N]:** colecionáveis/recompensas simbólicas análogos ao conceito de gemas; decidir finalidade antes de criar uma economia.
- **NARR-015 [W]:** log de eventos narrativos com condições de desbloqueio e recuperação ao carregar save sem repetir cenas indevidamente.

**Exemplo de curva pedagógica original (proposta, não reprodução):**

| Etapa | O que se aprende | Objetivo inicial |
|---|---|---|
| 0 | Virar e orientar nave | Chegar a um portal sem limite de tempo |
| 1 | Curvas e paredes seguras | Terminar trajeto de baixa pressão |
| 2 | Raspar paredes, visualizar ghost | Dar voltas e observar velocidade |
| 3 | Corrida por tempo | Dominar uma curva e reiniciar rapidamente |
| 4 | Gravidade e vento | Subir sem tempo limite |
| 5 | Corredores rivais e caminhos alternativos | Vencer uma prova acessível |

O autor confirma uma introdução gradual, fantasmas, tempo, gravidade, vento e disputa com vários corredores. Os detalhes de implementação e o conteúdo de nossas fases serão próprios.

## 6. Interface, áudio e estética

### 6.1 Identidade gráfica

- **VIS-001 [O/N]:** visual 2D minimalista com trilhas digitais, nave triangular própria e elementos geométricos de leitura rápida.
- **VIS-002 [O/N]:** neon emissivo e paleta própria, com contraste suficiente para nave, parede e fundo.
- **VIS-003 [O/N]:** rastro luminoso da nave com comprimento/intensidade proporcionais à velocidade.
- **VIS-004 [O/N]:** feedback visual mais intenso no deslizamento/impulso bem executado.
- **VIS-005 [W]:** partículas limitadas por orçamento e escaladas por qualidade.
- **VIS-006 [W]:** efeitos de brilho configuráveis; fallback sem pós-processamento pesado.
- **VIS-007 [W]:** HUD e tipografia legíveis tanto em tela pequena quanto retina/4K.
- **VIS-008 [W]:** efeitos de colisão diferenciados entre choque e raspagem positiva.
- **VIS-009 [W]:** sinalização clara de início, direção da pista, checkpoints, chegada e zonas.
- **VIS-010 [W]:** redução de flashes e de tremor para acessibilidade.
- **VIS-011 [N]:** temas visuais por capítulo, sem perder consistência de colisão e legibilidade.
- **VIS-012 [W]:** transições com tempo limitado e opção de pular animações longas.

### 6.2 Música e efeitos sonoros

- **AUDIO-001 [O/N]:** trilha eletrônica/vaporwave **licenciada ou produzida originalmente**, não reutilizar músicas do jogo de referência.
- **AUDIO-002 [W]:** música contextual por menu, corrida, vitória e clímax, com transições suaves.
- **AUDIO-003 [W]:** SFX de motor, parede, boost, turbo, UI, chegada, derrota e diálogo.
- **AUDIO-004 [W]:** mixagem independente de música/SFX, mute geral e preferências salvas.
- **AUDIO-005 [W]:** desbloquear contexto de áudio mediante gesto do usuário quando navegador exigir.
- **AUDIO-006 [W]:** pausa/resume apropriados ao alternar aba; evitar múltiplas trilhas simultâneas.
- **AUDIO-007 [W]:** limite de vozes simultâneas e comportamento sem som caso API falhe.
- **AUDIO-008 [N]:** pitch/dinâmica de motor e efeitos em função da velocidade, sem som agressivo.
- **AUDIO-009 [W]:** créditos e licenças documentados para cada recurso importado.

### 6.3 Menus e feedback

- **UI-001 [W]:** menu inicial com iniciar/continuar, seleção, configurações, créditos.
- **UI-002 [W]:** pausa e reinício instantâneo acessíveis em touch/teclado.
- **UI-003 [W]:** tela de resultado com tempo, meta, recorde, objetivos, próxima fase e tentar novamente.
- **UI-004 [W]:** seleção de níveis com bloqueio/desbloqueio, percurso, melhor tempo e descrição.
- **UI-005 [W]:** tutoriais contextuais dispensáveis e revisitáveis.
- **UI-006 [W]:** feedback de toque/hover/foco e labels acessíveis em controles HTML.
- **UI-007 [W]:** erros de carregamento e saves tratados com mensagens recuperáveis.
- **UI-008 [W]:** indicador de qualidade gráfica e controles configuráveis.
- **UI-009 [W]:** texto com tamanho mínimo legível e quebra adequada no retrato.

## 7. Responsividade, acessibilidade e compatibilidade

**Princípio:** *responsivo não significa esticar o jogo*. Geometria, física e temporização permanecem em coordenadas de mundo; a câmera enquadra e a interface se adapta.

- **RESP-001 [W]:** canvas ocupa área disponível de maneira proporcional; sem distorção em telas 16:9, 19.5:9, 4:3, retrato, ultrawide.
- **RESP-002 [W]:** distinguir espaço de mundo, CSS pixels, pixels físicos e `devicePixelRatio`; cap de DPR configurável por desempenho.
- **RESP-003 [W]:** `resize`/`orientationchange` reconstroem apenas viewport/câmera/UI, sem mudar posição ou impulso da nave.
- **RESP-004 [W]:** HUD fora de regiões obstruídas, notches e barras do navegador via `env(safe-area-inset-*)`.
- **RESP-005 [W]:** `touch-action` apropriado nas áreas do jogo; impedir scroll/zoom acidental sem prejudicar menus.
- **RESP-006 [W]:** suporte a multi-pointer independente e pointer capture/cancel limpos.
- **RESP-007 [W]:** botões touch com área generosa e contraste; não depender de hover.
- **RESP-008 [W]:** HUD nunca sobrepõe saída da fase ou encobre nave por períodos prolongados.
- **RESP-009 [W]:** modo retrato funcional ou orientação assistida sem travar navegador; documentar limitações.
- **RESP-010 [W]:** pausar ao perder foco/visibilidade, preservar estado e evitar salto de delta ao retornar.
- **RESP-011 [W]:** ajustes de acessibilidade: reduzir movimento, flashes e efeitos; volume e contraste.
- **RESP-012 [W]:** menus navegáveis via teclado, indicação de foco e texto escalável sempre que viável.
- **RESP-013 [W]:** testar Firefox e Chromium desktop, Safari iOS e Chrome Android em dispositivos reais/emulação.
- **RESP-014 [W]:** otimizar bundle/carregamento, liberar memória de cenas e lidar com context loss quando aplicável.
- **RESP-015 [F]:** PWA instalável e cache versionado como extensão opcional depois que a versão online responsiva estiver madura; validar atualizações sem deixar versões antigas presas.

**Matriz mínima de testes:**

| Caso | Resolução de referência | Entrada | Critério |
|---|---:|---|---|
| Celular retrato | 390×844 | dois dedos | menus legíveis, controls utilizáveis |
| Celular paisagem | 844×390 | dois dedos | gameplay desobstruído |
| Tablet | 768×1024 | toque | canvas e HUD ajustados |
| Notebook | 1366×768 | teclado | 60 FPS alvo ajustável |
| Desktop FHD | 1920×1080 | teclado | mesmo percurso/física |
| Ultrawide | 3440×1440 | teclado | sem alongar mapa/nave |
| DPI alto | DPR 2–3 | ambos | texto nitidez/performance equilibrados |

**Metas de engenharia (não garantias):** simulação consistente; 60 FPS em hardware representativo; modo econômico com menos partículas/post-processamento e render reduzido; WebGL com fallback conforme stack e suporte real. Medir sempre, nunca afirmar performance sem testes.

## 8. Persistência e dados

- **SAVE-001 [W]:** salvar progresso de fases, estrelas/coroas locais se houver, melhores tempos, configurações e diálogos vistos.
- **SAVE-002 [W]:** schema de save versionado e migrações, sem sobrescrever dados desconhecidos silenciosamente.
- **SAVE-003 [W]:** validar dados lidos; tratar storage indisponível, corrompido ou cheio com fallback em memória.
- **SAVE-004 [W]:** operação de `reset` apenas mediante confirmação explícita do jogador.
- **SAVE-005 [W]:** persistir ao finalizar fases e alterar opções; não gravar a cada frame.
- **SAVE-006 [W]:** separar save/progresso de cache, ghosts e estatísticas temporárias.
- **SAVE-007 [W]:** categoria/versão de tempo evita comparar recordes de físicas radicalmente diferentes.
- **SAVE-008 [N]:** exportar/importar progresso local via arquivo versionado, sujeito a validação.
- **SAVE-009 [F]:** sincronização de conta opcional; funcionamento offline não pode depender disso.

## 9. Concorrência, rankings e expansão de longo prazo

- **ONLINE-001 [O/N]:** conceito competitivo de melhores tempos e coroas por pista; começar **local**, sem criar backend prematuro.
- **ONLINE-002 [F]:** leaderboard remoto por fase, filtros e autenticação opcional.
- **ONLINE-003 [F]:** aceitar apenas tempos auditáveis; o cliente sozinho não é confiável contra fraude.
- **ONLINE-004 [F]:** política de privacidade e minimização de dados se houver contas/rankings.
- **ONLINE-005 [F]:** cache/offline-first e degradação graciosa quando servidor cair.
- **ONLINE-006 [N]:** eventos/desafios semanais somente após campanha, manutenção e anticheat.
- **ONLINE-007 [N]:** editor/compartilhamento de fases futuramente, com verificação e moderação se público.
- **ONLINE-008 [C/F]:** visualização de ranking/coroas por circuito inspirada em sistemas sociais como o DataUplink da referência; qualquer nome, interface e protocolo devem ser originais.

## 10. Arquitetura recomendada (somente se for projeto novo)

**Sugestão:** `Vite + JavaScript ESM + Phaser 4.x`, sem React; UI HTML/CSS onde isso melhorar acessibilidade. Phaser foi utilizado em outro projeto do usuário, mas **não presumir** que este repositório possua a mesma stack nem transferir arquivos entre projetos. A versão real de cada pacote deve ser validada no `package.json`, lockfile e APIs instaladas. Não impor migração se projeto existente já for funcional.

**Mapa proposto — NÃO representa arquivos que já existem:**

```text
projeto/
├── AGENTS.md                 # regras para IA e mapa real do código
├── FUNCIONALIDADES.md        # requisitos e suas evidências
├── CHECKLIST.md              # execução e status
├── package.json
├── index.html
├── public/assets/           # somente conteúdo autoral/licenciado
├── src/
│   ├── main.js
│   ├── config/                # tuning, chaves e constantes
│   ├── core/                  # máquina de estados, eventos, ciclo de vida
│   ├── scenes/                # boot, menu, mapa, corrida, resultado
│   ├── gameplay/
│   │   ├── player/            # nave, controller, estado
│   │   ├── physics/           # movimento, contatos, wall boost
│   │   ├── race/              # timer, voltas, ghosts, resultado
│   │   ├── levels/            # loader, parser, schema, geometria
│   │   ├── mechanics/         # gravity, wind, turbo, triggers
│   │   └── story/             # diálogo, eventos narrativos
│   ├── platform/              # input, storage, audio, browser
│   ├── ui/                    # HUD, menu, acessibilidade, responsividade
│   └── data/                  # fases, diálogos e localizações
└── tests/                     # unit, integration, smoke/e2e
```

**Regras da arquitetura:**

1. `physics` conhece coordenadas e corpos, não DOM nem textos de história.
2. `input` produz intenção (`turn=-1|0|1`, pause, restart); gameplay não lê teclado e toque diretamente.
3. `level data` não executa código arbitrário; valida schema antes de instanciar.
4. `race` avalia objetivo e tempo; UI apenas apresenta estado.
5. `save` persiste dados versionados; não grava instâncias do Phaser.
6. `scenes` orquestram, não viram arquivos monolíticos com toda a lógica.
7. Novo subsistema precisa de testes mínimos, IDs de requisitos e atualização de `AGENTS.md` + `CHECKLIST.md`.

## 11. Critérios de qualidade e conclusão

**Condição para vertical slice jogável:**

- Carregar uma fase original, mover nave com teclado/touch, colidir corretamente, deslizar e ganhar boost de parede.
- Ter chegada/vitória, cronômetro, reinício e menu/resultado.
- Rodar em desktop e celular paisagem com controles operáveis e sem distorção.
- Regressões básicas testadas em FPS distinto; não atravessar parede nem travar controles.
- Documentar o que foi implementado de fato e as limitações no `CHECKLIST.md`.

**Condição para `feito` de qualquer requisito:** código funcional + teste/validação relevante + revisão de regressões + documentação atualizada + evidência verificável. Não marcar concluído por compilar, por gerar arquivo ou por afirmação da IA.

## 12. Evolução do documento (obrigatória)

- Este é o catálogo de requisitos. **Cada nova funcionalidade recebe um ID estável**, tag de origem, descrição, objetivo e critério de aceitação.
- Se comportamento, prioridade ou escopo mudar, atualizar o requisito e seu item em `CHECKLIST.md` **na mesma tarefa**.
- Não apagar requisitos históricos concluídos; usar `Substituído por XYZ` e explicar motivação.
- Descobertas sobre o original que venham de fontes não oficiais permanecem [C] até verificação melhor.
- Uma IA não pode dizer “é igual ao jogo original” sem evidência. Reproduzir **sensação e princípios**, com implementação e arte próprias.
