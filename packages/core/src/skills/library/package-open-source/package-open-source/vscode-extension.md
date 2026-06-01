---
name: vscode-extension
title: VS Code Extension Architecture
category: package-open-source
subcategory: package-open-source
version: 1.0.0
tags:
  - vscode
  - extension
  - publishing
appliesTo:
  - "packages/vscode/**/*"
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

# VS Code Extension Architecture

## Project Structure
- `src/extension.ts` — activation entry point.
- `src/commands/` — command registration and handlers.
- `src/views/` — tree views, webviews, status bar.
- `src/config/` — configuration schema and settings.
- `package.json` — contributes, activation events, commands.

## Activation
- Use specific activation events, not `"activationEvents": ["*"]`.
- Common events: `onCommand`, `onView`, `onLanguage`, `workspaceContains`.
- Call `context.subscriptions.push()` for all disposables.
- Heavy initialization should be deferred or lazy-loaded.

## Webviews
- Strict CSP: no inline scripts, no remote script sources.
- Use `postMessage` for extension-webview communication.
- Always validate messages from webviews (they can be spoofed).
- Set `enableScripts: false` unless absolutely needed at trusted workspace trust.

## Security
- Use `SecretStorage` API for secrets, never `Memento`.
- Respect workspace trust: disable unsafe features in untrusted workspaces.
- Extension context is shared across workspaces. Store data per-workspace-key.
- Never execute code from the workspace without user confirmation.

## Publishing
- Version in `package.json`. Follow semver.
- Run `vsce package` to verify packaging before publish.
- Include `README.md`, `CHANGELOG.md`, `LICENSE`.
- Test on all supported VS Code versions before publishing.
