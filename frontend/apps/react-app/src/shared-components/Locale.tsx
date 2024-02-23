import { useState, useEffect, ReactNode } from 'react';
import { navigatorDetector } from 'typesafe-i18n/detectors';
import { loadLocaleAsync } from '../i18n/i18n-util.async';
import { detectLocale } from '../i18n/i18n-util';
import TypesafeI18n from '../i18n/i18n-react';

export const Locale = ({ children }: { children: ReactNode }) => {
    const [localesLoaded, setLocalesLoaded] = useState(false);

    const locale = detectLocale(navigatorDetector);

    useEffect(() => {
        loadLocaleAsync(locale).then(() => setLocalesLoaded(true));
    }, [locale]);

    if (!localesLoaded) {
        return null;
    }

    return <TypesafeI18n locale={locale}>{children}</TypesafeI18n>;
};
