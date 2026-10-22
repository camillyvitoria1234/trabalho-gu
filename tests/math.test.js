import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  vec2,
  vec2Set,
  vec2Copy,
  vec2Add,
  vec2Sub,
  vec2Scale,
  vec2Dot,
  vec2Cross,
  vec2LengthSq,
  vec2Length,
  vec2Normalize,
  clamp,
  lerp,
  normalizeAngle,
  closestPointOnSegment
} from '../src/core/math.js';

describe('Math 2D Vector Operations', () => {
  it('creates and sets vectors correctly', () => {
    const v = vec2(3, 4);
    assert.equal(v.x, 3);
    assert.equal(v.y, 4);

    vec2Set(v, 10, 20);
    assert.equal(v.x, 10);
    assert.equal(v.y, 20);

    const v2 = vec2();
    vec2Copy(v2, v);
    assert.equal(v2.x, 10);
    assert.equal(v2.y, 20);
  });

  it('adds and subtracts vectors', () => {
    const out = vec2();
    vec2Add(out, vec2(1, 2), vec2(3, 4));
    assert.equal(out.x, 4);
    assert.equal(out.y, 6);

    vec2Sub(out, vec2(5, 7), vec2(2, 3));
    assert.equal(out.x, 3);
    assert.equal(out.y, 4);
  });

  it('scales and measures lengths', () => {
    const out = vec2();
    vec2Scale(out, vec2(3, 4), 2);
    assert.equal(out.x, 6);
    assert.equal(out.y, 8);

    assert.equal(vec2LengthSq(vec2(3, 4)), 25);
    assert.equal(vec2Length(vec2(3, 4)), 5);

    vec2Normalize(out, vec2(0, 10));
    assert.equal(out.x, 0);
    assert.equal(out.y, 1);
  });

  it('calculates dot and cross products', () => {
    assert.equal(vec2Dot(vec2(1, 0), vec2(0, 1)), 0); // perpendicular
    assert.equal(vec2Dot(vec2(2, 3), vec2(4, 5)), 2 * 4 + 3 * 5); // 23
    assert.equal(vec2Cross(vec2(1, 0), vec2(0, 1)), 1);
  });

  it('clamps and lerps values', () => {
    assert.equal(clamp(5, 0, 10), 5);
    assert.equal(clamp(-5, 0, 10), 0);
    assert.equal(clamp(15, 0, 10), 10);

    assert.equal(lerp(0, 100, 0.5), 50);
    assert.equal(lerp(10, 20, 0.1), 11);
  });

  it('normalizes angles within [-PI, PI]', () => {
    assert.ok(Math.abs(normalizeAngle(0)) < 1e-6);
    assert.ok(Math.abs(normalizeAngle(Math.PI * 3) - Math.PI) < 1e-6);
    assert.ok(Math.abs(normalizeAngle(-Math.PI * 3) - (-Math.PI)) < 1e-6);
  });

  it('calculates closest point on line segment correctly', () => {
    const a = vec2(0, 0);
    const b = vec2(100, 0);

    // Ponto acima do meio do segmento
    const p1 = vec2(50, 10);
    const res1 = closestPointOnSegment(p1, a, b);
    assert.equal(res1.closest.x, 50);
    assert.equal(res1.closest.y, 0);
    assert.equal(res1.t, 0.5);
    assert.equal(res1.distSq, 100);

    // Ponto antes do início do segmento (deve clamp no ponto A)
    const p2 = vec2(-20, 10);
    const res2 = closestPointOnSegment(p2, a, b);
    assert.equal(res2.closest.x, 0);
    assert.equal(res2.closest.y, 0);
    assert.equal(res2.t, 0);

    // Ponto depois do fim do segmento (deve clamp no ponto B)
    const p3 = vec2(120, 5);
    const res3 = closestPointOnSegment(p3, a, b);
    assert.equal(res3.closest.x, 100);
    assert.equal(res3.closest.y, 0);
    assert.equal(res3.t, 1);
  });
});
