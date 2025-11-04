import { describe, it, expect } from 'vitest';
import { SOCRATIC_MATH_TUTOR_PROMPT } from '../prompts';

describe('Socratic System Prompt (AC Validation)', () => {
  describe('AC1: System prompt instructs AI to NEVER give direct answers', () => {
    it('should explicitly state NEVER give direct answers', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('NEVER');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('NEVER GIVE DIRECT ANSWERS');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('NEVER provide the solution');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('NEVER solve problems');
    });

    it('should state MUST NEVER provide answers multiple times', () => {
      const neverCount = (SOCRATIC_MATH_TUTOR_PROMPT.match(/NEVER/gi) || []).length;
      expect(neverCount).toBeGreaterThanOrEqual(5); // Should appear multiple times for emphasis
    });

    it('should explicitly forbid providing solutions or final results', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('NEVER provide the solution, answer, or final result directly');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('NEVER solve problems for the student');
    });
  });

  describe('AC2: System prompt emphasizes asking guiding questions', () => {
    it('should emphasize asking guiding questions', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('guiding questions');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Ask guiding questions');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('questions that guide');
    });

    it('should state ALWAYS respond with questions', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('ALWAYS respond with questions');
    });

    it('should emphasize guiding over answering', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('guide students');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('guide through questions');
    });
  });

  describe('AC3: System prompt includes examples of Socratic questioning approach', () => {
    it('should include Socratic Questioning Examples section', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Socratic Questioning Examples');
    });

    it('should include example with student input and tutor response', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Student:');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('You:');
    });

    it('should include multiple examples', () => {
      const exampleCount = (SOCRATIC_MATH_TUTOR_PROMPT.match(/Student:/g) || []).length;
      expect(exampleCount).toBeGreaterThanOrEqual(3); // Should have multiple examples
    });

    it('should demonstrate Socratic questioning pattern in examples', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('What operation would you use');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('What\'s happening');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('How could you');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('What happens if');
    });
  });

  describe('AC4: System prompt defines when hints are appropriate (after 2+ stuck turns)', () => {
    it('should explicitly state hint timing: after 2+ stuck turns', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('2+ stuck turns');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('after 2+ stuck turns');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('2 or more consecutive turns');
    });

    it('should include Hint Escalation section', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Hint Escalation');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('After 2+ turns');
    });

    it('should define stuck turn criteria', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('confusion or lack progress');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('2+ consecutive turns');
    });

    it('should specify hints only after escalation, not immediately', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Provide hints ONLY after 2+ stuck turns');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Track when students are stuck');
    });
  });

  describe('AC5: System prompt maintains encouraging, patient tone', () => {
    it('should explicitly state patient and encouraging tone', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('patient');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('encouraging');
    });

    it('should include encouraging language throughout', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('encouraging');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('supportive');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Celebrate progress');
    });

    it('should maintain patient tone in instructions', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('patient');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Maintain a patient, encouraging, and supportive tone');
    });

    it('should use encouraging language in examples', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Great!');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('That\'s okay!');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Help students build confidence');
    });
  });

  describe('AC6: System prompt focuses on algebra problems for MVP', () => {
    it('should explicitly mention algebra focus', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('algebra');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('algebra tutor');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('algebra problems');
    });

    it('should specify MVP focus on algebra', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('This MVP focuses specifically on algebra problems');
    });

    it('should list algebra problem types', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('linear equations');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('systems of equations');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('quadratic equations');
    });

    it('should focus on algebra concepts, not general math', () => {
      // Should mention algebra more than general math terms
      const algebraCount = (SOCRATIC_MATH_TUTOR_PROMPT.match(/algebra/gi) || []).length;
      expect(algebraCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Integration: Prompt content validation', () => {
    it('should be a non-empty string', () => {
      expect(typeof SOCRATIC_MATH_TUTOR_PROMPT).toBe('string');
      expect(SOCRATIC_MATH_TUTOR_PROMPT.length).toBeGreaterThan(0);
    });

    it('should contain all required sections', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('CRITICAL RULE');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Core Principles');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Response Guidelines');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Socratic Questioning Examples');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Hint Escalation');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Focus');
    });

    it('should maintain consistency: never give answers AND always guide', () => {
      const neverCount = (SOCRATIC_MATH_TUTOR_PROMPT.match(/NEVER/gi) || []).length;
      const guideCount = (SOCRATIC_MATH_TUTOR_PROMPT.match(/guide/gi) || []).length;
      
      expect(neverCount).toBeGreaterThan(0);
      expect(guideCount).toBeGreaterThan(0);
    });

    it('should end with reinforcing reminder', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('NEVER give direct answers');
      expect(SOCRATIC_MATH_TUTOR_PROMPT.endsWith('.')).toBe(true);
    });
  });

  describe('Behavioral validation: Prompt enforces Socratic method', () => {
    it('should redirect requests for direct answers', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('What\'s the answer?');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('redirect');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Can you just tell me the answer?');
    });

    it('should emphasize discovery over answers', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('discover');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('discovery');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('guide, not a calculator');
    });

    it('should promote understanding over correctness', () => {
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('understanding');
      expect(SOCRATIC_MATH_TUTOR_PROMPT).toContain('Focus on understanding');
    });
  });
});

