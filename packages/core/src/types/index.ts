export interface ContextKitConfig {
  rootDir: string;
  include?: string[];
  exclude?: string[];
  tokenWarningThreshold?: number;
  tokenErrorThreshold?: number;
  customInstructionFiles?: string[];
  preferredPackageManager?: "npm" | "pnpm" | "yarn" | "bun";
}

export interface InstructionFile {
  path: string;
  kind: InstructionFileKind;
  content: string;
  sizeBytes: number;
  estimatedTokens: number;
  lastModified?: Date;
}

export type InstructionFileKind =
  | "agents"
  | "claude"
  | "cursor"
  | "copilot"
  | "roo"
  | "codex"
  | "windsurf"
  | "gemini"
  | "custom";

export interface ContextIssue {
  id: string;
  severity: "info" | "warning" | "error";
  type:
    | "duplicate_rule"
    | "conflicting_rule"
    | "oversized_file"
    | "stale_instruction"
    | "missing_recommended_file"
    | "invalid_format"
    | "broken_link"
    | "unknown";
  message: string;
  filePath?: string;
  line?: number;
  relatedFiles?: string[];
  suggestion?: string;
}

export interface ContextScanResult {
  rootDir: string;
  scannedAt: string;
  files: InstructionFile[];
  issues: ContextIssue[];
  totalEstimatedTokens: number;
  healthScore: number;
  detectedProject: DetectedProjectInfo;
}

export interface DetectedProjectInfo {
  packageManager?: "npm" | "pnpm" | "yarn" | "bun";
  frameworks: string[];
  languages: string[];
  testTools: string[];
  lintTools: string[];
  formatTools: string[];
  buildCommands: string[];
  testCommands: string[];
  hasCi: boolean;
  hasDocker: boolean;
  hasDatabaseMigrations: boolean;
}

export interface ReportOptions {
  format: "markdown" | "json";
}

export interface ConvertInput {
  sourcePath: string;
  sourceContent: string;
  sourceKind: InstructionFileKind;
  targetKind: InstructionFileKind;
}

export interface ConvertOutput {
  content: string;
  targetPath: string;
  warnings: string[];
}

export interface SplitInput {
  filePath: string;
  content: string;
  outputDir: string;
  kind: InstructionFileKind;
}

export interface SplitOutput {
  rootContent: string;
  modules: Array<{
    path: string;
    content: string;
    heading: string;
  }>;
  backupPath: string;
}

export interface GenerateInstructionsInput {
  rootDir: string;
  targetKind: InstructionFileKind;
  detectedProject: DetectedProjectInfo;
  existingFiles: InstructionFile[];
}

export interface GenerateInstructionsOutput {
  content: string;
  targetPath: string;
  suggestedPath: string;
}

export interface ContextPackInput {
  rootDir: string;
  packType: ContextPackType;
  files: InstructionFile[];
  detectedProject: DetectedProjectInfo;
}

export interface ContextPackOutput {
  content: string;
  packType: ContextPackType;
}

export type ContextPackType =
  | "frontend"
  | "backend"
  | "database"
  | "testing"
  | "security"
  | "deployment"
  | "full";

export interface FileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  directoryExists(path: string): Promise<boolean>;
  listFiles(dir: string): Promise<string[]>;
  stat(path: string): Promise<{ size: number; mtimeMs: number }>;
  mkdir(path: string): Promise<void>;
  resolvePath(...segments: string[]): string;
  joinPath(...segments: string[]): string;
  isAbsolute(path: string): boolean;
  relativePath(from: string, to: string): string;
}

export interface Tokenizer {
  estimateTokens(text: string): number;
}

export interface HeadingNode {
  level: number;
  text: string;
  children: HeadingNode[];
  startLine: number;
  endLine?: number;
}

export interface SentenceInfo {
  text: string;
  normalized: string;
  line: number;
  filePath: string;
}

export interface ConflictGroup {
  id: string;
  values?: string[];
  patterns?: RegExp[];
  oppositePatterns?: Array<[RegExp, RegExp]>;
}

export interface DuplicateInfo {
  sentence1: SentenceInfo;
  sentence2: SentenceInfo;
  similarity: number;
}

export interface ParsedMarkdown {
  headings: HeadingNode[];
  sentences: SentenceInfo[];
  links: LinkInfo[];
  sections: MarkdownSection[];
}

export interface LinkInfo {
  text: string;
  url: string;
  isLocal: boolean;
  line: number;
}

export interface MarkdownSection {
  heading: string;
  headingLevel: number;
  content: string;
  startLine: number;
  endLine: number;
}

export interface ConfigFile {
  tokenWarningThreshold: number;
  tokenErrorThreshold: number;
  preferredInstructionFormat: string;
  include: string[];
  exclude: string[];
  customInstructionFiles: string[];
  conflictRules: ConflictGroup[];
}
