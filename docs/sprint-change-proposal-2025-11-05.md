# Sprint Change Proposal

**Date:** 2025-11-05  
**Project:** socratica  
**Author:** xvanov (via PM Agent - Correct Course Workflow)  
**Change Type:** Epic Sequencing & Tracking Update

---

## 1. Issue Summary

### Problem Statement

Epic 12 (Authentication & Account Management) exists in the epics documentation (`docs/epics.md`) but has not been propagated to the sprint tracking system (`docs/sprint-status.yaml`). Additionally, Epic 12 must be prioritized before Epic 6 (Interactive Whiteboard) to properly support cross-device session persistence requirements.

### Discovery Context

During sprint planning and prioritization review, it was identified that:
1. Epic 12 is fully defined in `docs/epics.md` with 6 complete stories (12.1 through 12.6)
2. Epic 12 is completely missing from `docs/sprint-status.yaml` tracking
3. Epic 6 Story 6.1 (Session History Tracking) requires authentication for proper cross-device persistence, but Epic 12 has not been implemented
4. Epic 12 documentation explicitly states: "This epic should be prioritized early as it's required for proper session history functionality"

### Evidence

- **Epic 12 Documentation** (epics.md line 1007): *"Note: This epic should be prioritized early as it's required for proper session history functionality. Story 6.1 currently uses localStorage fallback but needs proper authentication for cross-device persistence."*

- **Epic 6 Story 6.1 Prerequisite** (epics.md line 675): Requires Epic 5 complete, Story 2.5 complete, Story 0.2 complete (Firebase setup exists), but authentication is needed for cross-device persistence

- **Epic 12 Story 12.4 Prerequisite** (epics.md line 1107): Requires Story 12.1 (Google Sign-In exists), Story 6.1 (Session History exists - at least partial implementation), indicating a circular dependency that must be resolved by completing Epic 12 first

- **Implementation Sequence** (epics.md line 1238): Already indicates Epic 12 should come before Epic 6: *"Epic 12: Authentication & Account Management (requires Story 0.2, recommended early for Epic 6 Story 6.1)"*

---

## 2. Impact Analysis

### Epic Impact

**Epic 12: Authentication & Account Management**
- **Status:** Fully defined in epics.md, missing from sprint-status.yaml
- **Impact:** Must be added to tracking and prioritized before Epic 6
- **Stories Affected:** All 6 stories (12.1-12.6) need to be added to sprint-status.yaml

**Epic 6: Interactive Whiteboard**
- **Status:** Currently in backlog, Story 6.1 marked as "done" but incomplete without authentication
- **Impact:** Must be deferred until Epic 12 is complete
- **Stories Affected:** 
  - Story 6.1: Currently marked "done" but uses localStorage fallback - needs proper authentication implementation
  - Stories 6.2-6.3: Can proceed after Epic 12 completes

**Other Epics:**
- **Epic 7-11:** No direct impact, sequencing remains unchanged
- **Future Epics:** Epic 10 and Epic 11 may benefit from authentication for personalization features, but this is optional enhancement

### Story Impact

**Stories Requiring Changes:**

1. **Epic 12 Stories (All 6 stories):**
   - Story 12.1: Google Sign-In Integration
   - Story 12.2: User Profile Management
   - Story 12.3: Authentication State Management
   - Story 12.4: Guest User Migration (requires Story 6.1 partial implementation)
   - Story 12.5: Account Settings & Preferences
   - Story 12.6: Account Deletion & Data Privacy
   - **Action:** Add all 6 stories to sprint-status.yaml with status "backlog"

2. **Epic 6 Story 6.1: Session History Tracking**
   - **Current Status:** Marked as "done" in sprint-status.yaml
   - **Issue:** Implementation uses localStorage fallback instead of proper authentication
   - **Action:** May need rework after Epic 12 completes to integrate proper authentication (to be determined during Epic 12 implementation)

### Artifact Conflicts

**PRD Document:**
- No conflicts identified
- PRD mentions Epic 6 but doesn't explicitly sequence Epic 12
- **Action Required:** None (sequencing is implementation detail)

**Architecture Document:**
- No conflicts identified
- Firebase Auth already configured in Story 0.2
- Architecture supports Epic 12 implementation
- **Action Required:** None

**Epics Document:**
- Already correctly documents Epic 12 and recommended sequencing
- **Action Required:** None

**Sprint Status Tracking:**
- Missing Epic 12 entirely
- Epic sequencing doesn't reflect Epic 12 priority
- **Action Required:** Add Epic 12 with all stories, resequence before Epic 6

### Technical Impact

- **Code Changes:** None required immediately (documentation-only change)
- **Infrastructure:** Firebase Auth already configured (Story 0.2 complete)
- **Deployment:** No impact
- **Dependencies:** Epic 12 Story 12.4 has circular dependency with Epic 6 Story 6.1 - this will be resolved when Epic 12 is implemented first

---

## 3. Recommended Approach

### Selected Path: Direct Adjustment

**Rationale:**

1. **Low Effort, High Value:** This is a documentation/tracking update that requires no code changes
2. **Prevents Technical Debt:** Implementing Epic 6 before Epic 12 would require rework when adding authentication later
3. **Aligns with Documentation:** Epic documentation already indicates Epic 12 should come before Epic 6
4. **Minimal Risk:** No implementation changes, just tracking and sequencing updates
5. **Team Efficiency:** Prevents confusion about what to work on next

**Effort Estimate:** Low (1-2 hours for documentation updates)  
**Risk Level:** Low (tracking/documentation change only)  
**Timeline Impact:** None (Epic 6 was already in backlog, Epic 12 will now be prioritized)

---

## 4. Detailed Change Proposals

### Change Proposal 1: Add Epic 12 to sprint-status.yaml

**File:** `docs/sprint-status.yaml`

**Location:** Insert after Epic 5 section (before Epic 6)

**OLD:**
```yaml
  # Epic 5: UI Polish
  epic-5: backlog
  5-1-responsive-layout-design: done
  5-2-modern-visual-design-system: done
  5-3-loading-states-and-feedback: done
  5-4-accessibility-features: done
  5-5-error-handling-and-user-guidance: done
  5-6-testing-suite-5-algebra-problems: done
  epic-5-retrospective: completed

  # Epic 6: Interactive Whiteboard
```

**NEW:**
```yaml
  # Epic 5: UI Polish
  epic-5: backlog
  5-1-responsive-layout-design: done
  5-2-modern-visual-design-system: done
  5-3-loading-states-and-feedback: done
  5-4-accessibility-features: done
  5-5-error-handling-and-user-guidance: done
  5-6-testing-suite-5-algebra-problems: done
  epic-5-retrospective: completed

  # Epic 12: Authentication & Account Management
  epic-12: backlog
  12-1-google-sign-in-integration: backlog
  12-2-user-profile-management: backlog
  12-3-authentication-state-management: backlog
  12-4-guest-user-migration: backlog
  12-5-account-settings-and-preferences: backlog
  12-6-account-deletion-and-data-privacy: backlog
  epic-12-retrospective: optional

  # Epic 6: Interactive Whiteboard
```

**Rationale:** Epic 12 must be tracked and prioritized before Epic 6 as documented in epics.md. All 6 stories are added with "backlog" status.

---

### Change Proposal 2: Update Epic 6 Note (Optional Clarification)

**File:** `docs/sprint-status.yaml`

**Location:** Epic 6 section header

**OLD:**
```yaml
  # Epic 6: Interactive Whiteboard
  epic-6: backlog
```

**NEW:**
```yaml
  # Epic 6: Interactive Whiteboard (Requires Epic 12 for proper session history)
  epic-6: backlog
```

**Rationale:** Adds clarity that Epic 6 depends on Epic 12 completion for proper session history implementation. This is optional but helpful for team planning.

---

### Change Proposal 3: Epic 6 Story 6.1 Status Review (Future Action)

**File:** `docs/sprint-status.yaml`

**Current Status:** Story 6.1 marked as "done"

**Issue:** Story 6.1 implementation uses localStorage fallback instead of proper authentication for cross-device persistence

**Recommended Action:** 
- During Epic 12 implementation, review Story 6.1 implementation
- If localStorage-only implementation is acceptable for MVP, keep status as "done"
- If cross-device persistence is required, rework Story 6.1 after Epic 12 Story 12.1 completes
- Document decision in Epic 6 retrospective

**Rationale:** Story 6.1 may need rework after Epic 12 completes, but this should be evaluated during Epic 12 implementation rather than preemptively changing status.

---

## 5. Implementation Handoff

### Change Scope Classification: **Minor**

This change can be implemented directly by the development team or project manager as it requires only documentation updates.

### Handoff Recipients

**Primary:** Product Manager / Project Owner
- Update sprint-status.yaml with Epic 12 entries
- Resequence Epic 6 after Epic 12
- Communicate priority change to development team

**Secondary:** Development Team
- Begin Epic 12 Story 12.1 when ready
- Review Epic 6 Story 6.1 implementation during Epic 12 to determine if rework needed

### Implementation Steps

1. **Immediate Actions:**
   - [ ] Update `docs/sprint-status.yaml` with Epic 12 section (Change Proposal 1)
   - [ ] Add optional note to Epic 6 section (Change Proposal 2)
   - [ ] Commit changes to version control

2. **During Epic 12 Implementation:**
   - [ ] Review Epic 6 Story 6.1 implementation for authentication integration needs
   - [ ] Determine if Story 6.1 rework required after Epic 12 Story 12.1 completes
   - [ ] Update Epic 6 Story 6.1 status if rework needed

3. **Success Criteria:**
   - Epic 12 appears in sprint-status.yaml before Epic 6
   - All 6 Epic 12 stories tracked with appropriate status
   - Development team understands Epic 12 priority
   - Epic 6 Story 6.1 authentication integration evaluated during Epic 12

### Timeline

- **Documentation Update:** Immediate (can be done now)
- **Epic 12 Implementation:** Begin when team capacity allows (next sprint recommended)
- **Epic 6 Continuation:** After Epic 12 Story 12.1 completes (at minimum)

---

## 6. Approval and Next Steps

**Proposal Status:** Ready for Review

**Recommendation:** Approve and implement immediately

**Benefits:**
- Prevents technical debt from implementing Epic 6 without authentication
- Aligns tracking with documented epic sequencing
- Enables proper cross-device session persistence
- Low risk, high value change

**Next Steps After Approval:**
1. Implement Change Proposal 1 (add Epic 12 to sprint-status.yaml)
2. Implement Change Proposal 2 (optional Epic 6 note)
3. Communicate priority change to development team
4. Begin Epic 12 Story 12.1 when ready
5. Review Epic 6 Story 6.1 during Epic 12 implementation

---

## Appendix: Epic 12 Story Summary

For reference, Epic 12 includes the following stories:

- **Story 12.1:** Google Sign-In Integration (Prerequisites: Story 0.2)
- **Story 12.2:** User Profile Management (Prerequisites: Story 12.1)
- **Story 12.3:** Authentication State Management (Prerequisites: Story 12.1)
- **Story 12.4:** Guest User Migration (Prerequisites: Story 12.1, Story 6.1)
- **Story 12.5:** Account Settings & Preferences (Prerequisites: Story 12.2)
- **Story 12.6:** Account Deletion & Data Privacy (Prerequisites: Story 12.5)

All stories are fully defined in `docs/epics.md` with acceptance criteria and technical notes.

