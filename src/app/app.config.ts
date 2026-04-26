import {
    ApplicationConfig,
    provideZoneChangeDetection,
    provideAppInitializer,
    inject,
    isDevMode,
} from '@angular/core';
import { withPreloading, provideRouter, PreloadAllModules } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
    Title,
    Meta,
    provideClientHydration,
    withEventReplay,
    withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { CdnService, MarkdownService } from './service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { appRoutes } from './app.routes';

import { RouterService } from './modules/web/services/router';
import { CookieService } from './modules/web/services/cookie';
import { SettingsService } from './modules/web/services/settings';
import { LocaleService } from './modules/web/services/locale';
import { MediaQueryService } from './modules/web/services/media-query';
import { Boot as WebBoot } from './modules/web/boot';

import { ThemeService } from './modules/material/services/theme';
import { NotifyService } from './modules/material/services/notify/notify';
import { Boot as MaterialBoot } from './modules/material/boot';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection(),
        Title,
        Meta,
        // Web services (previously from CorifeusModule)
        RouterService,
        CookieService,
        SettingsService,
        LocaleService,
        MediaQueryService,
        WebBoot,
        // Material services (previously from CorifeusMaterialModule)
        ThemeService,
        NotifyService,
        MaterialBoot,
        { provide: 'Window', useFactory: () => typeof window !== 'undefined' ? window : {} as Window },
        // App-level services
        CdnService,
        MarkdownService,
        // Angular platform providers
        provideAnimationsAsync(),
        provideHttpClient(withFetch()),
        provideRouter(appRoutes, withPreloading(PreloadAllModules)),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
        provideClientHydration(
            withEventReplay(),
            withHttpTransferCacheOptions({
                includePostRequests: false,
                filter: (req) =>
                    req.url.startsWith('https://cdn.corifeus.com') ||
                    req.url.startsWith('https://network.corifeus.com'),
            }),
        ),
        /* Boot side-effects run before the root component renders.
           Order matters: web registers 'core' settings + boots locale,
           material registers 'material' settings + translations + theme. */
        provideAppInitializer(() => {
            inject(WebBoot).boot();
        }),
        provideAppInitializer(() => {
            inject(MaterialBoot); // constructor performs the work
        }),
    ],
};
