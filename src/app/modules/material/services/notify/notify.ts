import {
    Injectable,
    effect,
} from '@angular/core';

import { environment } from '../../../../../environments/environment';

const isDevMode = () => !environment.production;

import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { LocaleService } from '../../../web';

import { NotifyComponent } from './notify-component';

const duration = isDevMode() ? 100000 : 3000;

export interface NotifyOptions {
    icon: string;
}

@Injectable()
export class NotifyService {

    i18n: any;

    constructor(
        private snackBar: MatSnackBar,
        private locale: LocaleService,
    ) {
        effect(() => {
            this.locale.state();
            this.i18n = this.locale.data?.material;
        });
    }

    info(message: string, coryOptions?: NotifyOptions | string, config?: MatSnackBarConfig) {
        if (config === undefined) {
            config = <MatSnackBarConfig>{
                duration: duration,
                panelClass: ['custom-snackbar'],
            };
        } else {
            config.panelClass = config.panelClass || [];
            if (Array.isArray(config.panelClass)) {
                config.panelClass.push('custom-snackbar');
            } else {
                config.panelClass += ' custom-snackbar';
            }
        }

        if (typeof coryOptions === 'string') {
            coryOptions = <NotifyOptions>{ icon: coryOptions };
        }
        if (coryOptions === undefined) {
            coryOptions = <NotifyOptions>{ icon: 'info' };
        }
        config.data = config.data || {};
        config.data.message = message;
        config.data.options = coryOptions;
        this.snackBar.openFromComponent(NotifyComponent, config);
    }

    error(error: Error) {
        this.info(`${error.message}`, <NotifyOptions>{ icon: 'error' });
        console.error(error);
    }
}
