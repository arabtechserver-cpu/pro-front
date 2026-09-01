import type { Locale } from './config';
import ar from './dictionaries/ar.json';
import en from './dictionaries/en.json';

const dictionaries: Record<string, any> = {
  en,
  ar,
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale] || dictionaries.ar;
};

