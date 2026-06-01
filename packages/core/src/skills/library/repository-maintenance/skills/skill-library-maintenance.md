---
name: skill-library-maintenance
title: Skill Library Maintenance
category: repository-maintenance
subcategory: skills
version: 1.0.0
tags:
  - skills
  - documentation
  - versioning
  - maintenance
appliesTo:
  - "**/skills/**/*.md"
  - "**/library/**/*.md"
  - "**/AGENTS.md"
compatibility:
  targets:
    - skill-library
  majorVersions:
    - version: "1"
      status: current
      requirements:
        - Every skill must have metadata, provider/model guidance, and a clear update path.
      features:
        - Frontmatter metadata
        - Provider compatibility
        - Token estimates
        - Reviewable updates
  expertise:
    - Prompt maintenance
    - Skill versioning
    - Compatibility metadata
    - Library hygiene
agentCompatibility:
  defaultProvider: openai
  defaultModel: gpt-5
  providers:
    - provider: openai
      models:
        - id: gpt-5
          fit: excellent
          contextWindow: large
          recommendedModes:
            - code-editing
            - review
            - planning
          setup:
            - Use the skill as focused task context rather than loading the full skill library.
          optimization:
            - Import only matching category or subcategory skills to keep prompt context precise.
        - id: gpt-4.1
          fit: good
          contextWindow: large
          recommendedModes:
            - code-editing
            - review
          setup:
            - Keep the selected skill near the task-specific repository context.
          optimization:
            - Prefer concise skill bundles and avoid importing unrelated categories.
      notes:
        - Best default for AgentContextKit's coding, review, and planning skills.
    - provider: anthropic
      models:
        - id: claude-sonnet-4
          fit: excellent
          contextWindow: large
          recommendedModes:
            - code-editing
            - architecture
            - review
          setup:
            - Use the imported skill as project guidance in CLAUDE.md or a dedicated skill file.
          optimization:
            - Keep constraints explicit and avoid mixing conflicting provider-specific instructions.

    - provider: google
      models:
        - id: gemini-2.5-pro
          fit: good
          contextWindow: large
          recommendedModes:
            - analysis
            - code-editing
            - review
          setup:
            - Place the skill in GEMINI.md or reference the imported skill file directly.
          optimization:
            - Use category-level imports for broad reviews and exact skills for implementation work.

  setup:
    - Select the provider and model used by the target AI coding agent before importing.
    - Install only the skills that match the current workflow, repository stack, and agent provider.
  optimization:
    - Prefer exact skill imports for implementation tasks and category imports for audits or onboarding.
    - Review modified local skills before applying upstream improvements.
---

# Skill Library Maintenance

## Document Structure
- Store skills as Markdown documents in category and subcategory folders.
- Keep frontmatter complete: name, title, category, subcategory, version, tags, appliesTo, compatibility, and agentCompatibility.
- Keep each skill focused on one workflow or domain.

## Quality Checks
- Every skill should name the providers and models it supports.
- Include setup notes for each provider/model where behavior differs.
- Keep estimated token cost visible so users can manage context budgets.
- Prefer concise rules, concrete examples, and version-specific caveats.

## Updates
- Never overwrite user-edited skill content automatically.
- For critical improvements, return a review candidate and explain why it matters.
- Keep previous local content available during review.
