"use client";

import { Line, Text as KonvaText } from "react-konva";

interface AxisLabelsProps {
  width: number;
  height: number;
  spacing: number;
  showLabels?: boolean;
}

/**
 * AxisLabels Component
 * 
 * Renders x-axis and y-axis labels with tick marks and numbering.
 * Provides coordinate system annotations for graphing.
 */
export default function AxisLabels({
  width,
  height,
  spacing,
  showLabels = true,
}: AxisLabelsProps) {
  if (!showLabels) return [];

  const elements: React.ReactNode[] = [];
  const fontSize = 12;
  const tickLength = 5;
  const axisColor = "#9ca3af"; // gray-400
  const labelColor = "#6b7280"; // gray-500

  // X-axis line
  const xAxisY = height / 2;
  elements.push(
    <Line
      key="x-axis"
      points={[0, xAxisY, width, xAxisY]}
      stroke={axisColor}
      strokeWidth={2}
      listening={false}
    />
  );

  // Y-axis line
  const yAxisX = width / 2;
  elements.push(
    <Line
      key="y-axis"
      points={[yAxisX, 0, yAxisX, height]}
      stroke={axisColor}
      strokeWidth={2}
      listening={false}
    />
  );

  // X-axis ticks and labels
  const centerX = width / 2;
  for (let x = 0; x <= width; x += spacing) {
    const offset = x - centerX;
    const tickX = x;
    
    // Tick mark
    elements.push(
      <Line
        key={`x-tick-${x}`}
        points={[tickX, xAxisY - tickLength, tickX, xAxisY + tickLength]}
        stroke={axisColor}
        strokeWidth={1}
        listening={false}
      />
    );

    // Label
    if (offset !== 0 && tickX >= 0 && tickX <= width) {
      elements.push(
        <KonvaText
          key={`x-label-${x}`}
          x={tickX}
          y={xAxisY + tickLength + 2}
          text={offset.toString()}
          fontSize={fontSize}
          fill={labelColor}
          align="center"
          listening={false}
        />
      );
    }
  }

  // Y-axis ticks and labels
  const centerY = height / 2;
  for (let y = 0; y <= height; y += spacing) {
    const offset = centerY - y; // Inverted for screen coordinates
    const tickY = y;
    
    // Tick mark
    elements.push(
      <Line
        key={`y-tick-${y}`}
        points={[yAxisX - tickLength, tickY, yAxisX + tickLength, tickY]}
        stroke={axisColor}
        strokeWidth={1}
        listening={false}
      />
    );

    // Label
    if (offset !== 0 && tickY >= 0 && tickY <= height) {
      elements.push(
        <KonvaText
          key={`y-label-${y}`}
          x={yAxisX - tickLength - 2}
          y={tickY}
          text={offset.toString()}
          fontSize={fontSize}
          fill={labelColor}
          align="right"
          verticalAlign="middle"
          listening={false}
        />
      );
    }
  }

  // Axis labels (X and Y)
  elements.push(
    <KonvaText
      key="x-axis-label"
      x={width - 20}
      y={xAxisY + tickLength + fontSize + 2}
      text="x"
      fontSize={fontSize + 2}
      fill={labelColor}
      fontStyle="italic"
      listening={false}
    />
  );

  elements.push(
    <KonvaText
      key="y-axis-label"
      x={yAxisX - tickLength - fontSize - 2}
      y={20}
      text="y"
      fontSize={fontSize + 2}
      fill={labelColor}
      fontStyle="italic"
      listening={false}
    />
  );

  return elements;
}

