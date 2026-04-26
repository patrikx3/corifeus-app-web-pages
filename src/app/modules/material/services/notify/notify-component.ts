import {
    Injectable,
    Component,
    HostListener,
    Inject,
    effect,
} from '@angular/core';

import { ThemeService } from '../theme';

import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { DomSanitizer } from '@angular/platform-browser';

import { LocaleService } from '../../../web';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    template: `
        <div style="position: relative;">
            <mat-icon color="accent">{{ data.options.icon }}</mat-icon>
            &nbsp;
            <span class="message" [innerHTML]="transformHtml(data.message)"></span>
        </div>
        <a mat-button color="accent" class="cory-mat-notify-button" (click)="ctx.dismiss()">{{ this.i18n.title.ok }}</a>
    `,
    styles: [`
        .message {
            position: relative;
            top: -6px;
        }

        [mat-button]{
            position: absolute;
            top: 10px;
            right: 4px;
            min-width: auto !important;
        }
    `],
    imports: [MatIconModule, MatButtonModule],
})
@Injectable()
export class NotifyComponent {

    inited: boolean = false;

    public data: { message: string, options: any };

    i18n: any;

    constructor(
        public ctx: MatSnackBarRef<NotifyComponent>,
        private locale: LocaleService,
        private theme: ThemeService,
        @Inject(MAT_SNACK_BAR_DATA) data: any,
        private _sanitizer: DomSanitizer,
    ) {
        effect(() => {
            this.locale.state();
            this.i18n = this.locale.data?.material;
        });
        this.data = data;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: Event) {
        this.ctx.dismiss();
    }

    transformHtml(html: string): any {
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }
}
