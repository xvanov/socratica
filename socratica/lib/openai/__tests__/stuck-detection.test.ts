import { describe, it, expect } from 'vitest';
import {
  detectConfusion,
  trackStuckState,
  isStudentStuck,
  resetStuckState,
  analyzeConversationForStuckState,
  STUCK_THRESHOLD,
  type StuckState,
} from '../stuck-detection';
import { Message } from '@/types/chat';

describe('Stuck Detection Utilities', () => {
  const createMessage = (
    role: 'student' | 'tutor',
    content: string,
    timestamp: Date | string = new Date()
  ): Message => ({
    role,
    content,
    timestamp,
  });

  describe('detectConfusion', () => {
    describe('AC2: Detects patterns: "I don\'t know", "I\'m stuck", repeated questions', () => {
      it('should detect "I don\'t know" pattern', () => {
        expect(detectConfusion("I don't know how to solve this")).toBe(true);
        expect(detectConfusion("I dont know")).toBe(true);
        expect(detectConfusion("idk what to do")).toBe(true);
      });

      it('should detect "I\'m stuck" pattern', () => {
        expect(detectConfusion("I'm stuck")).toBe(true);
        expect(detectConfusion("im stuck on this problem")).toBe(true);
        expect(detectConfusion("I am stuck")).toBe(true);
      });

      it('should detect "I\'m confused" pattern', () => {
        expect(detectConfusion("I'm confused")).toBe(true);
        expect(detectConfusion("im confused about this")).toBe(true);
      });

      it('should detect "I don\'t understand" pattern', () => {
        expect(detectConfusion("I don't understand")).toBe(true);
        expect(detectConfusion("I dont understand this")).toBe(true);
      });

      it('should detect "help me" pattern', () => {
        expect(detectConfusion("help me please")).toBe(true);
        expect(detectConfusion("I need help")).toBe(true);
      });

      it('should detect repeated questions', () => {
        const history = [
          createMessage('student', 'How do I solve this?'),
          createMessage('tutor', 'What operation would you use?'),
          createMessage('student', 'How do I solve this?'), // Repeated
        ];
        expect(detectConfusion('How do I solve this?', history)).toBe(true);
      });

      it('should not detect confusion in clear responses', () => {
        expect(detectConfusion("I think I need to subtract 5 from both sides")).toBe(false);
        expect(detectConfusion("x equals 4")).toBe(false);
        expect(detectConfusion("Let me try solving for x")).toBe(false);
      });
    });

    describe('AC4: Logic considers response content, not just length', () => {
      it('should detect very short responses as confusion', () => {
        expect(detectConfusion('idk')).toBe(true);
        expect(detectConfusion('?')).toBe(true);
        expect(detectConfusion('no')).toBe(true);
      });

      it('should not detect short but clear responses as confusion', () => {
        expect(detectConfusion('x = 4')).toBe(false);
        expect(detectConfusion('subtract 5')).toBe(false);
      });

      it('should detect long vague responses without math content', () => {
        const vagueResponse = 'I am not sure what to do here because this is really confusing and I have been trying to figure it out but nothing seems to work and I am frustrated';
        expect(detectConfusion(vagueResponse)).toBe(true);
      });

      it('should not detect long responses with math content as confusion', () => {
        const mathResponse = 'I think I need to solve 2x + 5 = 13, so I subtract 5 from both sides to get 2x = 8, then divide by 2 to get x = 4';
        expect(detectConfusion(mathResponse)).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string', () => {
        expect(detectConfusion('')).toBe(true);
        expect(detectConfusion('   ')).toBe(true);
      });

      it('should handle responses with question words as engagement', () => {
        expect(detectConfusion('What should I do next?')).toBe(false);
        expect(detectConfusion('How do I isolate x?')).toBe(false);
      });
    });
  });

  describe('trackStuckState', () => {
    describe('AC1: Tracks number of consecutive responses indicating confusion', () => {
      it('should increment consecutiveConfused when response is confused', () => {
        const initialState = resetStuckState();
        const history: Message[] = [];

        const state1 = trackStuckState("I don't know", history, initialState);
        expect(state1.consecutiveConfused).toBe(1);
        expect(state1.isStuck).toBe(false);

        const state2 = trackStuckState("I'm stuck", history, state1);
        expect(state2.consecutiveConfused).toBe(2);
        expect(state2.isStuck).toBe(true);
      });

      it('should reset consecutiveConfused when response shows progress', () => {
        const initialState = resetStuckState();
        const history: Message[] = [];

        const state1 = trackStuckState("I don't know", history, initialState);
        expect(state1.consecutiveConfused).toBe(1);

        const state2 = trackStuckState("I think I need to subtract 5", history, state1);
        expect(state2.consecutiveConfused).toBe(0);
        expect(state2.isStuck).toBe(false);
      });
    });

    describe('AC3: Flags student as "stuck" after 2 consecutive confused responses', () => {
      it('should flag stuck after exactly 2 confused responses', () => {
        const initialState = resetStuckState();
        const history: Message[] = [];

        const state1 = trackStuckState("I don't know", history, initialState);
        expect(state1.isStuck).toBe(false);

        const state2 = trackStuckState("I'm stuck", history, state1);
        expect(state2.isStuck).toBe(true);
        expect(state2.consecutiveConfused).toBe(STUCK_THRESHOLD);
      });

      it('should remain stuck after 3+ confused responses', () => {
        const initialState = resetStuckState();
        const history: Message[] = [];

        const state1 = trackStuckState("I don't know", history, initialState);
        const state2 = trackStuckState("I'm stuck", history, state1);
        const state3 = trackStuckState("I don't understand", history, state2);

        expect(state3.isStuck).toBe(true);
        expect(state3.consecutiveConfused).toBe(3);
      });
    });

    it('should update lastConfusedIndex when confused', () => {
      const initialState = resetStuckState();
      const history: Message[] = [
        createMessage('student', 'Previous message'),
      ];

      const state = trackStuckState("I don't know", history, initialState);
      expect(state.lastConfusedIndex).toBe(history.length);
    });

    it('should preserve lastConfusedIndex when not confused', () => {
      const initialState: StuckState = {
        consecutiveConfused: 1,
        isStuck: false,
        lastConfusedIndex: 5,
      };
      const history: Message[] = [];

      const state = trackStuckState("I think x = 4", history, initialState);
      expect(state.lastConfusedIndex).toBe(5); // Preserved
      expect(state.consecutiveConfused).toBe(0);
    });
  });

  describe('isStudentStuck', () => {
    it('should return true when student is stuck', () => {
      const initialState = resetStuckState();
      const history: Message[] = [];

      const state1 = trackStuckState("I don't know", history, initialState);
      const state2 = trackStuckState("I'm stuck", history, state1);

      expect(isStudentStuck("I'm still confused", history, state2)).toBe(true);
    });

    it('should return false when student shows progress', () => {
      const initialState = resetStuckState();
      const history: Message[] = [];

      const state = trackStuckState("I think x = 4", history, initialState);
      expect(isStudentStuck("Let me verify", history, state)).toBe(false);
    });
  });

  describe('resetStuckState', () => {
    it('should return reset stuck state', () => {
      const reset = resetStuckState();
      expect(reset.consecutiveConfused).toBe(0);
      expect(reset.isStuck).toBe(false);
      expect(reset.lastConfusedIndex).toBe(null);
    });
  });

  describe('analyzeConversationForStuckState', () => {
    describe('AC5: Stuck state is tracked per problem session', () => {
      it('should analyze conversation and detect stuck state', () => {
        const history: Message[] = [
          createMessage('student', "I don't know"),
          createMessage('tutor', 'Let me help you'),
          createMessage('student', "I'm stuck"),
        ];

        const state = analyzeConversationForStuckState(history);
        expect(state.consecutiveConfused).toBe(2);
        expect(state.isStuck).toBe(true);
      });

      it('should only count consecutive confused responses', () => {
        const history: Message[] = [
          createMessage('student', "I don't know"),
          createMessage('tutor', 'Let me help you'),
          createMessage('student', 'I think x = 4'), // Clear response
          createMessage('tutor', 'Good!'),
          createMessage('student', "I'm stuck"), // New confusion
        ];

        const state = analyzeConversationForStuckState(history);
        expect(state.consecutiveConfused).toBe(1);
        expect(state.isStuck).toBe(false);
      });

      it('should return empty state for no confused responses', () => {
        const history: Message[] = [
          createMessage('student', 'I think x = 4'),
          createMessage('tutor', 'Good!'),
        ];

        const state = analyzeConversationForStuckState(history);
        expect(state.consecutiveConfused).toBe(0);
        expect(state.isStuck).toBe(false);
      });

      it('should handle empty conversation history', () => {
        const state = analyzeConversationForStuckState([]);
        expect(state.consecutiveConfused).toBe(0);
        expect(state.isStuck).toBe(false);
      });
    });
  });
});


