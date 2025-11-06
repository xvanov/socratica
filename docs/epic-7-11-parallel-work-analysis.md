# Epics 7-11: Parallel Work Analysis

**Date:** 2025-01-27  
**Goal:** Identify which Epics 7-11 can be worked on in parallel by multiple agents on the same codebase simultaneously.

---

## Current Epic Status

From `sprint-status.yaml`:
- ⏳ **Epic 7**: Step Visualization - `backlog` (not contexted)
- ⏳ **Epic 8**: Voice Interface - `backlog` (not contexted)
- ⏳ **Epic 9**: Animated Avatar - `backlog` (not contexted)
- ⏳ **Epic 10**: Difficulty Modes - `backlog` (not contexted)
- ⏳ **Epic 11**: Problem Generation - `backlog` (not contexted)

**Note:** All epics are currently in backlog status and require prerequisites to be completed first.

---

## Dependency Analysis

### Epic 7: Step Visualization
**Prerequisites:** 
- Epic 3 complete (Socratic logic exists)
- Epic 4 complete (Math rendering exists)

**Will Modify/Create:**
- `components/step-visualization/*` - NEW directory
- `components/chat/*` - May integrate into chat messages
- `lib/openai/prompts.ts` - May need to modify prompts to extract steps
- `components/math-renderer/*` - May extend math rendering for step highlighting

**Focus:** Progressive step reveal, animations, visual highlighting of transformations

---

### Epic 8: Voice Interface
**Prerequisites:** 
- Epic 2 complete (Chat interface exists)

**Will Modify/Create:**
- `components/voice/*` - NEW directory
- `components/chat/MessageInput.tsx` - Add microphone button
- `components/chat/ChatInterface.tsx` - Add voice controls
- `lib/utils/speech-to-text.ts` - NEW utility
- `lib/utils/text-to-speech.ts` - NEW utility
- `lib/utils/math-speech-converter.ts` - NEW utility (converts math to speech)
- `app/api/voice/*` - Optional API routes for voice processing

**Focus:** Speech-to-text input, text-to-speech output, voice commands

---

### Epic 9: Animated Avatar
**Prerequisites:** 
- Epic 5 complete (UI foundation exists)
- Epic 8 Story 8.1 complete (voice interface exists for lip-sync)

**Will Modify/Create:**
- `components/avatar/*` - NEW directory
- `components/chat/ChatInterface.tsx` - Add avatar display area
- `components/avatar/AvatarRenderer.tsx` - NEW component
- `components/avatar/AvatarExpressions.tsx` - NEW component
- `components/avatar/AvatarAnimations.tsx` - NEW component
- `lib/utils/avatar-sync.ts` - NEW utility (syncs with voice output)

**Focus:** 2D/3D avatar character, expressions, gestures, lip-sync with voice

---

### Epic 10: Difficulty Modes
**Prerequisites:** 
- Epic 3 complete (Socratic logic exists)
- Epic 5 complete (UI foundation exists)

**Will Modify/Create:**
- `components/difficulty/*` - NEW directory
- `components/settings/*` or `app/settings/page.tsx` - Add difficulty selector
- `lib/openai/prompts.ts` - MODIFY to include grade level in prompts
- `lib/openai/context.ts` - MODIFY to track difficulty level
- `lib/utils/difficulty-levels.ts` - NEW utility
- `lib/utils/performance-tracking.ts` - NEW utility (tracks student performance)

**Focus:** Grade level selection, adaptive questioning, scaffolding adjustment

---

### Epic 11: Problem Generation
**Prerequisites:** 
- Epic 3 complete (Socratic logic exists)
- Epic 10 complete (Difficulty modes exist)

**Will Modify/Create:**
- `components/problem-generator/*` - NEW directory
- `components/problem-input/*` - May add "Generate Practice Problem" button
- `lib/openai/problem-generator.ts` - NEW utility
- `lib/utils/problem-analysis.ts` - NEW utility
- `app/api/generate-problem/route.ts` - NEW API route
- `lib/openai/prompts.ts` - May add problem generation prompts

**Focus:** Analyze current problem, generate similar practice problems, adaptive difficulty

---

## Conflict Matrix

| Epic Pair | Dependency Conflict | File Conflict | Parallel Feasible? |
|-----------|-------------------|---------------|-------------------|
| **7 ↔ 8** | ✅ None (both have different prerequisites) | 🟢 LOW - Different directories | ✅ **YES** |
| **7 ↔ 9** | ⚠️ Epic 9 requires Epic 8 | 🟡 MEDIUM - Both may modify `components/chat/*` | ⚠️ **NO** (Epic 9 requires Epic 8 first) |
| **7 ↔ 10** | ✅ None (both have Epic 3 in common) | 🟡 MEDIUM - Both modify `lib/openai/prompts.ts` | ⚠️ **PARTIAL** (coordinate prompt modifications) |
| **7 ↔ 11** | ❌ Epic 11 requires Epic 10 | 🟡 MEDIUM - Both may modify `lib/openai/prompts.ts` | ❌ **NO** (Epic 11 requires Epic 10) |
| **8 ↔ 9** | ❌ Epic 9 requires Epic 8 | 🟡 MEDIUM - Both modify `components/chat/*` | ❌ **NO** (Epic 9 requires Epic 8) |
| **8 ↔ 10** | ✅ None (different prerequisites) | 🟢 LOW - Different directories | ✅ **YES** |
| **8 ↔ 11** | ❌ Epic 11 requires Epic 10 | 🟢 LOW - Different directories | ❌ **NO** (Epic 11 requires Epic 10) |
| **9 ↔ 10** | ✅ None (both have Epic 5 in common) | 🟢 LOW - Different directories | ✅ **YES** |
| **9 ↔ 11** | ❌ Epic 11 requires Epic 10 | 🟢 LOW - Different directories | ❌ **NO** (Epic 11 requires Epic 10) |
| **10 ↔ 11** | ❌ Epic 11 requires Epic 10 | 🟡 MEDIUM - Both modify `lib/openai/prompts.ts` | ❌ **NO** (Epic 11 requires Epic 10) |

---

## ✅ FEASIBLE PARALLEL WORK SCENARIOS

### Scenario 1: Epics 7 & 8 in Parallel (BEST CANDIDATE)

**Epic 7: Step Visualization**
- **Agent 1** works on:
  - Create `components/step-visualization/*` directory
  - Build step breakdown components
  - Integrate with math renderer for highlighting
  - May modify `components/chat/*` to display steps

**Epic 8: Voice Interface**
- **Agent 2** works on:
  - Create `components/voice/*` directory
  - Implement speech-to-text utility
  - Implement text-to-speech utility
  - Add microphone button to `components/chat/MessageInput.tsx`

**Conflict Potential:** 🟡 MEDIUM
- Both may modify `components/chat/ChatInterface.tsx`
- Solution: Coordinate chat interface modifications or work on different aspects

**Coordination Strategy:**
1. Agent 1 focuses on step visualization components (new directory)
2. Agent 2 focuses on voice utilities and voice component (new directory)
3. Both avoid modifying `components/chat/ChatInterface.tsx` simultaneously
4. After both complete, integrate separately into chat interface

**Result:** ✅ **FEASIBLE with coordination**

---

### Scenario 2: Epics 7 & 10 in Parallel (GOOD CANDIDATE)

**Epic 7: Step Visualization**
- **Agent 1** works on:
  - Create `components/step-visualization/*` directory
  - Build step breakdown components
  - May modify `lib/openai/prompts.ts` to extract solution steps

**Epic 10: Difficulty Modes**
- **Agent 2** works on:
  - Create `components/difficulty/*` directory
  - Build difficulty selector UI
  - Modify `lib/openai/prompts.ts` to include grade level

**Conflict Potential:** 🟡 MEDIUM
- Both modify `lib/openai/prompts.ts`
- Solution: Coordinate prompt modifications or use feature flags

**Coordination Strategy:**
1. Agent 1 adds step extraction prompts to `lib/openai/prompts.ts`
2. Agent 2 adds difficulty level prompts to `lib/openai/prompts.ts`
3. Use feature flags or separate prompt files
4. Merge prompt modifications carefully

**Result:** ✅ **FEASIBLE with careful coordination**

---

### Scenario 3: Epics 8 & 10 in Parallel (BEST CANDIDATE)

**Epic 8: Voice Interface**
- **Agent 1** works on:
  - Create `components/voice/*` directory
  - Implement voice utilities
  - Modify `components/chat/*` for voice controls

**Epic 10: Difficulty Modes**
- **Agent 2** works on:
  - Create `components/difficulty/*` directory
  - Build difficulty selector UI
  - Modify `lib/openai/prompts.ts` for grade level

**Conflict Potential:** 🟢 LOW
- Different directories
- Epic 8 modifies `components/chat/*`, Epic 10 modifies `lib/openai/prompts.ts` and settings

**Coordination Strategy:**
- Minimal coordination needed
- Different focus areas (voice vs difficulty)
- No file conflicts

**Result:** ✅ **FEASIBLE - LOW CONFLICT**

---

### Scenario 4: Epics 9 & 10 in Parallel (GOOD CANDIDATE)

**Epic 9: Animated Avatar**
- **Agent 1** works on:
  - Create `components/avatar/*` directory
  - Build avatar components
  - May modify `components/chat/ChatInterface.tsx` to display avatar

**Epic 10: Difficulty Modes**
- **Agent 2** works on:
  - Create `components/difficulty/*` directory
  - Build difficulty selector UI
  - Modify `lib/openai/prompts.ts` for grade level

**Conflict Potential:** 🟢 LOW
- Different directories
- Epic 9 modifies `components/chat/ChatInterface.tsx` (display area), Epic 10 modifies settings and prompts

**Coordination Strategy:**
- Minimal coordination needed
- Different focus areas (UI display vs settings)
- No file conflicts

**Result:** ✅ **FEASIBLE - LOW CONFLICT**

**Note:** Epic 9 requires Epic 8 to be complete first, so this scenario assumes Epic 8 is already done.

---

## ❌ NOT FEASIBLE PARALLEL SCENARIOS

### Scenario X: Epics 10 & 11 Simultaneously
**Why:** Epic 11 explicitly requires Epic 10 to be complete
**Dependency:** Epic 11 needs difficulty modes to generate appropriate problems
**Recommendation:** Sequential execution (Epic 10 → Epic 11)

### Scenario Y: Epics 8 & 9 Simultaneously
**Why:** Epic 9 requires Epic 8 Story 8.1 to be complete for lip-sync
**Dependency:** Avatar needs voice interface for synchronization
**Recommendation:** Sequential execution (Epic 8 → Epic 9)

### Scenario Z: Epics 7 & 11 Simultaneously
**Why:** Epic 11 requires Epic 10, which must be completed first
**Dependency:** Problem generation needs difficulty modes
**Recommendation:** Sequential execution (Epic 7 can be parallel with Epic 10, then Epic 11 after Epic 10)

---

## 🎯 RECOMMENDED PARALLEL WORK PHASES

### Phase 1: Foundation Epics (Parallel Opportunity)

**Epic 7: Step Visualization** (Agent 1)
- Create step visualization components
- Build step breakdown logic
- Integrate with math renderer

**Epic 8: Voice Interface** (Agent 2)
- Create voice components
- Implement speech utilities
- Add voice controls to chat

**Epic 10: Difficulty Modes** (Agent 3)
- Create difficulty selector UI
- Implement difficulty tracking
- Modify prompts for grade level

**Coordination:** 
- Epics 7 & 8 coordinate on `components/chat/ChatInterface.tsx` modifications
- Epics 7 & 10 coordinate on `lib/openai/prompts.ts` modifications
- Epic 10 works independently

**Result:** ✅ **3 Epics can run in parallel with coordination**

---

### Phase 2: Dependent Epics (Sequential)

**Epic 9: Animated Avatar** (After Epic 8 completes)
- Requires Epic 8 Story 8.1 for lip-sync
- Can run in parallel with Epic 10 (once Epic 8 is done)

**Epic 11: Problem Generation** (After Epic 10 completes)
- Requires Epic 10 for difficulty modes
- Can run independently once Epic 10 is done

---

## 📋 DETAILED PARALLEL WORK PLAN

### Option A: Maximum Parallelism (3 Agents)

**Agent 1: Epic 7 (Step Visualization)**
- Time: Days 1-5
- Tasks:
  - Create `components/step-visualization/StepBreakdown.tsx`
  - Create `components/step-visualization/StepAnimator.tsx`
  - Create `components/step-visualization/StepNavigation.tsx`
  - Modify `lib/openai/prompts.ts` to extract steps (coordinate with Agent 3)
  - Integrate with math renderer for highlighting
- **Deliverable:** Complete step visualization system

**Agent 2: Epic 8 (Voice Interface)**
- Time: Days 1-5
- Tasks:
  - Create `components/voice/VoiceInput.tsx`
  - Create `components/voice/VoiceOutput.tsx`
  - Create `lib/utils/speech-to-text.ts`
  - Create `lib/utils/text-to-speech.ts`
  - Create `lib/utils/math-speech-converter.ts`
  - Add microphone button to `components/chat/MessageInput.tsx` (coordinate with Agent 1)
- **Deliverable:** Complete voice interface system

**Agent 3: Epic 10 (Difficulty Modes)**
- Time: Days 1-5
- Tasks:
  - Create `components/difficulty/DifficultySelector.tsx`
  - Create `lib/utils/difficulty-levels.ts`
  - Create `lib/utils/performance-tracking.ts`
  - Modify `lib/openai/prompts.ts` to include grade level (coordinate with Agent 1)
  - Modify `lib/openai/context.ts` to track difficulty
  - Add difficulty selector to settings page
- **Deliverable:** Complete difficulty modes system

**Coordination Points:**
1. **Days 1-2:** All agents create new components in their directories (zero conflicts)
2. **Days 3-4:** Agent 1 & Agent 3 coordinate on `lib/openai/prompts.ts` modifications
3. **Days 3-4:** Agent 1 & Agent 2 coordinate on `components/chat/ChatInterface.tsx` modifications
4. **Day 5:** All agents integrate their features into main chat interface

**Result:** ✅ **3 Epics completed in parallel with minimal conflicts**

---

### Option B: Conservative Parallelism (2 Agents)

**Agent 1: Epic 7 (Step Visualization)**
- Time: Days 1-5
- Create step visualization components
- Integrate with math renderer

**Agent 2: Epic 8 (Voice Interface)**
- Time: Days 1-5
- Create voice components
- Implement speech utilities

**Coordination:**
- Coordinate on `components/chat/ChatInterface.tsx` modifications
- Work on different aspects of chat interface

**After Epic 8 completes:**
- **Agent 2:** Epic 9 (Animated Avatar) - Requires Epic 8
- **Agent 1:** Epic 10 (Difficulty Modes) - Can run in parallel with Epic 9

**After Epic 10 completes:**
- **Agent 1:** Epic 11 (Problem Generation) - Requires Epic 10

**Result:** ✅ **Conservative approach with sequential dependencies**

---

## 🚨 CRITICAL COORDINATION POINTS

### 1. `lib/openai/prompts.ts` Conflicts

**Epic 7 Needs:**
- Prompt modifications to extract solution steps
- Step-by-step breakdown format

**Epic 10 Needs:**
- Prompt modifications to include grade level
- Difficulty-aware questioning

**Solution:**
- Use feature flags or separate prompt files
- Coordinate merge of prompt modifications
- Or: Agent 1 completes step extraction prompts first, then Agent 3 adds difficulty layer

---

### 2. `components/chat/ChatInterface.tsx` Conflicts

**Epic 7 Needs:**
- Integrate step visualization display into chat
- Show step breakdown in chat area

**Epic 8 Needs:**
- Add voice controls to chat interface
- Add microphone button
- Add voice output controls

**Epic 9 Needs:**
- Add avatar display area to chat interface

**Solution:**
- Epic 7 & 8 can coordinate: One modifies chat display area, one modifies chat controls
- Epic 9 (requires Epic 8) can add avatar display after Epic 8 completes

---

### 3. Integration Sequence

**Recommended Order:**
1. **Epic 10** completes first (foundation for Epic 11)
2. **Epics 7 & 8** complete in parallel (coordinate on chat interface)
3. **Epic 8** completes → **Epic 9** can start (requires Epic 8)
4. **Epic 10** completes → **Epic 11** can start (requires Epic 10)

---

## ✅ FINAL RECOMMENDATIONS

### BEST APPROACH: Maximum Parallelism Phase 1

**Parallel Work:**
1. ✅ **Epic 7 & Epic 8** - Can run in parallel (coordinate on chat interface)
2. ✅ **Epic 7 & Epic 10** - Can run in parallel (coordinate on prompts)
3. ✅ **Epic 8 & Epic 10** - Can run in parallel (no conflicts)

**Result:** ✅ **Epics 7, 8, and 10 can all run in parallel with 3 agents**

**Sequential Work:**
4. **Epic 9** - After Epic 8 completes (requires Epic 8)
5. **Epic 11** - After Epic 10 completes (requires Epic 10)

---

## 📊 PARALLEL WORK SUMMARY

| Epic | Can Parallel With | Requires Sequential With | Max Parallel Agents |
|------|------------------|------------------------|---------------------|
| **7** | 8, 10 | 9 (via Epic 8), 11 (via Epic 10) | 3 (with 7, 8, 10) |
| **8** | 7, 10 | 9 (requires 8), 11 (via Epic 10) | 3 (with 7, 8, 10) |
| **9** | 10 (after Epic 8 done) | 8 (requires 8 first) | 2 (with 10, after 8) |
| **10** | 7, 8, 9 (after Epic 8) | 11 (requires 10 first) | 3 (with 7, 8, 10) |
| **11** | None | 7, 8, 9, 10 (requires 10 first) | 1 |

**Key Insight:** Epics 7, 8, and 10 can all run in parallel with careful coordination on `lib/openai/prompts.ts` and `components/chat/ChatInterface.tsx`. Epic 9 requires Epic 8, and Epic 11 requires Epic 10, creating a natural sequential flow after the initial parallel phase.

---

## 🎯 RECOMMENDED EXECUTION PLAN

### Phase 1: Parallel Foundation (Weeks 1-2)
- **Agent 1:** Epic 7 (Step Visualization)
- **Agent 2:** Epic 8 (Voice Interface)  
- **Agent 3:** Epic 10 (Difficulty Modes)

**Coordination:** 
- Days 1-2: Create new components (zero conflicts)
- Days 3-4: Coordinate on shared files (`prompts.ts`, `ChatInterface.tsx`)
- Day 5: Integration and testing

### Phase 2: Sequential Dependent (Weeks 2-3)
- **Agent 1:** Epic 9 (Animated Avatar) - After Epic 8 completes
- **Agent 2:** Epic 11 (Problem Generation) - After Epic 10 completes

**Result:** All 5 epics completed in 3 weeks with maximum parallelism in Phase 1.

