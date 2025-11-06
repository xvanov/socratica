/**
 * Calculate bounding box for whiteboard elements
 * Returns the min/max coordinates that encompass all drawn elements
 */

import { WhiteboardElement, PenElementData, LineElementData, CircleElementData, RectangleElementData, PolygonElementData, TextElementData, EquationElementData, MeasurementElementData } from "@/types/whiteboard";

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Calculate bounding box for all whiteboard elements
 * @param elements - Array of whiteboard elements
 * @param padding - Padding to add around the bounding box (in pixels)
 * @returns Bounding box with min/max coordinates, or null if no elements
 */
export function calculateElementBoundingBox(
  elements: WhiteboardElement[],
  padding: number = 50 // Increased default padding
): BoundingBox | null {
  if (!elements || elements.length === 0) {
    return null;
  }

  console.log(`[BoundingBox] Processing ${elements.length} elements`);
  
  // Count elements by type for debugging
  const elementCounts: Record<string, number> = {};
  elements.forEach(el => {
    elementCounts[el.type] = (elementCounts[el.type] || 0) + 1;
  });
  console.log('[BoundingBox] Element breakdown:', elementCounts);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  let processedCount = 0;

  for (const element of elements) {
    // Account for stroke width - strokes extend beyond their coordinates
    const strokeWidth = element.strokeWidth || 2;
    const strokePadding = strokeWidth / 2;

    switch (element.type) {
      case "pen": {
        const data = element.data as PenElementData;
        if (data.points && data.points.length >= 2) {
          const pointCount = data.points.length / 2;
          for (let i = 0; i < data.points.length; i += 2) {
            const x = data.points[i];
            const y = data.points[i + 1];
            minX = Math.min(minX, x - strokePadding);
            minY = Math.min(minY, y - strokePadding);
            maxX = Math.max(maxX, x + strokePadding);
            maxY = Math.max(maxY, y + strokePadding);
          }
          processedCount++;
          if (processedCount <= 3) { // Log first few pen strokes
            console.log(`[BoundingBox] Pen stroke ${processedCount}: ${pointCount} points, strokeWidth=${strokeWidth}, bounds: [${Math.min(...data.points.filter((_, i) => i % 2 === 0))}, ${Math.min(...data.points.filter((_, i) => i % 2 === 1))}] to [${Math.max(...data.points.filter((_, i) => i % 2 === 0))}, ${Math.max(...data.points.filter((_, i) => i % 2 === 1))}]`);
          }
        }
        break;
      }

      case "line": {
        const data = element.data as LineElementData;
        minX = Math.min(minX, data.x1 - strokePadding, data.x2 - strokePadding);
        minY = Math.min(minY, data.y1 - strokePadding, data.y2 - strokePadding);
        maxX = Math.max(maxX, data.x1 + strokePadding, data.x2 + strokePadding);
        maxY = Math.max(maxY, data.y1 + strokePadding, data.y2 + strokePadding);
        processedCount++;
        break;
      }

      case "circle": {
        const data = element.data as CircleElementData;
        const totalRadius = data.radius + strokePadding;
        minX = Math.min(minX, data.x - totalRadius);
        minY = Math.min(minY, data.y - totalRadius);
        maxX = Math.max(maxX, data.x + totalRadius);
        maxY = Math.max(maxY, data.y + totalRadius);
        processedCount++;
        break;
      }

      case "rectangle": {
        const data = element.data as RectangleElementData;
        minX = Math.min(minX, data.x - strokePadding);
        minY = Math.min(minY, data.y - strokePadding);
        maxX = Math.max(maxX, data.x + data.width + strokePadding);
        maxY = Math.max(maxY, data.y + data.height + strokePadding);
        processedCount++;
        break;
      }

      case "polygon":
      case "triangle": {
        const data = element.data as PolygonElementData;
        if (data.points && data.points.length >= 2) {
          for (let i = 0; i < data.points.length; i += 2) {
            const x = data.points[i];
            const y = data.points[i + 1];
            minX = Math.min(minX, x - strokePadding);
            minY = Math.min(minY, y - strokePadding);
            maxX = Math.max(maxX, x + strokePadding);
            maxY = Math.max(maxY, y + strokePadding);
          }
          processedCount++;
        }
        break;
      }

      case "text": {
        const data = element.data as TextElementData;
        // Estimate text size (rough approximation)
        const fontSize = data.fontSize || 16;
        const textWidth = (data.text?.length || 0) * fontSize * 0.7; // Increased multiplier
        const textHeight = fontSize * 1.4; // Increased multiplier
        minX = Math.min(minX, data.x);
        minY = Math.min(minY, data.y);
        maxX = Math.max(maxX, data.x + textWidth);
        maxY = Math.max(maxY, data.y + textHeight);
        processedCount++;
        break;
      }

      case "equation": {
        const data = element.data as EquationElementData;
        // Estimate equation size (rough approximation)
        const fontSize = data.fontSize || 16;
        const textWidth = (data.expression?.length || 0) * fontSize * 0.7; // Increased multiplier
        const textHeight = fontSize * 1.6; // Increased multiplier
        minX = Math.min(minX, data.x);
        minY = Math.min(minY, data.y);
        maxX = Math.max(maxX, data.x + textWidth);
        maxY = Math.max(maxY, data.y + textHeight);
        processedCount++;
        break;
      }

      case "measure-angle":
      case "measure-distance": {
        const data = element.data as MeasurementElementData;
        if (data.points && data.points.length >= 2) {
          for (let i = 0; i < data.points.length; i += 2) {
            const x = data.points[i];
            const y = data.points[i + 1];
            minX = Math.min(minX, x - strokePadding);
            minY = Math.min(minY, y - strokePadding);
            maxX = Math.max(maxX, x + strokePadding);
            maxY = Math.max(maxY, y + strokePadding);
          }
          processedCount++;
        }
        break;
      }

      // Eraser doesn't create elements, skip
      case "eraser":
        break;
      
      default:
        console.warn(`[BoundingBox] Unknown element type: ${element.type}`);
        break;
    }
  }

  console.log(`[BoundingBox] Processed ${processedCount} elements, found bounds: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);

  // Check if we found any valid coordinates
  if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
    console.warn('[BoundingBox] No valid coordinates found!');
    return null;
  }

  // Add padding (increased significantly)
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = maxX + padding;
  maxY = maxY + padding;

  // Ensure minimum size to prevent cropping too aggressively
  const minWidth = 400; // Increased from 200
  const minHeight = 200; // Increased from 100
  const width = maxX - minX;
  const height = maxY - minY;

  // Expand if too small
  if (width < minWidth) {
    const expandX = (minWidth - width) / 2;
    minX = Math.max(0, minX - expandX);
    maxX = maxX + expandX;
  }

  if (height < minHeight) {
    const expandY = (minHeight - height) / 2;
    minY = Math.max(0, minY - expandY);
    maxY = maxY + expandY;
  }

  // Additional safety: If we have many elements but small bounding box, expand it
  // This handles cases where elements might be spread out
  const avgElementArea = (width * height) / elements.length;
  if (elements.length > 2 && avgElementArea < 5000) { // Less than 5000 pixels per element
    console.warn(`[BoundingBox] Bounding box seems too small for ${elements.length} elements, expanding...`);
    const expansionFactor = 1.5; // Expand by 50%
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newWidth = width * expansionFactor;
    const newHeight = height * expansionFactor;
    minX = Math.max(0, centerX - newWidth / 2);
    minY = Math.max(0, centerY - newHeight / 2);
    maxX = centerX + newWidth / 2;
    maxY = centerY + newHeight / 2;
  }

  const finalBbox = {
    minX: Math.round(minX),
    minY: Math.round(minY),
    maxX: Math.round(maxX),
    maxY: Math.round(maxY),
    width: Math.round(maxX - minX),
    height: Math.round(maxY - minY),
  };
  
  console.log(`[BoundingBox] Final bounding box:`, finalBbox);
  
  return finalBbox;
}

/**
 * Crop an image to a bounding box
 * @param imageDataURL - Base64 data URL of the image
 * @param bbox - Bounding box to crop to
 * @returns Cropped image as data URL
 */
export async function cropImageToBoundingBox(
  imageDataURL: string,
  bbox: BoundingBox
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas for cropping
        const canvas = document.createElement("canvas");
        canvas.width = bbox.width;
        canvas.height = bbox.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get 2D context"));
          return;
        }

        // Fill with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the cropped portion of the image
        ctx.drawImage(
          img,
          bbox.minX,
          bbox.minY,
          bbox.width,
          bbox.height,
          0,
          0,
          bbox.width,
          bbox.height
        );

        // Convert to data URL
        const croppedDataURL = canvas.toDataURL("image/png", 0.95);
        resolve(croppedDataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageDataURL;
  });
}

