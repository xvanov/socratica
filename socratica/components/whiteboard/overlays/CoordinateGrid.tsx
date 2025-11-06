"use client";

import { Line } from "react-konva";

interface CoordinateGridProps {
  width: number;
  height: number;
  spacing: number;
}

/**
 * CoordinateGrid Component
 * 
 * Renders a coordinate grid overlay on the canvas for graphing.
 * Grid lines are drawn with appropriate spacing and styling.
 */
export default function CoordinateGrid({
  width,
  height,
  spacing,
}: CoordinateGridProps) {
  const lines: React.ReactNode[] = [];

  // Vertical lines
  for (let x = 0; x <= width; x += spacing) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke="#e5e7eb"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += spacing) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke="#e5e7eb"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return lines;
}
