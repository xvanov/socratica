import { describe, it, expect } from 'vitest';
import {
  validateMathematicalExpression,
  evaluateResponseCorrectness,
  indicatesPartialProgress,
  indicatesCorrectUnderstanding,
  ExpressionValidationResult,
  ValidationResult,
} from '../response-validation';

describe('Response Validation Framework', () => {
  describe('validateMathematicalExpression', () => {
    describe('Valid expressions', () => {
      it('should validate simple algebraic expressions', () => {
        const result = validateMathematicalExpression('2x + 5');
        expect(result.isValid).toBe(true);
      });

      it('should validate expressions with variables', () => {
        const result = validateMathematicalExpression('x + y');
        expect(result.isValid).toBe(true);
      });

      it('should validate expressions with parentheses', () => {
        const result = validateMathematicalExpression('2(x + 3)');
        expect(result.isValid).toBe(true);
      });

      it('should validate expressions with exponents', () => {
        const result = validateMathematicalExpression('x^2 + 3x');
        expect(result.isValid).toBe(true);
      });

      it('should validate negative numbers', () => {
        const result = validateMathematicalExpression('-5x + 3');
        expect(result.isValid).toBe(true);
      });

      it('should validate decimal numbers', () => {
        const result = validateMathematicalExpression('2.5x + 1.3');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Valid equations', () => {
      it('should validate equations with equals sign', () => {
        const result = validateMathematicalExpression('2x + 5 = 13');
        expect(result.isValid).toBe(true);
      });

      it('should validate complex equations', () => {
        const result = validateMathematicalExpression('x^2 + 3x - 5 = 0');
        expect(result.isValid).toBe(true);
      });

      it('should validate equations with parentheses', () => {
        const result = validateMathematicalExpression('2(x + 3) = 10');
        expect(result.isValid).toBe(true);
      });

      it('should validate equations with multiple variables', () => {
        const result = validateMathematicalExpression('x + y = 5');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Invalid expressions', () => {
      it('should reject empty expressions', () => {
        const result = validateMathematicalExpression('');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('empty');
      });

      it('should reject expressions with only whitespace', () => {
        const result = validateMathematicalExpression('   ');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('empty');
      });

      it('should reject expressions ending with operator', () => {
        const result = validateMathematicalExpression('2x +');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('cannot end with an operator');
      });

      it('should reject expressions starting with invalid operator', () => {
        const result = validateMathematicalExpression('+ 2x');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('cannot start');
      });

      it('should reject consecutive operators', () => {
        const result = validateMathematicalExpression('2x ++ 5');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('consecutive operators');
      });

      it('should reject unbalanced parentheses', () => {
        const result = validateMathematicalExpression('2(x + 3');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Unbalanced parentheses');
      });

      it('should reject closing parenthesis before opening', () => {
        const result = validateMathematicalExpression('2x + 3)');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Unbalanced parentheses');
      });

      it('should reject invalid characters', () => {
        const result = validateMathematicalExpression('2x + 5@');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('invalid characters');
      });
    });

    describe('Invalid equations', () => {
      it('should reject equations with multiple equals signs', () => {
        const result = validateMathematicalExpression('x = 5 = 3');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('exactly one equals sign');
      });

      it('should reject equations with no left side', () => {
        const result = validateMathematicalExpression('= 5');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Both sides');
      });

      it('should reject equations with no right side', () => {
        const result = validateMathematicalExpression('x =');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Both sides');
      });

      it('should reject invalid expression on left side', () => {
        const result = validateMathematicalExpression('2x + = 5');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Left side');
      });

      it('should reject invalid expression on right side', () => {
        const result = validateMathematicalExpression('x = + 5');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Right side');
      });
    });
  });

  describe('evaluateResponseCorrectness', () => {
    it('should validate expression syntax before evaluation', () => {
      const result = evaluateResponseCorrectness('2x +');
      expect(result.correctnessLevel).toBe('incorrect');
      expect(result.isValidExpression).toBe(false);
      expect(result.expressionError).toBeDefined();
    });

    it('should return partial for valid expressions (semantic evaluation done by LLM)', () => {
      const result = evaluateResponseCorrectness('2x + 5 = 13');
      expect(result.correctnessLevel).toBe('partial');
      expect(result.isValidExpression).toBe(true);
    });

    it('should handle non-math responses', () => {
      const result = evaluateResponseCorrectness('I need help');
      expect(result.correctnessLevel).toBe('partial');
      expect(result.isValidExpression).toBe(true); // No math content, so no validation needed
    });

    it('should accept problem context parameter', () => {
      const result = evaluateResponseCorrectness('x = 4', 'Solve 2x + 5 = 13');
      expect(result.correctnessLevel).toBe('partial');
      expect(result.isValidExpression).toBe(true);
    });
  });

  describe('indicatesPartialProgress', () => {
    it('should detect partial progress indicators', () => {
      expect(indicatesPartialProgress('I think maybe')).toBe(true);
      expect(indicatesPartialProgress('Getting there')).toBe(true);
      expect(indicatesPartialProgress('Almost right')).toBe(true);
      expect(indicatesPartialProgress('I\'m trying')).toBe(true);
    });

    it('should return false for responses without partial indicators', () => {
      expect(indicatesPartialProgress('x = 4')).toBe(false);
      expect(indicatesPartialProgress('I don\'t know')).toBe(false);
      expect(indicatesPartialProgress('Yes')).toBe(false);
    });
  });

  describe('indicatesCorrectUnderstanding', () => {
    it('should detect correct understanding indicators', () => {
      expect(indicatesCorrectUnderstanding('That\'s correct')).toBe(true);
      expect(indicatesCorrectUnderstanding('Yes, that\'s right')).toBe(true);
      expect(indicatesCorrectUnderstanding('x = 4')).toBe(true); // Contains equals sign
    });

    it('should return false for responses without correct indicators', () => {
      expect(indicatesCorrectUnderstanding('I don\'t know')).toBe(false);
      expect(indicatesCorrectUnderstanding('Maybe')).toBe(false);
      expect(indicatesCorrectUnderstanding('Help me')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long expressions', () => {
      const longExpression = 'x'.repeat(100) + ' + 5';
      const result = validateMathematicalExpression(longExpression);
      expect(result.isValid).toBe(true);
    });

    it('should handle expressions with many parentheses', () => {
      const result = validateMathematicalExpression('((((x + 1) + 2) + 3) + 4)');
      expect(result.isValid).toBe(true);
    });

    it('should handle expressions with spaces', () => {
      const result = validateMathematicalExpression('2 x + 5 = 13');
      expect(result.isValid).toBe(true);
    });

    it('should handle single character expressions', () => {
      const result = validateMathematicalExpression('x');
      expect(result.isValid).toBe(true);
    });

    it('should handle single number expressions', () => {
      const result = validateMathematicalExpression('5');
      expect(result.isValid).toBe(true);
    });

    it('should handle equations with single character on each side', () => {
      const result = validateMathematicalExpression('x = 5');
      expect(result.isValid).toBe(true);
    });
  });
});




