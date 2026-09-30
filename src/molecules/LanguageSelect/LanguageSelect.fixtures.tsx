import type { LanguageSelectOption, LanguageSelectProps } from './LanguageSelect';

/** Example content for stories and tests; the component itself carries no copy. */

export const GermanyFlag = (
    <svg viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="5" height="3" fill="#ffce00" />
        <rect width="5" height="2" fill="#dd0000" />
        <rect width="5" height="1" fill="#000" />
    </svg>
);

export const UnitedKingdomFlag = (
    <svg
        viewBox="0 0 60 30"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
    >
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0 60 30M60 0 0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0 60 30M60 0 0 30" stroke="#c8102e" strokeWidth="2" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
);

export const TurkeyFlag = (
    <svg
        viewBox="0 0 30 20"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
    >
        <rect width="30" height="20" fill="#e30a17" />
        <circle cx="11" cy="10" r="5" fill="#fff" />
        <circle cx="12.5" cy="10" r="4" fill="#e30a17" />
        <polygon
            points="19.10,10.00 17.35,10.62 17.30,12.47 16.18,11.00 14.40,11.53 15.45,10.00 14.40,8.47 16.18,9.00 17.30,7.53 17.35,9.38"
            fill="#fff"
        />
    </svg>
);

/** Deutsch 5/7, Englisch 1/7, Türkisch 0/7, Arabisch 7/7 (no flag → the code box). */
export const languageOptions: LanguageSelectOption[] = [
    { code: 'de', label: 'Deutsch', flag: GermanyFlag, done: 5, total: 7 },
    { code: 'en', label: 'Englisch', flag: UnitedKingdomFlag, done: 1, total: 7 },
    { code: 'tr', label: 'Türkisch', flag: TurkeyFlag, done: 0, total: 7 },
    { code: 'ar', label: 'Arabisch', done: 7, total: 7 },
];

export const languageLabels: LanguageSelectProps['labels'] = {
    label: 'Sprache der Seite',
    progress: (done, total) => `${done} von ${total} ausgefüllt`,
};
