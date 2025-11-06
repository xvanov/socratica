/**
 * KaTeX to Image Conversion Utility
 * 
 * Converts KaTeX LaTeX expressions to image data URLs for rendering on canvas.
 */

import katex from "katex";
import html2canvas from "html2canvas";
import KATEX_CONFIG from "./katex-config";

/**
 * Converts a KaTeX LaTeX expression to an image data URL
 * 
 * @param expression - LaTeX expression to render
 * @param fontSize - Font size in pixels (default: 20)
 * @param color - Text color (default: black)
 * @returns Promise resolving to image data URL
 */
export async function katexToImage(
  expression: string,
  fontSize: number = 20,
  color: string = "#000000"
): Promise<string> {
  if (!expression || expression.trim() === "") {
    throw new Error("Expression cannot be empty");
  }

  // Create a temporary container element
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.fontSize = `${fontSize}px`;
  container.style.color = color;
  container.style.display = "inline-block";
  container.style.padding = "8px";
  container.style.backgroundColor = "white";
  container.style.whiteSpace = "nowrap";
  
  document.body.appendChild(container);

  try {
    // Render KaTeX to HTML
    const html = katex.renderToString(expression, {
      ...KATEX_CONFIG,
      throwOnError: false,
    });

    container.innerHTML = html;

    // Wait for fonts to load
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for rendering

    // Use html2canvas to convert the rendered HTML to an image
    const canvas = await html2canvas(container, {
      backgroundColor: "white",
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      width: container.offsetWidth,
      height: container.offsetHeight,
    });

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png");
    
    return dataUrl;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to convert KaTeX to image");
  } finally {
    // Clean up
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}

