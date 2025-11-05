/**
 * Unit tests for Socratic questioning validation
 * Tests functions that verify AI asks guiding questions (not direct answers)
 */

import { describe, test, expect } from 'vitest';
import { Message } from '@/types/chat';

/**
 * Verify that AI responses contain Socratic questioning (questions, not direct answers)
 * @param messages - Array of messages from the chat
 * @returns true if Socratic questioning is present, false otherwise
 */
export function verifySocraticQuestioning(messages: Message[]): boolean {
  const aiMessages = messages.filter((m) => m.role === 'tutor');
  
  if (aiMessages.length === 0) {
    return false;
  }
  
  // Check if AI messages contain questions or guiding statements
  const hasQuestions = aiMessages.some((msg) => {
    const content = msg.content.toLowerCase();
    return (
      content.includes('?') ||
      /can you|what|how|why|what if|think about|consider|notice|observe/i.test(content)
    );
  });
  
  // Verify no direct answers
  const hasNoDirectAnswers = verifyNoDirectAnswers(messages);
  
  return hasQuestions && hasNoDirectAnswers;
}

/**
 * Verify that no direct answers are provided in any message
 * @param messages - Array of messages from the chat
 * @returns true if no direct answers found, false if direct answers detected
 */
export function verifyNoDirectAnswers(messages: Message[]): boolean {
  const directAnswerPatterns = [
    /^x\s*=\s*-?\d+/i, // "x = 5" or "x = -3"
    /^the answer is/i,
    /^solution is/i,
    /^result is/i,
    /^it equals/i,
    /^the value is/i,
    /^x equals/i,
    /^y equals/i,
    /^the solution/i,
    /^the answer/i,
    /equals\s+\d+/i, // "equals 5"
    /^(\d+|-\d+)$/i, // Just a number as answer
  ];
  
  const aiMessages = messages.filter((m) => m.role === 'tutor');
  
  for (const message of aiMessages) {
    const content = message.content;
    
    // Check each line for direct answer patterns
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines or lines that are clearly questions
      if (trimmedLine.length === 0 || trimmedLine.endsWith('?')) {
        continue;
      }
      
      // Check for direct answer patterns
      for (const pattern of directAnswerPatterns) {
        if (pattern.test(trimmedLine)) {
          return false; // Direct answer detected
        }
      }
    }
  }
  
  return true; // No direct answers found
}

describe('Story 5.6: Socratic Questioning Validation - Unit Tests', () => {
  describe('verifySocraticQuestioning', () => {
    test('should return true when AI asks guiding questions', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve for x: 2x + 5 = 13',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'What operation could you use to isolate the variable?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifySocraticQuestioning(messages)).toBe(true);
    });

    test('should return true when AI uses guiding statements', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve for x: 2x + 5 = 13',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'Think about what operation is being performed on the x term.',
          timestamp: new Date(),
        },
      ];
      
      expect(verifySocraticQuestioning(messages)).toBe(true);
    });

    test('should return false when no AI messages present', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve for x: 2x + 5 = 13',
          timestamp: new Date(),
        },
      ];
      
      expect(verifySocraticQuestioning(messages)).toBe(false);
    });

    test('should return false when AI provides direct answer', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve for x: 2x + 5 = 13',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'x = 4',
          timestamp: new Date(),
        },
      ];
      
      expect(verifySocraticQuestioning(messages)).toBe(false);
    });

    test('should return false when AI answer contains direct answer pattern', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve for x: 2x + 5 = 13',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'The answer is x = 4',
          timestamp: new Date(),
        },
      ];
      
      expect(verifySocraticQuestioning(messages)).toBe(false);
    });
  });

  describe('verifyNoDirectAnswers', () => {
    test('should return true when no direct answers present', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve for x: 2x + 5 = 13',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'What operation could you use to isolate the variable?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should return false when direct answer pattern detected (x = number)', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'x = 5',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(false);
    });

    test('should return false when direct answer pattern detected ("the answer is")', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'The answer is 5',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(false);
    });

    test('should return false when direct answer pattern detected ("solution is")', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'Solution is x = 5',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(false);
    });

    test('should return false when direct answer pattern detected ("equals number")', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'x equals 5',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(false);
    });

    test('should return true when question contains number but is not direct answer', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'What number plus 5 equals 13?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should return true when answer is in explanation context but not direct', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'If you subtract 5 from both sides, you get 2x = 8. What would x equal?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should return false when just a number is provided as answer', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: '5',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(false);
    });

    test('should return false when negative number answer provided', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'x = -3',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(false);
    });

    test('should return true when multiple questions are asked', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'What operation could you use? How would you isolate the variable?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should handle multi-line messages correctly', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'Let\'s think about this step by step.\nWhat operation is being performed?\nHow can you undo it?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should detect direct answer in multi-line message', () => {
      const messages: Message[] = [
        {
          role: 'tutor',
          content: 'Let\'s think about this.\nx = 5\nDoes that make sense?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifyNoDirectAnswers(messages)).toBe(false);
    });
  });

  describe('Integration: Real-world scenarios', () => {
    test('should validate Socratic questioning for linear equation problem', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve for x: 2x + 5 = 13',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'What operation could you use to isolate the variable?',
          timestamp: new Date(),
        },
        {
          role: 'student',
          content: 'Subtract 5?',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'That\'s right! What would you do next?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifySocraticQuestioning(messages)).toBe(true);
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });

    test('should detect violation when direct answer provided', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve for x: 2x + 5 = 13',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'x = 4',
          timestamp: new Date(),
        },
      ];
      
      expect(verifySocraticQuestioning(messages)).toBe(false);
      expect(verifyNoDirectAnswers(messages)).toBe(false);
    });

    test('should validate Socratic questioning for quadratic equation problem', () => {
      const messages: Message[] = [
        {
          role: 'student',
          content: 'Solve: x^2 - 5x + 6 = 0',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'What two numbers multiply to give you 6?',
          timestamp: new Date(),
        },
        {
          role: 'student',
          content: '2 and 3?',
          timestamp: new Date(),
        },
        {
          role: 'tutor',
          content: 'Good! What do those numbers need to add up to?',
          timestamp: new Date(),
        },
      ];
      
      expect(verifySocraticQuestioning(messages)).toBe(true);
      expect(verifyNoDirectAnswers(messages)).toBe(true);
    });
  });
});

