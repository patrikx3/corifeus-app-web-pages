import {
    Component,
    Input,
    effect,
} from '@angular/core';

import { LocaleService } from '../modules/web';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
    selector: 'cory-web-pages-build-status',
    styles: [`
        .cory-web-pages-build-status {
            position: relative;
            top: 3px;
        }
    `],
    template: `
    @if (pkg.corifeus.reponame !== undefined) {
      <span class="cory-web-pages-build-status">
        @if (pkg.corifeus.snap === true) {
          <span>
            <a href="https://snapcraft.io/{{ pkg.name }}" target="cory-pages-status-snap" matTooltip="Snap" matTooltipPosition="above">
              <img alt="{{ pkg.description }}" src="https://snapcraft.io/{{ pkg.name }}/badge.svg" />
            </a>
            &nbsp;
          </span>
        }
        @if (pkg.corifeus.build !== false) {
          <span  >
            <a target="cory-pages-status-networkcorifeusmonitor" href="https://network.corifeus.com/status/31ad7a5c194347c33e5445dbaf8"><img src="https://network.corifeus.com/public/api/uptime-shield/31ad7a5c194347c33e5445dbaf8.svg" alt="{{ i18n.pages.title.uptime }}" [matTooltip]="i18n.pages.title.uptime" matTooltipPosition="above"></a>
            &nbsp;
          </span>
        }
        <span>
          <a target="_blank" href="https://paypal.me/patrikx3"><img [src]="i18n.pages.badge.donate" [matTooltip]="i18n.pages.title.donate" matTooltipPosition="above"></a>
          &nbsp;
          <a target="_blank" [href]="i18n.pages.url.contact"><img [src]="i18n.pages.badge.contact" [matTooltip]="i18n.pages.title.contact" matTooltipPosition="above"></a>
          &nbsp;
          <a target="_blank" href="https://www.facebook.com/corifeus.software"><img [src]="i18n.pages.badge.facebook"  matTooltip="Corifeus Software Engineering" matTooltipPosition="above"></a>
        </span>
      </span>
    }
    `,
    imports: [MatTooltipModule],
})
export class Status {

    @Input('cory-pkg') pkg: any;

    i18n: any;

    constructor(
        protected locale: LocaleService,
    ) {
        effect(() => {
            this.locale.state();
            this.i18n = this.locale.data;
        });
    }
}
