# Epic 3 & 4 Testing Workflow

## Quick Testing Guide

Use this workflow to verify Epic 3 (Socratic Dialogue Logic) and Epic 4 (Math Rendering) features are working correctly.

---

## Epic 4: Math Rendering Tests (Visual - Easy to Verify)

### Test 1: Math Rendering in Chat Messages
**What to test:** Math expressions should render as formatted math, not plain text

**Steps:**
1. Type a problem with math notation: `Solve for x: $x^2 + 5 = 13$`
2. Send the message
3. **Expected:** The `$x^2 + 5 = 13$` should render as formatted math (superscripts, proper spacing)
4. AI response should also render math properly

**What to look for:**
- ✅ Math expressions render with proper formatting (not showing `$x^2$` as text)
- ✅ Exponents appear as superscripts
- ✅ Fractions render properly
- ✅ Variables and numbers are properly formatted

**If it looks like plain text:**
- Check browser console for errors
- Verify KaTeX library is loading
- Check if message content has LaTeX syntax (`$...$` or `$$...$$`)

### Test 2: Math Rendering in Problem Input
**What to test:** Live math preview when typing

**Steps:**
1. Start typing in the problem input: `x^2 + 5 = 13`
2. **Expected:** Should see a preview of rendered math below/above the input field
3. Type more complex math: `\frac{a}{b} + c = d`

**What to look for:**
- ✅ Live preview appears as you type
- ✅ Math renders correctly in preview
- ✅ Preview updates in real-time

**If preview doesn't appear:**
- Check if MathPreview component is integrated
- Verify input field has math preview enabled

### Test 3: Advanced Math Notation
**What to test:** Complex math expressions render correctly

**Test cases:**
1. **Fractions:** Type `\frac{2x+5}{3} = 7` - should render as proper fraction
2. **Exponents:** Type `x^2 + y^3` - exponents should be superscript
3. **Roots:** Type `\sqrt{x+5}` - should render square root symbol
4. **Matrices:** Type `\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}` - should render as matrix
5. **Greek letters:** Type `\alpha + \beta` - should render Greek letters

**Expected:** All should render as formatted math, not plain text

---

## Epic 3: Socratic Dialogue Logic Tests (Behavioral - Requires Interaction)

### Test 1: Socratic Questioning (No Direct Answers)
**What to test:** AI asks questions, never gives direct answers

**Steps:**
1. Type problem: `Solve for x: 2x + 5 = 13`
2. Send message
3. **Expected:** AI responds with questions like:
   - "What operation would you use to isolate x?"
   - "What's happening to the x in this equation?"
   - NOT: "x = 4" or "Subtract 5 from both sides"

**What to look for:**
- ✅ AI asks guiding questions
- ✅ AI never gives the final answer
- ✅ AI never solves the problem directly
- ✅ If student asks "What's the answer?", AI redirects with questions

**If AI gives direct answers:**
- Check system prompt is being used
- Verify `buildSystemPrompt` function is called
- Check API logs to see what prompt is sent

### Test 2: Stuck Detection & Hint Generation
**What to test:** AI detects when student is stuck and provides hints

**Steps:**
1. Type problem: `Solve for x: 2x + 5 = 13`
2. Respond with confused messages (2+ times):
   - "I don't know"
   - "I'm stuck"
   - "I can't figure it out"
   - "What do I do?"
3. **Expected:** After 2+ confused responses:
   - AI detects you're stuck
   - AI provides hints (still as questions, not answers)
   - Hints are progressively more specific

**What to look for:**
- ✅ After 2 confused responses, hints appear
- ✅ Hints are still questions (Socratic approach)
- ✅ Hints guide toward solution without giving it away
- ✅ Hints get more specific if still stuck

**How to verify:**
- Check browser console logs for "stuck state" messages
- Check API response includes `stuckState` object
- Verify hints appear after multiple confused responses

### Test 3: Response Validation
**What to test:** AI validates whether student responses are correct

**Steps:**
1. Type problem: `Solve for x: 2x + 5 = 13`
2. Try different responses:
   - **Correct:** "x = 4" or "subtract 5 from both sides"
   - **Incorrect:** "x = 8" or "add 5 to both sides"
   - **Partial:** "subtract 5" (without completing)

**Expected:**
- ✅ Correct responses: Positive feedback + guiding next steps
- ✅ Incorrect responses: Gentle correction + guiding questions
- ✅ Partial responses: Recognition + encouragement to continue

**What to look for:**
- ✅ AI acknowledges correct steps
- ✅ AI guides when incorrect (doesn't just say "wrong")
- ✅ AI recognizes partial progress

### Test 4: Adaptive Questioning
**What to test:** AI adjusts question complexity based on understanding

**Steps:**
1. Type problem: `Solve for x: 2x + 5 = 13`
2. **Confused scenario:**
   - Respond with: "I don't understand" or "What does that mean?"
   - **Expected:** AI simplifies questions, breaks into smaller steps
3. **Strong understanding scenario:**
   - Respond with correct steps: "x = 4", "I subtract 5 first"
   - **Expected:** AI increases difficulty, asks deeper questions

**What to look for:**
- ✅ Questions get simpler when confused
- ✅ Questions get more complex when showing understanding
- ✅ Question complexity adapts during conversation

**How to verify:**
- Check browser console for "understanding level" logs
- Check API response includes `understandingState` object
- Compare question complexity in different scenarios

---

## Comprehensive Testing Scenarios

### Scenario 1: Complete Problem Solving Flow
**Test end-to-end Socratic method:**

1. **Upload/type problem:** `Solve for x: 2x + 5 = 13`
2. **Verify math renders:** Equations should render properly
3. **AI asks initial question:** "What operation would isolate x?"
4. **Respond correctly:** "Subtract 5"
5. **AI validates & guides:** "Great! What happens when you subtract 5 from both sides?"
6. **Continue solving:** "2x = 8"
7. **AI guides to final step:** "What operation would you use next?"
8. **Complete solution:** "x = 4"
9. **AI celebrates:** "Excellent! You solved it!"

**Expected:**
- ✅ Math renders throughout
- ✅ AI never gives direct answer
- ✅ Questions guide progressively
- ✅ Validation happens at each step

### Scenario 2: Stuck Student Flow
**Test hint generation:**

1. **Upload/type problem:** `Solve for x: 3x - 7 = 14`
2. **AI asks question:** "What would you do first?"
3. **Respond confused:** "I don't know"
4. **AI asks simpler question:** "What number is being subtracted from 3x?"
5. **Still confused:** "I'm stuck"
6. **AI provides hint:** "Think about what operation undoes subtraction..."
7. **Continue stuck:** "I can't figure it out"
8. **AI provides more specific hint:** "What operation would you use on both sides?"

**Expected:**
- ✅ After 2+ confused responses, hints appear
- ✅ Hints get progressively more specific
- ✅ Hints remain as questions (not answers)

### Scenario 3: Math Notation Test
**Test various math expressions:**

1. **Type problem with different notation:**
   - `x^2 + 5x + 6 = 0` (exponents)
   - `\frac{2x+3}{5} = 7` (fractions)
   - `\sqrt{x+9} = 4` (square roots)
   - `2x + y = 10` (multiple variables)

**Expected:**
- ✅ All math renders correctly
- ✅ AI can understand and respond to math problems
- ✅ Responses also include properly rendered math

---

## Debugging Tips

### If Math Doesn't Render:
1. **Check browser console** for KaTeX errors
2. **Verify LaTeX syntax:** Use `$...$` for inline, `$$...$$` for block
3. **Check MessageContent component** is being used
4. **Test manually:** Type `$x^2$` and see if it renders

### If AI Gives Direct Answers:
1. **Check system prompt:** Verify `buildSystemPrompt` is called
2. **Check API logs:** See what prompt is actually sent to OpenAI
3. **Verify prompt includes:** "NEVER give direct answers" instructions
4. **Test with explicit request:** Ask "What's the answer?" - AI should redirect

### If Hints Don't Appear:
1. **Check stuck detection:** Look for console logs about stuck state
2. **Verify stuck threshold:** Need 2+ consecutive confused responses
3. **Check API response:** Verify `stuckState` object in response
4. **Test stuck detection:** Send multiple "I don't know" messages

### If Adaptive Questioning Doesn't Work:
1. **Check understanding state:** Look for console logs about understanding level
2. **Verify response validation:** Must have validation results to determine understanding
3. **Check API response:** Verify `understandingState` object in response
4. **Test different scenarios:** Try confused vs strong understanding responses

---

## Quick Verification Checklist

### Epic 4 (Math Rendering):
- [ ] Type `$x^2$` - renders as formatted math (not plain text)
- [ ] Type `\frac{a}{b}` - renders as fraction
- [ ] Math renders in chat messages (both student and AI)
- [ ] Math renders in problem input preview (if implemented)

### Epic 3 (Socratic Logic):
- [ ] AI asks questions (doesn't give direct answers)
- [ ] After 2+ "I don't know" responses, hints appear
- [ ] Hints are questions (not direct answers)
- [ ] AI validates correct/incorrect responses
- [ ] Questions adapt based on understanding level

---

## What You Should See vs. What You Might See

### ✅ Working Correctly:
- Math expressions render as formatted math
- AI asks guiding questions
- After being stuck, hints appear
- AI validates responses appropriately

### ❌ Not Working:
- Math shows as plain text (`$x^2$` instead of formatted)
- AI gives direct answers ("x = 4")
- No hints after multiple confused responses
- AI doesn't validate responses

---

## Console Commands for Debugging

Open browser DevTools Console and check:

```javascript
// Check if math rendering is working
// Look for any KaTeX errors

// Check API responses
// Network tab → Filter: /api/chat
// Look at response payload:
// - stuckState object
// - understandingState object
// - messages array with system prompt

// Check what prompt is being sent
// Look for "ADAPTIVE QUESTIONING INSTRUCTIONS" in system prompt
// Look for "HINT GENERATION INSTRUCTIONS" when stuck
```


