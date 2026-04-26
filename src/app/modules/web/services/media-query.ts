import {
    Injectable,
    NgZone,
    OnDestroy,
    signal,
    Signal,
} from '@angular/core';

import { log as defaultLog } from '../util/log';

const log = defaultLog.factory('media query');

export enum MediaQuerySettingType {
    Width,
}

let mediaQuerySettingId = 0;

export interface MediaQuerySetting {
    name: string;
    min: number;
    max: number;
    type: MediaQuerySettingType;
    _id: number;
}

@Injectable()
export class MediaQueryService implements OnDestroy {

    settings: MediaQuerySetting[] = [];

    lastResult: MediaQuerySetting[] = [];

    width: number;
    height: number;

    private readonly _state = signal<MediaQuerySetting[]>([]);
    /** Signal-native state. Read inside an `effect()` to react. */
    public readonly state: Signal<MediaQuerySetting[]> = this._state.asReadonly();

    onResize: EventListener;

    debounce: any;

    constructor(
        private ngZone: NgZone,
    ) {
        this.register([
            <MediaQuerySetting>{
                name: 'small',
                min: 0,
                max: 599,
                type: MediaQuerySettingType.Width,
            },
            <MediaQuerySetting>{
                name: 'large',
                min: 600,
                max: Infinity,
                type: MediaQuerySettingType.Width,
            },
        ]);

        const debounceTime = 500;
        this.onResize = () => {
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => {
                this.ngZone.run(() => {
                    if (typeof window !== 'undefined') {
                        this.width = window.innerWidth;
                        this.height = window.innerHeight;
                    }
                    this.findMediaQuery();
                });
            }, debounceTime);
        };

        if (typeof window !== 'undefined') {
            this.debounce = setTimeout(() => {
                this.onResize(null);
            }, debounceTime);

            window.addEventListener('resize', this.onResize);
        }
    }

    public register(settings: MediaQuerySetting[]) {
        const unregisterIds: Array<number> = [];
        for (let setting of settings) {
            let found = false;
            for (let useSetting of this.settings) {
                if (useSetting.name === setting.name && useSetting.type === setting.type) {
                    found = true;
                    console.warn(`corifeus-web media-query service has duplicate settings`);
                    break;
                }
            }
            if (found === false) {
                mediaQuerySettingId++;
                unregisterIds.push(mediaQuerySettingId);
                setting._id = mediaQuerySettingId;
                this.settings.push(setting);
            }
        }
        this.findMediaQuery();

        const self = this;
        return ((unregisterIds: Array<number>) => {
            return function () {
                const newSettings: MediaQuerySetting[] = [];
                for (let setting of self.settings) {
                    let keep = true;
                    for (let unregisterId of unregisterIds) {
                        if (setting._id === unregisterId) {
                            keep = false;
                            break;
                        }
                    }
                    if (keep) newSettings.push(setting);
                }
                self.settings = newSettings;
            };
        })(unregisterIds);
    }

    private findMediaQuery() {
        const results: MediaQuerySetting[] = [];
        this.settings.forEach((setting) => {
            switch (setting.type) {
                case MediaQuerySettingType.Width: {
                    const minFound = this.width >= setting.min;
                    const maxFound = this.width <= setting.max;
                    if (minFound && maxFound) results.push(setting);
                    break;
                }
            }
        });

        if (JSON.stringify(results) !== JSON.stringify(this.lastResult)) {
            this.lastResult = results;
            this._state.set(results);
        }
    }

    ngOnDestroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.onResize);
        }
        clearTimeout(this.debounce);
    }
}
