import {Injectable} from '@angular/core';

export type UILanguage = 'de' | 'en';

@Injectable()
export class LanguageService {

    private _currentLanguage: UILanguage = 'en';
    private onLanguageChangeCallback: (language: UILanguage) => void;

    set currentLanguage(value: UILanguage) {
        if (['en', 'de'].indexOf(value) === -1) {
            throw new Error(`Language code "${value}" not recognized. Valid values are "en", "de".`);
        }
        this._currentLanguage = value;
        if (typeof this.onLanguageChangeCallback === 'function') {
            this.onLanguageChangeCallback(value);
        }
    }
    get currentLanguage(): UILanguage {
        return this._currentLanguage;
    }

    onLanguageChange(callback: (language: UILanguage) => void): void {
        this.onLanguageChangeCallback = callback;
    }
}
