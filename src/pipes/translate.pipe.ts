import {Pipe, PipeTransform} from '@angular/core';

import {LanguageService} from '../providers/language.service';
import {translationTable} from './translations';

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
        return value;
    }
}
