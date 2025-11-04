# Product Brief: socratica

**Date:** 2025-11-03
**Author:** xvanov
**Context:** Greenfield Level 3 Software Project

---

## Executive Summary

Socratica is an AI-powered math tutoring platform that provides personalized, on-demand guidance to students through Socratic questioning. By eliminating the barriers of cost and scheduling that traditional tutors present, Socratica aims to democratize access to quality math education for students who cannot afford expensive tutors or coordinate with human tutors.

---

## Core Vision

### Problem Statement

Students struggling with math face significant challenges accessing quality tutoring support:

1. **Cost barriers**: Professional math tutors are expensive, often charging $40-100+ per hour, making them inaccessible to many families
2. **Scheduling challenges**: Coordinating sessions with tutors requires aligning multiple schedules, creating logistical friction
3. **Availability gaps**: When students need help (evening homework, before exams), tutors may not be available on-demand
4. **Democratization gap**: The current tutor model creates inequality - only students whose families can afford it get personalized support

This creates a situation where students who need help most are least likely to access it, perpetuating educational inequality.

### Problem Impact

- **Financial burden**: Families spending $200-500+ per month on tutoring represents a significant portion of household income for many
- **Learning gaps widen**: Without access to timely help, students fall further behind, creating cascading academic challenges
- **Equity issues**: The tutor model systematically disadvantages students from lower-income households
- **Missed opportunities**: Students who could excel with proper support never receive it

### Why Existing Solutions Fall Short

Current alternatives have limitations:

- **Traditional tutors**: Expensive, scheduling challenges, limited availability
- **Khan Academy / YouTube**: One-directional, doesn't adapt to individual confusion points, can't guide students through their specific problems
- **Online tutoring platforms** (Wyzant, Chegg): Still require scheduling, have tutor costs, not truly on-demand
- **Answer keys / solution manuals**: Give answers directly, don't teach understanding through discovery

The key gap: **No solution combines on-demand availability, affordability, and true pedagogical guidance that helps students discover solutions themselves**.

### Proposed Solution

Socratica is an AI tutor that guides students through math problems using Socratic questioning - the same approach demonstrated in the OpenAI x Khan Academy demo. Rather than giving direct answers, the system:

- Accepts problems via text or screenshot/OCR
- Asks guiding questions to help students discover solutions
- Maintains conversation context throughout multi-turn dialogues
- Adapts to student understanding level
- Never provides direct answers (unless student is stuck for 2+ turns, then provides hints)

**Phase 1** focuses on core tutoring functionality: problem input (text/image), chat interface, Socratic dialogue logic, math rendering, and polished UI.

**Phase 2** adds interactive whiteboard, step visualization, voice interface, animated avatar, difficulty modes, and problem generation.

The core differentiator: **On-demand, affordable, truly personalized guidance** that teaches through discovery, not just answers.

---

## Target Users

### Primary Users

**Primary Segment: Students who need math help but can't access traditional tutoring**

Specific profile:
- Middle school, high school, and early college students struggling with math
- Students whose families cannot afford $200-500/month for regular tutoring
- Students in rural or underserved areas where quality tutors are scarce
- Students who need help outside normal tutor availability hours (evenings, weekends, exam prep periods)
- Students who benefit from personalized guidance but don't have access to quality tutors

**Key characteristics:**
- Have access to internet and a device (smartphone, tablet, or computer)
- Are motivated to improve but need guidance on how to approach problems
- Prefer learning through discovery rather than rote memorization
- Need help with specific homework problems or exam preparation

**Current situation:**
- Rely on free resources (YouTube, Khan Academy) but struggle when stuck on specific problems
- May have tried tutors but couldn't sustain due to cost or scheduling
- Often resort to answer keys which don't help them learn
- Feel frustrated when they can't get help at the moment they need it

**What they value most:**
- Immediate availability when they're stuck
- Affordable (ideally free or very low cost)
- Guidance that helps them understand, not just get answers
- Patient, encouraging support that adapts to their pace

---

## Success Metrics

### Primary Success Metrics

**User adoption** is the primary success criterion:
- Number of students using the platform
- Active users over time
- User retention and engagement

### Key Behavior Metrics

**Completing problems** is the behavior that matters most:
- Students successfully completing problems through guided dialogue
- Problem completion rate
- Average number of problems completed per session

### Learning Impact Metrics

**Learning improvement** will be measured by students' increasing ability to solve problems independently:
- **Success indicator**: Students progressing to higher difficulty levels they can solve by themselves
- **Failure indicator**: Students repeatedly needing tutor help for the same difficulty level problems

**Critical philosophy**: Socratica is designed as a **temporary learning crutch**. The app should require **less and less use over time** as students develop their problem-solving skills. If students become dependent on the app for the same difficulty level, that indicates a failure of the pedagogical approach.

### Business Objectives

- **Primary goal**: User adoption (number of students using the platform)
- **Mission alignment**: Affordability is the mission - the app will be **free** to ensure maximum accessibility
- **Success threshold**: Significant adoption by students who cannot access traditional tutors

---

## MVP Scope

### Core Features (All Phase 1 Goals - Required for MVP)

**MVP Focus**: Algebra problems initially, then branch out to other problem types after validation.

All Phase 1 goalposts must be met before moving to Phase 2:

1. **Goalpost 1: Problem Input**
   - Text entry interface
   - Image upload with OCR/Vision LLM parsing
   - Image parsing must extract problem text accurately

2. **Goalpost 2: Basic Chat + LLM Integration**
   - Chat interface for dialogue
   - LLM integration for conversation
   - Conversation history maintenance

3. **Goalpost 3: Socratic Logic**
   - Questions, not answers approach
   - Socratic Dialogue: Multi-turn conversation that asks guiding questions
   - Validates student responses
   - Provides hints (never direct answers) when student is stuck for 2+ turns
   - Response validation logic

4. **Goalpost 4: Math Rendering**
   - Display equations properly using LaTeX rendering
   - Clean mathematical notation display

5. **Goalpost 5: UI Polish**
   - Sleek, modern app interface
   - Clean chat UI with image upload
   - Tested on 5+ Algebra problems

### Out of Scope for MVP

**Phase 2 Features** (deferred until MVP is validated):
- Interactive Whiteboard
- Step Visualization
- Voice Interface
- Animated Avatar
- Difficulty Modes
- Problem Generation
- Problem types beyond Algebra (will be added after MVP validation)

### MVP Success Criteria

- Successfully guides students through 5+ Algebra problem types without giving direct answers
- Maintains conversation context throughout multi-turn dialogues
- Adapts to student understanding level
- Math equations render correctly using LaTeX
- Modern, polished UI that's intuitive to use
- Free, accessible to all students

### Future Vision Features

**Phase 2 Expansion** (after MVP validation):
- Expand to other problem types: simple arithmetic, geometry, word problems, multi-step problems, calculus

**Phase 2 Features** (All Goalposts Required for Phase 2 Completion):

1. **Goalpost 1: Interactive Whiteboard**
   - Shared canvas for visual explanations and diagrams
   - Collaborative drawing surface where both student and AI can draw
   - Real-time synchronization between student and AI contributions
   - Support for mathematical diagrams, graphs, and geometric shapes
   - Tools for drawing equations, lines, shapes, and annotations
   - Visual explanations for geometric problems and graphing concepts

2. **Goalpost 2: Step Visualization**
   - Animated breakdown of solution steps
   - Visual representation of each step in the solution process
   - Progressive reveal of solution steps as student progresses
   - Clear visualization of mathematical transformations
   - Highlighting of key insights and decision points
   - Helps students understand the logical flow of problem-solving

3. **Goalpost 3: Voice Interface**
   - Text-to-speech responses: AI tutor speaks responses aloud
   - Speech-to-text input: Students can speak their responses instead of typing
   - Hands-free interaction for accessibility and convenience
   - Natural language processing for spoken math expressions
   - Voice commands for navigation and interaction
   - Accessible learning for students with different learning preferences

4. **Goalpost 4: Animated Avatar**
   - 2D/3D tutor character with expressions
   - Facial expressions change when AI speaks to show engagement
   - Visual feedback that makes the AI tutor feel more human and approachable
   - Emotional expressions (encouraging, thoughtful, celebratory) based on student progress
   - Animated gestures that support mathematical explanations
   - Makes the learning experience more engaging and less intimidating

5. **Goalpost 5: Difficulty Modes**
   - Adjust scaffolding by grade level
   - Adaptive questioning based on student's academic level
   - Customizable difficulty settings (e.g., middle school, high school, college)
   - Grade-appropriate language and concept complexity
   - Progressive difficulty adjustment as student improves
   - Tailored hints and guidance appropriate to student's level

6. **Goalpost 6: Problem Generation**
   - Create similar practice problems based on student's current problem
   - Generate variations of problems the student is working on
   - Adaptive problem sets that match student's current skill level
   - Practice problems that reinforce concepts from solved problems
   - Randomized problem generation to prevent memorization
   - Enables students to practice independently and build mastery

---

## Financial Considerations

- **Business Model**: Free application - affordability is the core mission
- **Revenue**: Not the primary focus for MVP; mission is to democratize access to quality math education
- **Cost Structure**: LLM API costs will need to be managed, but accessibility takes priority over monetization

---

## Technical Preferences

- **Platform**: Web interface (accessible across devices)
- **Math Rendering**: LaTeX-based equation rendering
- **Image Processing**: OCR/Vision LLM for problem parsing from screenshots
- **Conversation**: Multi-turn dialogue with context maintenance
- **Integration**: LLM APIs for chat functionality and Socratic questioning logic

---

## Risks and Assumptions

### Key Assumptions

- Students will engage with Socratic questioning approach (prefer discovery over direct answers)
- LLM can maintain pedagogical quality without giving direct answers
- Image OCR/Vision will accurately parse math problems from various sources
- Free model is sustainable for the platform
- Students will naturally reduce usage as they improve (temporary crutch model works)

### Critical Risks

- **Pedagogical risk**: If students repeatedly need help at same difficulty level, the approach isn't working
- **Dependency risk**: If students become dependent on the app instead of learning, the mission fails
- **Technical risk**: LLM may give direct answers despite system prompts, undermining the Socratic method
- **Adoption risk**: Free tools often struggle with quality perception - need to ensure quality despite being free

### Success Criteria Validation

- Must demonstrate students progressing to higher difficulty levels independently
- Must show decreased usage over time per student (indicating learning, not dependency)
- Must prove pedagogical effectiveness through problem completion without direct answers

---

_This Product Brief captures the vision and requirements for socratica._

_It was created through collaborative discovery and reflects the unique needs of this greenfield Level 3 software project._

