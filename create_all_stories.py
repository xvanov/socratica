#!/usr/bin/env python3
"""
Batch create all story documents from epics.md
This script generates story SOCS documents following the BMAD workflow pattern.
"""

import re
import os
from pathlib import Path
from datetime import datetime

# Configuration
EPICS_FILE = 'docs/epics.md'
SPRINT_STATUS_FILE = 'docs/sprint-status.yaml'
STORIES_DIR = 'docs/stories'
TEMPLATE_DIR = 'bmad/bmm/workflows/4-implementation/create-story'

def extract_story_from_epics(epics_content, epic_num, story_num):
    """Extract story details from epics.md content"""
    # Find epic section - look for "### Epic N:" pattern and capture until next Epic or --- separator
    epic_pattern = rf'### Epic {epic_num}:.*?\n(.*?)(?=\n---\n\n### Epic |\n### Epic |\Z)'
    epic_match = re.search(epic_pattern, epics_content, re.DOTALL)
    if not epic_match:
        return None
    
    epic_content = epic_match.group(1)
    
    # Find story section - look for "#### Story N.M:" pattern
    story_pattern = rf'#### Story {epic_num}\.{story_num}: (.+?)\n\n(.*?)(?=#### Story |\n---|\Z)'
    story_match = re.search(story_pattern, epic_content, re.DOTALL)
    if not story_match:
        return None
    
    title = story_match.group(1).strip()
    story_content = story_match.group(2)
    
    # Extract user story - handle "So that" (capital S)
    user_story_match = re.search(r'As a (.+?),?\nI want (.+?),?\nSo that (.+?)\n', story_content)
    if not user_story_match:
        return None
    
    role = user_story_match.group(1).strip()
    action = user_story_match.group(2).strip()
    benefit = user_story_match.group(3).strip()
    
    # Extract acceptance criteria
    ac_pattern = r'\*\*Acceptance Criteria:\*\*\n(.*?)(?=\*\*Prerequisites|\Z)'
    ac_match = re.search(ac_pattern, story_content, re.DOTALL)
    acceptance_criteria = []
    if ac_match:
        ac_text = ac_match.group(1)
        # Split by numbered list (1. at start of line)
        ac_items = re.findall(r'^(\d+\. .+?)(?=^\d+\. |\*\*Prerequisites|\Z)', ac_text, re.MULTILINE | re.DOTALL)
        acceptance_criteria = [item.strip() for item in ac_items if item.strip()]
        # If that didn't work, try simpler pattern
        if not acceptance_criteria:
            ac_lines = [line.strip() for line in ac_text.split('\n') if line.strip() and re.match(r'^\d+\.', line.strip())]
            acceptance_criteria = ac_lines
    
    # Extract prerequisites
    prereq_match = re.search(r'\*\*Prerequisites:\*\* (.+?)(?=\n|$)', story_content)
    prerequisites = prereq_match.group(1).strip() if prereq_match else "None"
    
    return {
        'title': title,
        'role': role,
        'action': action,
        'benefit': benefit,
        'acceptance_criteria': acceptance_criteria,
        'prerequisites': prerequisites,
        'epic_num': epic_num,
        'story_num': story_num
    }

def generate_story_document(story_key, story_data, previous_story_key=None):
    """Generate story document content"""
    epic_num = story_data['epic_num']
    story_num = story_data['story_num']
    
    # Generate tasks from acceptance criteria
    tasks = []
    for i, ac in enumerate(story_data['acceptance_criteria'], 1):
        task_num = i
        tasks.append(f"- [ ] Task {task_num}: (AC: {i})")
        tasks.append(f"  - [ ] Implement acceptance criterion {i}")
        tasks.append(f"  - [ ] Test acceptance criterion {i}")
    
    # Add testing task
    tasks.append(f"- [ ] Task {len(story_data['acceptance_criteria']) + 1}: Testing and verification")
    tasks.append(f"  - [ ] Test all acceptance criteria")
    tasks.append(f"  - [ ] Verify implementation matches requirements")
    
    # Generate learnings section if previous story exists
    learnings_section = ""
    if previous_story_key:
        learnings_section = f"""
### Learnings from Previous Story

**From Story {previous_story_key} (Status: see sprint-status.yaml)**

- Review previous story implementation for patterns and services to reuse
- Check for architectural decisions and technical debt
- Reference previous story file: [Source: docs/stories/{previous_story_key}.md]

"""
    
    # Generate story document
    doc = f"""# Story {epic_num}.{story_num}: {story_data['title']}

Status: drafted

## Story

As a {story_data['role']},
I want {story_data['action']},
so that {story_data['benefit']}.

## Acceptance Criteria

"""
    
    # Add acceptance criteria
    for i, ac in enumerate(story_data['acceptance_criteria'], 1):
        doc += f"{i}. {ac}\n"
    
    doc += f"""
## Tasks / Subtasks

"""
    
    # Add tasks
    doc += "\n".join(tasks)
    
    doc += f"""

## Dev Notes

{learnings_section}### Architecture Patterns

- Follow architecture patterns from `docs/architecture.md`
- Reference Epic {epic_num} architecture components
- Follow naming conventions and project structure

### Project Structure Notes

- Align with unified project structure from `docs/architecture.md`
- Follow component patterns and file organization
- Reference Epic {epic_num} component locations

### References

- [Source: docs/epics.md#Story-{epic_num}.{story_num}]
- [Source: docs/architecture.md#Epic-{epic_num}]
- [Source: docs/PRD.md]
"""
    
    if previous_story_key:
        doc += f"- [Source: docs/stories/{previous_story_key}.md#Dev-Agent-Record]\n"
    
    doc += """
## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- """ + datetime.now().strftime("%Y-%m-%d") + ": Story created from epics.md\n"
    
    return doc

def main():
    # Read epics file
    with open(EPICS_FILE, 'r') as f:
        epics_content = f.read()
    
    # Read sprint-status.yaml
    with open(SPRINT_STATUS_FILE, 'r') as f:
        sprint_status = f.read()
    
    # Extract backlog stories
    backlog_stories = []
    for line in sprint_status.split('\n'):
        if ': backlog' in line and not line.strip().startswith('#') and 'epic-' not in line and 'retrospective' not in line:
            story_key = line.split(':')[0].strip()
            backlog_stories.append(story_key)
    
    # Filter out already created stories
    existing_stories = [f.replace('.md', '') for f in os.listdir(STORIES_DIR) if f.endswith('.md')]
    remaining_stories = [s for s in backlog_stories if s not in existing_stories]
    
    print(f"Found {len(remaining_stories)} stories to create")
    
    # Process each story
    created_count = 0
    for story_key in remaining_stories:
        # Parse story key (e.g., "3-1-socratic-system-prompt-design")
        parts = story_key.split('-')
        if len(parts) < 2:
            continue
        
        epic_num = int(parts[0])
        story_num = int(parts[1])
        
        # Extract story data from epics
        story_data = extract_story_from_epics(epics_content, epic_num, story_num)
        if not story_data:
            print(f"Warning: Could not extract story data for {story_key}")
            continue
        
        # Find previous story
        story_index = backlog_stories.index(story_key)
        previous_story_key = None
        if story_index > 0:
            prev_key = backlog_stories[story_index - 1]
            if prev_key in existing_stories or prev_key in [s for s in backlog_stories[:story_index] if s in remaining_stories[:created_count]]:
                previous_story_key = prev_key
        
        # Generate story document
        doc_content = generate_story_document(story_key, story_data, previous_story_key)
        
        # Write story file
        story_file = os.path.join(STORIES_DIR, f"{story_key}.md")
        with open(story_file, 'w') as f:
            f.write(doc_content)
        
        created_count += 1
        if created_count % 10 == 0:
            print(f"Created {created_count} stories...")
    
    print(f"Successfully created {created_count} story documents!")
    
    # Update sprint-status.yaml
    print("Updating sprint-status.yaml...")
    updated_status = sprint_status
    for story_key in remaining_stories[:created_count]:
        updated_status = updated_status.replace(f"{story_key}: backlog", f"{story_key}: drafted")
    
    with open(SPRINT_STATUS_FILE, 'w') as f:
        f.write(updated_status)
    
    print("Done! All story documents created and sprint-status.yaml updated.")

if __name__ == '__main__':
    main()


