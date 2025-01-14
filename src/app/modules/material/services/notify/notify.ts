import {
    Injectable,
    OnDestroy,
} from '@angular/core';

import { environment } from '../../../../../environments/environment';

const isDevMode = () => {
    return !environment.production
}

import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';

import {LocaleService, LocaleSubject} from '../../../web';


import {NotifyComponent} from './notify-component'

const duration = isDevMode() ? 100000 : 3000;

export interface NotifyOptions {
    icon: string,
}

import { Subscription } from 'rxjs'

@Injectable()
export class NotifyService implements OnDestroy {

    i18n: any;
    subscriptions$: Array<Subscription> = []

    constructor(
        private snackBar: MatSnackBar,
        private locale: LocaleService,
    ) {


        this.subscriptions$.push(
            this.locale.subscribe((subject: LocaleSubject) => {
                this.i18n = subject.locale.data.material;
            })
        )
    }

    info(message: string, coryOptions?: NotifyOptions | string, config?: MatSnackBarConfig) {
        if (config === undefined) {
            config = <MatSnackBarConfig>{
                duration: duration,
                panelClass: ['custom-snackbar'] // Add custom class here
            }
        } else {
            // Ensure panelClass is added even if config is provided
            config.panelClass = config.panelClass || [];
            if (Array.isArray(config.panelClass)) {
                config.panelClass.push('custom-snackbar');
            } else {
                config.panelClass += ' custom-snackbar'
            }
        }
    
        if (typeof (coryOptions) === 'string') {
            coryOptions = <NotifyOptions>{
                icon: coryOptions
            }
        }
        if (coryOptions === undefined) {
            coryOptions = <NotifyOptions>{
                icon: 'info'
            }
        }
        config.data = config.data || {};
        config.data.message = message;
        config.data.options = coryOptions;
        this.snackBar.openFromComponent(NotifyComponent, config);
    }

    error(error: Error) {

        this.info(`${error.message}`, <NotifyOptions>{
            icon: 'error'
        });
        console.error(error);
    }

    ngOnDestroy(): void {
        this.subscriptions$.forEach(subs$ => subs$.unsubscribe())
    }

}
