/**
 * Gerenciador de entrada para teclado e multitoque (Pointer Events).
 * Satisfaz: CTRL-001, CTRL-002, CTRL-004, CTRL-005, CTRL-007, CTRL-008, CTRL-009.
 */

export class InputManager {
  constructor(options = {}) {
    this.targetWindow = options.window || (typeof window !== 'undefined' ? window : null);
    this.leftTouchEl = options.leftTouchEl || null;
    this.rightTouchEl = options.rightTouchEl || null;

    // Estado interno
    this.keyLeft = false;
    this.keyRight = false;
    this.pointersLeft = new Set();
    this.pointersRight = new Set();

    // Comandos de ação (consumíveis)
    this.restartRequested = false;
    this.pauseRequested = false;
    this.debugToggleRequested = false;

    // Bindings para limpeza de listeners
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
    this._onBlur = this.reset.bind(this);
    this._onVisibilityChange = this._handleVisibilityChange.bind(this);

    this._onLeftPointerDown = (e) => this._addPointer(this.pointersLeft, e);
    this._onLeftPointerUp = (e) => this._removePointer(this.pointersLeft, e);
    this._onRightPointerDown = (e) => this._addPointer(this.pointersRight, e);
    this._onRightPointerUp = (e) => this._removePointer(this.pointersRight, e);

    if (this.targetWindow) {
      this.attach();
    }
  }

  attach() {
    if (!this.targetWindow) return;

    this.targetWindow.addEventListener('keydown', this._onKeyDown);
    this.targetWindow.addEventListener('keyup', this._onKeyUp);
    this.targetWindow.addEventListener('blur', this._onBlur);

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }

    if (this.leftTouchEl) {
      this.leftTouchEl.addEventListener('pointerdown', this._onLeftPointerDown);
      this.leftTouchEl.addEventListener('pointerup', this._onLeftPointerUp);
      this.leftTouchEl.addEventListener('pointercancel', this._onLeftPointerUp);
    }

    if (this.rightTouchEl) {
      this.rightTouchEl.addEventListener('pointerdown', this._onRightPointerDown);
      this.rightTouchEl.addEventListener('pointerup', this._onRightPointerUp);
      this.rightTouchEl.addEventListener('pointercancel', this._onRightPointerUp);
    }
  }

  detach() {
    if (!this.targetWindow) return;

    this.targetWindow.removeEventListener('keydown', this._onKeyDown);
    this.targetWindow.removeEventListener('keyup', this._onKeyUp);
    this.targetWindow.removeEventListener('blur', this._onBlur);

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }

    if (this.leftTouchEl) {
      this.leftTouchEl.removeEventListener('pointerdown', this._onLeftPointerDown);
      this.leftTouchEl.removeEventListener('pointerup', this._onLeftPointerUp);
      this.leftTouchEl.removeEventListener('pointercancel', this._onLeftPointerUp);
    }

    if (this.rightTouchEl) {
      this.rightTouchEl.removeEventListener('pointerdown', this._onRightPointerDown);
      this.rightTouchEl.removeEventListener('pointerup', this._onRightPointerUp);
      this.rightTouchEl.removeEventListener('pointercancel', this._onRightPointerUp);
    }

    this.reset();
  }

  _addPointer(set, event) {
    if (event && event.pointerId !== undefined) {
      set.add(event.pointerId);
    }
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
  }

  _removePointer(set, event) {
    if (event && event.pointerId !== undefined) {
      set.delete(event.pointerId);
    }
  }

  _handleKeyDown(e) {
    const code = e.code;
    const key = e.key;

    // Impedir rolagem da página com setas/espaço durante jogo (CTRL-009)
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(code) || ['ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
    }

    if (code === 'KeyA' || code === 'ArrowLeft' || key === 'ArrowLeft' || key === 'a' || key === 'A') {
      this.keyLeft = true;
    }
    if (code === 'KeyD' || code === 'ArrowRight' || key === 'ArrowRight' || key === 'd' || key === 'D') {
      this.keyRight = true;
    }

    if (code === 'KeyR' || key === 'r' || key === 'R') {
      this.restartRequested = true;
    }
    if (code === 'Escape' || code === 'KeyP' || key === 'p' || key === 'P') {
      this.pauseRequested = true;
    }
    if (code === 'F3') {
      e.preventDefault();
      this.debugToggleRequested = true;
    }
  }

  _handleKeyUp(e) {
    const code = e.code;
    const key = e.key;

    if (code === 'KeyA' || code === 'ArrowLeft' || key === 'ArrowLeft' || key === 'a' || key === 'A') {
      this.keyLeft = false;
    }
    if (code === 'KeyD' || code === 'ArrowRight' || key === 'ArrowRight' || key === 'd' || key === 'D') {
      this.keyRight = false;
    }
  }

  _handleVisibilityChange() {
    if (typeof document !== 'undefined' && document.hidden) {
      this.reset();
    }
  }

  /**
   * Reseta todo o estado de entrada para neutro (CTRL-007).
   */
  reset() {
    this.keyLeft = false;
    this.keyRight = false;
    this.pointersLeft.clear();
    this.pointersRight.clear();
  }

  /**
   * Retorna a intenção de rotação horizontal normalizada (-1 = esq, +1 = dir, 0 = neutro).
   * Se ambos estiverem pressionados, o resultado é soma zero (CTRL-008).
   */
  get turn() {
    const isLeft = this.keyLeft || this.pointersLeft.size > 0;
    const isRight = this.keyRight || this.pointersRight.size > 0;

    let dir = 0;
    if (isLeft) dir -= 1;
    if (isRight) dir += 1;
    return dir;
  }

  consumeRestart() {
    const req = this.restartRequested;
    this.restartRequested = false;
    return req;
  }

  consumePause() {
    const req = this.pauseRequested;
    this.pauseRequested = false;
    return req;
  }

  consumeDebugToggle() {
    const req = this.debugToggleRequested;
    this.debugToggleRequested = false;
    return req;
  }
}
