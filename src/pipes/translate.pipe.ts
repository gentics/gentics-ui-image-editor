import {Pipe, PipeTransform} from '@angular/core';
import {LanguageService, UILanguage} from "../providers/language.service";

@Pipe({
    name: 'translate',
    pure: false
})
export class TranslatePipe implements PipeTransform {

    constructor(private languageService: LanguageService) {}

    transform(value: any, ...args: any[]): any {
        const translations = translationTable[value];
        const currentLanguage = this.languageService.currentLanguage;
        if (translations) {
            const translation = translations[currentLanguage];
            if (translation) {
                return translation;
            }
        }
        throw new Error(`No translation for for token "${value}" in ${currentLanguage}`);
    }
}

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
