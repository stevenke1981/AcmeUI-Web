import type { ConfigEnv, Logger } from 'vite';
export function classifyBuildWarning(message: string): 'css' | 'asset' | 'configuration' | 'dependency' | 'bundle' | 'unknown';
export function buildWarningError(message: string): Error;
export function assertBuildOutput(output: string): void;
export function createBuildWarningLogger(logger?: Logger): Logger;
export function buildWarningConfig(env: Pick<ConfigEnv, 'command'>): { customLogger?: Logger };
