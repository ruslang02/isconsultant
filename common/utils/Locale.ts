//import en from '../locales/en/global.json';
//import ru from '../locales/ru/global.json';

type ValueOf<T> = T[keyof T];

export type Locale = Record<string, string>;

export type LocalizedStringID = keyof Locale;

export type LocalizedString = ValueOf<Locale>;