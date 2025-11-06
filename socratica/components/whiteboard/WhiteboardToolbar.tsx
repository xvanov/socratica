"use client";

import { ToolType, TOOL_TYPES } from "@/types/whiteboard";

interface WhiteboardToolbarProps {
  currentTool: ToolType;
  currentColor: string;
  strokeWidth: number;
  gridVisible: boolean;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onGridToggle: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onSubmit?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

/**
 * WhiteboardToolbar Component
 * 
 * Toolbar for selecting drawing tools and settings.
 * Provides intuitive tool selection UI with keyboard shortcuts.
 * 
 * Keyboard Shortcuts:
 * - P: Pen tool
 * - E: Eraser tool
 * - L: Line tool
 * - C: Circle tool
 * - R: Rectangle tool
 * - Q: Equation tool
 * - G: Toggle grid
 */
export default function WhiteboardToolbar({
  currentTool,
  currentColor,
  strokeWidth: _strokeWidth,
  gridVisible,
  onToolChange,
  onColorChange,
  onStrokeWidthChange: _onStrokeWidthChange,
  onGridToggle,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSubmit,
  onExport,
  onImport,
}: WhiteboardToolbarProps) {
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return; // Don't interfere with browser shortcuts

    switch (e.key.toLowerCase()) {
      case "p":
        e.preventDefault();
        onToolChange("pen");
        break;
      case "e":
        e.preventDefault();
        onToolChange("eraser");
        break;
      case "l":
        e.preventDefault();
        onToolChange("line");
        break;
      case "c":
        e.preventDefault();
        onToolChange("circle");
        break;
      case "r":
        e.preventDefault();
        onToolChange("rectangle");
        break;
      case "g":
        e.preventDefault();
        onGridToggle();
        break;
      case "q":
        e.preventDefault();
        onToolChange("equation");
        break;
    }
  };

  const getToolLabel = (tool: ToolType): string => {
    const labels: Record<ToolType, string> = {
      pen: "Pen (P)",
      eraser: "Eraser (E)",
      line: "Line (L)",
      circle: "Circle (C)",
      rectangle: "Rectangle (R)",
      polygon: "Polygon",
      triangle: "Triangle",
      text: "Text",
      equation: "Equation (Q)",
      "measure-angle": "Measure Angle",
      "measure-distance": "Measure Distance",
    };
    return labels[tool] || tool;
  };

  // Tool icons - using SVG components for clean, professional look
  const getToolIcon = (tool: ToolType): React.ReactNode => {
    const iconClasses = "h-4 w-4";
    switch (tool) {
      case "pen":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case "eraser":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case "line":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      case "circle":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "rectangle":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case "polygon":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        );
      case "triangle":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19h14l-7-14-7 14z" />
          </svg>
        );
      case "text":
        return <span className="text-sm font-bold">T</span>;
      case "equation":
        return <span className="text-xs font-mono">fx</span>;
      case "measure-angle":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v8m0 0l4-4m-4 4l-4-4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v12" />
          </svg>
        );
      case "measure-distance":
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        );
      default:
        return <span className="text-xs">•</span>;
    }
  };

  return (
    <div
      className="flex items-center gap-2 p-2 bg-gray-100 border-b border-gray-200 flex-wrap"
      role="toolbar"
      aria-label="Whiteboard drawing tools"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Tool Selection Buttons */}
      <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Drawing tools" onClick={(e) => e.stopPropagation()}>
        {/* Pen Tool */}
        <button
          type="button"
          onClick={() => onToolChange("pen")}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label={getToolLabel("pen")}
          aria-pressed={currentTool === "pen"}
          title={getToolLabel("pen")}
        >
          <span className="mr-1 flex items-center">{getToolIcon("pen")}</span>
          <span className="hidden sm:inline">Pen</span>
        </button>
        {/* Eraser Tool */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToolChange("eraser");
          }}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label={getToolLabel("eraser")}
          aria-pressed={currentTool === "eraser"}
          title={getToolLabel("eraser")}
        >
          <span className="mr-1 flex items-center">{getToolIcon("eraser")}</span>
          <span className="hidden sm:inline">Eraser</span>
        </button>
        {/* Line Tool */}
        <button
          type="button"
          onClick={() => onToolChange("line")}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label={getToolLabel("line")}
          aria-pressed={currentTool === "line"}
          title={getToolLabel("line")}
        >
          <span className="mr-1 flex items-center">{getToolIcon("line")}</span>
          <span className="hidden sm:inline">Line</span>
        </button>
        {/* Equation Tool */}
        <button
          type="button"
          onClick={() => onToolChange("equation")}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label={getToolLabel("equation")}
          aria-pressed={currentTool === "equation"}
          title={getToolLabel("equation")}
        >
          <span className="mr-1 flex items-center">{getToolIcon("equation")}</span>
          <span className="hidden sm:inline">Equation</span>
        </button>
        {/* Distance Measurement Tool */}
        <button
          type="button"
          onClick={() => onToolChange("measure-distance")}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label={getToolLabel("measure-distance")}
          aria-pressed={currentTool === "measure-distance"}
          title={getToolLabel("measure-distance")}
        >
          <span className="mr-1 flex items-center">{getToolIcon("measure-distance")}</span>
          <span className="hidden sm:inline">Distance</span>
        </button>
        {/* Angle Measurement Tool */}
        <button
          type="button"
          onClick={() => onToolChange("measure-angle")}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label={getToolLabel("measure-angle")}
          aria-pressed={currentTool === "measure-angle"}
          title={getToolLabel("measure-angle")}
        >
          <span className="mr-1 flex items-center">{getToolIcon("measure-angle")}</span>
          <span className="hidden sm:inline">Angle</span>
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-300 mx-1" aria-hidden="true" />

      {/* Color Picker */}
      <div className="flex items-center gap-2" role="group" aria-label="Color selection">
        <label htmlFor="color-picker" className="sr-only">
          Select drawing color
        </label>
        <input
          id="color-picker"
          type="color"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
          aria-label="Drawing color"
        />
      </div>

      {/* Grid Toggle */}
      <button
        type="button"
        onClick={onGridToggle}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          gridVisible
            ? "bg-[var(--neutral-800)] dark:bg-[var(--neutral-700)] text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        aria-label={`Toggle grid (currently ${gridVisible ? "visible" : "hidden"})`}
        aria-pressed={gridVisible}
        title="Toggle grid (G)"
      >
        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Grid
      </button>

      {/* Zoom Controls */}
      {onZoomIn && onZoomOut && onResetZoom && (
        <>
          <div className="w-px h-8 bg-gray-300 mx-1" aria-hidden="true" />
          <div className="flex items-center gap-1" role="group" aria-label="Zoom controls">
            <button
              type="button"
              onClick={onZoomIn}
              className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200"
              aria-label="Zoom in"
              title="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={onZoomOut}
              className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200"
              aria-label="Zoom out"
              title="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={onResetZoom}
              className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200"
              aria-label="Reset zoom"
              title="Reset zoom (1:1)"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {/* Submit Button */}
      {onSubmit && (
        <>
          <div className="w-px h-8 bg-gray-300 mx-1" aria-hidden="true" />
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 rounded-md text-sm font-medium bg-black text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
            aria-label="Send whiteboard to AI tutor"
            title="Send whiteboard content to AI tutor"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </>
      )}

      {/* Export/Import Buttons */}
      {(onExport || onImport) && (
        <>
          <div className="w-px h-8 bg-gray-300 mx-1" aria-hidden="true" />
          <div className="flex items-center gap-1" role="group" aria-label="Export and import">
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                aria-label="Export whiteboard state"
                title="Export whiteboard state to JSON file"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            {onImport && (
              <button
                type="button"
                onClick={onImport}
                className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                aria-label="Import whiteboard state"
                title="Import whiteboard state from JSON file"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden sm:inline">Import</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

