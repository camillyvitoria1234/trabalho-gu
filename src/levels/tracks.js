/**
 * Banco declarativo com os 5 desafios autorais do Vertical Slice (Marco M2).
 * Satisfaz: LEVEL-001, LEVEL-002, LEVEL-003, LEVEL-005, LEVEL-006, LEVEL-007,
 *           LEVEL-009, LEVEL-011, LEVEL-012, RACE-001, RACE-002, RACE-003.
 */

export const TRACKS = [
  // 1. Fase 1: Introdução à Navegação e Inércia
  {
    id: 'track-01-proto',
    title: '01 · Circuito Alfa',
    subtitle: 'Introdução ao movimento',
    type: 'linear',
    targetTime: 14.0,
    spawn: { x: 100, y: 300, angle: 0 },
    // Linha de chegada perpendicular ao corredor final (de uma parede à outra sem atravessar paredes)
    finishLine: { a: { x: 2102, y: 428 }, b: { x: 2200, y: 550 } },
    walls: [
      { a: { x: 50, y: 220 }, b: { x: 700, y: 220 } },
      { a: { x: 700, y: 220 }, b: { x: 1100, y: 350 } },
      { a: { x: 1100, y: 350 }, b: { x: 1400, y: 650 } },
      { a: { x: 1400, y: 650 }, b: { x: 1700, y: 750 } },
      { a: { x: 1700, y: 750 }, b: { x: 2102, y: 428 } }, // Termina exatamente na ponta 'a' da linha de chegada

      { a: { x: 50, y: 380 }, b: { x: 650, y: 380 } },
      { a: { x: 650, y: 380 }, b: { x: 1000, y: 500 } },
      { a: { x: 1000, y: 500 }, b: { x: 1250, y: 780 } },
      { a: { x: 1250, y: 780 }, b: { x: 1650, y: 900 } },
      { a: { x: 1650, y: 900 }, b: { x: 2200, y: 550 } }, // Termina exatamente na ponta 'b' da linha de chegada

      { a: { x: 50, y: 220 }, b: { x: 50, y: 380 } }
    ]
  },

  // 2. Fase 2: Domínio do Wall Thrust em Curvas Suaves
  {
    id: 'track-02-arc',
    title: '02 · Arco Cinético',
    subtitle: 'Deslize nas paredes externas para acelerar',
    type: 'linear',
    targetTime: 13.0,
    spawn: { x: 100, y: 250, angle: 0 },
    // Linha de chegada horizontal, perpendicular à descida vertical, conectando da parede esquerda (1650) à direita (1900)
    finishLine: { a: { x: 1650, y: 950 }, b: { x: 1900, y: 950 } },
    walls: [
      // Parede externa / direita
      { a: { x: 50, y: 150 }, b: { x: 800, y: 150 } },
      { a: { x: 800, y: 150 }, b: { x: 1400, y: 300 } },
      { a: { x: 1400, y: 300 }, b: { x: 1900, y: 600 } },
      { a: { x: 1900, y: 600 }, b: { x: 1900, y: 950 } },

      // Parede interna / esquerda
      { a: { x: 50, y: 350 }, b: { x: 750, y: 350 } },
      { a: { x: 750, y: 350 }, b: { x: 1250, y: 480 } },
      { a: { x: 1250, y: 480 }, b: { x: 1650, y: 750 } },
      { a: { x: 1650, y: 750 }, b: { x: 1650, y: 950 } },

      { a: { x: 50, y: 150 }, b: { x: 50, y: 350 } }
    ]
  },

  // 3. Fase 3: Circuito Fechado com Contagem de Voltas (LEVEL-002, RACE-002, RACE-011)
  {
    id: 'track-03-loop',
    title: '03 · O Anel Digital',
    subtitle: 'Complete 2 voltas no circuito',
    type: 'circuit',
    lapsRequired: 2,
    targetTime: 22.0,
    spawn: { x: 500, y: 200, angle: 0 }, // Apontando para a direita no topo do anel
    finishLine: { a: { x: 600, y: 100 }, b: { x: 600, y: 300 } },
    // Checkpoint intermediário na parte inferior do anel para impedir cortar caminho (RACE-011)
    checkpoints: [
      { id: 'cp1', a: { x: 600, y: 700 }, b: { x: 600, y: 900 } }
    ],
    walls: [
      // Parede externa (octógono)
      { a: { x: 300, y: 100 }, b: { x: 900, y: 100 } },
      { a: { x: 900, y: 100 }, b: { x: 1200, y: 400 } },
      { a: { x: 1200, y: 400 }, b: { x: 1200, y: 600 } },
      { a: { x: 1200, y: 600 }, b: { x: 900, y: 900 } },
      { a: { x: 900, y: 900 }, b: { x: 300, y: 900 } },
      { a: { x: 300, y: 900 }, b: { x: 0, y: 600 } },
      { a: { x: 0, y: 600 }, b: { x: 0, y: 400 } },
      { a: { x: 0, y: 400 }, b: { x: 300, y: 100 } },

      // Parede interna (ilha central)
      { a: { x: 400, y: 300 }, b: { x: 800, y: 300 } },
      { a: { x: 800, y: 300 }, b: { x: 1000, y: 450 } },
      { a: { x: 1000, y: 450 }, b: { x: 1000, y: 550 } },
      { a: { x: 1000, y: 550 }, b: { x: 800, y: 700 } },
      { a: { x: 800, y: 700 }, b: { x: 400, y: 700 } },
      { a: { x: 400, y: 700 }, b: { x: 200, y: 550 } },
      { a: { x: 200, y: 550 }, b: { x: 200, y: 450 } },
      { a: { x: 200, y: 450 }, b: { x: 400, y: 300 } }
    ]
  },

  // 4. Fase 4: Contra o Relógio com Limite Estrito de Tempo (LEVEL-003, RACE-003)
  {
    id: 'track-04-rush',
    title: '04 · Sobrecarga Crítica',
    subtitle: 'Alcance a saída antes do tempo zerar (12.5s)',
    type: 'timeAttack',
    timeLimit: 12.5,
    targetTime: 10.0,
    spawn: { x: 100, y: 300, angle: 0 },
    finishLine: { a: { x: 1900, y: 200 }, b: { x: 1900, y: 400 } },
    walls: [
      // Corredor veloz em zigue-zague suave
      { a: { x: 50, y: 200 }, b: { x: 600, y: 200 } },
      { a: { x: 600, y: 200 }, b: { x: 900, y: 100 } },
      { a: { x: 900, y: 100 }, b: { x: 1400, y: 100 } },
      { a: { x: 1400, y: 100 }, b: { x: 1950, y: 200 } },

      { a: { x: 50, y: 400 }, b: { x: 550, y: 400 } },
      { a: { x: 550, y: 400 }, b: { x: 850, y: 300 } },
      { a: { x: 850, y: 300 }, b: { x: 1350, y: 300 } },
      { a: { x: 1350, y: 300 }, b: { x: 1950, y: 400 } },

      { a: { x: 50, y: 200 }, b: { x: 50, y: 400 } }
    ]
  },

  // 5. Fase 5: Escolha de Trajetória / Atalhos (LEVEL-011)
  {
    id: 'track-05-bifurcation',
    title: '05 · Bifurcação Quântica',
    subtitle: 'Caminho superior seguro ou atalho estreito inferior',
    type: 'linear',
    targetTime: 14.5,
    spawn: { x: 100, y: 500, angle: 0 },
    finishLine: { a: { x: 2300, y: 400 }, b: { x: 2300, y: 600 } },
    walls: [
      // Limite externo superior (caminho seguro longo)
      { a: { x: 50, y: 400 }, b: { x: 600, y: 400 } },
      { a: { x: 600, y: 400 }, b: { x: 1000, y: 150 } },
      { a: { x: 1000, y: 150 }, b: { x: 1600, y: 150 } },
      { a: { x: 1600, y: 150 }, b: { x: 2000, y: 400 } },
      { a: { x: 2000, y: 400 }, b: { x: 2350, y: 400 } },

      // Ilha central que divide os caminhos
      { a: { x: 750, y: 480 }, b: { x: 1100, y: 320 } },
      { a: { x: 1100, y: 320 }, b: { x: 1500, y: 320 } },
      { a: { x: 1500, y: 320 }, b: { x: 1850, y: 480 } },
      { a: { x: 1850, y: 480 }, b: { x: 1500, y: 580 } },
      { a: { x: 1500, y: 580 }, b: { x: 1100, y: 580 } },
      { a: { x: 1100, y: 580 }, b: { x: 750, y: 480 } },

      // Limite externo inferior (atalho estreito com paredes raspantes)
      { a: { x: 50, y: 600 }, b: { x: 600, y: 600 } },
      { a: { x: 600, y: 600 }, b: { x: 1000, y: 680 } },
      { a: { x: 1000, y: 680 }, b: { x: 1600, y: 680 } },
      { a: { x: 1600, y: 680 }, b: { x: 2000, y: 600 } },
      { a: { x: 2000, y: 600 }, b: { x: 2350, y: 600 } },

      { a: { x: 50, y: 400 }, b: { x: 50, y: 600 } }
    ]
  },

  // 6. Fase 6: Introdução à Gravidade e Vento Ambiental (MECH-001, MECH-002, M3-03)
  {
    id: 'track-06-gravity',
    title: '06 · Poço Gravitacional',
    subtitle: 'Vença a gravidade usando correntes de vento ascendente',
    type: 'linear',
    targetTime: 16.0,
    gravity: 340, // MECH-001: Puxa para baixo continuamente
    spawn: { x: 100, y: 280, angle: 0 },
    finishLine: { a: { x: 2300, y: 250 }, b: { x: 2300, y: 450 } },
    zones: [
      // MECH-002: Correntes de vento empurrando para cima
      {
        id: 'wind-01',
        type: 'wind',
        bounds: { x: 550, y: 250, width: 350, height: 450 },
        force: { x: 0, y: -540 }
      },
      {
        id: 'wind-02',
        type: 'wind',
        bounds: { x: 1350, y: 250, width: 350, height: 450 },
        force: { x: 0, y: -540 }
      }
    ],
    walls: [
      // Parede superior (desce e sobe)
      { a: { x: 50, y: 200 }, b: { x: 500, y: 200 } },
      { a: { x: 500, y: 200 }, b: { x: 900, y: 450 } },
      { a: { x: 900, y: 450 }, b: { x: 1300, y: 200 } },
      { a: { x: 1300, y: 200 }, b: { x: 1700, y: 450 } },
      { a: { x: 1700, y: 450 }, b: { x: 2300, y: 250 } },

      // Parede inferior (fundo do abismo)
      { a: { x: 50, y: 360 }, b: { x: 500, y: 360 } },
      { a: { x: 500, y: 360 }, b: { x: 900, y: 650 } },
      { a: { x: 900, y: 650 }, b: { x: 1300, y: 400 } },
      { a: { x: 1300, y: 400 }, b: { x: 1700, y: 650 } },
      { a: { x: 1700, y: 650 }, b: { x: 2300, y: 450 } },

      { a: { x: 50, y: 200 }, b: { x: 50, y: 360 } }
    ]
  },

  // 7. Fase 7: Domínio de Zonas Turbo e Vácuo de Propulsão (MECH-003, MECH-004, M3-03)
  {
    id: 'track-07-turbo',
    title: '07 · Corredor Hiper-Turbo',
    subtitle: 'Domine as faixas de aceleração turbo e as zonas de vácuo',
    type: 'linear',
    targetTime: 12.0,
    spawn: { x: 100, y: 300, angle: 0 },
    finishLine: { a: { x: 2400, y: 200 }, b: { x: 2400, y: 400 } },
    zones: [
      // MECH-003: Faixa turbo 1
      {
        id: 'turbo-01',
        type: 'turbo',
        bounds: { x: 400, y: 210, width: 250, height: 180 },
        force: 800,
        direction: { x: 1, y: 0 }
      },
      // MECH-004: Zona de vácuo (propulsão nula, apenas inércia pura)
      {
        id: 'vacuum-01',
        type: 'zeroThrust',
        bounds: { x: 950, y: 210, width: 350, height: 180 }
      },
      // MECH-003: Faixa turbo 2
      {
        id: 'turbo-02',
        type: 'turbo',
        bounds: { x: 1550, y: 210, width: 250, height: 180 },
        force: 900,
        direction: { x: 1, y: 0 }
      }
    ],
    walls: [
      // Parede superior reta com leve afunilamento
      { a: { x: 50, y: 200 }, b: { x: 800, y: 200 } },
      { a: { x: 800, y: 200 }, b: { x: 1400, y: 180 } },
      { a: { x: 1400, y: 180 }, b: { x: 2000, y: 200 } },
      { a: { x: 2000, y: 200 }, b: { x: 2400, y: 200 } },

      // Parede inferior paralela
      { a: { x: 50, y: 400 }, b: { x: 800, y: 400 } },
      { a: { x: 800, y: 400 }, b: { x: 1400, y: 420 } },
      { a: { x: 1400, y: 420 }, b: { x: 2000, y: 400 } },
      { a: { x: 2000, y: 400 }, b: { x: 2400, y: 400 } },

      { a: { x: 50, y: 200 }, b: { x: 50, y: 400 } }
    ]
  },

  // 8. Fase 8: Circuito Nexo Quântico (Combinação Integrada)
  {
    id: 'track-08-nexus',
    title: '08 · Nexo Quântico',
    subtitle: 'Circuito integrado com gravidade, vento e turbo (2 voltas)',
    type: 'circuit',
    lapsRequired: 2,
    targetTime: 26.0,
    gravity: 200,
    spawn: { x: 450, y: 180, angle: 0 },
    finishLine: { a: { x: 550, y: 80 }, b: { x: 550, y: 280 } },
    checkpoints: [
      { id: 'cp-nexus-1', a: { x: 550, y: 750 }, b: { x: 550, y: 950 } }
    ],
    zones: [
      // Corrente ascendente na subida esquerda
      {
        id: 'nexus-wind-up',
        type: 'wind',
        bounds: { x: 150, y: 400, width: 220, height: 400 },
        force: { x: 0, y: -450 }
      },
      // Turbo na reta superior
      {
        id: 'nexus-turbo-top',
        type: 'turbo',
        bounds: { x: 650, y: 100, width: 260, height: 160 },
        force: 750,
        direction: { x: 1, y: 0 }
      }
    ],
    walls: [
      // Perímetro externo
      { a: { x: 300, y: 80 }, b: { x: 950, y: 80 } },
      { a: { x: 950, y: 80 }, b: { x: 1250, y: 380 } },
      { a: { x: 1250, y: 380 }, b: { x: 1250, y: 650 } },
      { a: { x: 1250, y: 650 }, b: { x: 950, y: 950 } },
      { a: { x: 950, y: 950 }, b: { x: 300, y: 950 } },
      { a: { x: 300, y: 950 }, b: { x: 80, y: 650 } },
      { a: { x: 80, y: 650 }, b: { x: 80, y: 380 } },
      { a: { x: 80, y: 380 }, b: { x: 300, y: 80 } },

      // Ilha central
      { a: { x: 420, y: 280 }, b: { x: 830, y: 280 } },
      { a: { x: 830, y: 280 }, b: { x: 1050, y: 450 } },
      { a: { x: 1050, y: 450 }, b: { x: 1050, y: 580 } },
      { a: { x: 1050, y: 580 }, b: { x: 830, y: 750 } },
      { a: { x: 830, y: 750 }, b: { x: 420, y: 750 } },
      { a: { x: 420, y: 750 }, b: { x: 260, y: 580 } },
      { a: { x: 260, y: 580 }, b: { x: 260, y: 450 } },
      { a: { x: 260, y: 450 }, b: { x: 420, y: 280 } }
    ]
  },

  // 9. Fase 9: Terminal Cripto — Chaves e Portas de Segurança (M4-02, MECH-013)
  {
    id: 'track-09-cipher',
    title: '09 · Terminal Cripto',
    subtitle: 'Colete a chave de segurança para abrir a barreira laser',
    type: 'linear',
    targetTime: 18.0,
    spawn: { x: 100, y: 350, angle: 0 },
    finishLine: { a: { x: 2350, y: 280 }, b: { x: 2350, y: 450 } },
    keys: [
      { id: 'key-alpha', x: 1250, y: 175, radius: 18, color: '#00ffcc', label: 'Chave Alfa' }
    ],
    doors: [
      {
        id: 'door-alpha',
        keyId: 'key-alpha',
        wall: { a: { x: 1600, y: 280 }, b: { x: 1600, y: 450 } },
        color: '#ff0055'
      }
    ],
    walls: [
      // Parede superior com desvio para a câmara da chave
      { a: { x: 50, y: 200 }, b: { x: 750, y: 200 } },
      { a: { x: 750, y: 200 }, b: { x: 1050, y: 100 } },
      { a: { x: 1050, y: 100 }, b: { x: 1450, y: 100 } },
      { a: { x: 1450, y: 100 }, b: { x: 1750, y: 280 } },
      { a: { x: 1750, y: 280 }, b: { x: 2400, y: 280 } },

      // Parede divisória interna que isola a chave
      { a: { x: 750, y: 280 }, b: { x: 1050, y: 250 } },
      { a: { x: 1050, y: 250 }, b: { x: 1450, y: 250 } },
      { a: { x: 1450, y: 250 }, b: { x: 1600, y: 280 } },

      // Parede inferior do corredor principal
      { a: { x: 50, y: 450 }, b: { x: 2400, y: 450 } },

      // Paredes de fechamento
      { a: { x: 50, y: 200 }, b: { x: 50, y: 450 } },
      { a: { x: 2400, y: 280 }, b: { x: 2400, y: 450 } }
    ]
  },

  // 10. Fase 10: Setor de Arquivos — Colecionáveis de Dados (M4-02, MECH-006, MECH-015, NARR-006)
  {
    id: 'track-10-fragments',
    title: '10 · Setor de Arquivos',
    subtitle: 'Recupere todos os 4 fragmentos de dados para abrir o portal',
    type: 'collect',
    targetTime: 22.0,
    requireAllCollectibles: true,
    spawn: { x: 100, y: 260, angle: 0 },
    finishLine: { a: { x: 2450, y: 200 }, b: { x: 2450, y: 430 } },
    collectibles: [
      { id: 'frag-1', x: 600, y: 230, radius: 16, label: 'Kernel Log #1' },
      { id: 'frag-2', x: 1100, y: 460, radius: 16, label: 'Kernel Log #2' },
      { id: 'frag-3', x: 1600, y: 230, radius: 16, label: 'Kernel Log #3' },
      { id: 'frag-4', x: 2100, y: 460, radius: 16, label: 'Kernel Log #4' }
    ],
    walls: [
      // Corredor ondulado técnico com curvas acentuadas
      { a: { x: 50, y: 150 }, b: { x: 600, y: 150 } },
      { a: { x: 600, y: 150 }, b: { x: 1100, y: 320 } },
      { a: { x: 1100, y: 320 }, b: { x: 1600, y: 150 } },
      { a: { x: 1600, y: 150 }, b: { x: 2100, y: 320 } },
      { a: { x: 2100, y: 320 }, b: { x: 2500, y: 200 } },

      { a: { x: 50, y: 380 }, b: { x: 600, y: 380 } },
      { a: { x: 600, y: 380 }, b: { x: 1100, y: 550 } },
      { a: { x: 1100, y: 550 }, b: { x: 1600, y: 380 } },
      { a: { x: 1600, y: 380 }, b: { x: 2100, y: 550 } },
      { a: { x: 2100, y: 550 }, b: { x: 2500, y: 430 } },

      { a: { x: 50, y: 150 }, b: { x: 50, y: 380 } },
      { a: { x: 2500, y: 200 }, b: { x: 2500, y: 430 } }
    ]
  },

  // 11. Fase 11: A Singularidade — Circuito Misto Completo (M4-01, MECH-001, MECH-002, MECH-003, MECH-013)
  {
    id: 'track-11-singularity',
    title: '11 · A Singularidade',
    subtitle: 'Circuito gravitacional com vento e chave de autorização',
    type: 'circuit',
    lapsRequired: 2,
    targetTime: 25.0,
    gravity: 320,
    spawn: { x: 600, y: 200, angle: 0 },
    finishLine: { a: { x: 600, y: 100 }, b: { x: 600, y: 280 } },
    checkpoints: [
      { id: 'cp-singularity-1', a: { x: 600, y: 780 }, b: { x: 600, y: 950 } }
    ],
    keys: [
      { id: 'key-singularity', x: 950, y: 550, radius: 18, color: '#ffea00', label: 'Chave Quântica' }
    ],
    zones: [
      {
        id: 'turbo-top-11',
        type: 'turbo',
        bounds: { x: 450, y: 100, width: 300, height: 180 },
        direction: { x: 1, y: 0 },
        force: 450
      },
      {
        id: 'wind-bottom-11',
        type: 'wind',
        bounds: { x: 300, y: 700, width: 600, height: 250 },
        force: { x: 0, y: -450 }
      }
    ],
    walls: [
      // Parede externa octogonal
      { a: { x: 300, y: 100 }, b: { x: 900, y: 100 } },
      { a: { x: 900, y: 100 }, b: { x: 1150, y: 350 } },
      { a: { x: 1150, y: 350 }, b: { x: 1150, y: 750 } },
      { a: { x: 1150, y: 750 }, b: { x: 900, y: 950 } },
      { a: { x: 900, y: 950 }, b: { x: 300, y: 950 } },
      { a: { x: 300, y: 950 }, b: { x: 50, y: 750 } },
      { a: { x: 50, y: 750 }, b: { x: 50, y: 350 } },
      { a: { x: 50, y: 350 }, b: { x: 300, y: 100 } },

      // Parede interna (ilha central)
      { a: { x: 400, y: 280 }, b: { x: 800, y: 280 } },
      { a: { x: 800, y: 280 }, b: { x: 950, y: 420 } },
      { a: { x: 950, y: 420 }, b: { x: 950, y: 680 } },
      { a: { x: 950, y: 680 }, b: { x: 800, y: 780 } },
      { a: { x: 800, y: 780 }, b: { x: 400, y: 780 } },
      { a: { x: 400, y: 780 }, b: { x: 250, y: 680 } },
      { a: { x: 250, y: 680 }, b: { x: 250, y: 420 } },
      { a: { x: 250, y: 420 }, b: { x: 400, y: 280 } }
    ]
  }
];

export function getTrackById(id) {
  return TRACKS.find((t) => t.id === id) || null;
}

export function getNextTrackId(currentId) {
  const index = TRACKS.findIndex((t) => t.id === currentId);
  if (index !== -1 && index + 1 < TRACKS.length) {
    return TRACKS[index + 1].id;
  }
  return null;
}

/**
 * Validador de consistência de pistas (LEVEL-012, MECH-010).
 * Rejeita IDs duplicados, paredes malformadas, pontos de spawn inválidos e zonas incorretas.
 */
export function validateTracks(tracks = TRACKS) {
  const seenIds = new Set();
  const errors = [];

  for (const track of tracks) {
    if (!track.id || typeof track.id !== 'string') {
      errors.push(`Pista sem ID válido: ${JSON.stringify(track)}`);
      continue;
    }
    if (seenIds.has(track.id)) {
      errors.push(`ID de pista duplicado encontrado: ${track.id}`);
    }
    seenIds.add(track.id);

    if (!track.spawn || typeof track.spawn.x !== 'number' || typeof track.spawn.y !== 'number') {
      errors.push(`Spawn inválido na pista ${track.id}`);
    }

    if (!track.finishLine || !track.finishLine.a || !track.finishLine.b) {
      errors.push(`Finish line ausente ou inválida na pista ${track.id}`);
    }

    if (!Array.isArray(track.walls) || track.walls.length < 3) {
      errors.push(`Pista ${track.id} possui paredes insuficientes (mínimo 3 segmentos)`);
    } else {
      for (let i = 0; i < track.walls.length; i++) {
        const w = track.walls[i];
        if (!w.a || !w.b || typeof w.a.x !== 'number' || typeof w.a.y !== 'number' ||
            typeof w.b.x !== 'number' || typeof w.b.y !== 'number') {
          errors.push(`Parede malformada na pista ${track.id} no índice ${i}`);
        }
      }
    }

    if (track.type === 'circuit') {
      if (!track.lapsRequired || track.lapsRequired < 1) {
        errors.push(`Circuito ${track.id} deve declarar lapsRequired >= 1`);
      }
      if (!Array.isArray(track.checkpoints) || track.checkpoints.length === 0) {
        errors.push(`Circuito ${track.id} deve possuir ao menos 1 checkpoint para validação de voltas`);
      }
    }

    if (track.type === 'timeAttack') {
      if (!track.timeLimit || track.timeLimit <= 0) {
        errors.push(`Pista contra o relógio ${track.id} deve declarar timeLimit > 0`);
      }
    }

    // Validação defensiva de Zonas (MECH-010)
    if (track.zones) {
      if (!Array.isArray(track.zones)) {
        errors.push(`Pista ${track.id} possui zones declaradas que não são um array`);
      } else {
        const validZoneTypes = ['turbo', 'wind', 'zeroThrust'];
        for (const z of track.zones) {
          if (!z.id || !validZoneTypes.includes(z.type)) {
            errors.push(`Zona inválida na pista ${track.id}: ${JSON.stringify(z)}`);
          }
          if (!z.bounds || typeof z.bounds.x !== 'number' || typeof z.bounds.y !== 'number' ||
              typeof z.bounds.width !== 'number' || typeof z.bounds.height !== 'number' ||
              z.bounds.width <= 0 || z.bounds.height <= 0) {
            errors.push(`Bounds de zona inválidos na pista ${track.id} na zona ${z.id}`);
          }
        }
      }
    }

    // Validação de gravidade (MECH-001)
    if (track.gravity !== undefined) {
      if (typeof track.gravity !== 'number' && typeof track.gravity !== 'object') {
        errors.push(`Gravidade inválida na pista ${track.id}`);
      }
    }

    // Validação de colecionáveis (MECH-015, NARR-006)
    if (track.collectibles) {
      if (!Array.isArray(track.collectibles)) {
        errors.push(`Pista ${track.id} possui collectibles declarados que não são um array`);
      } else {
        for (const c of track.collectibles) {
          if (!c.id || typeof c.x !== 'number' || typeof c.y !== 'number') {
            errors.push(`Collectible inválido na pista ${track.id}: ${JSON.stringify(c)}`);
          }
        }
      }
    }

    // Validação de chaves e portas (MECH-013)
    if (track.keys) {
      if (!Array.isArray(track.keys)) {
        errors.push(`Pista ${track.id} possui keys declaradas que não são um array`);
      } else {
        for (const k of track.keys) {
          if (!k.id || typeof k.x !== 'number' || typeof k.y !== 'number') {
            errors.push(`Chave inválida na pista ${track.id}: ${JSON.stringify(k)}`);
          }
        }
      }
    }

    if (track.doors) {
      if (!Array.isArray(track.doors)) {
        errors.push(`Pista ${track.id} possui doors declaradas que não são um array`);
      } else {
        const keyIds = new Set((track.keys || []).map((k) => k.id));
        for (const d of track.doors) {
          if (!d.id || !d.keyId || !d.wall) {
            errors.push(`Porta inválida na pista ${track.id}: ${JSON.stringify(d)}`);
          }
          if (d.keyId && !keyIds.has(d.keyId)) {
            errors.push(`Porta ${d.id} na pista ${track.id} referencia keyId inexistente: ${d.keyId}`);
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
