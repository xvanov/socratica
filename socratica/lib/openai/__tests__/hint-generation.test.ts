import { describe, it, expect } from 'vitest';
import {
  calculateHintLevel,
  MAX_HINT_LEVEL,
  STUCK_THRESHOLD,
} from '../stuck-detection';
import {
  generateHintInstructions,
  buildEnhancedPromptWithHints,
  SOCRATIC_MATH_TUTOR_PROMPT,
  type HintLevel,
} from '../prompts';

describe('Hint Generation Logic', () => {
  describe('calculateHintLevel', () => {
    describe('AC2: Hints are progressively more revealing', () => {
      it('should return 0 when not stuck (consecutiveConfused < 2)', () => {
        expect(calculateHintLevel(0)).toBe(0);
        expect(calculateHintLevel(1)).toBe(0);
      });

      it('should return level 1 for 2-3 consecutive confused responses', () => {
        expect(calculateHintLevel(2)).toBe(1);
        expect(calculateHintLevel(3)).toBe(1);
      });

      it('should return level 2 for 4-5 consecutive confused responses', () => {
        expect(calculateHintLevel(4)).toBe(2);
        expect(calculateHintLevel(5)).toBe(2);
      });

      it('should return level 3 for 6+ consecutive confused responses', () => {
        expect(calculateHintLevel(6)).toBe(MAX_HINT_LEVEL);
        expect(calculateHintLevel(7)).toBe(MAX_HINT_LEVEL);
        expect(calculateHintLevel(10)).toBe(MAX_HINT_LEVEL);
      });

      it('should escalate progressively as stuck turns increase', () => {
        expect(calculateHintLevel(2)).toBeLessThan(calculateHintLevel(4));
        expect(calculateHintLevel(4)).toBeLessThan(calculateHintLevel(6));
      });
    });
  });

  describe('generateHintInstructions', () => {
    describe('AC1: When stuck detected, system prompt instructs AI to provide hints (not answers)', () => {
      it('should return empty string for level 0 (no hint)', () => {
        expect(generateHintInstructions(0, 0)).toBe('');
      });

      it('should include instructions to provide hints when stuck', () => {
        const instructions = generateHintInstructions(1, 2);
        expect(instructions).toContain('HINT GENERATION INSTRUCTIONS');
        expect(instructions).toContain('Student is stuck');
        expect(instructions).toContain('consecutive confused responses');
      });

      it('should explicitly state hints must be questions, not direct answers', () => {
        const instructions = generateHintInstructions(1, 2);
        expect(instructions).toContain('Hints must be QUESTIONS');
        expect(instructions).toContain('not direct answers');
        expect(instructions).toContain('NEVER provide direct answers');
      });
    });

    describe('AC2: Hints are progressively more revealing', () => {
      it('should provide level 1 hint instructions (subtle)', () => {
        const instructions = generateHintInstructions(1, 2);
        expect(instructions).toContain('Hint Level 1');
        expect(instructions).toContain('Subtle Hint');
        expect(instructions).toContain('2-3 stuck turns');
        expect(instructions).toContain('subtle guiding question');
        expect(instructions).toContain('general approach');
      });

      it('should provide level 2 hint instructions (more specific)', () => {
        const instructions = generateHintInstructions(2, 4);
        expect(instructions).toContain('Hint Level 2');
        expect(instructions).toContain('More Specific Hint');
        expect(instructions).toContain('4-5 stuck turns');
        expect(instructions).toContain('more specific guiding question');
        expect(instructions).toContain('narrows the approach');
      });

      it('should provide level 3 hint instructions (most specific)', () => {
        const instructions = generateHintInstructions(3, 6);
        expect(instructions).toContain('Hint Level 3');
        expect(instructions).toContain('Most Specific Hint');
        expect(instructions).toContain('6+ stuck turns');
        expect(instructions).toContain('most specific hint');
        expect(instructions).toContain('guide directly to the next step');
      });

      it('should show progression: level 1 < level 2 < level 3 in specificity', () => {
        const level1 = generateHintInstructions(1, 2);
        const level2 = generateHintInstructions(2, 4);
        const level3 = generateHintInstructions(3, 6);

        // Level 2 should be more specific than level 1
        expect(level2.length).toBeGreaterThan(level1.length);
        // Level 3 should be most specific
        expect(level3.length).toBeGreaterThan(level2.length);
      });
    });

    describe('AC3: Hints guide student toward next step in solution', () => {
      it('should instruct hints to guide toward next step', () => {
        const instructions = generateHintInstructions(1, 2);
        expect(instructions).toContain('guide student toward next step');
        expect(instructions).toContain('guide');
      });

      it('should include examples that guide toward next step', () => {
        const instructions = generateHintInstructions(1, 2);
        expect(instructions).toContain('Example:');
        expect(instructions).toMatch(/What operation|How could|What would/);
      });
    });

    describe('AC4: Hints maintain Socratic approach (questions within hints)', () => {
      it('should emphasize hints must be questions', () => {
        const instructions = generateHintInstructions(1, 2);
        expect(instructions).toContain('QUESTIONS');
        expect(instructions).toContain('question');
        expect(instructions).toContain('Socratic approach');
      });

      it('should provide example hints that are questions', () => {
        const level1 = generateHintInstructions(1, 2);
        const level2 = generateHintInstructions(2, 4);
        const level3 = generateHintInstructions(3, 6);

        // All examples should contain question words
        expect(level1).toMatch(/\?/); // Contains question mark
        expect(level2).toMatch(/\?/);
        expect(level3).toMatch(/\?/);
      });

      it('should maintain Socratic approach at all hint levels', () => {
        [1, 2, 3].forEach((level) => {
          const instructions = generateHintInstructions(level as HintLevel, level * 2);
          expect(instructions).toContain('Socratic approach');
          expect(instructions).toContain('question');
        });
      });
    });

    describe('AC5: Hints are algebra-specific and problem-appropriate', () => {
      it('should specify hints are algebra-specific', () => {
        const instructions = generateHintInstructions(1, 2);
        expect(instructions).toContain('algebra-specific');
        expect(instructions).toContain('problem-appropriate');
      });

      it('should provide algebra-specific examples', () => {
        const instructions = generateHintInstructions(1, 2);
        expect(instructions).toMatch(/variable|equation|isolate|operation/i);
      });

      it('should reference algebra concepts in examples', () => {
        const level2 = generateHintInstructions(2, 4);
        const level3 = generateHintInstructions(3, 6);

        expect(level2).toMatch(/equation|both sides|isolate/i);
        expect(level3).toMatch(/solve for|undo|operations/i);
      });
    });

    it('should include consecutive confused count in instructions', () => {
      const instructions = generateHintInstructions(1, 3);
      expect(instructions).toContain('3 consecutive confused responses');
    });
  });

  describe('buildEnhancedPromptWithHints', () => {
    describe('AC1: When stuck detected, system prompt instructs AI to provide hints', () => {
      it('should return base prompt when not stuck', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          false,
          0
        );
        expect(result).toBe(SOCRATIC_MATH_TUTOR_PROMPT);
      });

      it('should return base prompt when consecutiveConfused < 2', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          1
        );
        expect(result).toBe(SOCRATIC_MATH_TUTOR_PROMPT);
      });

      it('should enhance prompt with hint instructions when stuck detected', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          2
        );
        expect(result).toContain(SOCRATIC_MATH_TUTOR_PROMPT);
        expect(result).toContain('HINT GENERATION INSTRUCTIONS');
        expect(result).toContain('Student is stuck');
      });

      it('should use provided hint level when specified', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          2,
          2
        );
        expect(result).toContain('Hint Level 2');
      });

      it('should calculate hint level when not provided', () => {
        const result2 = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          2
        );
        expect(result2).toContain('Hint Level 1');

        const result3 = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          5
        );
        expect(result3).toContain('Hint Level 2');

        const result4 = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          6
        );
        expect(result4).toContain('Hint Level 3');
      });
    });

    describe('AC2: Progressive hint escalation', () => {
      it('should use level 1 for 2-3 consecutive confused', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          2
        );
        expect(result).toContain('Hint Level 1');
        expect(result).toContain('Subtle Hint');
      });

      it('should use level 2 for 4-5 consecutive confused', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          4
        );
        expect(result).toContain('Hint Level 2');
        expect(result).toContain('More Specific Hint');
      });

      it('should use level 3 for 6+ consecutive confused', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          6
        );
        expect(result).toContain('Hint Level 3');
        expect(result).toContain('Most Specific Hint');
      });

      it('should show progressive escalation in prompt length', () => {
        const level1 = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          2,
          1
        );
        const level2 = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          4,
          2
        );
        const level3 = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          6,
          3
        );

        expect(level2.length).toBeGreaterThan(level1.length);
        expect(level3.length).toBeGreaterThan(level2.length);
      });
    });

    describe('AC3: Hints guide toward next step', () => {
      it('should include instructions to guide toward next step', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          2
        );
        expect(result).toContain('guide student toward next step');
        expect(result).toContain('guide');
      });
    });

    describe('AC4: Hints maintain Socratic approach', () => {
      it('should emphasize Socratic approach in all hint levels', () => {
        [1, 2, 3].forEach((level) => {
          const result = buildEnhancedPromptWithHints(
            SOCRATIC_MATH_TUTOR_PROMPT,
            true,
            level * 2,
            level as HintLevel
          );
          expect(result).toContain('Socratic approach');
          expect(result).toContain('questions');
        });
      });
    });

    describe('AC5: Hints are algebra-specific', () => {
      it('should specify hints are algebra-specific', () => {
        const result = buildEnhancedPromptWithHints(
          SOCRATIC_MATH_TUTOR_PROMPT,
          true,
          2
        );
        expect(result).toContain('algebra-specific');
        expect(result).toContain('problem-appropriate');
      });
    });

    it('should handle custom base prompt', () => {
      const customPrompt = 'Custom prompt';
      const result = buildEnhancedPromptWithHints(
        customPrompt,
        true,
        2,
        1
      );
      expect(result).toContain(customPrompt);
      expect(result).toContain('HINT GENERATION INSTRUCTIONS');
    });
  });
});

