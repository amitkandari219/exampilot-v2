/**
 * Piecewise linear interpolation across sorted anchor points.
 * points: [[input, output], ...] sorted by input ascending.
 */
export function piecewiseLerp(value: number, points: [number, number][]): number {
  if (value <= points[0][0]) return points[0][1];
  if (value >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 1; i < points.length; i++) {
    if (value <= points[i][0]) {
      const t = (value - points[i - 1][0]) / (points[i][0] - points[i - 1][0]);
      return points[i - 1][1] + t * (points[i][1] - points[i - 1][1]);
    }
  }
  return points[points.length - 1][1];
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
