# VS Code Extension

ContextKit ships as a VS Code extension for in-editor context management.

## Installation

The extension is available from the VS Code Marketplace (search for "ContextKit") or can be installed from a `.vsix` file.

## Features

### Sidebar

The ContextKit sidebar appears in the activity bar and shows:

1. **Project Overview** — file count, token estimate, issue count, health score
2. **Instruction Files** — clickable list of all detected instruction files
3. **Issues** — duplicates, conflicts, oversized files, missing recommendations
4. **Context Packs** — one-click generation for frontend, backend, etc.
5. **Actions** — scan, report, split, convert, generate

### Diagnostics

ContextKit adds diagnostics (warnings/errors) directly in instruction files:

- Duplicate rule warnings
- Conflict warnings between files
- Oversized file errors
- Broken local link warnings
- Missing recommended file info

### Status Bar

The status bar shows:
- Token count (e.g., "10.4k tokens")
- Issue count (errors and warnings)
- Click to open the full report

### Webview Report

A rich HTML report showing:
- Health score dashboard
- Token breakdown by file
- Complete issue list with severity badges
- Detected project information
- Suggested actions

## Commands

| Command | ID |
|---|---|
| Scan Workspace | `contextkit.scanWorkspace` |
| Open Report | `contextkit.openReport` |
| Refresh | `contextkit.refresh` |
| Generate Instructions | `contextkit.generateInstructions` |
| Split Instruction File | `contextkit.splitInstructionFile` |
| Convert Instructions | `contextkit.convertInstructions` |
| Create Context Pack | `contextkit.createContextPack` |
| Open Settings | `contextkit.openSettings` |

## Settings

| Setting | Type | Default |
|---|---|---|
| `contextkit.autoScanOnOpen` | boolean | `false` |
| `contextkit.autoScanOnSave` | boolean | `false` |
| `contextkit.tokenWarningThreshold` | number | `4000` |
| `contextkit.tokenErrorThreshold` | number | `8000` |
| `contextkit.include` | string[] | `[]` |
| `contextkit.exclude` | string[] | `["node_modules", ...]` |
| `contextkit.preferredInstructionFormat` | string | `"agents"` |
| `contextkit.enableDiagnostics` | boolean | `true` |
| `contextkit.enableStatusBar` | boolean | `true` |
