// src/utils/categories.ts
import type { TFunction } from 'i18next';

/** Category names are stored in English; known ones are translated, custom ones pass through unchanged. */
export const categoryLabel = (t: TFunction, name: string): string => t(`categories.${name}`, { defaultValue: name });
