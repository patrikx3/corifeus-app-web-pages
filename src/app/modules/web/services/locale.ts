import { Injectable, signal, computed, Signal } from '@angular/core';

import { CookieService } from '../services/cookie';
import { SettingsService } from '../services/settings';

import { log as logDefault } from '../util/log';

const log = logDefault.factory('locale');

let currentLanguage = 'en';

const totalTranslations: Record<string, Record<string, any>> = {};

export interface LocaleSubject {
    action: string;
    locale: LocaleService;
}

@Injectable()
export class LocaleService {

    private readonly _state = signal<LocaleSubject>({
        action: 'empty',
        locale: this,
    });

    /** Signal-native state. Read inside an `effect()` to react. */
    public readonly state: Signal<LocaleSubject> = this._state.asReadonly();

    /** Current translation bundle as a signal — re-emits on locale change. */
    public readonly dataSignal: Signal<Record<string, any> | undefined> = computed(() => {
        this._state(); // track
        return totalTranslations[currentLanguage];
    });

    constructor(
        private settings: SettingsService,
        private cookie: CookieService,
    ) {}

    public async boot() {
        this.setTranslation(currentLanguage);
    }

    public register(module: string, translations: any) {
        log(`[ ${module.toUpperCase()} ]`);
        Object.keys(translations).forEach((lang: string) => {
            totalTranslations[lang] = totalTranslations[lang] || {};
            totalTranslations[lang][module] = translations[lang];
        });
        this._state.set({ action: 'set-translation', locale: this });
    }

    public setTranslation(setTranslation: string) {
        log(`setTranslation '${setTranslation}'`);
        if (this.settings.data.core.translations.language.hasOwnProperty(setTranslation)) {
            currentLanguage = setTranslation;
            this.cookie.set(this.settings.data.core.cookie.language, currentLanguage);
            this._state.set({ action: 'set-translation', locale: this });
            return true;
        }
        throw new Error(`setTranslation '${setTranslation}' failed`);
    }

    public get current() {
        return currentLanguage;
    }

    public get data() {
        return totalTranslations[currentLanguage];
    }
}
