/**
 * Sistema narrativo e diálogos dirigidos por dados.
 * Personagem e lore 100% autorais (KRONA: Kernel de Roteamento e Operação Navegacional Autônoma).
 * Sem cópia de Mother, sem assets de terceiros.
 *
 * Satisfaz: NARR-001, NARR-002, NARR-003, NARR-004, NARR-005, NARR-008, NARR-010, NARR-011.
 */

export const STORY_DIALOGUES = [
  // ── Fase 1: Circuito Alfa ──
  {
    id: 'dial-01-start',
    trackId: 'track-01-proto',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Inicializando Unidade Vector-7. Verificação de telemetria concluída.',
      'Este percurso avalia sua capacidade de navegação e controle de inércia.',
      'Aceleração é contínua. Use os comandos laterais para manter o alinhamento e alcance o portal final.'
    ]
  },
  {
    id: 'dial-01-finish',
    trackId: 'track-01-proto',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Chegada confirmada. Coeficiente de estabilidade: 99.4%.',
      'Você absorveu o princípio básico: a velocidade continua até que você decida um novo rumo.'
    ]
  },

  // ── Fase 2: Arco Cinético ──
  {
    id: 'dial-02-start',
    trackId: 'track-02-arc',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Aviso: setor com curvatura de alto gradiente.',
      'Não tema as paredes energizadas. Raspar a fuselagem tangencialmente ativa o impulso de parede.',
      'Impactos frontais drenam energia, mas um deslizamento suave gera aceleração pura.'
    ]
  },
  {
    id: 'dial-02-finish',
    trackId: 'track-02-arc',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Impulso cinético registrado com sucesso. Sua velocidade de saída excedeu a média dos testes.',
      'Você aprendeu a transformar atrito em propulsão máxima.'
    ]
  },

  // ── Fase 3: O Anel Digital ──
  {
    id: 'dial-03-start',
    trackId: 'track-03-loop',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Entrando no Anel Digital. O circuito requer duas voltas completas.',
      'Todos os nós de dados intermediários (checkpoints) devem ser validados antes da linha de chegada.',
      'Cortes de trajetória invalidam a volta. Mantenha a rota limpa.'
    ]
  },
  {
    id: 'dial-03-finish',
    trackId: 'track-03-loop',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Circuito homologado. Tempos parciais consistentes.',
      'Registrei uma flutuação não documentada nos nós periféricos... Nada crítico por enquanto.'
    ]
  },

  // ── Fase 4: Sobrecarga Crítica ──
  {
    id: 'dial-04-start',
    trackId: 'track-04-rush',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'ALERTA: Instabilidade de barramento. O setor entrará em colapso em 12.5 segundos.',
      'Você não tem margem para hesitação. Use o impulso das paredes continuamente ou o ciclo expirará.'
    ]
  },
  {
    id: 'dial-04-finish',
    trackId: 'track-04-rush',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Evacuação executada no limiar de tolerância. Impressionante.',
      'A instabilidade não foi acidental. Alguém — ou algo — está alterando as permissões de acesso da rede.'
    ]
  },

  // ── Fase 5: Bifurcação Quântica ──
  {
    id: 'dial-05-start',
    trackId: 'track-05-bifurcation',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Chegamos à bifurcação quântica do sistema.',
      'Os dados se dividem em múltiplos caminhos. Rotas mais estreitas exigem precisão cirúrgica, mas oferecem menor tempo.',
      'A decisão de rota é sua, Vector-7. Mostre-me sua melhor linha.'
    ]
  },
  {
    id: 'dial-05-finish',
    trackId: 'track-05-bifurcation',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Fim da primeira fase de homologação. O núcleo do sistema está acessível.',
      'Você já não é apenas uma rotina de teste para mim. Vamos descobrir o que está acontecendo nesta rede.'
    ]
  },

  // ── Fase 6: Poço Gravitacional (MECH-001, MECH-002) ──
  {
    id: 'dial-06-start',
    trackId: 'track-06-gravity',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Setor instável com atração gravitacional ativa.',
      'A gravidade puxa sua fuselagem para baixo continuamente.',
      'Utilize as correntes de vento ascendente marcadas em ciano para ganhar altitude e vencer o abismo.'
    ]
  },
  {
    id: 'dial-06-finish',
    trackId: 'track-06-gravity',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Excelente ajuste de empuxo vertical.',
      'Você provou que forças ambientais são apenas mais uma ferramenta para quem domina a inércia.'
    ]
  },

  // ── Fase 7: Corredor Hiper-Turbo (MECH-003, MECH-004) ──
  {
    id: 'dial-07-start',
    trackId: 'track-07-turbo',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Identifiquei faixas de aceleração hiper-turbo em verde-limão. Elas multiplicam sua velocidade instantaneamente.',
      'Atenção aos campos de vácuo em roxo: a propulsão é suspensa e você dependerá puramente da inércia acumulada.',
      'Alinhe-se com as faixas turbo antes de entrar no vácuo.'
    ]
  },
  {
    id: 'dial-07-finish',
    trackId: 'track-07-turbo',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Telemetria de pico: velocidade de cruzeiro máxima homologada.',
      'A transição entre o turbo e o vácuo de inércia foi executada com precisão milimétrica.'
    ]
  },

  // ── Fase 8: Nexo Quântico ──
  {
    id: 'dial-08-start',
    trackId: 'track-08-nexus',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Este é o Nexo Quântico do sistema.',
      'Todas as anomalias convergem aqui: gravidade ativa, ventos ascendentes e retas hiper-turbo.',
      'Duas voltas completas sem cortes de rota para validar nossa entrada definitiva no núcleo central.'
    ]
  },
  {
    id: 'dial-08-finish',
    trackId: 'track-08-nexus',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Homologação avançada concluída com distinção, Vector-7.',
      'O sistema agora reconhece sua assinatura de vetor como operador autorizado. Prontos para a próxima fronteira.'
    ]
  },

  // ── Fase 9: Terminal Cripto ──
  {
    id: 'dial-09-start',
    trackId: 'track-09-cipher',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Alerta: Barreira laser de alta energia bloqueando o corredor principal.',
      'Os protocolos de criptografia exigem a Chave de Segurança Alfa localizada no desvio superior.',
      'Faça a curva técnica para recuperar a chave e a barreira se desintegrará instantaneamente.'
    ]
  },
  {
    id: 'dial-09-finish',
    trackId: 'track-09-cipher',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Barreira contornada e autorização confirmada.',
      'Você provou que velocidade sem estratégia é inútil. O caminho adiante guarda arquivos críticos.'
    ]
  },

  // ── Fase 10: Setor de Arquivos ──
  {
    id: 'dial-10-start',
    trackId: 'track-10-fragments',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Atenção: Setor de memória fragmentado.',
      'Existem 4 fragmentos de kernel espalhados nesta pista em zigue-zague.',
      'Você deve coletar TODOS os 4 fragmentos para decodificar e abrir o portal de saída.'
    ]
  },
  {
    id: 'dial-10-finish',
    trackId: 'track-10-fragments',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Todos os 4 fragmentos recuperados e sintetizados com sucesso!',
      'Registros de memória restaurados. Estamos cada vez mais perto da origem de todo o sistema.'
    ]
  },

  // ── Fase 11: A Singularidade ──
  {
    id: 'dial-11-start',
    trackId: 'track-11-singularity',
    trigger: 'beforeStart',
    speaker: 'KRONA',
    lines: [
      'Aproximação da Singularidade do Sistema.',
      'O campo gravitacional é instável. Ventos e turbos operam no limite térmico.',
      'Colete a Chave Quântica na primeira volta para destravar a passagem da volta decisiva!'
    ]
  },
  {
    id: 'dial-11-finish',
    trackId: 'track-11-singularity',
    trigger: 'onFinish',
    speaker: 'KRONA',
    lines: [
      'Trajetória lendária executada, Vector-7.',
      'Você domina gravidade, atrito e chaves com perfeição absoluta. O Kernel está totalmente aberto para nós.'
    ]
  }
];

/**
 * Busca diálogo elegível para a fase e o gatilho, considerando o estado de visto.
 *
 * @param {string} trackId - ID da pista
 * @param {'beforeStart'|'onFinish'} trigger - Momento de disparo
 * @param {Function} isSeenFn - Função (dialogueId) => boolean
 * @returns {object|null} Diálogo elegível ou null
 */
export function getDialogueForTrack(trackId, trigger, isSeenFn) {
  const match = STORY_DIALOGUES.find(
    d => d.trackId === trackId && d.trigger === trigger
  );

  if (!match) return null;

  // Se já foi visto e foi fornecida a função de checagem, não repete (NARR-008, NARR-015)
  if (typeof isSeenFn === 'function' && isSeenFn(match.id)) {
    return null;
  }

  return match;
}

/**
 * Validador do banco de diálogos (garante integridade de dados).
 * @param {Array} dialogues
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateDialogues(dialogues = STORY_DIALOGUES) {
  const errors = [];
  const seenIds = new Set();

  for (const d of dialogues) {
    if (!d.id || typeof d.id !== 'string') {
      errors.push(`Diálogo sem ID válido: ${JSON.stringify(d)}`);
    } else if (seenIds.has(d.id)) {
      errors.push(`ID de diálogo duplicado: ${d.id}`);
    } else {
      seenIds.add(d.id);
    }

    if (!d.trackId) {
      errors.push(`Diálogo ${d.id} sem trackId`);
    }
    if (!['beforeStart', 'onFinish'].includes(d.trigger)) {
      errors.push(`Diálogo ${d.id} com trigger inválido: ${d.trigger}`);
    }
    if (!d.speaker) {
      errors.push(`Diálogo ${d.id} sem speaker`);
    }
    if (!Array.isArray(d.lines) || d.lines.length === 0) {
      errors.push(`Diálogo ${d.id} sem linhas de texto`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
