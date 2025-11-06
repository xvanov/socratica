"use client";

import React, { useRef, useEffect } from "react";
import { Line, Circle, Rect, Image as KonvaImage, Text as KonvaText } from "react-konva";
import {
  WhiteboardElement,
  ToolType,
  PenElementData,
  LineElementData,
  CircleElementData,
  RectangleElementData,
  PolygonElementData,
  EquationElementData,
  MeasurementElementData,
} from "@/types/whiteboard";
import Konva from "konva";
import {
  calculateAngle,
  calculateDistance,
  formatAngle,
  formatDistance,
} from "./utils/measurement-utils";

/**
 * Equation Image Component
 * 
 * Renders an equation as a Konva Image from a data URL.
 */
function EquationImage({ data }: { data: EquationElementData }) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = data.imageDataUrl;
  }, [data.imageDataUrl]);

  if (!image) return null;

  return (
    <KonvaImage
      x={data.x}
      y={data.y}
      image={image}
      listening={false}
    />
  );
}

/**
 * Hook for whiteboard drawing handlers
 */
export function useWhiteboardDrawing(
  tool: ToolType,
  color: string,
  strokeWidth: number,
  elements: WhiteboardElement[],
  onElementsChange: (elements: WhiteboardElement[]) => void,
  onEquationClick?: (x: number, y: number) => void
) {
  const isDrawing = useRef(false);
  const currentPoints = useRef<number[]>([]);
  const currentElementId = useRef<string | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const measurementPoints = useRef<number[]>([]); // For measurement tools
  
  // Use refs to always have latest values
  const elementsRef = useRef(elements);
  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const strokeWidthRef = useRef(strokeWidth);
  const onElementsChangeRef = useRef(onElementsChange);

  // Update refs when values change
  useEffect(() => {
    elementsRef.current = elements;
    toolRef.current = tool;
    colorRef.current = color;
    strokeWidthRef.current = strokeWidth;
    onElementsChangeRef.current = onElementsChange;
  }, [elements, tool, color, strokeWidth, onElementsChange]);

  // Generate unique ID for elements
  const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle mouse/touch start
  const handleStart = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    isDrawing.current = true;
    
    // Use refs for latest values
    const currentTool = toolRef.current;
    const currentColor = colorRef.current;
    const currentStrokeWidth = strokeWidthRef.current;
    const currentElements = elementsRef.current;
    const currentOnChange = onElementsChangeRef.current;

    if (currentTool === "pen") {
      currentPoints.current = [pointerPos.x, pointerPos.y];
      const newElement: WhiteboardElement = {
        id: generateId(),
        type: "pen",
        data: { points: [...currentPoints.current] } as PenElementData,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        createdAt: new Date().toISOString(),
      };
      currentElementId.current = newElement.id;
      currentOnChange([...currentElements, newElement]);
    } else if (currentTool === "line" || currentTool === "circle" || currentTool === "rectangle") {
      startPos.current = { x: pointerPos.x, y: pointerPos.y };
      isDrawing.current = true;
      
      let newElement: WhiteboardElement;
      if (currentTool === "line") {
        newElement = {
          id: generateId(),
          type: "line",
          data: {
            x1: pointerPos.x,
            y1: pointerPos.y,
            x2: pointerPos.x,
            y2: pointerPos.y,
          } as LineElementData,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdAt: new Date().toISOString(),
        };
      } else if (currentTool === "circle") {
        newElement = {
          id: generateId(),
          type: "circle",
          data: {
            x: pointerPos.x,
            y: pointerPos.y,
            radius: 0,
          } as CircleElementData,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdAt: new Date().toISOString(),
        };
      } else {
        // rectangle
        newElement = {
          id: generateId(),
          type: "rectangle",
          data: {
            x: pointerPos.x,
            y: pointerPos.y,
            width: 0,
            height: 0,
          } as RectangleElementData,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdAt: new Date().toISOString(),
        };
      }
      
      currentElementId.current = newElement.id;
      currentOnChange([...currentElements, newElement]);
    } else if (currentTool === "polygon" || currentTool === "triangle") {
      // Polygon/triangle: click to add points, drag to preview
      startPos.current = { x: pointerPos.x, y: pointerPos.y };
      isDrawing.current = true;
      
      const newElement: WhiteboardElement = {
        id: generateId(),
        type: currentTool === "triangle" ? "triangle" : "polygon",
        data: {
          points: [pointerPos.x, pointerPos.y, pointerPos.x, pointerPos.y],
          closed: false,
        } as PolygonElementData,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        createdAt: new Date().toISOString(),
      };
      
      currentElementId.current = newElement.id;
      currentOnChange([...currentElements, newElement]);
    } else if (currentTool === "eraser") {
      // Eraser: find and remove elements near the pointer position
      const eraserRadius = currentStrokeWidth * 2; // Eraser area
      const filteredElements = currentElements.filter((el) => {
        if (el.type === "pen") {
          const data = el.data as PenElementData;
          // Check if any point in the pen path is within eraser radius
          for (let i = 0; i < data.points.length; i += 2) {
            const px = data.points[i];
            const py = data.points[i + 1];
            const distance = Math.sqrt(
              Math.pow(px - pointerPos.x, 2) + Math.pow(py - pointerPos.y, 2)
            );
            if (distance <= eraserRadius) {
              return false; // Remove this element
            }
          }
        } else if (el.type === "line") {
          const data = el.data as LineElementData;
          // Check if pointer is near the line (simplified point-to-line distance)
          const dx = data.x2 - data.x1;
          const dy = data.y2 - data.y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length > 0) {
            const t = Math.max(
              0,
              Math.min(
                1,
                ((pointerPos.x - data.x1) * dx + (pointerPos.y - data.y1) * dy) / (length * length)
              )
            );
            const closestX = data.x1 + t * dx;
            const closestY = data.y1 + t * dy;
            const distance = Math.sqrt(
              Math.pow(pointerPos.x - closestX, 2) + Math.pow(pointerPos.y - closestY, 2)
            );
            if (distance <= eraserRadius) {
              return false; // Remove this element
            }
          }
        } else if (el.type === "circle") {
          const data = el.data as CircleElementData;
          const distance = Math.sqrt(
            Math.pow(pointerPos.x - data.x, 2) + Math.pow(pointerPos.y - data.y, 2)
          );
          if (Math.abs(distance - data.radius) <= eraserRadius) {
            return false; // Remove this element
          }
        } else if (el.type === "rectangle") {
          const data = el.data as RectangleElementData;
          // Check if pointer is near rectangle edges
          const isNearLeftEdge = Math.abs(pointerPos.x - data.x) <= eraserRadius;
          const isNearRightEdge = Math.abs(pointerPos.x - (data.x + data.width)) <= eraserRadius;
          const isNearTopEdge = Math.abs(pointerPos.y - data.y) <= eraserRadius;
          const isNearBottomEdge = Math.abs(pointerPos.y - (data.y + data.height)) <= eraserRadius;
          const isInBounds =
            pointerPos.x >= data.x - eraserRadius &&
            pointerPos.x <= data.x + data.width + eraserRadius &&
            pointerPos.y >= data.y - eraserRadius &&
            pointerPos.y <= data.y + data.height + eraserRadius;
          
          if (isInBounds && (isNearLeftEdge || isNearRightEdge || isNearTopEdge || isNearBottomEdge)) {
            return false; // Remove this element
          }
        }
        return true; // Keep this element
      });
      currentOnChange(filteredElements);
    } else if (currentTool === "equation") {
      // Equation tool: trigger dialog instead of drawing
      if (onEquationClick) {
        onEquationClick(pointerPos.x, pointerPos.y);
      }
      isDrawing.current = false;
    } else if (currentTool === "measure-distance") {
      // Distance measurement: click first point, then second point
      if (measurementPoints.current.length === 0) {
        // First click - start measurement
        measurementPoints.current = [pointerPos.x, pointerPos.y];
        isDrawing.current = true;
      } else if (measurementPoints.current.length === 2) {
        // Second click - complete measurement
        const distance = calculateDistance(
          { x: measurementPoints.current[0], y: measurementPoints.current[1] },
          { x: pointerPos.x, y: pointerPos.y }
        );
        const newElement: WhiteboardElement = {
          id: generateId(),
          type: "measure-distance",
          data: {
            type: "distance",
            points: [...measurementPoints.current, pointerPos.x, pointerPos.y],
            value: distance,
            unit: "px",
          } as MeasurementElementData,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdAt: new Date().toISOString(),
        };
        currentOnChange([...currentElements, newElement]);
        measurementPoints.current = [];
        isDrawing.current = false;
      }
    } else if (currentTool === "measure-angle") {
      // Angle measurement: click three points
      if (measurementPoints.current.length === 0) {
        // First click - start angle measurement
        measurementPoints.current = [pointerPos.x, pointerPos.y];
        isDrawing.current = true;
      } else if (measurementPoints.current.length === 2) {
        // Second click - set vertex
        measurementPoints.current.push(pointerPos.x, pointerPos.y);
      } else if (measurementPoints.current.length === 4) {
        // Third click - complete angle measurement
        const angle = calculateAngle(
          { x: measurementPoints.current[0], y: measurementPoints.current[1] },
          { x: measurementPoints.current[2], y: measurementPoints.current[3] },
          { x: pointerPos.x, y: pointerPos.y }
        );
        const newElement: WhiteboardElement = {
          id: generateId(),
          type: "measure-angle",
          data: {
            type: "angle",
            points: [...measurementPoints.current, pointerPos.x, pointerPos.y],
            value: angle,
            unit: "°",
          } as MeasurementElementData,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdAt: new Date().toISOString(),
        };
        currentOnChange([...currentElements, newElement]);
        measurementPoints.current = [];
        isDrawing.current = false;
      }
    }
  };

  // Handle mouse/touch move
  const handleMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current) return;

    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Use refs for latest values
    const currentTool = toolRef.current;
    const currentElements = elementsRef.current;
    const currentStrokeWidth = strokeWidthRef.current;
    const currentColor = colorRef.current;
    const currentOnChange = onElementsChangeRef.current;

    if (currentTool === "pen" && currentElementId.current) {
      currentPoints.current.push(pointerPos.x, pointerPos.y);
      
      // Update the last element with new points
      const updatedElements = currentElements.map((el) =>
        el.id === currentElementId.current
          ? {
              ...el,
              data: { points: [...currentPoints.current] } as PenElementData,
            }
          : el
      );
      currentOnChange(updatedElements);
    } else if (
      (currentTool === "line" || currentTool === "circle" || currentTool === "rectangle") &&
      startPos.current &&
      currentElementId.current
    ) {
      // Update shape as pointer moves
      const updatedElements = currentElements.map((el) => {
        if (el.id !== currentElementId.current) return el;
        
        if (currentTool === "line") {
          return {
            ...el,
            data: {
              x1: startPos.current!.x,
              y1: startPos.current!.y,
              x2: pointerPos.x,
              y2: pointerPos.y,
            } as LineElementData,
          };
        } else if (currentTool === "circle") {
          const radius = Math.sqrt(
            Math.pow(pointerPos.x - startPos.current!.x, 2) +
            Math.pow(pointerPos.y - startPos.current!.y, 2)
          );
          return {
            ...el,
            data: {
              x: startPos.current!.x,
              y: startPos.current!.y,
              radius,
            } as CircleElementData,
          };
        } else {
          // rectangle
          const width = pointerPos.x - startPos.current!.x;
          const height = pointerPos.y - startPos.current!.y;
          return {
            ...el,
            data: {
              x: Math.min(startPos.current!.x, pointerPos.x),
              y: Math.min(startPos.current!.y, pointerPos.y),
              width: Math.abs(width),
              height: Math.abs(height),
            } as RectangleElementData,
          };
        }
      });
      currentOnChange(updatedElements);
    } else if ((currentTool === "polygon" || currentTool === "triangle") && startPos.current && currentElementId.current) {
      // Update polygon/triangle preview as pointer moves
      const updatedElements = currentElements.map((el) => {
        if (el.id !== currentElementId.current) return el;
        const data = el.data as PolygonElementData;
        const newPoints = [...data.points];
        // Update the last point pair (preview line)
        newPoints[newPoints.length - 2] = pointerPos.x;
        newPoints[newPoints.length - 1] = pointerPos.y;
        return {
          ...el,
          data: {
            ...data,
            points: newPoints,
          } as PolygonElementData,
        };
      });
      currentOnChange(updatedElements);
    } else if (currentTool === "eraser") {
      // Continue erasing as pointer moves
      const eraserRadius = currentStrokeWidth * 2;
      const filteredElements = currentElements.filter((el) => {
        if (el.type === "pen") {
          const data = el.data as PenElementData;
          for (let i = 0; i < data.points.length; i += 2) {
            const px = data.points[i];
            const py = data.points[i + 1];
            const distance = Math.sqrt(
              Math.pow(px - pointerPos.x, 2) + Math.pow(py - pointerPos.y, 2)
            );
            if (distance <= eraserRadius) {
              return false;
            }
          }
        } else if (el.type === "line") {
          const data = el.data as LineElementData;
          const dx = data.x2 - data.x1;
          const dy = data.y2 - data.y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length > 0) {
            const t = Math.max(
              0,
              Math.min(
                1,
                ((pointerPos.x - data.x1) * dx + (pointerPos.y - data.y1) * dy) / (length * length)
              )
            );
            const closestX = data.x1 + t * dx;
            const closestY = data.y1 + t * dy;
            const distance = Math.sqrt(
              Math.pow(pointerPos.x - closestX, 2) + Math.pow(pointerPos.y - closestY, 2)
            );
            if (distance <= eraserRadius) {
              return false;
            }
          }
        } else if (el.type === "circle") {
          const data = el.data as CircleElementData;
          const distance = Math.sqrt(
            Math.pow(pointerPos.x - data.x, 2) + Math.pow(pointerPos.y - data.y, 2)
          );
          if (Math.abs(distance - data.radius) <= eraserRadius) {
            return false;
          }
        } else if (el.type === "rectangle") {
          const data = el.data as RectangleElementData;
          const isNearLeftEdge = Math.abs(pointerPos.x - data.x) <= eraserRadius;
          const isNearRightEdge = Math.abs(pointerPos.x - (data.x + data.width)) <= eraserRadius;
          const isNearTopEdge = Math.abs(pointerPos.y - data.y) <= eraserRadius;
          const isNearBottomEdge = Math.abs(pointerPos.y - (data.y + data.height)) <= eraserRadius;
          const isInBounds =
            pointerPos.x >= data.x - eraserRadius &&
            pointerPos.x <= data.x + data.width + eraserRadius &&
            pointerPos.y >= data.y - eraserRadius &&
            pointerPos.y <= data.y + data.height + eraserRadius;
          
          if (isInBounds && (isNearLeftEdge || isNearRightEdge || isNearTopEdge || isNearBottomEdge)) {
            return false;
          }
        }
        return true;
      });
      currentOnChange(filteredElements);
    } else if (currentTool === "measure-distance" && measurementPoints.current.length === 2) {
      // Update distance measurement preview
      const distance = calculateDistance(
        { x: measurementPoints.current[0], y: measurementPoints.current[1] },
        { x: pointerPos.x, y: pointerPos.y }
      );
      // Create/update preview element
      const previewId = "measure-distance-preview";
      const existingPreview = currentElements.find((el) => el.id === previewId);
      const previewElement: WhiteboardElement = {
        id: previewId,
        type: "measure-distance",
        data: {
          type: "distance",
          points: [...measurementPoints.current, pointerPos.x, pointerPos.y],
          value: distance,
          unit: "px",
        } as MeasurementElementData,
        color: colorRef.current,
        strokeWidth: currentStrokeWidth,
        createdAt: new Date().toISOString(),
      };
      if (existingPreview) {
        const updatedElements = currentElements.map((el) =>
          el.id === previewId ? previewElement : el
        );
        currentOnChange(updatedElements);
      } else {
        currentOnChange([...currentElements, previewElement]);
      }
    } else if (currentTool === "measure-angle") {
      if (measurementPoints.current.length === 2) {
        // Update angle measurement preview (two points so far)
        const previewId = "measure-angle-preview";
        const existingPreview = currentElements.find((el) => el.id === previewId);
        const previewElement: WhiteboardElement = {
          id: previewId,
          type: "measure-angle",
          data: {
            type: "angle",
            points: [...measurementPoints.current, pointerPos.x, pointerPos.y],
            value: 0,
            unit: "°",
          } as MeasurementElementData,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdAt: new Date().toISOString(),
        };
        if (existingPreview) {
          const updatedElements = currentElements.map((el) =>
            el.id === previewId ? previewElement : el
          );
          currentOnChange(updatedElements);
        } else {
          currentOnChange([...currentElements, previewElement]);
        }
      } else if (measurementPoints.current.length === 4) {
        // Update angle measurement preview (three points)
        const angle = calculateAngle(
          { x: measurementPoints.current[0], y: measurementPoints.current[1] },
          { x: measurementPoints.current[2], y: measurementPoints.current[3] },
          { x: pointerPos.x, y: pointerPos.y }
        );
        const previewId = "measure-angle-preview";
        const existingPreview = currentElements.find((el) => el.id === previewId);
        const previewElement: WhiteboardElement = {
          id: previewId,
          type: "measure-angle",
          data: {
            type: "angle",
            points: [...measurementPoints.current, pointerPos.x, pointerPos.y],
            value: angle,
            unit: "°",
          } as MeasurementElementData,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          createdAt: new Date().toISOString(),
        };
        if (existingPreview) {
          const updatedElements = currentElements.map((el) =>
            el.id === previewId ? previewElement : el
          );
          currentOnChange(updatedElements);
        } else {
          currentOnChange([...currentElements, previewElement]);
        }
      }
    }
  };

  // Handle mouse/touch end
  const handleEnd = () => {
    // Clean up preview elements
    const currentElements = elementsRef.current;
    const currentOnChange = onElementsChangeRef.current;
    const filteredElements = currentElements.filter(
      (el) => el.id !== "measure-distance-preview" && el.id !== "measure-angle-preview"
    );
    if (filteredElements.length !== currentElements.length) {
      currentOnChange(filteredElements);
    }

    // Only reset if not in measurement mode (measurement tools handle their own state)
    const currentTool = toolRef.current;
    if (currentTool !== "measure-distance" && currentTool !== "measure-angle") {
      isDrawing.current = false;
      currentPoints.current = [];
      currentElementId.current = null;
      startPos.current = null;
    }
  };

  return { handleStart, handleMove, handleEnd };
}

/**
 * Render whiteboard elements
 */
export function renderWhiteboardElements(elements: WhiteboardElement[]) {
  return elements.map((element) => {
    switch (element.type) {
      case "pen": {
        const data = element.data as PenElementData;
        if (data.points.length < 2) return null;
        return (
          <Line
            key={element.id}
            points={data.points}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
            globalCompositeOperation="source-over"
            listening={false}
          />
        );
      }
      case "line": {
        const data = element.data as LineElementData;
        return (
          <Line
            key={element.id}
            points={[data.x1, data.y1, data.x2, data.y2]}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            lineCap="round"
            listening={false}
          />
        );
      }
      case "circle": {
        const data = element.data as CircleElementData;
        return (
          <Circle
            key={element.id}
            x={data.x}
            y={data.y}
            radius={data.radius}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
            listening={false}
          />
        );
      }
      case "rectangle": {
        const data = element.data as RectangleElementData;
        return (
          <Rect
            key={element.id}
            x={data.x}
            y={data.y}
            width={data.width}
            height={data.height}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
            listening={false}
          />
        );
      }
      case "polygon":
      case "triangle": {
        const data = element.data as PolygonElementData;
        if (data.points.length < 4) return null; // Need at least 2 points
        return (
          <Line
            key={element.id}
            points={data.points}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            closed={data.closed}
            fill="transparent"
            listening={false}
          />
        );
      }
      case "equation": {
        const data = element.data as EquationElementData;
        return <EquationImage key={element.id} data={data} />;
      }
      case "measure-distance": {
        const data = element.data as MeasurementElementData;
        if (data.points.length < 4) return null;
        const [x1, y1, x2, y2] = data.points;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const label = formatDistance(data.value);
        
        return (
          <React.Fragment key={element.id}>
            <Line
              points={[x1, y1, x2, y2]}
              stroke={element.color}
              strokeWidth={element.strokeWidth}
              listening={false}
            />
            {/* Draw tick marks at endpoints */}
            <Line
              points={[x1 - 5, y1, x1 + 5, y1]}
              stroke={element.color}
              strokeWidth={element.strokeWidth}
              listening={false}
            />
            <Line
              points={[x2 - 5, y2, x2 + 5, y2]}
              stroke={element.color}
              strokeWidth={element.strokeWidth}
              listening={false}
            />
            {/* Measurement label */}
            <Rect
              x={midX - 20}
              y={midY - 10}
              width={40}
              height={20}
              fill="white"
              opacity={0.9}
              listening={false}
            />
            <KonvaText
              x={midX - 20}
              y={midY - 10}
              width={40}
              height={20}
              text={label}
              fontSize={12}
              fill={element.color}
              align="center"
              verticalAlign="middle"
              listening={false}
            />
          </React.Fragment>
        );
      }
      case "measure-angle": {
        const data = element.data as MeasurementElementData;
        if (data.points.length < 6) return null;
        const [x1, y1, x2, y2, x3, y3] = data.points;
        // Draw the two rays
        const ray1Length = Math.max(
          Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),
          Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2))
        );
        const ray2Length = ray1Length;
        
        // Calculate ray directions
        const dx1 = x1 - x2;
        const dy1 = y1 - y2;
        const dx2 = x3 - x2;
        const dy2 = y3 - y2;
        const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        const ray1EndX = x2 + (dx1 / dist1) * ray1Length;
        const ray1EndY = y2 + (dy1 / dist1) * ray1Length;
        const ray2EndX = x2 + (dx2 / dist2) * ray2Length;
        const ray2EndY = y2 + (dy2 / dist2) * ray2Length;
        
        // Draw arc for angle (simplified - draw a small arc)
        const angle1 = Math.atan2(dy1, dx1);
        const angle2 = Math.atan2(dy2, dx2);
        const arcRadius = 30;
        
        // Label position (midpoint of arc)
        const labelAngle = (angle1 + angle2) / 2;
        const labelX = x2 + Math.cos(labelAngle) * (arcRadius + 15);
        const labelY = y2 + Math.sin(labelAngle) * (arcRadius + 15);
        const label = formatAngle(data.value);
        
        return (
          <React.Fragment key={element.id}>
            {/* First ray */}
            <Line
              points={[x2, y2, ray1EndX, ray1EndY]}
              stroke={element.color}
              strokeWidth={element.strokeWidth}
              listening={false}
            />
            {/* Second ray */}
            <Line
              points={[x2, y2, ray2EndX, ray2EndY]}
              stroke={element.color}
              strokeWidth={element.strokeWidth}
              listening={false}
            />
            {/* Angle arc */}
            <Circle
              x={x2}
              y={y2}
              radius={arcRadius}
              stroke={element.color}
              strokeWidth={element.strokeWidth}
              fill="transparent"
              listening={false}
              // Use a Line to approximate the arc (Konva doesn't have arc directly)
            />
            {/* Angle label */}
            <Rect
              x={labelX - 20}
              y={labelY - 10}
              width={40}
              height={20}
              fill="white"
              opacity={0.9}
              listening={false}
            />
            <KonvaText
              x={labelX - 20}
              y={labelY - 10}
              width={40}
              height={20}
              text={label}
              fontSize={12}
              fill={element.color}
              align="center"
              verticalAlign="middle"
              listening={false}
            />
          </React.Fragment>
        );
      }
      default:
        return null;
    }
  });
}

/**
 * WhiteboardCanvas Component
 * 
 * Canvas component handling drawing interactions and rendering elements.
 * Supports mouse and touch input for drawing.
 * 
 * NOTE: This component now returns just the shapes array - Layer is managed by parent.
 */
export default function WhiteboardCanvas({
  elements,
}: {
  elements: WhiteboardElement[];
}) {
  return <>{renderWhiteboardElements(elements)}</>;
}


