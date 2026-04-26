import {
    Injectable,
    effect,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
    Router as AngularRouter,
    NavigationExtras,
    NavigationEnd,
} from '@angular/router';

const IsBot = require('../util/is-bot.js');

let debounceGoogleAnalyticsTimeout: any;

import { SettingsService } from './settings';

@Injectable()
export class RouterService {

    analytics = false;

    constructor(
        private router: AngularRouter,
        private settings: SettingsService,
    ) {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
        if (navigator.userAgent.toLowerCase().includes('corifeus') || IsBot()) return;

        const eventsSig = toSignal(this.router.events);

        /* Fires on every router event, but only does work once GA is ready
           and we see a NavigationEnd. Registered in injection context so it
           cleans up with the service. */
        effect(() => {
            const event = eventsSig();
            if (!this.analytics) return;
            if (!(event instanceof NavigationEnd)) return;

            clearTimeout(debounceGoogleAnalyticsTimeout);
            debounceGoogleAnalyticsTimeout = setTimeout(() => {
                window['gtag']('config', settings.data.core.integration.google.analytics, {
                    'page_path': event.urlAfterRedirects,
                });
            }, 333);
        });

        setTimeout(() => {
            if (
                settings.data.core.hasOwnProperty('integration') &&
                settings.data.core.integration.hasOwnProperty('google') &&
                settings.data.core.integration.google.hasOwnProperty('analytics') &&
                settings.data.core.integration.google.analytics !== ''
            ) {
                const loadSettings = setInterval(() => {
                    if (window['gtag'] !== undefined) {
                        clearInterval(loadSettings);
                        window['gtag']('config', settings.data.core.integration.google.analytics, {
                            'page_path': location.pathname,
                        });
                        this.analytics = true;
                    } else {
                        console.info('corifeus-web is waiting for gtag to be available');
                    }
                }, 333);
            }
        });
    }

    scrollToTop() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        window.scrollTo(0, 0);
        const elements = document.querySelectorAll('[cdk-scrollable]');
        for (let i = 0; i < elements.length; ++i) {
            (elements[i] as any).scrollTop = 0;
        }
        const sideNavDivs = document.getElementsByTagName('mat-sidenav-content');
        for (let i = 0; i < sideNavDivs.length; i++) {
            sideNavDivs[i].scrollTop = 0;
        }
    }

    navigateTop(commands: any[], extras?: NavigationExtras): Promise<boolean> {
        this.scrollToTop();
        return this.navigate(commands, extras);
    }

    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
        return this.router.navigate(commands, extras);
    }

    get events() {
        return this.router.events;
    }
}
