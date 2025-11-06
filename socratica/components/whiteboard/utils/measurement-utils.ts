/**
 * Measurement Utilities
 * 
 * Utility functions for calculating angles and distances on the canvas.
 */

/**
 * Calculate the angle between three points in degrees
 * @param p1 First point (vertex)
 * @param p2 Second point (vertex - angle is measured here)
 * @param p3 Third point
 * @returns Angle in degrees (0-180)
 */
export function calculateAngle(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  // Vectors from p2 to p1 and p2 to p3
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  // Calculate dot product
  const dotProduct = v1.x * v2.x + v1.y * v2.y;

  // Calculate magnitudes
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  // Avoid division by zero
  if (mag1 === 0 || mag2 === 0) return 0;

  // Calculate angle in radians
  const cosAngle = dotProduct / (mag1 * mag2);
  const clampedCos = Math.max(-1, Math.min(1, cosAngle)); // Clamp to avoid NaN
  const angleRad = Math.acos(clampedCos);

  // Convert to degrees
  return (angleRad * 180) / Math.PI;
}

/**
 * Calculate the distance between two points
 * @param p1 First point
 * @param p2 Second point
 * @returns Distance in pixels
 */
export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Format angle value for display
 * @param angle Angle in degrees
 * @returns Formatted string with unit
 */
export function formatAngle(angle: number): string {
  return `${angle.toFixed(1)}°`;
}

/**
 * Format distance value for display
 * @param distance Distance in pixels
 * @returns Formatted string with unit
 */
export function formatDistance(distance: number): string {
  return `${distance.toFixed(1)} px`;
}


