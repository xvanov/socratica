/**
 * Whiteboard description utilities
 * Converts whiteboard state into text descriptions for AI context
 */

import { WhiteboardState, WhiteboardElement } from "@/types/whiteboard";

/**
 * Describe a whiteboard element in text format
 */
function describeElement(element: WhiteboardElement): string {
  switch (element.type) {
    case "pen":
      const penData = element.data as { points: number[] };
      const pointCount = penData.points.length / 2;
      return `- Freehand drawing (pen stroke) with ${pointCount} points, color ${element.color}, stroke width ${element.strokeWidth}`;
    
    case "line":
      const lineData = element.data as { x1: number; y1: number; x2: number; y2: number };
      return `- Line from (${lineData.x1.toFixed(1)}, ${lineData.y1.toFixed(1)}) to (${lineData.x2.toFixed(1)}, ${lineData.y2.toFixed(1)}), color ${element.color}`;
    
    case "circle":
      const circleData = element.data as { x: number; y: number; radius: number };
      return `- Circle centered at (${circleData.x.toFixed(1)}, ${circleData.y.toFixed(1)}) with radius ${circleData.radius.toFixed(1)}, color ${element.color}`;
    
    case "rectangle":
      const rectData = element.data as { x: number; y: number; width: number; height: number };
      return `- Rectangle at (${rectData.x.toFixed(1)}, ${rectData.y.toFixed(1)}) with width ${rectData.width.toFixed(1)} and height ${rectData.height.toFixed(1)}, color ${element.color}`;
    
    case "polygon":
    case "triangle":
      const polygonData = element.data as { points: number[]; closed: boolean };
      const vertexCount = polygonData.points.length / 2;
      return `- ${element.type === "triangle" ? "Triangle" : "Polygon"} with ${vertexCount} vertices${polygonData.closed ? " (closed)" : ""}, color ${element.color}`;
    
    case "text":
      const textData = element.data as { x: number; y: number; text: string; fontSize: number };
      return `- Text "${textData.text}" at (${textData.x.toFixed(1)}, ${textData.y.toFixed(1)}), font size ${textData.fontSize}, color ${element.color}`;
    
    case "equation":
      const eqData = element.data as { x: number; y: number; expression: string; fontSize: number };
      return `- Mathematical equation: ${eqData.expression} at (${eqData.x.toFixed(1)}, ${eqData.y.toFixed(1)}), font size ${eqData.fontSize}`;
    
    case "measure-distance":
      const distData = element.data as { type: "distance"; points: number[]; value: number; unit: string };
      return `- Distance measurement: ${distData.value.toFixed(2)} ${distData.unit}`;
    
    case "measure-angle":
      const angleData = element.data as { type: "angle"; points: number[]; value: number; unit: string };
      return `- Angle measurement: ${angleData.value.toFixed(2)} ${angleData.unit}`;
    
    case "eraser":
      return `- Eraser mark`;
    
    default:
      return `- ${element.type} element`;
  }
}

/**
 * Convert whiteboard state to a text description for AI context
 * @param whiteboardState - Whiteboard state to describe
 * @returns Text description of the whiteboard contents
 */
export function describeWhiteboardState(whiteboardState: WhiteboardState | null | undefined): string {
  if (!whiteboardState || !whiteboardState.elements || whiteboardState.elements.length === 0) {
    return "The whiteboard is currently empty.";
  }

  const descriptions: string[] = [];
  descriptions.push(`The whiteboard contains ${whiteboardState.elements.length} element(s):`);
  
  // Group elements by type for better readability
  const elementDescriptions = whiteboardState.elements.map(describeElement);
  descriptions.push(...elementDescriptions);
  
  // Add settings context
  if (whiteboardState.gridVisible) {
    descriptions.push(`Grid is visible with spacing ${whiteboardState.gridSpacing}.`);
  }
  
  descriptions.push(`Current tool: ${whiteboardState.currentTool}, color: ${whiteboardState.currentColor}, stroke width: ${whiteboardState.strokeWidth}.`);
  
  return descriptions.join("\n");
}

/**
 * Build whiteboard context section for system prompt
 * @param whiteboardState - Whiteboard state to include
 * @returns Whiteboard context section or empty string
 */
export function buildWhiteboardContext(whiteboardState: WhiteboardState | null | undefined): string {
  if (!whiteboardState || !whiteboardState.elements || whiteboardState.elements.length === 0) {
    return "";
  }

  const description = describeWhiteboardState(whiteboardState);
  
  return `

**WHITEBOARD CONTEXT:**
The student has access to a collaborative whiteboard where they can draw diagrams, write equations, and make visual notes. 

**IMPORTANT:** When a whiteboard image is included with the student's message, you can SEE the actual visual content of the whiteboard. This allows you to:
- Recognize handwritten equations and mathematical expressions
- See diagrams, graphs, and geometric figures
- Understand spatial relationships and visual problem-solving approaches
- Read text and equations exactly as drawn by the student

The whiteboard image appears as part of the user's message when available. Use your vision capabilities to analyze what's drawn and respond accordingly.

You also receive structured data about the whiteboard:
${description}

**WHITEBOARD USAGE GUIDELINES:**
- **When you see a whiteboard image:** Carefully analyze it to recognize equations, diagrams, and mathematical content
- **For handwritten equations:** Read and interpret the equation accurately, then help solve it using Socratic questioning
- You can reference what's on the whiteboard in your responses (e.g., "Looking at the equation you drew: 5x+10=5..." or "I see you've written...")
- If the student asks about something on the whiteboard, use both the image (if available) and the description above to understand what they're referring to
- You can suggest drawing something on the whiteboard if it would help visualize a concept (e.g., "Try drawing a coordinate plane to visualize this")
- If you want to add something to the whiteboard, you can use the whiteboard drawing API (see whiteboard drawing instructions below)
- Maintain Socratic approach even when referencing whiteboard content - use questions, not direct answers

**WHITEBOARD DRAWING CAPABILITY:**
You have the ability to draw on the whiteboard to help illustrate concepts. To add a drawing:
- Use the format: [WHITEBOARD_DRAW:type:data] where type is the element type (e.g., "circle", "line", "equation")
- For equations, use: [WHITEBOARD_DRAW:equation:LaTeX expression]
- For shapes, provide coordinates in a simple format
- Drawings will appear on the student's whiteboard instantly
- Only use drawings when they would genuinely help the student understand a concept
- Always explain what you're drawing and why it helps

Example: If you want to draw a circle to illustrate a concept, you might say: "Let me draw a circle to help visualize this. [WHITEBOARD_DRAW:circle:x:100:y:100:radius:50]"
`;
}
