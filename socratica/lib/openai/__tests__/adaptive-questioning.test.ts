import { describe, it, expect } from 'vitest';
import {
  determineUnderstandingLevel,
  adjustQuestionComplexity,
  getAdaptiveQuestioningInstructions,
  buildProgressiveQuestion,
  determineCurrentStep,
  resetUnderstandingState,
  UNDERSTANDING_TO_COMPLEXITY,
  type UnderstandingLevel,
  type QuestionComplexity,
  type UnderstandingState,
} from '../adaptive-questioning';
import type { StuckState } from '@/types/chat';

describe('Adaptive Questioning Framework', () => {
  describe('determineUnderstandingLevel', () => {
    it('should mark as confused when stuck with 2+ consecutive confused responses', () => {
      const stuckState: StuckState = {
        consecutiveConfused: 2,
        isStuck: true,
        lastConfusedIndex: 0,
      };
      
      const state = determineUnderstandingLevel('incorrect', stuckState, null);
      
      expect(state.level).toBe('confused');
    });

    it('should mark as confused with 3+ consecutive incorrect responses', () => {
      const previousState: UnderstandingState = {
        level: 'progressing',
        consecutiveCorrect: 0,
        consecutiveIncorrect: 2,
        consecutivePartial: 0,
        totalResponses: 2,
        lastUpdated: Date.now(),
      };
      
      const state = determineUnderstandingLevel('incorrect', null, previousState);
      
      expect(state.level).toBe('confused');
      expect(state.consecutiveIncorrect).toBe(3);
    });

    it('should mark as struggling with 2 consecutive incorrect responses', () => {
      const previousState: UnderstandingState = {
        level: 'progressing',
        consecutiveCorrect: 0,
        consecutiveIncorrect: 1,
        consecutivePartial: 0,
        totalResponses: 1,
        lastUpdated: Date.now(),
      };
      
      const state = determineUnderstandingLevel('incorrect', null, previousState);
      
      expect(state.level).toBe('struggling');
      expect(state.consecutiveIncorrect).toBe(2);
    });

    it('should mark as strong with 2+ consecutive correct responses', () => {
      const previousState: UnderstandingState = {
        level: 'progressing',
        consecutiveCorrect: 1,
        consecutiveIncorrect: 0,
        consecutivePartial: 0,
        totalResponses: 1,
        lastUpdated: Date.now(),
      };
      
      const state = determineUnderstandingLevel('correct', null, previousState);
      
      expect(state.level).toBe('strong');
      expect(state.consecutiveCorrect).toBe(2);
    });

    it('should default to progressing with mixed responses', () => {
      const state = determineUnderstandingLevel('partial', null, null);
      
      expect(state.level).toBe('progressing');
    });

    it('should track consecutive counters correctly', () => {
      let state: UnderstandingState | null = null;
      
      // First incorrect
      state = determineUnderstandingLevel('incorrect', null, state);
      expect(state.consecutiveIncorrect).toBe(1);
      expect(state.consecutiveCorrect).toBe(0);
      
      // Second incorrect
      state = determineUnderstandingLevel('incorrect', null, state);
      expect(state.consecutiveIncorrect).toBe(2);
      expect(state.level).toBe('struggling');
      
      // Correct response resets incorrect counter
      state = determineUnderstandingLevel('correct', null, state);
      expect(state.consecutiveIncorrect).toBe(0);
      expect(state.consecutiveCorrect).toBe(1);
    });

    it('should initialize state if not provided', () => {
      const state = determineUnderstandingLevel('correct', null, null);
      
      expect(state.level).toBe('progressing'); // Default
      expect(state.totalResponses).toBe(1);
      expect(state.consecutiveCorrect).toBe(1);
    });

    it('should update total responses count', () => {
      const previousState: UnderstandingState = {
        level: 'progressing',
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        consecutivePartial: 0,
        totalResponses: 5,
        lastUpdated: Date.now(),
      };
      
      const state = determineUnderstandingLevel('correct', null, previousState);
      
      expect(state.totalResponses).toBe(6);
    });
  });

  describe('adjustQuestionComplexity', () => {
    it('should return simplified for confused level', () => {
      expect(adjustQuestionComplexity('confused')).toBe('simplified');
    });

    it('should return scaffolded for struggling level', () => {
      expect(adjustQuestionComplexity('struggling')).toBe('scaffolded');
    });

    it('should return standard for progressing level', () => {
      expect(adjustQuestionComplexity('progressing')).toBe('standard');
    });

    it('should return advanced for strong level', () => {
      expect(adjustQuestionComplexity('strong')).toBe('advanced');
    });

    it('should match UNDERSTANDING_TO_COMPLEXITY mapping', () => {
      expect(adjustQuestionComplexity('confused')).toBe(UNDERSTANDING_TO_COMPLEXITY.confused);
      expect(adjustQuestionComplexity('struggling')).toBe(UNDERSTANDING_TO_COMPLEXITY.struggling);
      expect(adjustQuestionComplexity('progressing')).toBe(UNDERSTANDING_TO_COMPLEXITY.progressing);
      expect(adjustQuestionComplexity('strong')).toBe(UNDERSTANDING_TO_COMPLEXITY.strong);
    });
  });

  describe('getAdaptiveQuestioningInstructions', () => {
    it('should return instructions for confused level', () => {
      const instructions = getAdaptiveQuestioningInstructions('confused', 'simplified');
      
      expect(instructions).toContain('Confused');
      expect(instructions).toContain('Simplified');
      expect(instructions).toContain('simpler');
      expect(instructions).toContain('NEVER give direct answers');
    });

    it('should return instructions for struggling level', () => {
      const instructions = getAdaptiveQuestioningInstructions('struggling', 'scaffolded');
      
      expect(instructions).toContain('Struggling');
      expect(instructions).toContain('Scaffolded');
      expect(instructions).toContain('scaffolding');
      expect(instructions).toContain('NEVER give direct answers');
    });

    it('should return instructions for progressing level', () => {
      const instructions = getAdaptiveQuestioningInstructions('progressing', 'standard');
      
      expect(instructions).toContain('Progressing');
      expect(instructions).toContain('Standard');
      expect(instructions).toContain('normal progression');
      expect(instructions).toContain('NEVER give direct answers');
    });

    it('should return instructions for strong level', () => {
      const instructions = getAdaptiveQuestioningInstructions('strong', 'advanced');
      
      expect(instructions).toContain('Strong');
      expect(instructions).toContain('Advanced');
      expect(instructions).toContain('more challenging');
      expect(instructions).toContain('NEVER give direct answers');
    });

    it('should maintain Socratic approach in all complexity levels', () => {
      const levels: UnderstandingLevel[] = ['confused', 'struggling', 'progressing', 'strong'];
      const complexities: QuestionComplexity[] = ['simplified', 'scaffolded', 'standard', 'advanced'];
      
      levels.forEach((level, i) => {
        const instructions = getAdaptiveQuestioningInstructions(level, complexities[i]);
        expect(instructions).toContain('questions');
        expect(instructions).toContain('NEVER give direct answers');
      });
    });
  });

  describe('buildProgressiveQuestion', () => {
    it('should return question for step 0 (understand problem)', () => {
      const question = buildProgressiveQuestion(0, 'progressing');
      
      expect(question).toBeDefined();
      expect(question.length).toBeGreaterThan(0);
    });

    it('should return different complexity for different understanding levels', () => {
      const simplified = buildProgressiveQuestion(0, 'confused');
      const standard = buildProgressiveQuestion(0, 'progressing');
      const advanced = buildProgressiveQuestion(0, 'strong');
      
      // Simplified should be simpler/shorter
      expect(simplified).toContain('What do you see');
      expect(standard).toBeDefined();
      expect(advanced).toBeDefined();
    });

    it('should return questions for all steps (0-4)', () => {
      for (let step = 0; step <= 4; step++) {
        const question = buildProgressiveQuestion(step, 'progressing');
        expect(question).toBeDefined();
        expect(question.length).toBeGreaterThan(0);
      }
    });

    it('should handle step beyond range (defaults to last step)', () => {
      const question = buildProgressiveQuestion(10, 'progressing');
      
      expect(question).toBeDefined();
      expect(question.length).toBeGreaterThan(0);
    });
  });

  describe('determineCurrentStep', () => {
    it('should return step 4 for verify mentions', () => {
      const history = [
        { role: 'user', content: 'Let me verify my answer' },
      ];
      
      expect(determineCurrentStep(history)).toBe(4);
    });

    it('should return step 3 for solve mentions', () => {
      const history = [
        { role: 'user', content: 'x = 4' },
      ];
      
      expect(determineCurrentStep(history)).toBe(3);
    });

    it('should return step 2 for isolate mentions', () => {
      const history = [
        { role: 'user', content: 'How do I isolate x?' },
      ];
      
      expect(determineCurrentStep(history)).toBe(2);
    });

    it('should return step 1 for approach mentions', () => {
      const history = [
        { role: 'user', content: 'What strategy should I use?' },
      ];
      
      expect(determineCurrentStep(history)).toBe(1);
    });

    it('should return step 0 by default', () => {
      const history = [
        { role: 'user', content: 'Hello' },
      ];
      
      expect(determineCurrentStep(history)).toBe(0);
    });

    it('should handle empty history', () => {
      expect(determineCurrentStep([])).toBe(0);
    });
  });

  describe('resetUnderstandingState', () => {
    it('should return fresh understanding state', () => {
      const state = resetUnderstandingState();
      
      expect(state.level).toBe('progressing');
      expect(state.consecutiveCorrect).toBe(0);
      expect(state.consecutiveIncorrect).toBe(0);
      expect(state.consecutivePartial).toBe(0);
      expect(state.totalResponses).toBe(0);
      expect(state.lastUpdated).toBeGreaterThan(0);
    });
  });

  describe('Integration: Understanding level transitions', () => {
    it('should transition from progressing to confused when stuck', () => {
      let state: UnderstandingState | null = null;
      
      // Progressing with incorrect
      state = determineUnderstandingLevel('incorrect', null, state);
      
      // Stuck detected
      const stuckState: StuckState = {
        consecutiveConfused: 2,
        isStuck: true,
        lastConfusedIndex: 0,
      };
      
      state = determineUnderstandingLevel('incorrect', stuckState, state);
      
      expect(state.level).toBe('confused');
    });

    it('should transition from confused to progressing when correct', () => {
      const previousState: UnderstandingState = {
        level: 'confused',
        consecutiveCorrect: 0,
        consecutiveIncorrect: 3,
        consecutivePartial: 0,
        totalResponses: 3,
        lastUpdated: Date.now(),
      };
      
      const state = determineUnderstandingLevel('correct', null, previousState);
      
      // Should transition to progressing (not immediately strong)
      expect(state.level).toBe('progressing');
      expect(state.consecutiveCorrect).toBe(1);
    });

    it('should transition from progressing to strong with consecutive correct', () => {
      const previousState: UnderstandingState = {
        level: 'progressing',
        consecutiveCorrect: 1,
        consecutiveIncorrect: 0,
        consecutivePartial: 0,
        totalResponses: 1,
        lastUpdated: Date.now(),
      };
      
      const state = determineUnderstandingLevel('correct', null, previousState);
      
      expect(state.level).toBe('strong');
    });
  });
});

