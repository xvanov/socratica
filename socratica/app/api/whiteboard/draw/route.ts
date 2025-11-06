import { NextRequest, NextResponse } from "next/server";
import { addWhiteboardElement } from "@/lib/firebase/whiteboard";
import { getSessionById } from "@/lib/firebase/sessions";
import { WhiteboardElement } from "@/types/whiteboard";

/**
 * POST /api/whiteboard/draw
 * Allows AI tutor to add drawings to the whiteboard
 * 
 * Request Body:
 * {
 *   sessionId: string,
 *   userId: string,
 *   element: WhiteboardElement
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: { elementId: string } | null,
 *   error: string | null
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, element } = body;

    // Validate request
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "sessionId is required and must be a string.",
        },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "userId is required and must be a string.",
        },
        { status: 400 }
      );
    }

    if (!element || typeof element !== "object") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "element is required and must be an object.",
        },
        { status: 400 }
      );
    }

    // Validate element structure
    if (!element.id || !element.type || !element.data) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "element must have id, type, and data properties.",
        },
        { status: 400 }
      );
    }

    // Verify session exists and belongs to user
    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Session not found.",
        },
        { status: 404 }
      );
    }

    if (session.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "You don't have permission to modify this session.",
        },
        { status: 403 }
      );
    }

    // Add element to whiteboard
    await addWhiteboardElement(sessionId, userId, element as WhiteboardElement);

    return NextResponse.json(
      {
        success: true,
        data: { elementId: element.id },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Whiteboard draw API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}


