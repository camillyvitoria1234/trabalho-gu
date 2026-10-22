import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { InputManager } from '../src/core/input.js';

describe('InputManager', () => {
  it('defaults to neutral turn', () => {
    const input = new InputManager();
    assert.equal(input.turn, 0);
  });

  it('handles left and right keyboard input', () => {
    const input = new InputManager();

    // Simula tecla 'KeyA' pressionada
    input._handleKeyDown({ code: 'KeyA', preventDefault() {} });
    assert.equal(input.turn, -1);

    // Simula tecla 'KeyD' pressionada simultaneamente (soma zero - CTRL-008)
    input._handleKeyDown({ code: 'KeyD', preventDefault() {} });
    assert.equal(input.turn, 0);

    // Solta 'KeyA', deve continuar virando para direita
    input._handleKeyUp({ code: 'KeyA' });
    assert.equal(input.turn, 1);

    // Solta 'KeyD', volta ao neutro
    input._handleKeyUp({ code: 'KeyD' });
    assert.equal(input.turn, 0);
  });

  it('handles arrow keys and prevents scroll', () => {
    const input = new InputManager();
    let prevented = false;

    input._handleKeyDown({
      code: 'ArrowLeft',
      preventDefault() {
        prevented = true;
      }
    });
    assert.equal(prevented, true);
    assert.equal(input.turn, -1);

    input._handleKeyUp({ code: 'ArrowLeft' });
    assert.equal(input.turn, 0);
  });

  it('handles pointer/multitouch events', () => {
    const input = new InputManager();

    // Dedo esquerdo
    input._addPointer(input.pointersLeft, { pointerId: 1, preventDefault() {} });
    assert.equal(input.turn, -1);

    // Dedo direito simultâneo
    input._addPointer(input.pointersRight, { pointerId: 2, preventDefault() {} });
    assert.equal(input.turn, 0);

    // Remove dedo esquerdo
    input._removePointer(input.pointersLeft, { pointerId: 1 });
    assert.equal(input.turn, 1);

    // Remove dedo direito
    input._removePointer(input.pointersRight, { pointerId: 2 });
    assert.equal(input.turn, 0);
  });

  it('resets completely on blur or visibility loss', () => {
    const input = new InputManager();
    input.keyLeft = true;
    input.keyRight = true;
    input.pointersLeft.add(1);
    input.pointersRight.add(2);

    input.reset();
    assert.equal(input.turn, 0);
    assert.equal(input.keyLeft, false);
    assert.equal(input.keyRight, false);
    assert.equal(input.pointersLeft.size, 0);
    assert.equal(input.pointersRight.size, 0);
  });

  it('consumes action triggers properly', () => {
    const input = new InputManager();
    input._handleKeyDown({ code: 'KeyR', preventDefault() {} });
    input._handleKeyDown({ code: 'Escape', preventDefault() {} });
    input._handleKeyDown({ code: 'F3', preventDefault() {} });

    assert.equal(input.consumeRestart(), true);
    assert.equal(input.consumeRestart(), false);

    assert.equal(input.consumePause(), true);
    assert.equal(input.consumePause(), false);

    assert.equal(input.consumeDebugToggle(), true);
    assert.equal(input.consumeDebugToggle(), false);
  });
});
