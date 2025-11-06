# Adaptive Questioning Testing Workflow

## Overview

Adaptive questioning adjusts the complexity of AI tutor questions based on your understanding level. The system tracks your responses and adjusts question complexity accordingly.

**Understanding Levels:**
- **Confused** → Simplified questions (more guidance, simpler language)
- **Stuck** → Scaffolded questions (step-by-step guidance)
- **Progressing** → Standard questions (normal Socratic approach)
- **Strong** → Advanced questions (more challenging, deeper thinking)

---

## How to Test Each Understanding Level

### Test 1: Trigger "Confused" Level (Simplified Questions)

**Goal:** Get AI to use simplified, very guided questions

**Steps:**
1. Start a new problem: `Solve for x: 2x + 5 = 13`
2. **Send 3+ incorrect or confused responses** in a row:
   - "I don't know"
   - "I'm confused"
   - "This doesn't make sense"
   - "I don't understand"
   - Or give wrong answers: "x = 10", "x = 15"

**What to expect:**
- ✅ AI asks very simple, yes/no questions
- ✅ AI breaks problems into tiny steps
- ✅ AI uses more encouragement: "Let's start with something simpler..."
- ✅ AI checks understanding frequently
- ✅ Example: "What do you see in this equation? Is there a number being added to x?"

**How to verify:**
- Open browser console (F12 → Console)
- Look for logs showing understanding level
- AI questions should be noticeably simpler and more guided

---

### Test 2: Trigger "Struggling" Level (Scaffolded Questions)

**Goal:** Get AI to use scaffolded, step-by-step questions

**Steps:**
1. Start a new problem: `Solve for x: 3x - 7 = 14`
2. **Send 2 incorrect responses:**
   - First wrong answer: "x = 5"
   - Second wrong answer: "x = 3"
   - OR send one confused response: "I'm stuck"

**What to expect:**
- ✅ AI asks guiding questions that break problems into steps
- ✅ AI provides scaffolding within questions
- ✅ AI checks understanding at each step
- ✅ Example: "Let's work through this step by step. First, what number is being subtracted from 3x? What operation would undo that subtraction?"

**How to verify:**
- AI should ask questions that guide you through steps
- Questions should be more structured than simplified but still very guided

---

### Test 3: Test "Progressing" Level (Standard Questions)

**Goal:** See normal Socratic questioning (default state)

**Steps:**
1. Start a new problem: `Solve for x: x + 8 = 15`
2. Send a mix of responses:
   - Some correct answers
   - Some partial answers
   - Some questions

**What to expect:**
- ✅ AI asks standard Socratic questions
- ✅ Questions guide toward solution but aren't overly simplified
- ✅ Example: "What operation would you use to get x by itself? What's happening to the x in this equation?"
- ✅ Balanced guidance and independence

**How to verify:**
- This is the default state when starting fresh
- Questions should feel natural and balanced

---

### Test 4: Trigger "Strong" Level (Advanced Questions)

**Goal:** Get AI to ask more challenging, advanced questions

**Steps:**
1. Start a new problem: `Solve for x: 5x + 10 = 35`
2. **Send 2+ correct answers in a row:**
   - First response: "I subtract 10 from both sides: 5x = 25"
   - Second response: "Then divide by 5: x = 5"
   - OR send consistently correct answers: "x = 5", "x = 7", "x = 3"

**What to expect:**
- ✅ AI asks more challenging questions
- ✅ AI reduces scaffolding - expects more independent thinking
- ✅ AI asks deeper conceptual questions
- ✅ AI may skip simpler steps if you demonstrate understanding
- ✅ Example: "How would you approach solving this equation? What properties of equality apply here?"

**How to verify:**
- Questions should be more sophisticated
- AI should expect you to think more independently
- AI should challenge you to explain reasoning

---

## Testing Scenarios

### Scenario 1: Recovery from Confused to Progressing

**Test:** Can student recover from confused state?

**Steps:**
1. Trigger confused state (3+ wrong answers)
2. Then start giving correct answers:
   - "I subtract 5 from both sides"
   - "Then divide by 2"
   - "x = 4"
3. **Expected:** Understanding level should improve from "confused" → "struggling" → "progressing"

**What to verify:**
- Question complexity should gradually increase
- AI should recognize improvement
- Should transition smoothly between levels

---

### Scenario 2: Mixed Performance

**Test:** How does system handle mixed correct/incorrect responses?

**Steps:**
1. Send correct answer: "x = 4"
2. Send incorrect answer: "x = 10"
3. Send partial answer: "I think I subtract..."
4. Send correct answer: "x = 4"

**Expected:**
- System should stay in "progressing" state
- Questions should remain standard complexity
- Should not trigger confused or strong states

---

### Scenario 3: Stuck Detection + Adaptive Questioning

**Test:** How does adaptive questioning interact with stuck detection?

**Steps:**
1. Send problem: `Solve for x: 4x - 12 = 20`
2. Send 2+ confused responses: "I don't know", "I'm stuck"
3. **Expected:** 
   - Stuck detection triggers hints
   - Understanding level becomes "confused" or "struggling"
   - Questions become simplified/scaffolded
   - Hints are integrated with adaptive questioning

**What to verify:**
- Both systems work together
- Questions adjust complexity AND hints appear
- Still maintains Socratic approach (questions, not answers)

---

## Debugging Tips

### Check Understanding Level in Browser Console

1. Open browser console (F12)
2. Look for logs showing:
   - `correctnessLevel`: "correct", "incorrect", or "partial"
   - `understandingState`: Shows current level and counters
   - Understanding level updates after each response

### Verify Question Complexity

**Simplified (Confused):**
- Look for: "Let's start with something simpler..."
- Very basic questions
- Yes/no or simple choice questions

**Scaffolded (Struggling):**
- Look for: "Let's work through this step by step..."
- Guided questions with hints embedded
- Checks understanding at each step

**Standard (Progressing):**
- Look for: "What operation would you use..."
- Balanced questions
- Standard Socratic approach

**Advanced (Strong):**
- Look for: "How would you approach..."
- Challenging questions
- Expects independent thinking
- Asks for explanations

---

## Quick Test Checklist

- [ ] **Confused Level:** Triggered by 3+ wrong answers → Questions become very simple
- [ ] **Stuck Level:** Triggered by 2 wrong answers → Questions become scaffolded
- [ ] **Progressing Level:** Default state → Standard questions
- [ ] **Strong Level:** Triggered by 2+ correct answers → Questions become advanced
- [ ] **Recovery:** Can improve from confused → progressing
- [ ] **Integration:** Works with stuck detection and hints
- [ ] **Socratic Approach:** Always asks questions, never gives direct answers

---

## Expected Behavior Summary

| Your Performance | Understanding Level | Question Complexity | What You'll See |
|------------------|-------------------|---------------------|-----------------|
| 3+ wrong answers | Confused | Simplified | Very simple, yes/no questions, lots of guidance |
| 2 wrong answers | Struggling | Scaffolded | Step-by-step questions with hints |
| Mix of answers | Progressing | Standard | Normal Socratic questions |
| 2+ correct answers | Strong | Advanced | Challenging questions, expects independent thinking |

---

## Tips for Testing

1. **Start fresh:** Clear chat or use new problem to reset understanding state
2. **Be consistent:** Send responses that match the level you want to test
3. **Check console:** Look for understanding level logs in browser console
4. **Compare questions:** Notice how question complexity changes between levels
5. **Test transitions:** Try moving between levels (confused → progressing → strong)

---

**Note:** The system maintains Socratic approach at ALL levels - it always asks questions, never gives direct answers. The complexity adjusts, but the method (Socratic questioning) stays consistent.



