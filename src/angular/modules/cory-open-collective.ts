import {
    Component,
    Host,
} from '@angular/core';

import { Layout } from '../layout/cory-layout';

import { SettingsService } from 'corifeus-web';

import {
    NotifyService
} from 'corifeus-web-material';

@Component({
    selector: 'cory-open-collective',
    template: `
        AHA!
    `
})
export class OpenCollective {

    constructor(
        @Host() public parent: Layout,
    ) {
   }
}



