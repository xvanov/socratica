/**
 * Unit tests for algebra problem test fixtures
 * Tests fixture loading, structure validation, and data integrity
 */

import { describe, test, expect } from 'vitest';
import linearProblems from '../../__fixtures__/algebra-problems/linear-equations.json';
import quadraticProblems from '../../__fixtures__/algebra-problems/quadratic-equations.json';
import systemsProblems from '../../__fixtures__/algebra-problems/systems-of-equations.json';
import factoringProblems from '../../__fixtures__/algebra-problems/factoring-problems.json';
import wordProblems from '../../__fixtures__/algebra-problems/word-problems.json';

describe('Story 5.6: Algebra Problem Fixtures - Unit Tests', () => {
  describe('Fixture Loading', () => {
    test('should load linear equations fixture', () => {
      expect(linearProblems).toBeDefined();
      expect(linearProblems.type).toBe('linear');
      expect(linearProblems.problems).toBeInstanceOf(Array);
      expect(linearProblems.problems.length).toBeGreaterThan(0);
    });

    test('should load quadratic equations fixture', () => {
      expect(quadraticProblems).toBeDefined();
      expect(quadraticProblems.type).toBe('quadratic');
      expect(quadraticProblems.problems).toBeInstanceOf(Array);
      expect(quadraticProblems.problems.length).toBeGreaterThan(0);
    });

    test('should load systems of equations fixture', () => {
      expect(systemsProblems).toBeDefined();
      expect(systemsProblems.type).toBe('systems');
      expect(systemsProblems.problems).toBeInstanceOf(Array);
      expect(systemsProblems.problems.length).toBeGreaterThan(0);
    });

    test('should load factoring problems fixture', () => {
      expect(factoringProblems).toBeDefined();
      expect(factoringProblems.type).toBe('factoring');
      expect(factoringProblems.problems).toBeInstanceOf(Array);
      expect(factoringProblems.problems.length).toBeGreaterThan(0);
    });

    test('should load word problems fixture', () => {
      expect(wordProblems).toBeDefined();
      expect(wordProblems.type).toBe('word');
      expect(wordProblems.problems).toBeInstanceOf(Array);
      expect(wordProblems.problems.length).toBeGreaterThan(0);
    });
  });

  describe('Fixture Structure Validation', () => {
    const allFixtures = [
      { name: 'linear', data: linearProblems },
      { name: 'quadratic', data: quadraticProblems },
      { name: 'systems', data: systemsProblems },
      { name: 'factoring', data: factoringProblems },
      { name: 'word', data: wordProblems },
    ];

    allFixtures.forEach(({ name, data }) => {
      test(`should have correct structure for ${name} fixture`, () => {
        expect(data).toHaveProperty('type');
        expect(data).toHaveProperty('description');
        expect(data).toHaveProperty('problems');
        expect(data).toHaveProperty('testMetadata');
        expect(typeof data.type).toBe('string');
        expect(typeof data.description).toBe('string');
        expect(Array.isArray(data.problems)).toBe(true);
        expect(typeof data.testMetadata).toBe('object');
      });

      test(`should have at least 3 problems for ${name} fixture`, () => {
        expect(data.problems.length).toBeGreaterThanOrEqual(3);
      });

      test(`should have valid problem structure for ${name} fixture`, () => {
        data.problems.forEach((problem: any, index: number) => {
          expect(problem, `Problem ${index} in ${name} fixture`).toHaveProperty('id');
          expect(problem, `Problem ${index} in ${name} fixture`).toHaveProperty('problem');
          expect(problem, `Problem ${index} in ${name} fixture`).toHaveProperty('difficulty');
          expect(problem, `Problem ${index} in ${name} fixture`).toHaveProperty('category');
          expect(problem, `Problem ${index} in ${name} fixture`).toHaveProperty('expectedMathNotation');
          expect(problem, `Problem ${index} in ${name} fixture`).toHaveProperty('expectedQuestions');
          expect(problem, `Problem ${index} in ${name} fixture`).toHaveProperty('expectedWorkflow');
          
          expect(typeof problem.id).toBe('string');
          expect(typeof problem.problem).toBe('string');
          expect(typeof problem.difficulty).toBe('string');
          expect(typeof problem.category).toBe('string');
          expect(Array.isArray(problem.expectedMathNotation)).toBe(true);
          expect(Array.isArray(problem.expectedQuestions)).toBe(true);
          expect(Array.isArray(problem.expectedWorkflow)).toBe(true);
        });
      });
    });
  });

  describe('Problem Content Validation', () => {
    const allProblems = [
      ...linearProblems.problems,
      ...quadraticProblems.problems,
      ...systemsProblems.problems,
      ...factoringProblems.problems,
      ...wordProblems.problems,
    ];

    test('should have unique problem IDs', () => {
      const ids = allProblems.map((p: any) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('should have non-empty problem text', () => {
      allProblems.forEach((problem: any) => {
        expect(problem.problem.trim().length).toBeGreaterThan(0);
      });
    });

    test('should have at least one expected question', () => {
      allProblems.forEach((problem: any) => {
        expect(problem.expectedQuestions.length).toBeGreaterThan(0);
      });
    });

    test('should have at least one workflow step', () => {
      allProblems.forEach((problem: any) => {
        expect(problem.expectedWorkflow.length).toBeGreaterThan(0);
      });
    });

    test('should have non-empty expected math notation', () => {
      allProblems.forEach((problem: any) => {
        expect(problem.expectedMathNotation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Total Problem Count', () => {
    test('should have 5+ algebra problem types', () => {
      const problemTypes = new Set([
        linearProblems.type,
        quadraticProblems.type,
        systemsProblems.type,
        factoringProblems.type,
        wordProblems.type,
      ]);
      expect(problemTypes.size).toBeGreaterThanOrEqual(5);
    });

    test('should have 25+ total problems across all types', () => {
      const totalProblems =
        linearProblems.problems.length +
        quadraticProblems.problems.length +
        systemsProblems.problems.length +
        factoringProblems.problems.length +
        wordProblems.problems.length;
      expect(totalProblems).toBeGreaterThanOrEqual(25);
    });
  });

  describe('Socratic Questioning Validation', () => {
    const allProblems = [
      ...linearProblems.problems,
      ...quadraticProblems.problems,
      ...systemsProblems.problems,
      ...factoringProblems.problems,
      ...wordProblems.problems,
    ];

    test('expected questions should not contain direct answers', () => {
      const directAnswerPatterns = [
        /^x\s*=\s*\d+/i,
        /^the answer is/i,
        /^solution is/i,
        /^result is/i,
        /^it equals/i,
      ];

      allProblems.forEach((problem: any) => {
        problem.expectedQuestions.forEach((question: string) => {
          directAnswerPatterns.forEach((pattern) => {
            expect(
              pattern.test(question),
              `Question "${question}" should not contain direct answer pattern ${pattern}`
            ).toBe(false);
          });
        });
      });
    });

    test('expected questions should contain question marks or be guiding statements', () => {
      allProblems.forEach((problem: any) => {
        problem.expectedQuestions.forEach((question: string) => {
          const hasQuestionMark = question.includes('?');
          const isGuidingStatement = /can you|what|how|why|what if|think about/i.test(question);
          expect(
            hasQuestionMark || isGuidingStatement,
            `Question "${question}" should be a question or guiding statement`
          ).toBe(true);
        });
      });
    });
  });

  describe('Math Notation Validation', () => {
    const allProblems = [
      ...linearProblems.problems,
      ...quadraticProblems.problems,
      ...systemsProblems.problems,
      ...factoringProblems.problems,
      ...wordProblems.problems,
    ];

    test('should have expected math notation elements', () => {
      allProblems.forEach((problem: any) => {
        expect(problem.expectedMathNotation.length).toBeGreaterThan(0);
        problem.expectedMathNotation.forEach((notation: string) => {
          expect(typeof notation).toBe('string');
          expect(notation.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Expected Workflow Validation', () => {
    const allProblems = [
      ...linearProblems.problems,
      ...quadraticProblems.problems,
      ...systemsProblems.problems,
      ...factoringProblems.problems,
      ...wordProblems.problems,
    ];

    test('should have workflow starting with problem submission', () => {
      allProblems.forEach((problem: any) => {
        const firstStep = problem.expectedWorkflow[0].toLowerCase();
        expect(
          firstStep.includes('submit') || firstStep.includes('student submits'),
          `Workflow should start with problem submission: ${problem.id}`
        ).toBe(true);
      });
    });

    test('should have workflow ending with AI confirmation', () => {
      allProblems.forEach((problem: any) => {
        const lastStep = problem.expectedWorkflow[problem.expectedWorkflow.length - 1].toLowerCase();
        expect(
          lastStep.includes('confirm') || lastStep.includes('ai confirms'),
          `Workflow should end with AI confirmation: ${problem.id}`
        ).toBe(true);
      });
    });
  });
});

