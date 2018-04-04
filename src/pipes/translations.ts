import {UILanguage} from '../providers/language.service';

export type TranslationTable = {
    [token: string]: {
        [K in UILanguage]: string;
    }
}

export const translationTable: TranslationTable = {
    'aspect_ratio': {
        de: 'Seitenverhältnis',
        en: 'Aspect ratio'
    },
    'aspect_ratio_original': {
        de: 'Original',
        en: 'Original'
    },
    'aspect_ratio_free': {
        de: 'Frei',
        en: 'Free'
    },
    'aspect_ratio_square': {
        de: 'Quadratisch',
        en: 'Square'
    },
    'cancel': {
        de: 'Abbrechen',
        en: 'Cancel'
    },
    'crop': {
        de: 'Zuschneiden',
        en: 'Crop'
    },
    'focal_point': {
        de: 'Fokuspunkt',
        en: 'focal point'
    },
    'ratio_locked': {
        de: 'Seitenverhältnis gesperrt',
        en: 'Aspect ratio is locked'
    },
    'ratio_unlocked': {
        de: 'Seitenverhältnis nicht gesperrt',
        en: 'Aspect ratio is unlocked'
    },
    'resize': {
        de: 'Anpassen',
        en: 'Resize'
    },
    'reset': {
        de: 'Rücksetzen',
        en: 'Reset'
    },
    'set_focal_point': {
        de: 'Fokuspunkt setzen',
        en: 'Set focal point'
    }
};
