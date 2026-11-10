import { stripVTControlCharacters } from 'node:util';
import { createLogger } from 'vite';

// Categories help diagnose failures; they never exempt a warning from the gate.
export function classifyBuildWarning(message) {
  const text = stripVTControlCharacters(message);
  if (/sourcemap|source map|asset|publicdir|public directory|referenced in .*resolve|doesn't exist at build time/i.test(text)) return 'asset';
  if (/\bcss\b|postcss|css[- ](?:syntax|minify)/i.test(text)) return 'css';
  if (/deprecat|configuration|config\b/i.test(text)) return 'configuration';
  if (/module.level.directive|node_modules|dependency|externalized/i.test(text)) return 'dependency';
  if (/chunk|circular|\beval\b/i.test(text)) return 'bundle';
  return 'unknown';
}

export function buildWarningError(message) {
  return new Error(`Build warning [${classifyBuildWarning(message)}]: ${stripVTControlCharacters(message)}`);
}

// Independent generated scripts cannot import this repo's Vite config. Match
// diagnostic lines only, so an earlier CSS asset listing cannot misclassify a
// later chunk-size warning. This fallback deliberately fails unknown warnings.
export function assertBuildOutput(output) {
  const diagnostics = stripVTControlCharacters(output).split(/\r?\n/).filter(line =>
    /\bwarn(?:ing)?\b|\(!\)|chunks are larger|didn't resolve at build time/i.test(line));
  if (diagnostics.length) throw buildWarningError(diagnostics.join('\n'));
}

export function createBuildWarningLogger(logger = createLogger()) {
  const reject = message => { throw buildWarningError(message); };
  return { ...logger, warn: reject, warnOnce: reject };
}

// Development servers keep normal Vite diagnostics. Production builds fail even
// when a plugin emits a diagnostic containing no literal "warn" string.
export function buildWarningConfig({ command }) {
  return command === 'build' ? { customLogger: createBuildWarningLogger() } : {};
}
