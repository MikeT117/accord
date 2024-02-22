import type { FormattersInitializer } from 'typesafe-i18n';
import type { Locales, Formatters } from './i18n-types';

export const initFormatters: FormattersInitializer<Locales, Formatters> = (_: Locales) => {
    const formatters: Formatters = {};
    return formatters;
};
