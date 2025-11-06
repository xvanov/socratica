/**
 * Whiteboard Type Definitions
 * 
 * Defines types and interfaces for whiteboard functionality.
 */

export type ToolType =
  | "pen"
  | "eraser"
  | "line"
  | "circle"
  | "rectangle"
  | "polygon"
  | "triangle"
  | "text"
  | "equation"
  | "measure-angle"
  | "measure-distance";

export interface WhiteboardElement {
  id: string;
  type: ToolType;
  data: ElementData;
  color: string;
  strokeWidth: number;
  createdAt: string; // ISO 8601 timestamp
}

export interface PenElementData {
  points: number[]; // [x1, y1, x2, y2, ...]
}

export interface LineElementData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface CircleElementData {
  x: number;
  y: number;
  radius: number;
}

export interface RectangleElementData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonElementData {
  points: number[]; // [x1, y1, x2, y2, ...]
  closed: boolean;
}

export interface TextElementData {
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export interface EquationElementData {
  x: number;
  y: number;
  expression: string; // LaTeX expression
  fontSize: number;
  imageDataUrl: string; // Rendered image data URL
}

export interface MeasurementElementData {
  type: "angle" | "distance";
  points: number[]; // For angle: 3 points [x1, y1, x2, y2, x3, y3]
  // For distance: 2 points [x1, y1, x2, y2]
  value: number;
  unit: string;
}

export type ElementData =
  | PenElementData
  | LineElementData
  | CircleElementData
  | RectangleElementData
  | PolygonElementData
  | TextElementData
  | EquationElementData
  | MeasurementElementData;

export interface WhiteboardState {
  elements: WhiteboardElement[];
  currentTool: ToolType;
  currentColor: string;
  strokeWidth: number;
  gridVisible: boolean;
  gridSpacing: number;
}

export interface WhiteboardProps {
  /** Initial whiteboard state */
  initialState?: Partial<WhiteboardState>;
  /** Callback when whiteboard state changes */
  onStateChange?: (state: WhiteboardState) => void;
  /** Canvas width (defaults to responsive) */
  width?: number;
  /** Canvas height (defaults to responsive) */
  height?: number;
  /** Whether whiteboard is visible */
  visible?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** Session ID for real-time synchronization */
  sessionId?: string;
  /** User ID for authorization */
  userId?: string;
  /** Callback to receive the capture function */
  onCaptureReady?: (capture: () => Promise<string | null>) => void;
  /** Callback when submit button is clicked */
  onSubmit?: () => void;
}

export const DEFAULT_COLOR = "#000000";
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_GRID_SPACING = 20;
export const MIN_STROKE_WIDTH = 1;
export const MAX_STROKE_WIDTH = 10;

export const TOOL_TYPES: ToolType[] = [
  "pen",
  "eraser",
  "line",
  "circle",
  "rectangle",
  "polygon",
  "triangle",
  "text",
  "equation",
  "measure-angle",
  "measure-distance",
];

