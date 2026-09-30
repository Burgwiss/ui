import type { VideoPlayerLabels } from './VideoPlayer';
import type { Localized } from '../../../.storybook/locale';

/** German example labels for stories, tests and page prototypes. Not exported from the package. */
export const VIDEO_LABELS: VideoPlayerLabels = {
    back30: '−30 Sek.',
    back15: '−15 Sek.',
    forward15: '+15 Sek.',
    forward30: '+30 Sek.',
    speed: 'Geschwindigkeit',
    speedValue: (rate) => `${rate}× Geschwindigkeit`,
    errorTitle: 'Dieses Video konnte nicht geladen werden',
    errorBody: 'Der Link ist möglicherweise abgelaufen. Versuche es erneut, um ihn neu zu laden.',
    retry: 'Erneut versuchen',
};

/** The same labels in every Storybook language (Language toolbar). */
export const VIDEO_LABELS_BY_LOCALE: Localized<VideoPlayerLabels> = {
    de: VIDEO_LABELS,
    en: {
        back30: '−30 s',
        back15: '−15 s',
        forward15: '+15 s',
        forward30: '+30 s',
        speed: 'Speed',
        speedValue: (rate) => `${rate}× speed`,
        errorTitle: 'This video could not be loaded',
        errorBody: 'The link may have expired. Try again to reload it.',
        retry: 'Try again',
    },
    ar: {
        back30: '−30 ث',
        back15: '−15 ث',
        forward15: '+15 ث',
        forward30: '+30 ث',
        speed: 'السرعة',
        speedValue: (rate) => `السرعة ${rate}×`,
        errorTitle: 'تعذّر تحميل هذا الفيديو',
        errorBody: 'ربما انتهت صلاحية الرابط. حاول مرة أخرى لإعادة تحميله.',
        retry: 'حاول مرة أخرى',
    },
    tr: {
        back30: '−30 sn',
        back15: '−15 sn',
        forward15: '+15 sn',
        forward30: '+30 sn',
        speed: 'Hız',
        speedValue: (rate) => `${rate}× hız`,
        errorTitle: 'Bu video yüklenemedi',
        errorBody: 'Bağlantının süresi dolmuş olabilir. Yeniden yüklemek için tekrar dene.',
        retry: 'Tekrar dene',
    },
};
