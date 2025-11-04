/**
 * Response validation utilities for evaluating student responses
 * Provides functions to validate mathematical expressions and evaluate correctness
 */

/**
 * Validation result indicating correctness level
 */
export type CorrectnessLevel = "correct" | "incorrect" | "partial";

/**
 * Result of validating a mathematical expression
 */
export interface ExpressionValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Result of evaluating student response correctness
 */
export interface ValidationResult {
  correctnessLevel: CorrectnessLevel;
  feedback?: string;
  isValidExpression?: boolean;
  expressionError?: string;
}

/**
 * Patterns for common algebraic notation
 */
const ALGEBRAIC_VARIABLE_PATTERN = /[a-zA-Z]/;
const ALGEBRAIC_OPERATOR_PATTERN = /[+\-*/^=]/;
const NUMBER_PATTERN = /-?\d+(\.\d+)?/;
const PARENTHESIS_PATTERN = /[()]/;

/**
 * Validates that a mathematical expression has valid syntax
 * Handles common algebraic notation: variables, operators, parentheses, exponents
 * 
 * @param expression - The mathematical expression to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateMathematicalExpression(
  expression: string
): ExpressionValidationResult {
  // Trim whitespace
  const trimmed = expression.trim();

  // Empty expression is invalid
  if (!trimmed) {
    return {
      isValid: false,
      error: "Expression cannot be empty",
    };
  }

  // Check for equation format (contains =)
  const isEquation = trimmed.includes("=");
  
  if (isEquation) {
    // Validate equation format: left side = right side
    const parts = trimmed.split("=");
    
    if (parts.length !== 2) {
      return {
        isValid: false,
        error: "Equation must have exactly one equals sign",
      };
    }

    const [leftSide, rightSide] = parts.map((p) => p.trim());
    
    if (!leftSide || !rightSide) {
      return {
        isValid: false,
        error: "Both sides of equation must have content",
      };
    }

    // Validate each side
    const leftValidation = validateExpressionSyntax(leftSide);
    if (!leftValidation.isValid) {
      return {
        isValid: false,
        error: `Left side of equation: ${leftValidation.error}`,
      };
    }

    const rightValidation = validateExpressionSyntax(rightSide);
    if (!rightValidation.isValid) {
      return {
        isValid: false,
        error: `Right side of equation: ${rightValidation.error}`,
      };
    }
  } else {
    // Validate as expression (no equals sign)
    const expressionValidation = validateExpressionSyntax(trimmed);
    if (!expressionValidation.isValid) {
      return {
        isValid: false,
        error: expressionValidation.error,
      };
    }
  }

  return {
    isValid: true,
  };
}

/**
 * Validates expression syntax (expression without equals sign)
 * Checks for balanced parentheses, valid characters, and basic structure
 */
function validateExpressionSyntax(expression: string): ExpressionValidationResult {
  // Check for balanced parentheses
  let openCount = 0;
  for (const char of expression) {
    if (char === "(") {
      openCount++;
    } else if (char === ")") {
      openCount--;
      if (openCount < 0) {
        return {
          isValid: false,
          error: "Unbalanced parentheses",
        };
      }
    }
  }

  if (openCount !== 0) {
    return {
      isValid: false,
      error: "Unbalanced parentheses",
    };
  }

  // Check for valid characters (alphanumeric, operators, parentheses, spaces)
  const validCharPattern = /^[a-zA-Z0-9+\-*/^().\s]+$/;
  if (!validCharPattern.test(expression)) {
    return {
      isValid: false,
      error: "Expression contains invalid characters",
    };
  }

  // Check for consecutive operators (e.g., "++", "+*") - but allow "*-" pattern
  const consecutiveOperatorPattern = /[+\-*/^]{2,}/;
  if (consecutiveOperatorPattern.test(expression.replace(/\s+/g, ""))) {
    // Allow negative numbers: "*-5" or "(-5)" but not "++" or "**"
    const cleaned = expression.replace(/-\d+/g, "").replace(/\(-[^)]+\)/g, "");
    if (consecutiveOperatorPattern.test(cleaned.replace(/\s+/g, ""))) {
      return {
        isValid: false,
        error: "Expression contains consecutive operators",
      };
    }
  }

  // Check for operators at start/end (except for negative numbers)
  const trimmed = expression.trim();
  const startsWithOperator = /^[+\-*/^]/.test(trimmed);
  const endsWithOperator = /[+\-*/^]$/.test(trimmed);
  
  if (startsWithOperator && !trimmed.match(/^-\d/)) {
    // Allow negative numbers starting with "-"
    if (!trimmed.match(/^-\d/)) {
      return {
        isValid: false,
        error: "Expression cannot start with an operator",
      };
    }
  }

  if (endsWithOperator) {
    return {
      isValid: false,
      error: "Expression cannot end with an operator",
    };
  }

  // Basic validation passed
  return {
    isValid: true,
  };
}

/**
 * Evaluates student response for correctness
 * This function provides a framework for correctness evaluation
 * The actual semantic evaluation will be done by the LLM via the enhanced prompt
 * 
 * @param studentResponse - The student's response to evaluate
 * @param problemContext - Optional context about the problem being solved
 * @returns Validation result with correctness level
 */
export function evaluateResponseCorrectness(
  studentResponse: string,
  problemContext?: string
): ValidationResult {
  // First, validate mathematical expression syntax if it looks like a math expression
  const mathExpressionPattern = /[a-zA-Z0-9+\-*/^=()]/;
  const hasMathContent = mathExpressionPattern.test(studentResponse);

  let expressionValidation: ExpressionValidationResult | undefined;
  
  if (hasMathContent) {
    expressionValidation = validateMathematicalExpression(studentResponse);
    
    if (!expressionValidation.isValid) {
      return {
        correctnessLevel: "incorrect",
        isValidExpression: false,
        expressionError: expressionValidation.error,
      };
    }
  }

  // For semantic correctness evaluation, we rely on the LLM via enhanced prompt
  // This function provides the validation framework
  // The actual correctness determination happens in the chat API route with enhanced prompt
  
  return {
    correctnessLevel: "partial", // Default to partial - LLM will refine this
    isValidExpression: expressionValidation?.isValid ?? true,
  };
}

/**
 * Checks if a response indicates partial progress
 * Looks for indicators that student is making progress but not complete
 * 
 * @param response - The student's response
 * @returns True if response indicates partial progress
 */
export function indicatesPartialProgress(response: string): boolean {
  const partialProgressIndicators = [
    /partially/i,
    /getting there/i,
    /think/i,
    /try/i,
    /maybe/i,
    /almost/i,
    /close/i,
  ];

  return partialProgressIndicators.some((pattern) => pattern.test(response));
}

/**
 * Checks if a response indicates correct understanding
 * Looks for indicators that student has correct reasoning
 * 
 * @param response - The student's response
 * @returns True if response indicates correct understanding
 */
export function indicatesCorrectUnderstanding(response: string): boolean {
  const correctIndicators = [
    /correct/i,
    /right/i,
    /yes/i,
    /equals/i,
    /=/,
  ];

  return correctIndicators.some((pattern) => pattern.test(response));
}


