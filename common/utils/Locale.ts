import en from '../locales/en/global.json';
import ru from '../locales/ru/global.json';

export type Locale = typeof en | typeof ru;

export type LocaleString = keyof Locale;