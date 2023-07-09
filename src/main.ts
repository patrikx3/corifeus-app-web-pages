import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { Application } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { withPreloading, provideRouter, PreloadAllModules } from '@angular/router';
import { CorifeusMaterialModule } from './app/modules/material/index';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { CdnService, MarkdownService } from './app/service';
import { HttpRequestCounterInterceptor } from './app/http-request-counter.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { GlobalService } from './app/service/global.service';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(Application, {
    providers: [
        importProvidersFrom(BrowserModule, CorifeusMaterialModule),
        GlobalService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpRequestCounterInterceptor,
            multi: true
        },
        CdnService,
        MarkdownService,
        provideAnimations(),
        provideRouter(appRoutes, withPreloading(PreloadAllModules))
    ]
})
  .catch(err => console.error(err));
