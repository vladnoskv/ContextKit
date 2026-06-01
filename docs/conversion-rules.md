# Conversion Rules

AgentContextKit converts between AI instruction file formats using rule-based, deterministic conversion.

## Supported Conversions

| From | To | Preserves |
|---|---|---|
| AGENTS.md | Copilot | Overview, commands, standards, testing, security, warnings |
| AGENTS.md | Cursor | Overview, standards, testing, warnings (wrapped in YAML frontmatter) |
| AGENTS.md | Claude | All content, reorganized for Claude format |
| AGENTS.md | Roo | Overview, standards |
| CLAUDE.md | AGENTS.md | All content, reorganized for AGENTS.md format |
| Cursor .mdc | AGENTS.md | Content (strips YAML frontmatter) |
| Copilot | AGENTS.md | All content, reorganized |

## Section Mapping

AgentContextKit maps sections between formats:

| Source Section | Target |
|---|---|
| Overview / Introduction / About | Project Overview |
| Commands / Scripts | Commands |
| Standards / Style / Conventions | Coding Standards |
| Test / Spec | Testing Rules |
| Security / Auth | Security |
| Warning / Caution / Important | Important Warnings |

## Limitations

- Conversion is deterministic and rule-based (no LLM)
- Complex custom formatting may not be perfectly preserved
- Tool-specific features (Cursor globs, etc.) are added/removed as appropriate
- Always review converted files before using them
