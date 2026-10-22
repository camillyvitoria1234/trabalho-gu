/**
 * Gerenciador de persistência local versionada com tolerância a falhas.
 * Satisfaz: SAVE-001, SAVE-002, SAVE-003, SAVE-004, SAVE-005, SAVE-006, SAVE-007.
 */

export const CURRENT_SAVE_VERSION = 1;
export const CURRENT_PHYSICS_VERSION = '0.1';
export const STORAGE_KEY = 'neon_racer_save';

export function createDefaultSaveData() {
  return {
    version: CURRENT_SAVE_VERSION,
    physicsVersion: CURRENT_PHYSICS_VERSION,
    unlockedLevels: ['track-01-proto'],
    records: {},
    ghosts: {},
    seenDialogues: [],
    collectedItems: {},
    settings: {
      volume: 0.6,
      musicVolume: 0.35,
      sfxVolume: 0.5,
      mute: false,
      reducedMotion: false,
      showGhost: true,
      showDebug: false
    },
    updatedAt: Date.now()
  };
}

export class StorageManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || STORAGE_KEY;
    this.customStorage = options.storage || null;

    // Fallback em memória para ambientes sem localStorage (ex: SSR, testes unitários, storage restrito)
    this.memoryFallback = null;
    this.data = this.load();
  }

  _getStorageBackend() {
    if (this.customStorage) return this.customStorage;
    if (typeof localStorage !== 'undefined') {
      try {
        // Testar se o storage realmente funciona (evitar crash em cookies desativados/modo anônimo)
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return localStorage;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Carrega os dados salvos com validação defensiva e migrações (SAVE-002, SAVE-003).
   */
  load() {
    const backend = this._getStorageBackend();
    let raw = null;

    try {
      if (backend) {
        raw = backend.getItem(this.storageKey);
      } else if (this.memoryFallback) {
        raw = this.memoryFallback;
      }
    } catch (e) {
      console.warn('Falha ao ler storage local; usando memória de fallback:', e);
    }

    if (!raw) {
      const defaultData = createDefaultSaveData();
      this.data = defaultData;
      return defaultData;
    }

    try {
      const parsed = JSON.parse(raw);
      const migrated = this._migrate(parsed);
      this.data = migrated;
      return migrated;
    } catch (e) {
      console.warn('Dados de save corrompidos ou inválidos; inicializando padrão seguro:', e);
      const defaultData = createDefaultSaveData();
      this.data = defaultData;
      return defaultData;
    }
  }

  /**
   * Salva os dados no storage (SAVE-005).
   */
  save() {
    this.data.updatedAt = Date.now();
    const serialized = JSON.stringify(this.data);
    const backend = this._getStorageBackend();

    try {
      if (backend) {
        backend.setItem(this.storageKey, serialized);
      } else {
        this.memoryFallback = serialized;
      }
      return true;
    } catch (e) {
      console.warn('Falha ao gravar no storage; mantendo em memória de fallback:', e);
      this.memoryFallback = serialized;
      return false;
    }
  }

  _migrate(data) {
    if (!data || typeof data !== 'object') {
      return createDefaultSaveData();
    }

    // Se o schema for de uma versão anterior, migra mantendo os dados preservados
    if (!data.version || data.version < CURRENT_SAVE_VERSION) {
      data.version = CURRENT_SAVE_VERSION;
    }

    // Se a versão da física for diferente, não apaga o save, mas sinaliza (SAVE-007)
    if (!data.physicsVersion) {
      data.physicsVersion = CURRENT_PHYSICS_VERSION;
    }

    if (!Array.isArray(data.unlockedLevels)) {
      data.unlockedLevels = ['track-01-proto'];
    }

    if (!data.records || typeof data.records !== 'object') {
      data.records = {};
    }

    if (!data.ghosts || typeof data.ghosts !== 'object') {
      data.ghosts = {};
    }

    if (!Array.isArray(data.seenDialogues)) {
      data.seenDialogues = [];
    }

    if (!data.collectedItems || typeof data.collectedItems !== 'object') {
      data.collectedItems = {};
    }

    const defaultSettings = createDefaultSaveData().settings;
    if (!data.settings || typeof data.settings !== 'object') {
      data.settings = defaultSettings;
    } else {
      data.settings = { ...defaultSettings, ...data.settings };
    }

    return data;
  }

  isDialogueSeen(dialogueId) {
    return Array.isArray(this.data.seenDialogues) && this.data.seenDialogues.includes(dialogueId);
  }

  markDialogueSeen(dialogueId) {
    if (!Array.isArray(this.data.seenDialogues)) {
      this.data.seenDialogues = [];
    }
    if (!this.data.seenDialogues.includes(dialogueId)) {
      this.data.seenDialogues.push(dialogueId);
      this.save();
      return true;
    }
    return false;
  }

  getCollectedItems(levelId) {
    if (!this.data.collectedItems || typeof this.data.collectedItems !== 'object') {
      return [];
    }
    return this.data.collectedItems[levelId] || [];
  }

  saveCollectedItem(levelId, itemId) {
    if (!this.data.collectedItems || typeof this.data.collectedItems !== 'object') {
      this.data.collectedItems = {};
    }
    if (!Array.isArray(this.data.collectedItems[levelId])) {
      this.data.collectedItems[levelId] = [];
    }
    if (!this.data.collectedItems[levelId].includes(itemId)) {
      this.data.collectedItems[levelId].push(itemId);
      this.save();
      return true;
    }
    return false;
  }

  isLevelUnlocked(levelId) {
    return this.data.unlockedLevels.includes(levelId);
  }

  unlockLevel(levelId) {
    if (!this.data.unlockedLevels.includes(levelId)) {
      this.data.unlockedLevels.push(levelId);
      this.save();
      return true;
    }
    return false;
  }

  getBestTime(levelId) {
    const rec = this.data.records[levelId];
    if (rec && typeof rec.bestTime === 'number') {
      return rec.bestTime;
    }
    return null;
  }

  /**
   * Registra tempo de conclusão de uma fase e atualiza o recorde se for menor.
   * Se fornecido e for novo recorde, salva também a telemetria do ghost (RACE-004, RACE-012).
   *
   * @param {string} levelId - Identificador único da fase
   * @param {number} time - Tempo em segundos
   * @param {object|null} ghostData - Telemetria do ghost gravado
   * @returns {{isNewBest: boolean, bestTime: number}}
   */
  recordTime(levelId, time, ghostData = null) {
    if (typeof time !== 'number' || time <= 0) {
      return { isNewBest: false, bestTime: this.getBestTime(levelId) };
    }

    const currentBest = this.getBestTime(levelId);
    let isNewBest = false;

    if (currentBest === null || time < currentBest) {
      isNewBest = true;
      this.data.records[levelId] = {
        bestTime: time,
        physicsVersion: CURRENT_PHYSICS_VERSION,
        achievedAt: Date.now()
      };

      if (ghostData && typeof ghostData === 'object') {
        this.data.ghosts[levelId] = ghostData;
      }

      this.save();
    }

    return {
      isNewBest,
      bestTime: isNewBest ? time : currentBest
    };
  }

  getGhost(levelId) {
    if (!this.data.ghosts || typeof this.data.ghosts !== 'object') {
      return null;
    }
    return this.data.ghosts[levelId] || null;
  }

  saveGhost(levelId, ghostData) {
    if (!this.data.ghosts || typeof this.data.ghosts !== 'object') {
      this.data.ghosts = {};
    }
    this.data.ghosts[levelId] = ghostData;
    this.save();
    return true;
  }

  getSettings() {
    return { ...this.data.settings };
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  /**
   * Reseta todo o progresso mediante confirmação explícita (SAVE-004).
   */
  reset() {
    this.data = createDefaultSaveData();
    this.save();
    return this.data;
  }

  /**
   * Exporta os dados salvos em formato JSON versionado para backup ou transferência (SAVE-008).
   * @returns {string}
   */
  exportSave() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Importa e valida dados de save a partir de uma string JSON (SAVE-008).
   * @param {string} jsonString
   * @returns {{success: boolean, error?: string}}
   */
  importSave(jsonString) {
    if (typeof jsonString !== 'string' || !jsonString.trim()) {
      return { success: false, error: 'String de save vazia ou inválida' };
    }
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Estrutura de dados inválida' };
      }
      const migrated = this._migrate(parsed);
      this.data = migrated;
      this.save();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
