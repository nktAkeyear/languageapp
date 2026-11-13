import type { Lang, LanguageContent } from '../core/types';
import en from './en';
import zh from './zh';
export { SHARED } from './shared';

export const CONTENT: Record<Lang, LanguageContent> = { en, zh };
