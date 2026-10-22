/**
 * Utilidades matemáticas e operações vetoriais 2D para física e colisão.
 * Funções puras e sem alocações desnecessárias.
 */

export function vec2(x = 0, y = 0) {
  return { x, y };
}

export function vec2Set(out, x, y) {
  out.x = x;
  out.y = y;
  return out;
}

export function vec2Copy(out, src) {
  out.x = src.x;
  out.y = src.y;
  return out;
}

export function vec2Add(out, a, b) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  return out;
}

export function vec2Sub(out, a, b) {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  return out;
}

export function vec2Scale(out, v, s) {
  out.x = v.x * s;
  out.y = v.y * s;
  return out;
}

export function vec2Dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

export function vec2Cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

export function vec2LengthSq(v) {
  return v.x * v.x + v.y * v.y;
}

export function vec2Length(v) {
  return Math.hypot(v.x, v.y);
}

export function vec2Normalize(out, v) {
  const len = Math.hypot(v.x, v.y);
  if (len > 1e-6) {
    out.x = v.x / len;
    out.y = v.y / len;
  } else {
    out.x = 0;
    out.y = 0;
  }
  return out;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Normaliza um ângulo para o intervalo [-PI, PI].
 */
export function normalizeAngle(angle) {
  let a = angle % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/**
 * Projeta um ponto P no segmento AB e retorna o ponto mais próximo,
 * o fator de interpolação t (clampado [0, 1]) e a distância.
 *
 * @param {Object} p - Ponto {x, y}
 * @param {Object} a - Início do segmento {x, y}
 * @param {Object} b - Fim do segmento {x, y}
 * @returns {{closest: {x: number, y: number}, t: number, distSq: number, normal: {x: number, y: number}, tangent: {x: number, y: number}, length: number}}
 */
export function closestPointOnSegment(p, a, b) {
  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const segLenSq = abX * abX + abY * abY;

  if (segLenSq < 1e-6) {
    const dX = p.x - a.x;
    const dY = p.y - a.y;
    return {
      closest: { x: a.x, y: a.y },
      t: 0,
      distSq: dX * dX + dY * dY,
      normal: { x: 0, y: 0 },
      tangent: { x: 1, y: 0 },
      length: 0
    };
  }

  const apX = p.x - a.x;
  const apY = p.y - a.y;
  const t = clamp((apX * abX + apY * abY) / segLenSq, 0, 1);

  const closestX = a.x + t * abX;
  const closestY = a.y + t * abY;
  const diffX = p.x - closestX;
  const diffY = p.y - closestY;
  const distSq = diffX * diffX + diffY * diffY;

  const segLen = Math.sqrt(segLenSq);
  const tangent = { x: abX / segLen, y: abY / segLen };
  // Normal orientada à esquerda do vetor tangente AB: (-tangent.y, tangent.x)
  const normal = { x: -tangent.y, tangent: tangent.x };

  return {
    closest: { x: closestX, y: closestY },
    t,
    distSq,
    normal: { x: -tangent.y, y: tangent.x },
    tangent,
    length: segLen
  };
}
