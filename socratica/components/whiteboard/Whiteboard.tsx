"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Konva from "konva";
import {
  WhiteboardProps,
  WhiteboardState,
  ToolType,
  DEFAULT_COLOR,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_GRID_SPACING,
} from "@/types/whiteboard";
import WhiteboardCanvas from "./WhiteboardCanvas";
import WhiteboardToolbar from "./WhiteboardToolbar";
import CoordinateGrid from "./overlays/CoordinateGrid";
import AxisLabels from "./overlays/AxisLabels";
import { useWhiteboardDrawing } from "./WhiteboardCanvas";
import EquationInputDialog from "./EquationInputDialog";
import { EquationElementData } from "@/types/whiteboard";
import {
  subscribeToWhiteboardState,
  saveWhiteboardState,
  loadWhiteboardState,
  PEN_TOOL_DEBOUNCE_MS,
  exportWhiteboardState,
  importWhiteboardState,
} from "@/lib/firebase/whiteboard";
import { Unsubscribe } from "firebase/firestore";
import { calculateElementBoundingBox, cropImageToBoundingBox } from "@/lib/whiteboard/bounding-box";

/**
 * Whiteboard Component
 * 
 * Main whiteboard component providing a shared drawing canvas with comprehensive
 * drawing tools and mathematical diagram support.
 * 
 * Features:
 * - Responsive canvas sizing (mobile, tablet, desktop)
 * - Mouse and touch input support
 * - Drawing tools (pen, eraser, shapes, etc.)
 * - Coordinate grid for graphing
 * - Real-time drawing visibility
 * - Accessibility support (ARIA labels, keyboard navigation)
 * 
 * @component
 */
export default function Whiteboard({
  initialState,
  onStateChange,
  width,
  height,
  visible = true,
  ariaLabel = "Interactive whiteboard for drawing and mathematical diagrams",
  sessionId,
  userId,
  onCaptureReady,
  onSubmit,
}: WhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [equationDialog, setEquationDialog] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  }>({ isOpen: false, x: 0, y: 0 });

  // Track space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Initialize whiteboard state
  const [state, setState] = useState<WhiteboardState>(() => ({
    elements: [],
    currentTool: "pen",
    currentColor: DEFAULT_COLOR,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    gridVisible: false,
    gridSpacing: DEFAULT_GRID_SPACING,
    ...initialState,
  }));

  // Track if we're applying a remote update (to prevent feedback loops)
  const isApplyingRemoteUpdate = useRef(false);
  // Debounce timer for pen tool updates
  const saveDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  // Last saved state version (for conflict resolution)
  const lastSavedVersion = useRef<number>(0);
  // Firestore unsubscribe function
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  // Ref to track current state for cleanup
  const stateRef = useRef<WhiteboardState>(state);
  // Track if we've loaded initial state to prevent overwriting with empty state
  const hasLoadedInitialState = useRef(false);

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Responsive sizing based on viewport
      let newWidth = width || containerRect.width || 800;
      let newHeight = height || containerRect.height || 600;

      // Mobile: use container width, limit height
      if (window.innerWidth < 640) {
        newWidth = containerRect.width || window.innerWidth - 32;
        newHeight = Math.min(400, window.innerHeight * 0.4);
      }
      // Tablet: use container width, moderate height
      else if (window.innerWidth < 1024) {
        newWidth = containerRect.width || window.innerWidth - 48;
        newHeight = Math.min(500, window.innerHeight * 0.5);
      }
      // Desktop: use provided dimensions or defaults
      else {
        newWidth = width || containerRect.width || 800;
        newHeight = height || containerRect.height || 600;
      }

      setCanvasSize({ width: newWidth, height: newHeight });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [width, height]);

  // Track if we've applied initialState to prevent re-applying it
  const hasAppliedInitialState = useRef(false);
  const initialMountRef = useRef(true);
  const prevInitialStateRef = useRef<Partial<WhiteboardState> | undefined>(undefined);
  const appliedInitialStateElementsRef = useRef<string>(""); // Track what we've applied
  
  // Sync initialState prop changes when whiteboard becomes visible
  // This ensures state is restored when reopening the whiteboard
  // Use serialized elements string to avoid re-renders from object reference changes
  const prevInitialStateElementsStrRef = useRef<string>("");
  const initialStateElementsStr = useMemo(() => 
    JSON.stringify(initialState?.elements || []), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(initialState?.elements || [])]
  );
  
  useEffect(() => {
    // Only sync if component is visible and we have a new initialState
    if (!visible || !initialState || !initialState.elements || initialState.elements.length === 0) {
      return;
    }

    // Skip if we've already applied this exact initialState
    if (initialStateElementsStr === appliedInitialStateElementsRef.current) {
      return;
    }
    
    // Skip if the serialized string hasn't changed from previous render
    if (initialStateElementsStr === prevInitialStateElementsStrRef.current) {
      return;
    }
    
    // Update the ref
    prevInitialStateElementsStrRef.current = initialStateElementsStr;

    // If initialState has elements, apply it when whiteboard becomes visible
    // This restores state when reopening the whiteboard
    // BUT: Only apply if current state is different (to prevent loops)
    setState((prev) => {
      const prevElementsStr = JSON.stringify(prev.elements);
      
      // Only apply if elements are actually different
      if (prevElementsStr === initialStateElementsStr) {
        return prev; // No change needed
      }
      
      const shouldApply = initialState.elements && 
        initialState.elements.length > 0 &&
        (prev.elements.length === 0 || 
         initialState.elements.length > prev.elements.length ||
         prevElementsStr !== initialStateElementsStr);
      
      if (shouldApply && !isApplyingRemoteUpdate.current) {
        console.log("Whiteboard: Applying initialState prop when visible:", { 
          elementCount: initialState.elements!.length,
          prevElementCount: prev.elements.length,
          visible
        });
        prevInitialStateRef.current = initialState;
        appliedInitialStateElementsRef.current = initialStateElementsStr;
        return {
          ...prev,
          ...initialState,
          elements: initialState.elements || prev.elements,
          // Preserve currentTool - don't override with initialState
          currentTool: prev.currentTool,
        };
      }
      
      return prev;
    });
    
    prevInitialStateRef.current = initialState;
  }, [visible, initialStateElementsStr]);
  
  // Apply initialState only once on mount (before Firestore load)
  // This prevents infinite loops from state updates triggering prop changes
  useEffect(() => {
    // Skip if we've already loaded from Firestore, applied initialState, or if we're applying a remote update
    if (hasLoadedInitialState.current || hasAppliedInitialState.current || isApplyingRemoteUpdate.current) {
      return;
    }
    
    // Only apply on initial mount if initialState is provided and has elements
    if (initialMountRef.current && initialState && initialState.elements && initialState.elements.length > 0) {
      setState((prev) => {
        // Only apply if current state is empty
        if (prev.elements.length === 0) {
          hasAppliedInitialState.current = true;
          initialMountRef.current = false;
          prevInitialStateRef.current = initialState;
          return {
            ...prev,
            ...initialState,
            elements: initialState.elements || prev.elements,
            // Preserve currentTool - don't override with initialState on mount
            currentTool: prev.currentTool,
          };
        }
        return prev;
      });
    }
    
    // Mark mount as complete after first render
    if (initialMountRef.current) {
      initialMountRef.current = false;
      if (!initialState || !initialState.elements || initialState.elements.length === 0) {
        hasAppliedInitialState.current = true;
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Load initial whiteboard state from Firestore when sessionId is available
  useEffect(() => {
    if (!sessionId) {
      console.log("Whiteboard: No sessionId available - cannot load state");
      return;
    }

    let isMounted = true;

    const loadInitialState = async () => {
      try {
        console.log("Whiteboard: Loading state from Firestore for session:", sessionId);
        const loadedState = await loadWhiteboardState(sessionId);
        if (loadedState && isMounted) {
          console.log("Whiteboard: Loaded state from Firestore:", { elementCount: loadedState.elements.length });
          isApplyingRemoteUpdate.current = true;
          setState(loadedState);
          hasLoadedInitialState.current = true;
          // Update version tracking
          const remoteVersion = (loadedState as any).version || 0;
          lastSavedVersion.current = remoteVersion;
          isApplyingRemoteUpdate.current = false;
        } else if (isMounted) {
          // No existing state, mark as loaded anyway
          console.log("Whiteboard: No existing state found in Firestore");
          hasLoadedInitialState.current = true;
        }
      } catch (error) {
        console.error("Failed to load whiteboard state:", error);
        // Mark as loaded even on error to prevent infinite retries
        if (isMounted) {
          hasLoadedInitialState.current = true;
        }
      }
    };

    // Reset flags when sessionId changes
    hasLoadedInitialState.current = false;
    hasAppliedInitialState.current = false;
    initialMountRef.current = true;
    loadInitialState();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  // Subscribe to real-time whiteboard state updates
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToWhiteboardState(sessionId, (remoteState) => {
      if (!remoteState) return;

      // Check version to prevent processing old updates
      const remoteVersion = (remoteState as any).version || 0;
      if (remoteVersion <= lastSavedVersion.current) {
        console.log("Whiteboard: Ignoring older remote update:", { remoteVersion, lastSavedVersion: lastSavedVersion.current });
        return; // Ignore older updates
      }

      // Only apply remote updates if they're actually different and not from our own save
      const { version, lastUpdated, ...stateWithoutMetadata } = remoteState as any;
      const currentState = stateRef.current;
      
      // Check if this is significantly different from current state
      const currentElementsStr = JSON.stringify(currentState.elements);
      const remoteElementsStr = JSON.stringify(stateWithoutMetadata.elements);
      const isDifferent = remoteElementsStr !== currentElementsStr ||
                          stateWithoutMetadata.currentTool !== currentState.currentTool ||
                          stateWithoutMetadata.currentColor !== currentState.currentColor;
      
      if (isDifferent && !isApplyingRemoteUpdate.current) {
        // Only apply if remote state has more elements or is significantly different
        // Don't overwrite local state with an empty remote state
        const shouldApply = stateWithoutMetadata.elements.length >= currentState.elements.length ||
                           (currentState.elements.length === 0 && stateWithoutMetadata.elements.length > 0);
        
        if (shouldApply) {
          console.log("Whiteboard: Applying remote update:", { 
            remoteElementCount: stateWithoutMetadata.elements.length, 
            currentElementCount: currentState.elements.length,
            remoteVersion 
          });
          // Apply remote update
          isApplyingRemoteUpdate.current = true;
          setState(stateWithoutMetadata as WhiteboardState);
          lastSavedVersion.current = remoteVersion;
          isApplyingRemoteUpdate.current = false;
        } else {
          console.log("Whiteboard: Ignoring remote update - local state has more elements:", {
            remoteElementCount: stateWithoutMetadata.elements.length,
            currentElementCount: currentState.elements.length,
          });
        }
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [sessionId]);

  // Save whiteboard state to Firestore with debouncing
  const saveStateToFirestore = useCallback(
    async (stateToSave: WhiteboardState) => {
      if (!sessionId || !userId || isApplyingRemoteUpdate.current) {
        return; // Don't save if no session/user or if we're applying a remote update
      }

      // Clear existing debounce timer
      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current);
      }

      // Debounce pen tool updates
      const shouldDebounce = stateToSave.currentTool === "pen";
      const delay = shouldDebounce ? PEN_TOOL_DEBOUNCE_MS : 0;

      saveDebounceTimer.current = setTimeout(async () => {
        try {
          await saveWhiteboardState(sessionId, userId, stateToSave);
          const currentVersion = (stateToSave as any).version || 0;
          lastSavedVersion.current = Math.max(lastSavedVersion.current, currentVersion + 1);
        } catch (error) {
          console.error("Failed to save whiteboard state:", error);
        }
      }, delay);
    },
    [sessionId, userId]
  );

  // Notify parent of state changes and save to Firestore
  useEffect(() => {
    // Update ref with current state immediately
    stateRef.current = state;

    // Always notify parent of state changes (for API calls and state preservation)
    // BUT: Prevent notifying if we're currently applying initialState (to avoid loops)
    if (onStateChange && !isApplyingRemoteUpdate.current) {
      // Check if state actually changed from what we've already notified
      const currentElementsStr = JSON.stringify(state.elements);
      if (currentElementsStr !== appliedInitialStateElementsRef.current) {
        onStateChange(state);
        // Update the applied ref to track what we've notified
        appliedInitialStateElementsRef.current = currentElementsStr;
      }
    }

    // Save to Firestore if sessionId and userId are available
    // Only save if we're not applying a remote update
    // Note: We save even when not visible to ensure state is persisted
    if (sessionId && userId && !isApplyingRemoteUpdate.current && visible) {
      console.log("Whiteboard state changed - saving:", { 
        sessionId, 
        elementCount: state.elements.length, 
        currentTool: state.currentTool,
        visible,
        elements: state.elements.map(e => ({ type: e.type, id: e.id }))
      });
      saveStateToFirestore(state);
    } else if (!sessionId && state.elements.length > 0) {
      // Only log if there are elements to save (debug level - this is expected when no session exists yet)
      console.debug("Whiteboard: Cannot save whiteboard state - no sessionId. Session will be created when user sends first message.");
    }
  }, [state.elements, onStateChange, sessionId, userId, saveStateToFirestore, visible]);

  // Expose function to capture whiteboard as image
  const captureWhiteboardImage = useCallback(async (): Promise<string | null> => {
    if (!stageRef.current) {
      console.warn("Whiteboard: Cannot capture - stage ref is null");
      return null;
    }

    // Check if there are any elements to capture
    if (!state.elements || state.elements.length === 0) {
      console.log("Whiteboard: No elements to capture");
      return null;
    }

    try {
      const stage = stageRef.current;
      const container = containerRef.current;
      
      // CRITICAL: Konva needs the stage to be visible and properly sized for toDataURL to work
      // Temporarily make it visible if hidden
      const wasHidden = !visible;
      let originalStyles: Partial<CSSStyleDeclaration> = {};
      
      if (wasHidden && container) {
        // Save original styles
        originalStyles = {
          display: container.style.display,
          visibility: container.style.visibility,
          position: container.style.position,
          left: container.style.left,
          top: container.style.top,
          zIndex: container.style.zIndex,
          opacity: container.style.opacity,
          width: container.style.width,
          height: container.style.height,
        };
        
        // Make visible temporarily (but keep off-screen)
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.position = 'fixed';
        container.style.left = '0px'; // Move to viewport (but will be covered)
        container.style.top = '0px';
        container.style.zIndex = '9999'; // Above everything temporarily
        container.style.opacity = '1';
        container.style.width = `${canvasSize.width}px`;
        container.style.height = `${canvasSize.height}px`;
        
        // Ensure stage has proper dimensions
        if (stage.width() === 0 || stage.height() === 0) {
          stage.width(canvasSize.width);
          stage.height(canvasSize.height);
        }
        
        // Wait for browser to render
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Ensure stage has proper dimensions
      if (stage.width() === 0 || stage.height() === 0) {
        stage.width(canvasSize.width);
        stage.height(canvasSize.height);
      }
      
      // Force a redraw
      stage.batchDraw();
      
      // Additional delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // IMPORTANT: Reset stage transforms temporarily for accurate capture
      // The stage might be scaled/panned, which affects coordinate calculations
      // We'll capture without transforms, then crop, then restore transforms
      const originalScaleX = stage.scaleX();
      const originalScaleY = stage.scaleY();
      const originalX = stage.x();
      const originalY = stage.y();
      
      // Reset transforms for capture
      stage.scaleX(1);
      stage.scaleY(1);
      stage.x(0);
      stage.y(0);
      
      // Ensure white background layer is visible for capture
      // Create a white background rectangle if it doesn't exist
      const layer = stage.findOne('.background-layer') as Konva.Layer || stage.findOne('Layer') as Konva.Layer;
      if (layer && layer instanceof Konva.Layer) {
        // Ensure background is white
        const bgRect = layer.findOne('.bg-rect');
        if (!bgRect) {
          // Add white background rectangle
          const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
            fill: '#FFFFFF',
            listening: false,
          });
          bg.setAttr('className', 'bg-rect');
          layer.add(bg);
          bg.moveToBottom();
        } else {
          bgRect.setAttr('fill', '#FFFFFF');
        }
      }
      
      stage.batchDraw();
      
      // Small delay to ensure redraw
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Use toDataURL - should work now that stage is visible and transforms are reset
      // IMPORTANT: Ensure white background for proper OCR
      let dataURL = stage.toDataURL({
        mimeType: "image/png",
        quality: 0.95,
        pixelRatio: 2,
      });
      
      // Validate the captured image
      if (!dataURL || dataURL.length < 1000) {
        console.error("Whiteboard: Captured image appears to be invalid (too small)");
        // Restore transforms before returning
        stage.scaleX(originalScaleX);
        stage.scaleY(originalScaleY);
        stage.x(originalX);
        stage.y(originalY);
        stage.batchDraw();
        return null;
      }
      
      console.log("Whiteboard: Image captured successfully with white background:", {
        dataURLLength: dataURL.length,
        preview: dataURL.substring(0, 100) + "..."
      });
      
      // Restore transforms immediately
      stage.scaleX(originalScaleX);
      stage.scaleY(originalScaleY);
      stage.x(originalX);
      stage.y(originalY);
      stage.batchDraw();
      
      // Calculate bounding box of all elements and crop image to reduce blank space
      // This improves OCR accuracy by focusing on the actual content
      // Now we can safely use element coordinates since transforms are reset during capture
      const bbox = calculateElementBoundingBox(state.elements, 150); // Increased padding to 150px for safety
      if (bbox) {
        console.log("Whiteboard: Calculated bounding box:", {
          bbox,
          elementCount: state.elements.length,
          stageTransforms: { scaleX: originalScaleX, scaleY: originalScaleY, x: originalX, y: originalY },
          elements: state.elements.map(e => ({ 
            type: e.type, 
            strokeWidth: e.strokeWidth,
            bounds: e.type === 'pen' ? {
              minX: Math.min(...(e.data as any).points.filter((_: any, i: number) => i % 2 === 0)),
              maxX: Math.max(...(e.data as any).points.filter((_: any, i: number) => i % 2 === 0)),
              minY: Math.min(...(e.data as any).points.filter((_: any, i: number) => i % 2 === 1)),
              maxY: Math.max(...(e.data as any).points.filter((_: any, i: number) => i % 2 === 1)),
            } : null
          }))
        });
        
        // TEMPORARILY DISABLE CROPPING - use full image to debug
        // TODO: Re-enable once bounding box calculation is fixed
        console.warn("Whiteboard: Cropping temporarily disabled for debugging - using full image");
        
        // Safety check: Don't crop if bounding box seems suspiciously small
        // const stageArea = stage.width() * stage.height();
        // const bboxArea = bbox.width * bbox.height;
        // const coverageRatio = bboxArea / stageArea;
        
        // if (coverageRatio > 0.8) {
        //   console.warn("Whiteboard: Bounding box covers >80% of stage, skipping crop to avoid issues");
        // } else {
        //   try {
        //     dataURL = await cropImageToBoundingBox(dataURL, bbox);
        //     console.log("Whiteboard: Successfully cropped image to:", {
        //       width: bbox.width,
        //       height: bbox.height,
        //       originalSize: { width: stage.width(), height: stage.height() },
        //       reduction: `${Math.round((1 - (bbox.width * bbox.height) / (stage.width() * stage.height())) * 100)}%`,
        //       coverageRatio: `${Math.round(coverageRatio * 100)}%`
        //     });
        //   } catch (cropError) {
        //     console.warn("Whiteboard: Failed to crop image, using full image:", cropError);
        //     // Continue with full image if crop fails
        //   }
        // }
      } else {
        console.log("Whiteboard: No bounding box calculated, using full image");
      }
      
      // Restore original styles if we changed them
      if (wasHidden && container && originalStyles) {
        if (originalStyles.display !== undefined) container.style.display = originalStyles.display || '';
        if (originalStyles.visibility !== undefined) container.style.visibility = originalStyles.visibility || '';
        if (originalStyles.position !== undefined) container.style.position = originalStyles.position || '';
        if (originalStyles.left !== undefined) container.style.left = originalStyles.left || '';
        if (originalStyles.top !== undefined) container.style.top = originalStyles.top || '';
        if (originalStyles.zIndex !== undefined) container.style.zIndex = originalStyles.zIndex || '';
        if (originalStyles.opacity !== undefined) container.style.opacity = originalStyles.opacity || '';
        if (originalStyles.width !== undefined) container.style.width = originalStyles.width || '';
        if (originalStyles.height !== undefined) container.style.height = originalStyles.height || '';
      }
      
      // Validate the captured image
      if (!dataURL || dataURL.length < 100) {
        console.error("Whiteboard: Captured image appears to be empty");
        return null;
      }
      
      console.log("Whiteboard: Successfully captured image:", { 
        dataURLLength: dataURL.length,
        elementCount: state.elements.length,
        wasHidden,
        stageWidth: stage.width(),
        stageHeight: stage.height(),
        preview: dataURL.substring(0, 50) + "..."
      });
      
      return dataURL;
    } catch (error) {
      console.error("Failed to capture whiteboard image:", error);
      return null;
    }
  }, [state.elements, visible, canvasSize.width, canvasSize.height]);

  // Expose capture function to parent
  useEffect(() => {
    if (onCaptureReady) {
      onCaptureReady(captureWhiteboardImage);
    }
  }, [onCaptureReady, captureWhiteboardImage]);

  // Save state when component becomes invisible (but not unmounted)
  useEffect(() => {
    if (!visible && sessionId && userId) {
      // Component is hidden - flush any pending saves
      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current);
        saveDebounceTimer.current = null;
      }
      
      // Immediately save current state if there are elements
      const currentState = stateRef.current;
      if (!isApplyingRemoteUpdate.current && currentState.elements.length > 0) {
        console.log("Whiteboard hidden - saving state:", { sessionId, elementCount: currentState.elements.length });
        saveWhiteboardState(sessionId, userId, currentState).catch((error) => {
          console.error("Failed to save whiteboard state when hidden:", error);
        });
      }
    }
  }, [visible, sessionId, userId]);

  // Flush pending saves and cleanup on unmount
  useEffect(() => {
    return () => {
      // Flush any pending debounced saves before unmounting
      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current);
        saveDebounceTimer.current = null;
        
        // Immediately save current state if sessionId and userId are available
        // Use ref to get latest state value (not stale closure)
        const currentState = stateRef.current;
        if (sessionId && userId && !isApplyingRemoteUpdate.current && currentState.elements.length > 0) {
          console.log("Whiteboard unmounting - saving state:", { sessionId, elementCount: currentState.elements.length });
          saveWhiteboardState(sessionId, userId, currentState).catch((error) => {
            console.error("Failed to save whiteboard state on unmount:", error);
          });
        }
      }
    };
  }, [sessionId, userId]);

  const handleToolChange = useCallback((tool: ToolType) => {
    setState((prev) => ({ ...prev, currentTool: tool }));
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setState((prev) => ({ ...prev, currentColor: color }));
  }, []);

  const handleStrokeWidthChange = useCallback((strokeWidth: number) => {
    setState((prev) => ({ ...prev, strokeWidth }));
  }, []);

  const handleGridToggle = useCallback(() => {
    setState((prev) => ({ ...prev, gridVisible: !prev.gridVisible }));
  }, []);

  const handleElementsChange = useCallback((elements: WhiteboardState["elements"]) => {
    setState((prev) => ({ ...prev, elements }));
  }, []);

  const handleEquationClick = useCallback((x: number, y: number) => {
    setEquationDialog({ isOpen: true, x, y });
  }, []);

  const handleEquationConfirm = useCallback(
    (expression: string, imageDataUrl: string) => {
      // Use the dialog coordinates which are already in stage space
      const worldX = (equationDialog.x - position.x) / scale;
      const worldY = (equationDialog.y - position.y) / scale;
      
      const newElement: WhiteboardState["elements"][0] = {
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "equation",
        data: {
          x: worldX,
          y: worldY,
          expression,
          fontSize: 20,
          imageDataUrl,
        } as EquationElementData,
        color: state.currentColor,
        strokeWidth: state.strokeWidth,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        elements: [...prev.elements, newElement],
      }));
      setEquationDialog({ isOpen: false, x: 0, y: 0 });
    },
    [equationDialog, position, scale, state.currentColor, state.strokeWidth]
  );

  // Get drawing handlers first
  const { handleStart, handleMove, handleEnd } = useWhiteboardDrawing(
    state.currentTool,
    state.currentColor,
    state.strokeWidth,
    state.elements,
    handleElementsChange,
    (x: number, y: number) => {
      // Convert world coordinates to stage coordinates for equation dialog
      const stagePos = {
        x: x * scale + position.x,
        y: y * scale + position.y,
      };
      handleEquationClick(stagePos.x, stagePos.y);
    }
  );

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale)); // Limit zoom between 0.1x and 5x

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, [scale, position]);

  // Handle pan with space + drag or middle mouse button
  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // Check if space is pressed or middle mouse button
    if (e.evt.button === 1 || isSpacePressed) {
      setIsPanning(true);
      setLastPointerPos(stage.getPointerPosition() || { x: 0, y: 0 });
      e.evt.preventDefault();
      return;
    }
    
    // For drawing tools, convert coordinates accounting for pan/zoom
    if (state.currentTool !== "equation") {
      // Call wrappedHandleStart directly - it's defined below
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      
      const worldPos = {
        x: (pointerPos.x - position.x) / scale,
        y: (pointerPos.y - position.y) / scale,
      };
      
      const modifiedStage = {
        ...stage,
        getPointerPosition: () => worldPos,
      } as Konva.Stage;
      
      const modifiedEvent = {
        ...e,
        target: {
          ...e.target,
          getStage: () => modifiedStage,
        },
      } as Konva.KonvaEventObject<MouseEvent | TouchEvent>;
      
      handleStart(modifiedEvent);
    }
  }, [isSpacePressed, state.currentTool, position, scale, handleStart]);

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const dx = pointerPos.x - lastPointerPos.x;
      const dy = pointerPos.y - lastPointerPos.y;

      setPosition({
        x: position.x + dx,
        y: position.y + dy,
      });
      setLastPointerPos(pointerPos);
      return;
    }
    
    // For drawing tools
    if (state.currentTool !== "equation") {
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      
      const worldPos = {
        x: (pointerPos.x - position.x) / scale,
        y: (pointerPos.y - position.y) / scale,
      };
      
      const modifiedStage = {
        ...stage,
        getPointerPosition: () => worldPos,
      } as Konva.Stage;
      
      const modifiedEvent = {
        ...e,
        target: {
          ...e.target,
          getStage: () => modifiedStage,
        },
      } as Konva.KonvaEventObject<MouseEvent | TouchEvent>;
      
      handleMove(modifiedEvent);
    }
  }, [isPanning, lastPointerPos, position, state.currentTool, scale, handleMove]);

  const handleStageMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsPanning(false);
    
    // For drawing tools
    if (state.currentTool !== "equation") {
      handleEnd();
    }
  }, [state.currentTool, handleEnd]);

  // Reset zoom and pan
  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Export whiteboard state to JSON file
  const handleExport = useCallback(() => {
    try {
      const jsonString = exportWhiteboardState(state);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whiteboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export whiteboard state:", error);
      alert("Failed to export whiteboard state. Please try again.");
    }
  }, [state]);

  // Import whiteboard state from JSON file
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedState = importWhiteboardState(text);
        setState(importedState);
        
        // Save to Firestore if sessionId is available
        if (sessionId && userId) {
          try {
            await saveWhiteboardState(sessionId, userId, importedState);
          } catch (error) {
            console.error("Failed to save imported state to Firestore:", error);
            // Don't show error to user - state is already applied locally
          }
        }
      } catch (error) {
        console.error("Failed to import whiteboard state:", error);
        alert("Failed to import whiteboard state. Please check the file format.");
      }
    };
    input.click();
  }, [sessionId, userId]);

  // Always render the stage (even when hidden) so we can capture images
  // Use CSS to hide it when not visible, but keep it rendered (not display: none)
  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full bg-white border border-gray-200 rounded-lg overflow-hidden"
      role="region"
      aria-label={ariaLabel}
      aria-live="polite"
      style={!visible ? { 
        position: 'fixed', 
        left: '-9999px', 
        top: '-9999px', 
        visibility: 'visible', // Keep visible for Konva capture
        opacity: 0, // But make transparent
        pointerEvents: 'none', // And non-interactive
        zIndex: -1, // Behind everything
        width: canvasSize.width, // Maintain size for proper rendering
        height: canvasSize.height
      } : undefined}
    >
      {/* Toolbar */}
      <WhiteboardToolbar
        currentTool={state.currentTool}
        currentColor={state.currentColor}
        strokeWidth={state.strokeWidth}
        gridVisible={state.gridVisible}
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onStrokeWidthChange={handleStrokeWidthChange}
        onGridToggle={handleGridToggle}
        onZoomIn={() => setScale(Math.min(5, scale * 1.2))}
        onZoomOut={() => setScale(Math.max(0.1, scale / 1.2))}
        onResetZoom={handleResetZoom}
        onSubmit={onSubmit}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden bg-gray-50">
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="touch-none"
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onWheel={handleWheel}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={handleStageMouseUp}
        >
          {/* Grid and Axis Labels Layer */}
          {state.gridVisible && (
            <Layer>
              {CoordinateGrid({
                width: canvasSize.width,
                height: canvasSize.height,
                spacing: state.gridSpacing,
              })}
              {AxisLabels({
                width: canvasSize.width,
                height: canvasSize.height,
                spacing: state.gridSpacing,
                showLabels: true,
              })}
            </Layer>
          )}

          {/* Drawing Canvas Layer */}
          <Layer>
            {/* Transparent background to catch mouse events - events handled at Stage level */}
            <Rect
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
              fill="transparent"
              listening={false}
            />
            <WhiteboardCanvas elements={state.elements} />
          </Layer>
        </Stage>
      </div>

      {/* Equation Input Dialog */}
      <EquationInputDialog
        x={equationDialog.x}
        y={equationDialog.y}
        isOpen={equationDialog.isOpen}
        onClose={() => setEquationDialog({ isOpen: false, x: 0, y: 0 })}
        onConfirm={handleEquationConfirm}
      />
    </div>
  );
}

