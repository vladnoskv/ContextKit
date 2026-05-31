// Auto-generated skills definitions
export const skills = [
  {
    name: "translation-key-design",
    title: "Translation Key Design",
    category: "i18n-localization",
    description: "Naming keys and structuring locales for maintainable i18n",
    version: "1.0.0",
    tags: ["i18n", "keys", "locales"],
    appliesTo: ["**/*"],
    content: `# Translation Key Design

## Key Naming Conventions
- Use dot-separated namespace hierarchy: \`checkout.payment.cardNumber.label\`
- Prefer semantic keys over English-text keys: \`error.timeout\` not \`"Request timed out"\`
- Group by feature/domain first, not by page or component name
- Suffix with type hint: \`.label\`, \`.tooltip\`, \`.ariaLabel\`, \`.placeholder\`, \`.error\`, \`.success\`
- Never include formatting or interpolation in the key itself — that lives in values

## Locale File Structure
- One JSON file per locale: \`en.json\`, \`fr.json\`, \`ar.json\`
- Flat structure at top level: \`{ "checkout.payment.cardNumber.label": "..." }\`
- Nesting allowed only when all keys share a common prefix and no dynamic segments
- Keep locale files under \`src/locales/{locale}/common.json\` by default
- Split only when a single file exceeds ~1000 keys or 50KB

## Key Lifecycle Rules
- Never delete a key without checking all consumers first — use grep across the full codebase
- Deprecated keys get a \`DEPRECATED:\` comment in the fallback locale only, kept for 2 releases
- Renaming a key = deprecate old + add new; never reuse old key name for different meaning
- Version locale files in git; review diffs for unintended key removals before merge

## Dynamic Key Patterns
- Avoid runtime key construction: \`t(\`error.\${code}\`)\` — use a switch/map instead
- For enumerated values: \`categories.{categoryId}\` is acceptable if \`categoryId\` is bounded
- Parameterized keys must use ICU-style placeholders: \`"You have {count} items"\`

## Review Checklist
- Every new UI string has a corresponding key in ALL locale files (even if identical initially)
- No keys contain presentation markup in the raw value — use rich text interpolation
- Context comments provided for translators: \`"_comment_key": "Appears in payment modal header"\``
  },
  {
    name: "locale-validation",
    title: "Locale Validation",
    category: "i18n-localization",
    description: "Validate missing keys, placeholders, and risky content across locales",
    version: "1.0.0",
    tags: ["i18n", "validation", "linting"],
    appliesTo: ["**/*"],
    content: `# Locale Validation

## Missing Key Detection
- Run a script that extracts all key usages from source (\`t("key")\`, \`<Trans i18nKey="key" />\`) and diffs against each locale file
- Fail CI if any locale is missing a key present in the fallback locale
- For keys present in a translation locale but absent in fallback: flag as orphaned, add to orphan report, do NOT fail CI
- Allow a \`SKIP_VALIDATE_KEYS\` regex config to exclude test fixtures and debug keys

## Placeholder Consistency
- Extract all \`{placeholder}\` and \`{count, plural, ...}\` tokens from each value using a regex: \`\\{[^{}]+\\}\`
- For each key, assert that every locale has the exact same set of placeholder names (order may differ)
- ICU MessageFormat placeholders must match their type and style across locales
- Flag any locale where placeholder count is zero but fallback has >0 — likely an untranslated copy

## Risky Content Detection
- Flag keys where source and target character-count ratio exceeds 3:1 (possible truncation or missing content)
- Flag values containing HTML-like tags (translation injection risk) unless the value is in an allow-list
- Flag values that contain only whitespace or look like random noise (Shannon entropy < 2.5 bits/char check)
- Detect keys where the translated value is identical to the source English value (possibly missed translation)
- Flag values containing non-standard Unicode: zero-width joiners, bidirectional control characters outside RTL locales

## Automated CI Integration
- Run locale validation as a pre-commit hook with \`--staged\` option for changed locale files only
- Full validation runs on PR; report differences as annotations on the diff
- Store baseline snapshots of the fallback locale; alert on key count drops >5% between commits
- Generate a \`TRANSLATION_STATUS.md\` report with coverage percentage, orphan count, and placeholder drift

## Severity Classification
- Blocking (fail CI): missing keys in a production locale, placeholder mismatch, broken ICU syntax
- Warning (annotation): >3:1 length ratio, duplicate values, untranslated copies, orphan keys
- Info: new keys added without context comments, locales lagging behind fallback by >10 keys`
  },
  {
    name: "hardcoded-string-scan",
    title: "Hardcoded String Scanner",
    category: "i18n-localization",
    description: "Detect user-facing hardcoded strings that should use i18n keys",
    version: "1.0.0",
    tags: ["i18n", "linting", "strings"],
    appliesTo: ["**/*"],
    content: `# Hardcoded String Scanner

## Detection Patterns
- Scan JSX/TSX for text nodes: \`<div>Hello</div>\`, \`<Button>Submit</Button>\`, \`<span>{'Pay now'}</span>\`
- Scan string literals passed to native HTML attributes: \`placeholder="Search..."\`, \`alt="Logo"\`, \`title="Close"\`, \`aria-label="Menu"\`
- Scan for template literal strings in JSX: \`<div>{\`Welcome \${name}\`}</div>\`
- Scan for \`console.error("User not found")\` — these may need translation if user-visible in toasts
- Scan for \`alert()\`, \`confirm()\`, \`prompt()\` with hardcoded messages

## Exclusion Rules (Allow-List)
- Console debug/trace logs: \`console.debug\`, \`console.trace\` are exempt
- Test files (\`*.test.ts\`, \`*.spec.ts\`, \`__tests__/**\`) are exempt entirely
- Comment strings and JSDoc are never flagged
- Error object constructors: \`new Error("Internal failure")\` is exempt unless surfaced to UI
- Regex patterns, \`String.raw\`, TypeScript \`as const\` type assertions — exempt

## Severity Tiers
- **Error**: strings in user-facing attributes (\`aria-label\`, \`placeholder\`, \`title\`, \`alt\`) — these always need translation
- **Warning**: strings in JSX text nodes and \`children\` props
- **Info**: strings in \`console.error\`, error \`.message\` properties, and notification text

## Auto-Fix Suggestions
- For detected strings, generate a suggested key name following the key design rules (\`component.action.label\`)
- Output a JSON patch file with proposed additions to the fallback locale
- Never auto-insert \`t()\` calls — require manual review for correct interpolation context

## Configuration (.hardstringrc)
- \`excludePatterns\`: array of globs for files to skip (default: \`["**/*.test.*", "**/__mocks__/**"]\`)
- \`excludeStrings\`: array of exact strings to ignore (e.g. single-character strings, numbers)
- \`minLength\`: minimum string length to flag (default: 3, skip "OK", "X")
- \`requireContextComment\`: enforce \`_comment\` in generated locale entries (default: true)`
  },
  {
    name: "rtl-support",
    title: "RTL Support",
    category: "i18n-localization",
    description: "Right-to-left language UI concerns and CSS logical properties",
    version: "1.0.0",
    tags: ["i18n", "rtl", "css", "accessibility"],
    appliesTo: ["**/*"],
    content: `# RTL Support

## CSS Logical Properties (Mandatory)
- Replace \`margin-left\` with \`margin-inline-start\`, \`margin-right\` with \`margin-inline-end\`
- Replace \`padding-left\` with \`padding-inline-start\`, \`padding-right\` with \`padding-inline-end\`
- Replace \`border-left\` with \`border-inline-start\`, \`border-right\` with \`border-inline-end\`
- Replace \`left\`/\`right\` positioning with \`inset-inline-start\`/\`inset-inline-end\`
- Replace \`text-align: left\` with \`text-align: start\`, \`text-align: right\` with \`text-align: end\`
- Use logical border-radius: \`border-start-start-radius\`, \`border-start-end-radius\`, etc.

## Direction Attribute
- Set \`dir="auto"\` on user-generated content containers to auto-detect text direction
- Set \`html[dir="rtl"]\` or \`html[lang="ar"]\` in the root element for RTL locales
- Use \`direction: rtl\` CSS as fallback, but prefer the HTML \`dir\` attribute for accessibility
- Never set \`dir="rtl"\` on individual inline elements unless wrapping bidirectional text

## Icon Mirroring
- Directional icons (arrows, chevrons, progress indicators) flip in RTL: \`[dir="rtl"] .icon-directional { transform: scaleX(-1); }\`
- Non-directional icons (search, plus, home, user) must NOT flip — maintain a whitelist
- Icons with text or numbers (badges, pagination) never flip
- Test icons in RTL by adding \`dir="rtl"\` to \`<html>\` in browser DevTools

## Bidirectional Text
- Wrap mixed Arabic/English strings with \`<bdi>\` (bidirectional isolate) or use \`unicode-bidi: isolate\`
- Use \`<bdo dir="ltr">\` only when forcing explicit direction (e.g., phone numbers in Arabic UI)
- For user input fields, set \`dir="auto"\` on \`<input>\` and \`<textarea>\` to match the input language
- Never rely on LRM/RLM Unicode control characters in source code — use HTML/CSS

## Layout Considerations
- Flexbox and Grid are direction-aware automatically — use \`flex-direction\` not explicit margins
- \`justify-content: flex-start/flex-end\` follows the writing direction
- Test all layouts with both LTR and RTL by toggling \`dir\` on \`<html>\`
- Components with horizontal scrolling must maintain scroll position relative to start edge

## Testing Requirements
- Every component must have a visual regression test in both LTR and RTL
- Cypress/Playwright tests should set \`dir="rtl"\` on \`<html>\` before RTL-specific scenarios
- Check that tooltip/popover positioning flips to stay within viewport in RTL mode`
  },
  {
    name: "pluralization",
    title: "Pluralization",
    category: "i18n-localization",
    description: "Plural rules, count placeholders, and ICU MessageFormat usage",
    version: "1.0.0",
    tags: ["i18n", "icu", "plural", "cldr"],
    appliesTo: ["**/*"],
    content: `# Pluralization

## ICU MessageFormat Plural Rules
- Always use \`{count, plural, ...}\` syntax for numeric quantities: \`{count, plural, =0 {No items} one {# item} other {# items}}\`
- CLDR plural categories: \`zero\`, \`one\`, \`two\`, \`few\`, \`many\`, \`other\`. English uses only \`one\` and \`other\`
- Arabic uses \`zero\`, \`one\`, \`two\`, \`few\`, \`many\`, \`other\` — all six categories. Every RTL locale file must cover all six
- Russian uses \`one\` (1, 21, 31...), \`few\` (2-4, 22-24...), \`many\` (0, 5-20, 25-30...), and \`other\` (fractional)
- Always include the \`=N\` exact match for 0: \`=0 {No results}\` — many languages have a dedicated zero form

## Count Variable Conventions
- Name the count variable descriptively: \`{itemCount, plural, ...}\` not \`{n, plural, ...}\`
- The \`#\` placeholder auto-substitutes the numeric value with locale-aware formatting
- Never compute plural forms in application code (no \`if (count === 1)\`) — always delegate to ICU
- Use \`{count, number}\` for standalone numeric display, \`#\` only inside plural branches

## Select and SelectOrdinal
- \`{gender, select, male {He} female {She} other {They}}\` for gender-dependent strings
- \`{position, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}\` for ordinals
- Nested plurals allowed but keep depth at most 2 levels

## Common Mistakes to Avoid
- Do NOT use \`||\` fallback in JSX: \`{count || 0}\` — ICU handles zero natively via \`=0\` branch
- Do NOT concatenate count into a string: \`count + " items"\` — use the ICU pattern with \`#\`
- Do NOT forget the \`other\` branch — it is required by the ICU spec; missing it causes runtime errors
- Do NOT use non-standard plural categories — only the six CLDR categories are valid

## Validation
- Lint that every \`{x, plural, ...}\` has an \`other\` branch
- Verify that each locale file covers the plural categories required by that locale's CLDR rules
- Test with edge values: 0, 1, 2, 5, 11, 21, 100, 101, 1.5, NaN, Infinity
- Run plural tests against \`Intl.PluralRules\`: \`new Intl.PluralRules('ar').select(3) === 'few'\``
  },
  {
    name: "date-number-formatting",
    title: "Date, Number, and Currency Formatting",
    category: "i18n-localization",
    description: "Intl API usage for dates, numbers, currencies, and units",
    version: "1.0.0",
    tags: ["i18n", "intl", "formatting", "dates"],
    appliesTo: ["**/*"],
    content: `# Date, Number, and Currency Formatting

## Intl.DateTimeFormat
- Always use \`Intl.DateTimeFormat(locale, options)\` — never \`.toLocaleDateString()\` which ignores locale context
- Explicitly specify \`dateStyle\` and \`timeStyle\`: \`{ dateStyle: 'full', timeStyle: 'short' }\` for consistent output
- For relative time: \`Intl.RelativeTimeFormat(locale, { numeric: 'auto' })\`. Pass negative values for past: \`rtf.format(-3, 'day') -> "3 days ago"\`
- Store dates as ISO 8601 strings and format at render time — never format on the server
- Gregorian calendar is default; for Hijri/Buddhist: \`new Intl.DateTimeFormat('ar-SA-u-ca-islamic')\`
- Use \`timeZone\` option explicitly: \`{ timeZone: 'Asia/Dubai' }\` for locale-aware timestamps

## Intl.NumberFormat
- For plain numbers: \`new Intl.NumberFormat('de-DE').format(1234567.89) -> "1.234.567,89"\`
- For currency: \`new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(1000) -> "￥1,000"\`
- Never concatenate currency symbols manually — use \`currencyDisplay: 'symbol'\` / \`'narrowSymbol'\` / \`'name'\`
- For percentages: \`{ style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }\`
- For units: \`{ style: 'unit', unit: 'kilometer-per-hour' }\` — use approved CLDR unit identifiers only

## Common Patterns
- Detect user locale from \`navigator.language\` and pass explicitly to all \`Intl\` constructors
- Cache \`Intl.*\` formatter instances by (locale + options key) — they are expensive to construct
- For SSR: polyfill \`Intl\` with \`@formatjs/intl\` and pass locale from \`Accept-Language\` header
- List formatting: \`new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(['A','B','C']) -> "A, B, and C"\`

## Anti-Patterns
- \`date.toLocaleDateString()\` without explicit locale — uses system locale, breaks SSR consistency
- \`Number(amount).toFixed(2)\` for currency — hardcodes decimal separator, ignores locale grouping
- \`.toUpperCase()\` on locale-sensitive strings (Turkish \`i -> İ\`, not \`I\`) — use \`.toLocaleUpperCase('tr-TR')\`
- String concatenation for lists: \`items.join(', ')\` — use \`Intl.ListFormat\`
- Hardcoding date formats like \`"MM/DD/YYYY"\` — use \`Intl.DateTimeFormat\` with \`dateStyle\`

## Testing
- Set \`LOCALE\` env variable in tests and run same assertions against \`en\`, \`ar\`, \`de\`, \`ja\`
- Snapshot test formatted output for each locale to catch regressions in ICU data
- Never assert on exact formatted output in unit tests — use regex patterns to allow minor CLDR updates`
  },
  {
    name: "translation-expansion",
    title: "Translation Expansion Prevention",
    category: "i18n-localization",
    description: "Prevent layout breakage from longer translated text",
    version: "1.0.0",
    tags: ["i18n", "layout", "css", "expansion"],
    appliesTo: ["**/*"],
    content: `# Translation Expansion Prevention

## Expected Expansion Ratios
- English to German: +35% character length (compound words: "Rechtsschutzversicherungsgesellschaften")
- English to Arabic: +25% length, different glyph width (Arabic script more compact but taller)
- English to Japanese: -20% character count but line height often needs +10% for Kanji readability
- English to Finnish: +40% (agglutinative — single words carry many morphemes)
- Design containers for +50% width expansion and +30% height expansion from English reference

## CSS Defensive Patterns
- Never use \`width: 200px\` on text containers — use \`min-width\` + \`max-width\` with \`overflow-wrap: break-word\`
- Use \`text-overflow: ellipsis\` as last resort only; prefer \`white-space: normal\` and \`word-break: break-word\`
- Flexbox: never set \`flex-shrink: 0\` on text containers unless intentionally preventing shrink
- Grid: use \`minmax(0, 1fr)\` instead of \`1fr\` to allow grid items to shrink below content size
- \`max-width: 100%\` on images/media — but text needs \`overflow-wrap\` or \`word-break\`

## UI Patterns That Break
- Tab bars with fixed-width button labels — Germans overflow in 4 tabs where English fits in 5
- Sidebar nav with fixed width — test with longest translated label in every slot
- Inline icon+label combos — icon may separate from label if text wraps; use \`white-space: nowrap\`
- Toast notifications with truncated text — translated errors are often longer; allow multiline toasts
- Form labels in \`<table>\` layouts — column widths should be \`min-content\` not fixed

## Testing Strategy
- Generate pseudo-localized test strings: append \`[!!LONGEST_LOCALE_TEST_STRING_!!]\` to every key to simulate +50% length
- Use Playwright screenshot comparison in CI with pseudo-locale enabled
- Run a "text overflow" scan: find all DOM elements where \`scrollWidth > clientWidth\` or \`scrollHeight > clientHeight\`
- Test every component in German (\`de\`) and Arabic (\`ar\`) — worst-case width and direction combos

## Developer Guidelines
- Write CSS that accommodates 2x line wrapping in button labels by default
- Use \`line-clamp: 2\` for card descriptions, never \`line-clamp: 1\` — translators need headroom
- Icons paired with text must stack vertically at narrow widths via \`flex-wrap: wrap\`
- Review every new \`overflow: hidden\` — ask: "Is this hiding translated content?"`
  },
  {
    name: "auto-translate-review",
    title: "Auto-Translate Review Workflow",
    category: "i18n-localization",
    description: "Safe review workflow for machine translations before merge",
    version: "1.0.0",
    tags: ["i18n", "translation", "review", "automation"],
    appliesTo: ["**/*"],
    content: `# Auto-Translate Review Workflow

## Receiving Machine Translations
- Machine translations (Google, DeepL, Azure) must land as a separate PR tagged \`[AUTO-TRANSLATE]\` — never push directly to locale files
- Each auto-translated key gets a metadata comment: \`"_auto_generated": true, "_engine": "deepl", "_generated_at": "2026-05-15T10:00:00Z"\`
- Auto-translate PRs must pass locale validation checks before human review — fail CI if placeholders missing or ICU syntax broken
- Limit auto-translate PRs to 50 or fewer new/modified keys per PR for manageable review size

## Human Review Checklist
- Reviewer must be a native or C1-level speaker of the target language — gate via CODEOWNERS per locale directory
- Check that the translation preserves the tone (formal/informal) — \`du\` vs \`Sie\` in German matters
- Verify that brand names and product terms are NOT translated unless a glossary explicitly allows it
- Check for false friends: English "sensible" does not equal Spanish "sensible" (sensitive)
- For UI strings: verify the translation fits the allocated space by running pseudo-locale build

## Glossary Enforcement
- Maintain a glossary file per locale: \`glossary.{locale}.json\` with \`{ "source_term": "approved_translation" }\`
- CI linter: reject any translation using a non-approved term when the glossary has an entry for that source word
- Glossary includes: product names (never translate), technical terms (agree once), UI microcopy (consistent app-wide)
- Flag glossary violations as PR review comments with suggested replacement

## Differential Review
- Show side-by-side diff in PR: English source | Previous translation | New auto-translation
- Highlight keys where auto-translation differs significantly from previous human translation (>30% Levenshtein distance)
- Require explicit reviewer approval on all keys where previous human translation is being overwritten

## Rollback Safety
- Every auto-translate PR includes a \`REVERT_AUTO_{PR_NUMBER}.json\` patch reverting only auto-translated keys
- Do not squash-merge auto-translate PRs — keep individual commits so specific keys can be cherry-picked out
- Monitor error logs for 48h after deploy; if \`MissingKeyError\` rate spikes, auto-revert the last translation PR

## Never Auto-Translate
- Legal disclaimers, terms of service, privacy policies — must go through legal review
- Error messages referencing specific monetary amounts or time limits — misinterpretation can cause financial harm
- Placeholder-only strings where context is insufficient — mark with \`"_needs_context": true\``
  },
  {
    name: "prediction-market-spec",
    title: "Prediction Market Specification",
    category: "prediction-market",
    description: "Write clear, unambiguous prediction market rules and outcomes",
    version: "1.0.0",
    tags: ["prediction-market", "spec", "rules"],
    appliesTo: ["**/*"],
    content: `# Prediction Market Specification

## Market Question Format
- Every question must resolve to a verifiable binary outcome: YES or NO
- Phrase questions in the present or future tense with a clear time boundary: "Will ETH close above \$3,000 on 2026-12-31 23:59:59 UTC?"
- Include a primary resolution source URL: "Per CoinGecko ETH/USD price at the specified timestamp"
- Avoid subjective terms: "significant," "substantial," "likely" — use quantified thresholds: ">1% increase from baseline"
- No double-barreled questions: "Will X happen AND Y also occur?" — split into separate markets

## Resolution Time
- Specify exact deadline in UTC with timezone offset: \`2026-08-15T17:00:00-04:00\` (or UTC+0)
- Distinguish between "closes at" (no more trading) and "resolves at" (outcome determined)
- Add a resolution buffer: "Market resolves 24 hours after close to allow for data verification"
- If the resolution source has publication delay (gov reports), specify: "Resolves 72h after close per BLS CPI release schedule"

## Void Conditions
- List exhaustive void conditions: "Market voids if: (1) event is cancelled, (2) resolution source is unavailable, (3) rules are ambiguous"
- Void = all bets refunded at cost, no winners or losers determined
- Include force majeure: "Natural disaster, regulatory action, platform downtime preventing settlement"
- "If the resolution source changes its methodology before close, market may void at moderator discretion"

## Edge Cases
- Ties: "If the final price equals exactly \$3,000.00, market resolves NO (threshold is >\$3,000, not >=)"
- Disqualifications: "If the named individual withdraws before the event, market voids"
- Multiple valid sources: "If CoinGecko is unavailable, fall back to CoinMarketCap; if both unavailable, market voids"
- Data corrections: "If the source revises data within 7 days of initial publication, the revised value prevails"

## Prohibited Patterns
- No self-referential markets: "Will the majority vote YES on this market?" — these are manipulable
- No markets on individuals' actions without their consent — privacy concerns
- No markets on illegal activities or regulated securities without legal review
- No open-ended timespans: "Eventually" is not a resolution date`
  },
  {
    name: "market-resolution-rules",
    title: "Market Resolution Rules",
    category: "prediction-market",
    description: "Settlement source selection, close timing, and void condition design",
    version: "1.0.0",
    tags: ["prediction-market", "resolution", "settlement"],
    appliesTo: ["**/*"],
    content: `# Market Resolution Rules

## Primary Source Hierarchy
- Tier 1 Official source: government databases (SEC EDGAR, BLS, census), sports league official sites (NBA.com, FIFA.com)
- Tier 2 Authoritative aggregator: CoinGecko, CoinMarketCap, TradingView, Yahoo Finance for financial data
- Tier 3 Archived snapshot: Internet Archive Wayback Machine URL pinned to a specific date
- Tier 4 Manual adjudication: moderators decide based on pre-agreed evidence rules
- Sources must be publicly accessible, non-paywalled, with documented API or stable selectors

## Source Verification
- Pin the resolution URL at market creation: \`https://api.coingecko.com/api/v3/coins/ethereum/history?date=31-12-2026\`
- Specify the exact JSON path or CSS selector: \`JSONPath: \$.market_data.current_price.usd\`
- Record a hash of source documentation at creation time: \`SHA-256 of resolution_methodology.md\`
- Test the resolution source automatically 24h before close — if inaccessible, alert moderators

## Close Time Specification
- \`closeTimestamp\`: Unix millisecond epoch when trading stops — check \`Date.now() < closeTimestamp\` on every order
- \`resolveTimestamp\`: Unix millisecond epoch when resolution is expected to be available
- \`resolveDeadline\`: maximum timestamp by which resolution MUST occur — after this, escalates to moderator
- Grace period: 5-minute post-close window for final resolution data ingestion, no trading during this window

## Multi-Source Resolution
- When using multiple indices: \`AVG(Coinbase, Binance, Kraken) BTC/USD at close\`
- Define outlier exclusion: "Exclude any source >5% from the median; if only 1 source remains, use it"
- Weighted sources: \`0.5 * SourceA + 0.3 * SourceB + 0.2 * SourceC\` — must sum to 1.0
- If any weighted source fails, redistribute its weight proportionally to remaining sources

## Manual Adjudication Safeguards
- Manual resolution requires 2/3 moderator consensus with documented reasoning per moderator
- Moderators with open positions in the market are recused — enforce via automated position check
- Resolution decision is published with evidence links and has a 48h appeal window
- Appeal triggers a new vote from an expanded panel (5 moderators, all recused from the market)

## Immutability
- Once \`resolve()\` is called and payouts are processed, resolution is immutable — no double-resolve
- Resolution transaction is logged with a unique idempotency key: \`resolve-{marketId}-{timestamp}\`
- Store full resolution evidence (screenshots, API response dumps, JSON payloads) in append-only log`
  },
  {
    name: "market-ambiguity-check",
    title: "Market Ambiguity Checker",
    category: "prediction-market",
    description: "Detect vague wording, subjective criteria, and disputed outcome scenarios",
    version: "1.0.0",
    tags: ["prediction-market", "ambiguity", "validation"],
    appliesTo: ["**/*"],
    content: `# Market Ambiguity Checker

## Automated Ambiguity Detection
- Scan market descriptions for subjective adjectives: "significant," "major," "large," "substantial," "meaningful," "important" — flag every occurrence
- Flag relative terms without baselines: "higher than expected" — expected by whom, based on what model?
- Flag temporal vagueness: "soon," "shortly after," "in the near future," "eventually" — require exact timestamps
- Flag undefined entities: "the company" — which company? Ticker or legal name required
- Flag ambiguous scope: "in the US" — does this include territories (Puerto Rico, Guam)?

## Threshold Ambiguity
- "Price increase" must specify: absolute (+\$5) or percentage (+2%)? Over what baseline?
- "Majority" must specify: >50%, >=2/3, or >66.6%? Of what group (voters, shareholders, members)?
- "Before the end of the year" must specify timezone: \`2026-12-31T23:59:59-05:00 (US Eastern)\`
- "After the announcement" must specify: after start or end of announcement? Link to official press release?

## Disputed Outcome Simulation
- For each market, generate 3 adversarial interpretations that could reasonably dispute the outcome
- Example: "Will BTC reach \$100K?" — Interpretation A: any exchange, B: Coinbase only, C: daily close vs intraday high
- If any interpretation would flip the result (YES->NO or NO->YES), the market spec is ambiguous and must be refined
- Run the adversarial check in CI; block market creation if >1 plausible interpretation exists

## Crowd-Sourced Ambiguity Reports
- Allow market participants to flag ambiguity BEFORE placing bets — "Ask for Clarification" button
- Flagged markets are paused (no new bets) until ambiguity is resolved by moderators
- Publish flag reasons publicly so all participants see the dispute context
- Track ambiguity flag rate per market creator; creators with >10% flag rate are rate-limited

## Case Studies (Anti-Patterns)
- BAD: "Will AI be regulated in 2026?" -> GOOD: "Will the EU AI Act be published in the Official Journal of the EU by 2026-12-31?"
- BAD: "Will SpaceX reach Mars?" -> GOOD: "Will SpaceX Starship successfully perform a propulsive landing on Mars as confirmed by NASA/JPL telemetry?"
- BAD: "Will the economy improve?" -> GOOD: "Will US GDP growth rate (Q4 2026 annualized, per BEA first estimate) exceed 2.0%?"
- BAD: "Will the president resign?" -> GOOD: "Will [Name] no longer hold the office of President of [Country] as listed on [official government URL]?"`
  },
  {
    name: "duel-game-logic",
    title: "Duel Game Logic",
    category: "prediction-market",
    description: "PvP duel state machine, fairness guarantees, and settlement logic",
    version: "1.0.0",
    tags: ["prediction-market", "gaming", "duel", "pvp"],
    appliesTo: ["**/*"],
    content: `# Duel Game Logic

## Duel State Machine
- States: \`CREATED\` -> \`WAITING_FOR_OPPONENT\` -> \`ACTIVE\` -> \`LOCKED\` -> \`RESOLVED\` | \`CANCELLED\` | \`EXPIRED\`
- \`CREATED\`: Player A creates duel with stake S, question Q, and optional time limit T
- \`WAITING_FOR_OPPONENT\`: Player B joins by matching stake — both stakes escrowed, not withdrawable
- \`ACTIVE\`: Both players locked in; event outcome pending; no cancellation allowed
- \`LOCKED\`: Event occurred, outcome known to system but not yet published (anti-frontrunning)
- \`RESOLVED\`: Winner paid, loser forfeits; \`CANCELLED\`: both refunded; \`EXPIRED\`: timeout, both refunded minus fee

## Fairness Constraints
- Both players must agree on the resolution source BEFORE the duel becomes ACTIVE
- Stakes must be equal — no "I bet 10, you bet 5" asymmetric duels
- Platform fee deducted from the TOTAL pot, not individual stakes: \`winnerGets = (stakeA + stakeB) * (1 - feePercent)\`
- Timeout: if opponent doesn't join within T (default 48h), creator can cancel and reclaim full stake
- Disconnection safety: offline players still receive payout automatically when resolution publishes

## Collusion Detection
- Monitor duel networks: if Player A and Player B duel repeatedly with same stake size, flag for review
- Detect "chip dumping": Player A consistently loses to Player B in pattern suggesting intentional loss
- Flag duels where both players resolve in opposite directions on correlated markets (suspicious hedging)
- Rate-limit duels per pair: max 3 simultaneous duels between the same two players

## Settlement Execution
- Settlement is atomic: either both sides execute (winner gets pot, loser gets nothing) or neither does
- Use two-phase commit: \`prepareSettlement()\` -> validate balances -> \`commitSettlement()\`
- Log settlement events immutably: \`{ duelId, winnerId, loserId, amount, fee, timestamp, resolutionSource, evidence }\`
- If settlement fails mid-execution, retry with same idempotency key; never duplicate payout

## Expiry and Abandonment
- If resolution source unavailable past \`resolveDeadline + 7 days\`, duel expires — both get stakes back minus fee
- If one player is banned/suspended, all their active duels are cancelled and opponents receive full refund
- Expired duels emit a public event so dashboards and notifications update correctly

## Testing Requirements
- Unit test every valid and invalid state transition in the state machine
- Test race conditions: simultaneous cancel requests, double-join attempts, settlement during cancellation
- Load test: 10,000 simultaneous duels with random resolution to verify no double-payout or deadlock
- Chaos test: kill settlement worker mid-execution, verify idempotent replay produces correct results`
  },
  {
    name: "provably-fair-rng",
    title: "Provably Fair RNG",
    category: "prediction-market",
    description: "HMAC commitment scheme, server/client seed combination, and verification",
    version: "1.0.0",
    tags: ["prediction-market", "rng", "crypto", "fairness"],
    appliesTo: ["**/*"],
    content: `# Provably Fair RNG

## HMAC-SHA256 Commitment Scheme
- Step 1: Server generates \`serverSeed\` (32 random bytes from \`crypto.randomBytes(32)\`) and computes \`serverSeedHash = SHA256(serverSeed)\`
- Step 2: Server publishes \`serverSeedHash\` to the client BEFORE the client provides their seed — this commits the server
- Step 3: Client provides \`clientSeed\` (any string, e.g., "my-custom-seed-2026") which can be changed per round
- Step 4: Outcome = first 4 bytes of \`HMAC-SHA256(serverSeed, clientSeed)\` interpreted as unsigned 32-bit big-endian integer, then \`outcome % range\`
- Step 5: After the round, server reveals \`serverSeed\` — client verifies: \`SHA256(serverSeed) === serverSeedHash && HMAC-SHA256(serverSeed, clientSeed) == expected\`

## Nonce Handling
- Include a nonce to prevent replay: \`HMAC-SHA256(serverSeed, clientSeed + ":" + nonce)\` where nonce increments per round
- Nonce must be published with each roll so clients can verify the sequence
- Do NOT reset the nonce per session — continuous increment prevents selective reveal attacks
- Store \`{ serverSeed, serverSeedHash, clientSeed, nonce, outcome }\` for every roll in append-only log

## Seed Generation Requirements
- Server seed MUST come from a cryptographically secure source: \`crypto.randomBytes(32)\` or \`crypto.getRandomValues()\`
- Never use \`Math.random()\`, \`Date.now()\`, or any predictable seed — these are trivially exploitable
- Rotate server seed after a fixed number of rolls (e.g., 10,000) or when client changes their seed
- Server seed must never be reused across different clients — each client-connection gets a unique server seed

## Outcome Mapping
- For dice (1-6): \`(HMAC_int % 6) + 1\` — modulo bias negligible for 32-bit values with small range
- For card shuffling: Fisher-Yates with HMAC-derived indices: \`swapIdx = HMAC_int(round=i) % (52 - i)\` for i=0..51
- For roulette (0-36): \`HMAC_int % 37\`
- Always use the first 4 bytes of the HMAC output as a single integer — don't split across multiple outcomes
- For multi-outcome games, derive each outcome from sequential nonces: \`HMAC(seed, clientSeed + ":draw:" + i)\`

## Verification UI
- Provide a "Verify Fairness" page where users input \`serverSeed\` and \`clientSeed\` to recompute outcomes
- Show step-by-step breakdown: seed hash check -> HMAC computation -> outcome derivation
- Allow export of all historical seeds and nonces for external audit
- Provide an open-source verification script users can run offline

## Security Requirements
- Commitment scheme must be reviewed by an external cryptography auditor before production
- Use constant-time comparison for seed hash verification to prevent timing attacks
- Regenerate server seed immediately if \`serverSeedHash\` was transmitted over non-TLS connection
- Monitor for replay attempts: reject any roll where (serverSeedHash, clientSeed, nonce) tuple already exists`
  },
  {
    name: "real-money-safety",
    title: "Real Money Safety",
    category: "prediction-market",
    description: "Wallet, escrow, payout, and idempotency safety for real-money systems",
    version: "1.0.0",
    tags: ["prediction-market", "security", "payments", "money"],
    appliesTo: ["**/*"],
    content: `# Real Money Safety

## Double-Entry Accounting
- Every balance change recorded as a pair of ledger entries: \`{ debitAccount, creditAccount, amount, timestamp, idempotencyKey }\`
- Sum of all account balances + sum of all escrow balances must equal total deposits — reconcile every 5 minutes
- Use integer arithmetic for all monetary amounts: store cents/millisats/wei as integers, never as floats
- Ledger entries are append-only immutable — never UPDATE or DELETE a ledger row
- Perform daily reconciliation with external payment provider ledgers (Stripe, Coinbase, on-chain)

## Idempotency Keys
- Every payout, deposit, withdrawal, and escrow operation requires a unique idempotency key: \`{operationType}-{entityId}-{timestamp}-{random4chars}\`
- Store idempotency keys in database with UNIQUE constraint — reject duplicate keys with HTTP 409
- Generate idempotency keys on client side using \`crypto.randomUUID()\` — never trust server-generated sequences
- If a request times out, retry with the SAME idempotency key — server returns cached response
- Idempotency key cache TTL: 24 hours for payment operations, 7 days for escrow settlement

## Escrow Safety
- When user places a bet, move funds from \`user_balance\` to \`market_escrow\` in a single DB transaction
- Escrow balances segregated per market: \`escrow_balance_{marketId}\` — never commingle markets
- Market resolution MUST debit escrow and credit winners atomically: \`BEGIN; debit escrow; credit winners; COMMIT;\`
- If atomic resolution fails, escrow remains untouched — funds never lost, only locked until manual resolution
- Decide escrow interest policy: (a) accrues to platform, (b) distributed to participants, (c) non-interest-bearing stablecoin

## Withdrawal Safety
- Withdrawals >\$10,000 or >90% of account balance trigger manual review (24h cooldown with admin approval)
- Enforce withdrawal address whitelisting: new addresses have 48h cooling-off before first withdrawal
- Rate-limit withdrawals: max 3 per hour per user, max \$50,000 per day without enhanced verification
- Circuit breaker: if total platform withdrawals exceed 30% of platform balance in 1 hour, pause all withdrawals and alert on-call

## Payout Reconciliation
- After market resolution, verify: \`sum(payouts) + fee == sum(escrow_deductions)\` for each market
- Run daily reconciliation: expected balances from ledger sum must match actual wallet balances within 0.01%
- Discrepancy procedure: if mismatch >0.01%, freeze affected accounts, page on-call engineer, investigate
- All reconciliation reports are hashed and stored for compliance audit trail

## Security Hardening
- Payment API endpoints: strict rate limiting (10 req/sec per IP, 30 req/min per user)
- All monetary operations require 2FA confirmation for amounts >\$1,000
- Database credentials for ledger tables separate from application credentials (least privilege)
- Backup ledger database hourly; store in different cloud region with encryption at rest`
  },
  {
    name: "gaming-ui",
    title: "Casino-Style Gaming UI",
    category: "prediction-market",
    description: "Casino-style UI polish, animations, and responsible design patterns",
    version: "1.0.0",
    tags: ["prediction-market", "ui", "gaming", "design"],
    appliesTo: ["**/*"],
    content: `# Casino-Style Gaming UI

## Visual Polish
- Use CSS \`backdrop-filter: blur(8px)\` for overlay panels to create depth without full opacity
- Animate number changes with \`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)\` — never use \`linear\` for value changes
- Cards and tiles: \`transform: scale(1.02)\` on hover with \`box-shadow\` elevation increase
- Progress/loading uses shimmer skeletons with animated gradient: \`background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)\`
- Winning animations: brief confetti burst (max 2 seconds), pulsing glow on winning amount, never auto-play sound
- Color-coded outcomes: green for profit (\`#22c55e\`), red for loss (\`#ef4444\`), neutral gray for break-even

## Responsible Design Mandates
- Display "Total spent today" and "Net P/L today" prominently in the header — never hide this
- Session timer visible: "You've been playing for 42 minutes" — no opt-out
- Cool-off button in main nav: "Take a Break" pauses all betting for 30 min (configurable: 1h, 24h, 7d)
- Deposit limits: users must set daily/weekly/monthly deposit limit before first deposit — no bypass
- Reality check popup every 60 minutes showing session P/L with "Continue" or "Stop" choice
- Never use "risk-free," "guaranteed," or "sure win" language anywhere in the UI

## Accessibility Requirements
- All animations respect \`@media (prefers-reduced-motion: reduce)\` — disable animations entirely
- Color is never the sole indicator of state — always pair with an icon or text label
- Minimum contrast ratio 4.5:1 for all text; 3:1 for large text (18px+)
- Keyboard navigation: all game controls reachable via Tab, actionable via Enter/Space
- Screen reader announcements for state changes: \`aria-live="polite"\` on wallet balance, bet result

## Performance Constraints
- UI must render at 60fps during animations — profile with React Profiler or Chrome Performance tab
- Lazy-load game components not in the initial viewport
- Use \`will-change: transform\` sparingly and only on elements that animate (remove after animation ends)
- Debounce rapid bet submissions: minimum 300ms between consecutive bets from same user
- Optimistic UI: show bet confirmation immediately, reconcile with server response — rollback on failure

## Dark Patterns to Avoid
- No "pressure to act" timers: "Only 2 minutes left!" — unless it is a genuine market close countdown
- No hidden fees revealed only at checkout — show total cost breakdown before confirmation
- No preselected higher-stake options — default to the minimum bet size
- No making withdrawal intentionally harder than deposit — deposit and withdraw must have equal UX friction`
  },
  {
    name: "odds-pricing",
    title: "Binary Market Odds Pricing",
    category: "prediction-market",
    description: "Binary market pricing, overround, liquidity constraints, and arbitrage detection",
    version: "1.0.0",
    tags: ["prediction-market", "odds", "pricing", "finance"],
    appliesTo: ["**/*"],
    content: `# Binary Market Odds Pricing

## Binary Market Mechanics
- A binary market has exactly two outcomes: YES and NO. \`price(YES) + price(NO) = 1.0\` on a well-functioning market
- Prices expressed as decimals 0.00-1.00, representing the implied probability
- At resolution: YES pays 1.00 per share if correct, 0.00 if incorrect; NO the inverse
- Payout for YES position: \`shares * (1.0 - purchasePrice)\` if YES wins, \`-shares * purchasePrice\` if NO wins
- Never allow buying at price 0.00 or 1.00 — the outcome is known and markets should be resolved

## Overround and Spread
- Overround = \`price(YES) + price(NO) - 1.0\`. A fair market has overround = 0
- Typical overround: 0.02-0.05 (2%-5%). Overround >0.10 signals illiquid or manipulated market
- Spread = \`bestAsk - bestBid\`. Tight spread (<0.02) indicates high liquidity
- Platform earns fees from the spread: buy at P, sell at P - spread — this is the "vig" or "juice"
- Display current overround in market UI so traders can assess fairness

## Liquidity Constraints
- Each market has maximum exposure cap: \`maxExposure = marketLiquidityPool * 0.25\` — no single market >25% of pool
- Per-user position limit: \`min(userBalance * 0.1, marketMaxExposure * 0.2)\` — diversification enforced
- Orders that would move price >5% rejected with \`PRICE_IMPACT_TOO_HIGH\`
- AMM curve: constant product \`x * y = k\` where x = YES shares, y = NO shares, k = constant
- Slippage tolerance: users specify max slippage (default 0.5%); if exceeded, order cancelled

## Arbitrage Detection
- Cross-market arbitrage: \`price(YES on market A) + price(NO on market B) < 1.0\` -> risk-free profit possible
- Multi-leg arbitrage: monitor all market triples where A->B, B->C, C->A for cyclical pricing gaps
- Run arbitrage scan every 30 seconds; if detected, pause most illiquid market in cycle, alert moderators
- Historical arbitrage window: look back 24h for profitable opportunities — flag if any existed >5 minutes
- Report arbitrage findings to market makers so they can adjust pricing

## Price Manipulation Safeguards
- Wash trading detection: same user buying and selling same position within 60 seconds
- Spoofing: large orders placed and cancelled within 5 seconds — rate-limit users with >50% cancellation rate
- Pump and dump: 20%+ price movement in <2 minutes followed by reversal — auto-pause trading 10 min
- Coordinated buying: >5 accounts opening similar-sized positions in same market within 30 seconds — investigate

## Display Conventions
- Show both decimal and fractional odds: \`0.65 (approx 13/20)\` for accessibility to different user backgrounds
- Display implied probability as percentage: \`65% YES / 35% NO\`
- Show 24h volume, total liquidity locked, and price change since last close
- Chart price history with candlestick or line chart; include volume bars at the bottom`
  },
  {
    name: "settlement-audit",
    title: "Settlement Audit",
    category: "prediction-market",
    description: "Verify outcome accuracy and payout flow correctness",
    version: "1.0.0",
    tags: ["prediction-market", "audit", "settlement", "verification"],
    appliesTo: ["**/*"],
    content: `# Settlement Audit

## Pre-Settlement Verification
- Before calling \`resolve()\`, run automated checklist: (1) source accessible, (2) data matches expected format, (3) no void conditions triggered
- Snapshot resolution data: store raw API response, HTML page, or screenshot as JSON blob with SHA-256 hash
- Compute expected outcome programmatically: \`generateOutcome(market.rules, snapshot) -> YES | NO | VOID\`
- Compare programmatic outcome with human-moderated outcome — flag if they diverge
- Pre-settlement audit must pass before \`resolve()\` transaction is broadcast to chain/ledger

## Payout Calculation Verification
- For each resolved market, compute: \`totalPayout = sum(position.shares * payoutPerShare) for all winning positions\`
- Verify: \`totalPayout <= totalEscrow\` — payouts must never exceed escrowed amount
- Verify: \`totalEscrow - totalPayout == totalFees\` within tolerance (\`|diff| < 0.0001\`)
- Check for orphaned positions: positions with \`resolved = false\` after market resolution -> escalate
- Generate payout report: \`{ marketId, resolvedOutcome, totalPayout, totalFees, positionCount, winningCount, losingCount }\`

## Edge Case Validation
- Zero-share positions: positions with \`shares = 0\` due to full sale before resolution — must not receive payout
- Fractional shares from partial fills: verify \`sum(payouts for partials) == totalShares * payoutPerShare\`
- Cancelled orders partially filled before cancellation — only the filled portion counts
- Accounts with zero balance after payout: verify they are not charged a negative balance (no debt creation)

## Audit Trail Requirements
- Every settlement event logged immutably: \`{ auditId, marketId, resolvedBy, resolvedAt, outcome, snapshotHash, payoutSummaryHash }\`
- Store settlement snapshots in append-only storage (S3 with versioning, or blockchain event log)
- Each audit record includes a hash of the previous record — tamper-evident chain
- Annual external audit by independent firm: provide full audit trail export with verification script

## Automated Reconciliation
- Daily cron: for every market resolved in the past 24h, recompute payouts from raw position data
- Compare recomputed payouts against actual ledger entries — flag discrepancies >0.001%
- If discrepancy found: freeze all accounts involved, page on-call, begin manual investigation
- Reconciliation results stored in \`reconciliation_reports\` table with running SHA-256 chain

## Dispute Resolution
- Users have 7 days after settlement to file a dispute with evidence
- Dispute review: 3 moderators (recused from market) review evidence within 48h
- If dispute upheld, execute \`reverseSettlement()\` — must refund winners AND restore escrow atomically
- Track dispute rate per market creator; if >2% dispute rate, require enhanced spec review before new markets`
  },
  {
    name: "financial-copy-compliance",
    title: "Financial Copy Compliance",
    category: "prediction-market",
    description: "Avoid misleading financial claims and ensure regulatory language",
    version: "1.0.0",
    tags: ["prediction-market", "compliance", "legal", "copy"],
    appliesTo: ["**/*"],
    content: `# Financial Copy Compliance

## Required Disclaimers
- Every page with financial products must display: "Trading involves risk. You may lose your entire stake. Past performance does not guarantee future results."
- Market descriptions must include: "This is not financial advice. Do your own research before trading."
- Footer must contain: "Prediction markets are speculative instruments. Consult a qualified financial advisor before making trading decisions."
- Registration/onboarding must include risk acknowledgment checkbox that the user MUST explicitly accept

## Prohibited Language
- NEVER claim guaranteed returns: "earn passive income," "make money," "profit guaranteed"
- NEVER use income claims: "earn \$500/week," "make a living trading"
- NEVER imply risk-free: "risk-free trading," "safe investment," "protect your capital"
- NEVER use urgency pressure: "don't miss out," "limited time offer," "act now before it's too late"
- NEVER compare to savings accounts without disclaimer: "better than a savings account" requires SEC compliant comparison

## Risk Warnings Format
- Risk warnings must be displayed in a font size at least 90% of the body text size — never in fine print
- Warning contrast must meet WCAG AA (4.5:1 ratio) — not grayed out or low opacity
- Repeated at key decision points: before deposit, before first trade, before withdrawal of winnings
- Include specific risk types: liquidity risk (may not be able to exit position), market risk (outcome uncertain), platform risk (technical failure possible)

## Regulatory Language by Jurisdiction
- US: "Prediction markets are regulated by the CFTC. Trading binary options on unregistered platforms may be prohibited in your jurisdiction."
- UK: "This product is not regulated by the FCA. You will not have access to the Financial Ombudsman Service or FSCS protection."
- EU: "This platform is not a regulated trading venue under MiFID II. Negative balance protection does not apply."
- General: "Check your local regulations before trading. Access may be restricted in certain jurisdictions including [list]. Use of VPN to circumvent geo-restrictions is prohibited."

## Performance Disclosure
- When displaying historical returns: "Past performance is not indicative of future results. Returns are unaudited."
- When displaying leaderboards: "Top trader returns are not typical. Most traders lose money."
- When displaying win rates: "Win rate does not account for stake size. A 70% win rate with losses larger than wins results in net loss."
- Never cherry-pick timeframes to show positive returns — always show all-time, 1-year, 6-month, and 1-month returns

## Copy Review Process
- All marketing and UI copy must be reviewed by a compliance officer before publication
- Maintain a version-controlled copy register with approval dates
- Any claims about odds, returns, or probabilities must cite the specific calculation methodology
- User-generated content (comments, forum posts) must be moderated to remove prohibited financial claims
- Automated scanning of all platform text for prohibited terms — run on every deploy with CI enforcement`
  }
];
