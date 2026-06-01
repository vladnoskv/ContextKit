import type {
  ContextKitConfig,
  ContextScanResult,
  ReportOptions,
  ConvertInput,
  ConvertOutput,
  SplitInput,
  SplitOutput,
  GenerateInstructionsInput,
  GenerateInstructionsOutput,
  ContextPackInput,
  ContextPackOutput,
  InstructionFile,
  ContextIssue,
  FileSystemAdapter,
  SkillCategory,
  SkillMetadata,
  BuiltinSkill,
  InstalledSkill,
  SkillInstallOptions,
  SkillInstallResult,
  SkillDoctorIssue,
  InstructionFormat,
  SkillsManifest,
  SkillGroupDefinition,
  SkillCatalog,
  SkillSelection,
  SkillCompatibility,
  SkillMajorVersionKnowledge,
  SkillAgentCompatibility,
  SkillProviderCompatibility,
  SkillModelCompatibility,
  SkillSafeUpdateOptions,
  SkillSafeUpdateResult,
  SkillUpdateCandidate,
} from "./types/index.js";
import { scanInstructions } from "./scanner/index.js";
import { analyzeDuplicates } from "./analyzer/duplicateRuleAnalyzer.js";
import { analyzeConflicts } from "./analyzer/conflictAnalyzer.js";
import { analyzeOversizedFiles } from "./analyzer/oversizedFileAnalyzer.js";
import { analyzeBrokenLinks } from "./analyzer/brokenLinkAnalyzer.js";
import { analyzeStaleInstructions } from "./analyzer/staleInstructionAnalyzer.js";
import { analyzeMissingRecommendedFiles } from "./analyzer/missingRecommendedFileAnalyzer.js";
import { analyzeFormatIssues } from "./analyzer/formatAnalyzer.js";
import { detectProject } from "./analyzer/projectDetector.js";
import { generateReport } from "./reporter/index.js";
import { convertInstructions } from "./converter/index.js";
import { splitInstructionFile } from "./splitter/index.js";
import { generateInstructions } from "./generator/index.js";
import { createContextPack } from "./generator/contextPackGenerator.js";
import { calculateHealthScore } from "./utils/healthScore.js";
import { createNodeFileSystemAdapter } from "./utils/fsAdapter.js";
import { loadConfig, mergeConfig, DEFAULT_CONFIG } from "./utils/config.js";
import { detectInstructionKind, instructionKindToPath, ALL_INSTRUCTION_KINDS } from "./utils/instructionKinds.js";
import {
  getSkill,
  listSkills,
  listCategories,
  searchSkills,
  getSkillsByCategory,
  getInstalledSkills,
  getSkillCatalog,
  installSkills,
  readInstalledSkill,
  removeInstalledSkill,
  resolveSkillSelection,
  updateInstalledSkills,
  updateInstalledSkillsSafe,
  writeInstalledSkill,
  exportSkillsToInstructionFormat,
  runSkillsDoctor,
  getRecommendedSkills,
  listGroups,
  getGroup,
  resolveGroupSkills,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  ALL_SKILLS,
  SKILL_GROUPS,
} from "./skills/index.js";

// Re-export types
export type {
  ContextKitConfig,
  ContextScanResult,
  ReportOptions,
  ConvertInput,
  ConvertOutput,
  SplitInput,
  SplitOutput,
  GenerateInstructionsInput,
  GenerateInstructionsOutput,
  ContextPackInput,
  ContextPackOutput,
  InstructionFile,
  ContextIssue,
  FileSystemAdapter,
  InstructionFileKind,
  ContextPackType,
  DetectedProjectInfo,
  DuplicateInfo,
  ConflictGroup,
  ParsedMarkdown,
  HeadingNode,
  MarkdownSection,
  Tokenizer,
  SkillCategory,
  SkillMetadata,
  BuiltinSkill,
  InstalledSkill,
  SkillInstallOptions,
  SkillInstallResult,
  SkillDoctorIssue,
  InstructionFormat,
  SkillsManifest,
  SkillGroupDefinition,
  SkillCatalog,
  SkillSelection,
  SkillCompatibility,
  SkillMajorVersionKnowledge,
  SkillAgentCompatibility,
  SkillProviderCompatibility,
  SkillModelCompatibility,
  SkillSafeUpdateOptions,
  SkillSafeUpdateResult,
  SkillUpdateCandidate,
} from "./types/index.js";

export type { ConflictFinding, DuplicateAnalysis } from "./analyzer/index.js";
export type { OversizedFileConfig } from "./analyzer/oversizedFileAnalyzer.js";

export {
  analyzeDuplicates,
  analyzeConflicts,
  analyzeOversizedFiles,
  analyzeBrokenLinks,
  analyzeStaleInstructions,
  analyzeMissingRecommendedFiles,
  analyzeFormatIssues,
  detectProject,
  generateReport,
  convertInstructions,
  splitInstructionFile,
  generateInstructions,
  createContextPack,
  calculateHealthScore,
  createNodeFileSystemAdapter,
  loadConfig,
  mergeConfig,
  DEFAULT_CONFIG,
  detectInstructionKind,
  instructionKindToPath,
  ALL_INSTRUCTION_KINDS,
  getSkill,
  listSkills,
  listCategories,
  searchSkills,
  getSkillsByCategory,
  getInstalledSkills,
  getSkillCatalog,
  installSkills,
  readInstalledSkill,
  removeInstalledSkill,
  resolveSkillSelection,
  updateInstalledSkills,
  updateInstalledSkillsSafe,
  writeInstalledSkill,
  exportSkillsToInstructionFormat,
  runSkillsDoctor,
  getRecommendedSkills,
  listGroups,
  getGroup,
  resolveGroupSkills,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  ALL_SKILLS,
  SKILL_GROUPS,
};

export async function scanContext(
  config: ContextKitConfig,
  fs?: FileSystemAdapter,
): Promise<ContextScanResult> {
  const adapter = fs ?? createNodeFileSystemAdapter();

  const configFile = await loadConfig(config.rootDir, adapter);
  const mergedConfig = configFile
    ? {
        ...config,
        tokenWarningThreshold: config.tokenWarningThreshold ?? configFile.tokenWarningThreshold,
        tokenErrorThreshold: config.tokenErrorThreshold ?? configFile.tokenErrorThreshold,
      }
    : config;

  const files = await scanInstructions(mergedConfig, adapter);
  const detectedProject = await detectProject(config.rootDir, adapter);

  const scannedAt = new Date().toISOString();

  const issues: ContextIssue[] = [];

  // Duplicate detection
  const dupAnalysis = analyzeDuplicates(files);
  for (const dup of dupAnalysis.duplicates) {
    issues.push({
      id: `dup-${dup.sentence1.filePath}-${dup.sentence1.line}-${dup.sentence2.filePath}-${dup.sentence2.line}`,
      severity: "warning",
      type: "duplicate_rule",
      message: `Duplicate rule detected: "${truncate(dup.sentence1.text)}"`,
      filePath: dup.sentence1.filePath,
      line: dup.sentence1.line,
      relatedFiles: [dup.sentence2.filePath],
      suggestion:
        "Consider removing the duplicate to reduce instruction noise.",
    });
  }

  // Conflict detection
  const conflictRules = configFile?.conflictRules ?? [];
  const conflictFindings = analyzeConflicts(files, conflictRules);
  for (const conflict of conflictFindings) {
    issues.push({
      id: `conflict-${conflict.groupId}-${conflict.fileA}-${conflict.fileB}`,
      severity: "warning",
      type: "conflicting_rule",
      message: `Conflicting rule (${conflict.groupId}): "${truncate(conflict.sentenceA)}" vs "${truncate(conflict.sentenceB)}"`,
      filePath: conflict.fileA,
      line: conflict.lineA,
      relatedFiles: [conflict.fileB],
      suggestion: `Choose a consistent approach for "${conflict.groupId}" and update all instruction files.`,
    });
  }

  // Oversized files
  const oversizedIssues = analyzeOversizedFiles(files, {
    warningThreshold: mergedConfig.tokenWarningThreshold ?? 4000,
    errorThreshold: mergedConfig.tokenErrorThreshold ?? 8000,
  });
  issues.push(...oversizedIssues);

  // Stale instructions
  const staleIssues = analyzeStaleInstructions(files);
  issues.push(...staleIssues);

  // Broken links
  const brokenLinks = await analyzeBrokenLinks(
    files,
    async (p) => adapter.fileExists(adapter.joinPath(config.rootDir, p)),
    (...segs) => adapter.resolvePath(...segs),
  );
  issues.push(...brokenLinks);

  // Missing recommended files
  const missingIssues = analyzeMissingRecommendedFiles(files, detectedProject);
  issues.push(...missingIssues);

  // Format issues
  const formatIssues = analyzeFormatIssues(files);
  issues.push(...formatIssues);

  const totalEstimatedTokens = files.reduce(
    (sum, f) => sum + f.estimatedTokens,
    0,
  );

  const hasMainInstructionFile = files.some(
    (f) => f.kind === "agents" || f.path.toLowerCase() === "agents.md",
  );

  const healthScore = calculateHealthScore(
    issues,
    totalEstimatedTokens,
    hasMainInstructionFile,
  );

  return {
    rootDir: config.rootDir,
    scannedAt,
    files,
    issues,
    totalEstimatedTokens,
    healthScore,
    detectedProject,
  };
}

function truncate(text: string, maxLen: number = 60): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}
